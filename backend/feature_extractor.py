"""
DRISHTI-CRIMENEXUS Feature Extraction Engine.
Transforms multi-relational intelligence (CDRs, Transactions, FIRs, Surveillance, OSINT)
into normalized numeric feature matrices for PyTorch neural network training and inference.
"""
import numpy as np
import networkx as nx
from typing import Dict, List, Tuple, Any
from .dataset import dataset

FEATURE_NAMES = [
    "cdr_degree",
    "cdr_in_degree",
    "cdr_out_degree",
    "cdr_betweenness",
    "cdr_pagerank",
    "cdr_clustering",
    "call_duration_total",
    "call_duration_avg",
    "call_night_ratio",
    "fin_amount_sent",
    "fin_amount_recv",
    "fin_tx_count",
    "fin_smurfing_flags",
    "fin_linked_to_sunrise",
    "fir_count",
    "fir_ndps_count",
    "fir_pmla_count",
    "fir_cheating_count",
    "fir_conspiracy_count",
    "is_absconding",
    "surveillance_count",
    "surveillance_meetings",
    "osint_post_count",
    "has_alt_phone"
]

ROLE_CLASSES = [
    "Kingpin",
    "Syndicate Linchpin / Bridge",
    "Hawala Operator / Mule",
    "Core Lieutenant",
    "Low-Risk Associate"
]

class FeatureExtractor:
    def __init__(self):
        self.feature_names = FEATURE_NAMES
        self.role_classes = ROLE_CLASSES
        self.means = None
        self.stds = None
        
    def build_cdr_graph(self) -> nx.DiGraph:
        G = nx.DiGraph()
        # Add all 40 suspects as nodes
        for p in dataset.persons:
            G.add_node(p["person_id"])
            
        for cdr in dataset.cdrs:
            caller = cdr.get("caller_id")
            callee = cdr.get("callee_id")
            dur = cdr.get("duration_sec", 0)
            if caller and callee:
                if G.has_edge(caller, callee):
                    G[caller][callee]["weight"] += 1
                    G[caller][callee]["duration"] += dur
                else:
                    G.add_edge(caller, callee, weight=1, duration=dur)
        return G

    def extract_all(self) -> Tuple[np.ndarray, np.ndarray, List[str]]:
        G = self.build_cdr_graph()
        undirected_G = G.to_undirected()
        
        betweenness = nx.betweenness_centrality(undirected_G)
        pagerank = nx.pagerank(G, weight="weight")
        clustering = nx.clustering(undirected_G)
        
        # Prepare financial stats
        sunrise_acc = "Axis-203577948775"
        fin_stats = {p["person_id"]: {
            "sent": 0.0, "recv": 0.0, "tx_count": 0, "smurfing": 0, "sunrise": 0
        } for p in dataset.persons}
        
        for txn in dataset.financial_txns:
            sender_acc = txn.get("sender_account")
            recv_acc = txn.get("receiver_account")
            amt = float(txn.get("amount_inr", 0))
            flag = txn.get("flag", "")
            is_smurfing = 1 if (flag in ["below-1L-threshold", "structuring"] or (amt >= 50000 and amt < 100000)) else 0
            
            s_entity = dataset.entity_by_account.get(sender_acc)
            r_entity = dataset.entity_by_account.get(recv_acc)
            
            if s_entity and s_entity["type"] == "person":
                pid = s_entity["id"]
                fin_stats[pid]["sent"] += amt
                fin_stats[pid]["tx_count"] += 1
                fin_stats[pid]["smurfing"] += is_smurfing
                if recv_acc == sunrise_acc:
                    fin_stats[pid]["sunrise"] = 1
                    
            if r_entity and r_entity["type"] == "person":
                pid = r_entity["id"]
                fin_stats[pid]["recv"] += amt
                fin_stats[pid]["tx_count"] += 1
                fin_stats[pid]["smurfing"] += is_smurfing
                if sender_acc == sunrise_acc:
                    fin_stats[pid]["sunrise"] = 1

        # Call stats per person
        call_stats = {p["person_id"]: {"dur_total": 0, "calls": 0, "night_calls": 0} for p in dataset.persons}
        for cdr in dataset.cdrs:
            caller = cdr.get("caller_id")
            callee = cdr.get("callee_id")
            dur = cdr.get("duration_sec", 0)
            time_str = cdr.get("timestamp", "").split(" ")[-1]
            hour = int(time_str.split(":")[0]) if ":" in time_str else 12
            is_night = 1 if (hour >= 22 or hour < 6) else 0
            
            for pid in (caller, callee):
                if pid and pid in call_stats:
                    call_stats[pid]["dur_total"] += dur
                    call_stats[pid]["calls"] += 1
                    call_stats[pid]["night_calls"] += is_night

        # FIR stats
        fir_stats = {p["person_id"]: {"total": 0, "ndps": 0, "pmla": 0, "cheating": 0, "conspiracy": 0, "absconding": 0} for p in dataset.persons}
        for fir in dataset.all_firs:
            pid = fir.get("person_id")
            if pid and pid in fir_stats:
                fir_stats[pid]["total"] += 1
                sec = fir.get("section", "").upper()
                if "NDPS" in sec: fir_stats[pid]["ndps"] += 1
                if "PMLA" in sec: fir_stats[pid]["pmla"] += 1
                if "420" in sec: fir_stats[pid]["cheating"] += 1
                if "120B" in sec: fir_stats[pid]["conspiracy"] += 1
                if fir.get("status") == "Absconding": fir_stats[pid]["absconding"] = 1

        # Surveillance stats
        surv_stats = {p["person_id"]: {"count": 0, "meetings": 0} for p in dataset.persons}
        for sr in dataset.surveillance_reports:
            pid = sr.get("subject_id")
            if pid and pid in surv_stats:
                surv_stats[pid]["count"] += 1
                surv_stats[pid]["meetings"] += len(sr.get("other_persons_present", []))
            for other_pid in sr.get("other_persons_present", []):
                if other_pid in surv_stats:
                    surv_stats[other_pid]["meetings"] += 1

        # OSINT stats
        osint_stats = {p["person_id"]: 0 for p in dataset.persons}
        for sp in dataset.social_posts:
            pid = sp.get("person_id")
            if pid and pid in osint_stats:
                osint_stats[pid] += 1

        # Assemble feature rows
        X = []
        labels = []
        pids = []
        
        gt = dataset.ground_truth
        narc_ring = set(gt.get("narcotics_ring_ids", []))
        fraud_ring = set(gt.get("fraud_ring_ids", []))
        bridge_id = gt.get("bridge_person_id", "P004")
        kingpin_narc = gt.get("kingpin_narcotics_id", "P016")
        kingpin_fraud = gt.get("kingpin_fraud_id", "P007")

        for p in dataset.persons:
            pid = p["person_id"]
            pids.append(pid)
            
            calls = max(1, call_stats[pid]["calls"])
            row = [
                float(G.degree(pid)),
                float(G.in_degree(pid)),
                float(G.out_degree(pid)),
                float(betweenness.get(pid, 0.0)),
                float(pagerank.get(pid, 0.0)),
                float(clustering.get(pid, 0.0)),
                float(call_stats[pid]["dur_total"]),
                float(call_stats[pid]["dur_total"] / calls),
                float(call_stats[pid]["night_calls"] / calls),
                float(fin_stats[pid]["sent"]),
                float(fin_stats[pid]["recv"]),
                float(fin_stats[pid]["tx_count"]),
                float(fin_stats[pid]["smurfing"]),
                float(fin_stats[pid]["sunrise"]),
                float(fir_stats[pid]["total"]),
                float(fir_stats[pid]["ndps"]),
                float(fir_stats[pid]["pmla"]),
                float(fir_stats[pid]["cheating"]),
                float(fir_stats[pid]["conspiracy"]),
                float(fir_stats[pid]["absconding"]),
                float(surv_stats[pid]["count"]),
                float(surv_stats[pid]["meetings"]),
                float(osint_stats[pid]),
                1.0 if p.get("alt_phone") else 0.0
            ]
            X.append(row)
            
            # Ground truth label assignment:
            if pid in (kingpin_narc, kingpin_fraud):
                role = "Kingpin"
            elif pid == bridge_id:
                role = "Syndicate Linchpin / Bridge"
            elif fin_stats[pid]["sunrise"] == 1 or fin_stats[pid]["smurfing"] >= 2:
                role = "Hawala Operator / Mule"
            elif (pid in narc_ring or pid in fraud_ring) and fir_stats[pid]["total"] >= 1:
                role = "Core Lieutenant"
            else:
                role = "Low-Risk Associate"
                
            labels.append(self.role_classes.index(role))
            
        X = np.array(X, dtype=np.float32)
        y = np.array(labels, dtype=np.int64)
        
        # Calculate normalization parameters
        self.means = np.mean(X, axis=0)
        self.stds = np.std(X, axis=0)
        self.stds[self.stds == 0] = 1.0  # avoid division by zero
        
        return X, y, pids
        
    def normalize(self, X: np.ndarray) -> np.ndarray:
        if self.means is None:
            self.means = np.mean(X, axis=0)
            self.stds = np.std(X, axis=0)
            self.stds[self.stds == 0] = 1.0
        return (X - self.means) / self.stds
