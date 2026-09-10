"""
DRISHTI-CRIMENEXUS Backend Intelligence Service.
FastAPI REST API exposing PyTorch Neural Network & Machine Learning Inferences.
"""
import json
import torch
import joblib
import numpy as np
from pathlib import Path
from typing import Dict, Any, List, Optional
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from .dataset import dataset
from .feature_extractor import FeatureExtractor, FEATURE_NAMES, ROLE_CLASSES
from .models_def import SyndicateNet, HawalaAutoencoder
from .train_models import run_training_pipeline

MODELS_DIR = Path(__file__).resolve().parent / "models"

app = FastAPI(
    title="DRISHTI-CRIMENEXUS Intelligence API",
    description="Law Enforcement Criminal Network ML & Neural Inference Engine",
    version="2.0.0"
)

# Enable CORS for local web interface
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse

ROOT_DIR = Path(__file__).resolve().parent.parent

@app.get("/", include_in_schema=False)
def serve_root():
    return FileResponse(ROOT_DIR / "index.html")

@app.get("/styles.css", include_in_schema=False)
def serve_styles():
    return FileResponse(ROOT_DIR / "styles.css")

app.mount("/js", StaticFiles(directory=ROOT_DIR / "js"), name="js")

class ModelManager:
    def __init__(self):
        self.syndicatenet = None
        self.hawala_ae = None
        self.iso_forest = None
        self.link_cache = {}
        self.nlp_clf = None
        self.tfidf_vec = None
        self.metrics = {}
        self.norm_stats = {}
        self.suspect_cache = {}
        self.load_all()

    def load_all(self):
        if not (MODELS_DIR / "syndicatenet.pt").exists():
            print("Models not found, running training pipeline...")
            run_training_pipeline()

        # Load metrics
        with open(MODELS_DIR / "metrics.json", "r", encoding="utf-8") as f:
            self.metrics = json.load(f)

        # Load norm stats
        with open(MODELS_DIR / "norm_stats.json", "r", encoding="utf-8") as f:
            self.norm_stats = json.load(f)

        # Load link cache
        with open(MODELS_DIR / "link_predictions.json", "r", encoding="utf-8") as f:
            self.link_cache = json.load(f)

        # Load SyndicateNet
        self.syndicatenet = SyndicateNet(input_dim=len(FEATURE_NAMES), num_classes=len(ROLE_CLASSES))
        self.syndicatenet.load_state_dict(torch.load(MODELS_DIR / "syndicatenet.pt", weights_only=True))
        self.syndicatenet.eval()

        # Load Hawala Autoencoder
        self.hawala_ae = HawalaAutoencoder(input_dim=6)
        self.hawala_ae.load_state_dict(torch.load(MODELS_DIR / "hawala_ae.pt", weights_only=True))
        self.hawala_ae.eval()

        # Load NLP models
        self.nlp_clf = joblib.load(MODELS_DIR / "nlp_classifier.joblib")
        self.tfidf_vec = joblib.load(MODELS_DIR / "tfidf_vectorizer.joblib")
        
        # Precompute enriched suspect profiles
        self.rebuild_suspect_cache()
        print("All models successfully loaded into memory.")

    def rebuild_suspect_cache(self):
        base_preds = self.metrics.get("syndicatenet", {}).get("base_preds", {})
        feat_rank = self.metrics.get("syndicatenet", {}).get("feature_ranking", [])
        top_factors = [f["feature"] for f in feat_rank[:4]]

        self.suspect_cache = []
        for p in dataset.persons:
            pid = p["person_id"]
            ai_data = base_preds.get(pid, {
                "predicted_role": "Low-Risk Associate",
                "confidence": 0.90,
                "threat_score": 30.0,
                "probabilities": {}
            })
            
            # Find person's prior FIRs
            person_firs = [f for f in dataset.all_firs if f.get("person_id") == pid]
            
            enriched = {
                **p,
                "ai_predicted_role": ai_data["predicted_role"],
                "ai_confidence": ai_data["confidence"],
                "ai_threat_score": ai_data["threat_score"],
                "ai_role_probabilities": ai_data["probabilities"],
                "ai_top_factors": top_factors,
                "firs_count": len(person_firs),
                "firs": person_firs
            }
            self.suspect_cache.append(enriched)

models = ModelManager()

# --- Request / Response Models ---
class CustomSuspectInput(BaseModel):
    cdr_degree: Optional[float] = 5.0
    cdr_betweenness: Optional[float] = 0.05
    call_night_ratio: Optional[float] = 0.3
    fin_amount_sent: Optional[float] = 50000.0
    fin_smurfing_flags: Optional[float] = 1.0
    fin_linked_to_sunrise: Optional[float] = 0.0
    fir_count: Optional[float] = 1.0
    fir_ndps_count: Optional[float] = 0.0
    fir_pmla_count: Optional[float] = 0.0
    is_absconding: Optional[float] = 0.0

class LinkPredictRequest(BaseModel):
    person_a_id: str
    person_b_id: str

class NLPClassifyRequest(BaseModel):
    report_text: str

class HawalaScanRequest(BaseModel):
    amount: float = 48500.0
    hour: Optional[int] = 2
    velocity_txns_per_hr: Optional[float] = 6.0
    is_round_amount: Optional[bool] = False
    sender_account: Optional[str] = "Axis-203577948775"
    receiver_account: Optional[str] = "ICICI-273665994394"

class CDRIngestRequest(BaseModel):
    raw_csv: Optional[str] = None
    records: Optional[List[Dict[str, Any]]] = None

class TxnIngestRequest(BaseModel):
    raw_csv: Optional[str] = None
    transactions: Optional[List[Dict[str, Any]]] = None

class OSINTUserScanRequest(BaseModel):
    handle: str

class OSINTPhoneScanRequest(BaseModel):
    phone: str

class OSINTNetworkScanRequest(BaseModel):
    target: str

# --- API Routes ---

@app.get("/api/health")
def get_health():
    return {
        "status": "ONLINE",
        "service": "DRISHTI-CRIMENEXUS AI Intelligence Backend",
        "version": "2.0.0",
        "models_loaded": {
            "syndicatenet": models.syndicatenet is not None,
            "hawala_autoencoder": models.hawala_ae is not None,
            "nlp_classifier": models.nlp_clf is not None,
            "link_predictor": len(models.link_cache) > 0
        },
        "device": "PyTorch CPU",
        "accuracy": models.metrics.get("syndicatenet", {}).get("final_accuracy", 1.0)
    }

@app.get("/api/models/metrics")
def get_model_metrics():
    return {
        "accuracy": models.metrics.get("syndicatenet", {}).get("final_accuracy", 1.0),
        "epochs": models.metrics.get("syndicatenet", {}).get("epochs", 120),
        "parameters_count": models.metrics.get("syndicatenet", {}).get("parameters_count", 3800),
        "loss_curve": models.metrics.get("syndicatenet", {}).get("loss_curve", []),
        "confusion_matrix": models.metrics.get("syndicatenet", {}).get("confusion_matrix", []),
        "feature_ranking": models.metrics.get("syndicatenet", {}).get("feature_ranking", []),
        "role_classes": ROLE_CLASSES,
        "metadata": models.metrics.get("metadata", {})
    }

@app.get("/api/suspects")
def get_enriched_suspects():
    return {
        "count": len(models.suspect_cache),
        "suspects": models.suspect_cache
    }

@app.get("/api/suspects/{person_id}")
def get_suspect_detail(person_id: str):
    for s in models.suspect_cache:
        if s["person_id"] == person_id:
            return s
    raise HTTPException(status_code=404, detail="Suspect not found")

@app.post("/api/predict/suspect")
def predict_custom_suspect(data: CustomSuspectInput):
    import time
    t0 = time.perf_counter()
    # Construct feature row with defaults for missing
    means = np.array(models.norm_stats["means"])
    stds = np.array(models.norm_stats["stds"])
    
    row = np.copy(means)
    data_dict = data.dict()
    for k, v in data_dict.items():
        if k in FEATURE_NAMES and v is not None:
            idx = FEATURE_NAMES.index(k)
            row[idx] = float(v)
            
    norm_row = (row - means) / stds
    tensor_input = torch.tensor(norm_row, dtype=torch.float32).unsqueeze(0)
    
    with torch.no_grad():
        logits, threat = models.syndicatenet(tensor_input)
        probs = torch.softmax(logits, dim=1).squeeze().numpy()
        pred_idx = int(np.argmax(probs))
        threat_val = float(threat.squeeze().numpy())

    latency_ms = round((time.perf_counter() - t0) * 1000, 2)

    return {
        "predicted_role": ROLE_CLASSES[pred_idx],
        "confidence": round(float(probs[pred_idx]), 4),
        "threat_score": round(threat_val, 1),
        "role_probabilities": {ROLE_CLASSES[i]: round(float(probs[i]), 4) for i in range(len(ROLE_CLASSES))},
        "neural_latency_ms": latency_ms,
        "device": "PyTorch CPU",
        "input_features": data_dict
    }

@app.post("/api/predict/link")
def predict_criminal_link(req: LinkPredictRequest):
    import time
    t0 = time.perf_counter()
    u = req.person_a_id
    v = req.person_b_id
    if u == v:
        return {
            "person_a_id": u,
            "person_b_id": v,
            "criminal_link_probability": 1.0,
            "direct_contact": True,
            "common_associates_count": 0,
            "status": "Identical Subject",
            "neural_latency_ms": 0.1
        }
        
    pair_key1 = f"{u}_{v}"
    pair_key2 = f"{v}_{u}"
    link_info = models.link_cache.get(pair_key1) or models.link_cache.get(pair_key2)
    
    if not link_info:
        # Dynamic calculation using CDR graph topology (Adamic-Adar + Jaccard)
        neighbors_u = set()
        neighbors_v = set()
        direct = False
        
        for c in dataset.cdrs:
            p_a = dataset.person_by_phone.get(c.get("caller_phone"))
            p_b = dataset.person_by_phone.get(c.get("receiver_phone"))
            if (p_a == u and p_b == v) or (p_a == v and p_b == u):
                direct = True
            if p_a == u and p_b: neighbors_u.add(p_b)
            if p_b == u and p_a: neighbors_u.add(p_a)
            if p_a == v and p_b: neighbors_v.add(p_b)
            if p_b == v and p_a: neighbors_v.add(p_a)
            
        common = neighbors_u.intersection(neighbors_v)
        common_count = len(common)
        
        adamic_adar = 0.0
        for w in common:
            deg_w = sum(1 for c in dataset.cdrs if dataset.person_by_phone.get(c.get("caller_phone")) == w or dataset.person_by_phone.get(c.get("receiver_phone")) == w)
            if deg_w > 1:
                adamic_adar += 1.0 / np.log(deg_w)
                
        union_count = len(neighbors_u.union(neighbors_v))
        jaccard = round(common_count / max(union_count, 1), 3)
        prob = 0.45 if direct else (round(min(0.95, adamic_adar * 0.25 + jaccard * 0.4), 3) if common_count > 0 else 0.05)
        
        link_info = {
            "direct_contact": direct,
            "common_associates_count": common_count,
            "common_associates": [dataset.person_by_id.get(p, {}).get("name", p) for p in common],
            "jaccard_coefficient": jaccard,
            "adamic_adar_score": round(adamic_adar, 3),
            "criminal_link_probability": prob,
            "status": "Direct Contact Confirmed" if direct else ("Covert Conduit Detected" if prob > 0.3 else "Unconnected / Isolated")
        }

    person_a = dataset.person_by_id.get(u, {})
    person_b = dataset.person_by_id.get(v, {})
    latency_ms = round((time.perf_counter() - t0) * 1000, 2)

    return {
        "person_a": {"id": u, "name": person_a.get("name", u)},
        "person_b": {"id": v, "name": person_b.get("name", v)},
        "neural_latency_ms": latency_ms,
        **link_info
    }

@app.post("/api/hawala/scan")
def scan_hawala_transaction(req: HawalaScanRequest):
    import time
    t0 = time.perf_counter()
    amt = float(req.amount)
    hr = float(req.hour % 24)
    is_night = 1.0 if (hr >= 23 or hr <= 5) else 0.0
    vel = float(req.velocity_txns_per_hr)
    is_round = 1.0 if (req.is_round_amount or (amt > 1000 and amt % 1000 == 0)) else 0.0
    structuring = 1.0 if (40000 <= amt < 50000) else (0.5 if (30000 <= amt < 40000) else 0.0)
    
    # 6-dim input vector into HawalaAutoencoder
    vec = np.array([amt / 100000.0, hr / 24.0, is_night, vel / 10.0, is_round, structuring], dtype=np.float32)
    tensor_input = torch.tensor(vec).unsqueeze(0)
    
    with torch.no_grad():
        recon = models.hawala_ae(tensor_input)
        mse_loss = float(torch.mean((tensor_input - recon) ** 2).item())
        
    threshold = 0.022
    is_anomaly = bool((mse_loss > threshold) or (structuring >= 0.8 and vel >= 4.0))
    anomaly_score = min(100.0, round(mse_loss * 1200.0 + (50.0 if structuring >= 0.8 else 0.0), 1))
    latency_ms = round((time.perf_counter() - t0) * 1000, 2)
    
    reasons = []
    if structuring >= 0.8:
        reasons.append("Deposit falls into Section 12 PMLA Smurfing Window (₹40,000–₹49,999 to evade mandatory FIU CTR reporting)")
    if is_night == 1.0:
        reasons.append(f"Nocturnal transfer at {int(hr):02d}:00 IST outside standard banking clearing hours")
    if vel >= 4.0:
        reasons.append(f"Rapid dispersal velocity ({vel:.1f} txns/hr) flags layering mule behavior")
    if not reasons:
        reasons.append("Reconstruction loss within standard distribution baseline")

    return {
        "amount": amt,
        "reconstruction_loss_mse": round(mse_loss, 5),
        "threshold": threshold,
        "is_smurfing_anomaly": is_anomaly,
        "anomaly_score": anomaly_score,
        "fiu_str_recommended": is_anomaly,
        "flag_reasons": reasons,
        "neural_latency_ms": latency_ms,
        "model": "HawalaAutoencoder-PyTorch-v2.0"
    }

@app.post("/api/ingest/cdr")
def ingest_cdr_data(req: CDRIngestRequest):
    import time
    t0 = time.perf_counter()
    rows = []
    if req.raw_csv:
        lines = [l.strip() for l in req.raw_csv.strip().split("\n") if l.strip()]
        if len(lines) > 1:
            header = [h.strip().lower() for h in lines[0].split(",")]
            for line in lines[1:]:
                parts = [p.strip() for p in line.split(",")]
                if len(parts) >= 2:
                    rows.append(dict(zip(header, parts)))
    elif req.records:
        rows = req.records
        
    if not rows:
        raise HTTPException(status_code=400, detail="No CDR records provided")
        
    unique_callers = set()
    unique_callees = set()
    edges = []
    night_calls = 0
    
    for r in rows:
        caller = r.get("caller") or r.get("caller_phone") or r.get("from")
        callee = r.get("receiver") or r.get("callee") or r.get("receiver_phone") or r.get("to")
        duration = int(r.get("duration", 60) or 60)
        timestamp = r.get("timestamp", "2025-06-01 12:00:00")
        city = r.get("city", "Surat")
        
        if caller and callee:
            unique_callers.add(caller)
            unique_callees.add(callee)
            edges.append({
                "caller": caller,
                "callee": callee,
                "duration": duration,
                "timestamp": timestamp,
                "city": city
            })
            if any(t in timestamp for t in [" 23:", " 00:", " 01:", " 02:", " 03:", " 04:"]):
                night_calls += 1

    latency_ms = round((time.perf_counter() - t0) * 1000, 2)
    all_phones = unique_callers.union(unique_callees)

    return {
        "status": "SUCCESS",
        "records_processed": len(rows),
        "unique_identities_discovered": len(all_phones),
        "edges_generated": len(edges),
        "night_calls_flagged": night_calls,
        "processing_latency_ms": latency_ms,
        "edges": edges[:50],
        "phones": list(all_phones)
    }

@app.post("/api/ingest/transactions")
def ingest_transaction_data(req: TxnIngestRequest):
    import time
    t0 = time.perf_counter()
    rows = []
    if req.raw_csv:
        lines = [l.strip() for l in req.raw_csv.strip().split("\n") if l.strip()]
        if len(lines) > 1:
            header = [h.strip().lower() for h in lines[0].split(",")]
            for line in lines[1:]:
                parts = [p.strip() for p in line.split(",")]
                if len(parts) >= 2:
                    rows.append(dict(zip(header, parts)))
    elif req.transactions:
        rows = req.transactions

    if not rows:
        raise HTTPException(status_code=400, detail="No transaction records provided")

    scored_txns = []
    smurfing_count = 0

    for idx, r in enumerate(rows):
        amt = float(r.get("amount", 25000) or 25000)
        sender = r.get("sender") or r.get("sender_account") or f"ACC-SND-{idx}"
        recv = r.get("receiver") or r.get("receiver_account") or f"ACC-RCV-{idx}"
        structuring = 1.0 if (40000 <= amt < 50000) else (0.5 if (30000 <= amt < 40000) else 0.0)
        
        vec = np.array([amt / 100000.0, 0.5, 0.0, 0.3, 1.0 if amt % 1000 == 0 else 0.0, structuring], dtype=np.float32)
        with torch.no_grad():
            recon = models.hawala_ae(torch.tensor(vec).unsqueeze(0))
            mse = float(torch.mean((torch.tensor(vec).unsqueeze(0) - recon) ** 2).item())

        is_anomaly = bool(mse > 0.022 or structuring >= 0.8)
        if is_anomaly:
            smurfing_count += 1

        scored_txns.append({
            "txn_id": f"ING-TXN-{idx+1:04d}",
            "sender_account": sender,
            "receiver_account": recv,
            "amount": amt,
            "ai_reconstruction_mse": round(mse, 5),
            "ai_is_smurfing_anomaly": is_anomaly,
            "fiu_str_recommended": is_anomaly
        })

    latency_ms = round((time.perf_counter() - t0) * 1000, 2)

    return {
        "status": "SUCCESS",
        "transactions_processed": len(rows),
        "smurfing_anomalies_flagged": smurfing_count,
        "processing_latency_ms": latency_ms,
        "transactions": scored_txns
    }

@app.get("/api/hawala/anomalies")
def get_hawala_anomalies():
    anomalies_map = models.metrics.get("hawala_anomalies", {})
    all_txns = []
    
    for t in dataset.financial_txns:
        tid = t["txn_id"]
        ai_res = anomalies_map.get(tid, {
            "anomaly_score": 10.0,
            "is_smurfing_anomaly": False,
            "fiu_str_recommended": False
        })
        sender_e = dataset.entity_by_account.get(t.get("sender_account"), {})
        recv_e = dataset.entity_by_account.get(t.get("receiver_account"), {})
        
        all_txns.append({
            **t,
            "ai_anomaly_score": ai_res["anomaly_score"],
            "ai_is_smurfing_anomaly": ai_res["is_smurfing_anomaly"],
            "ai_fiu_str_recommended": ai_res["fiu_str_recommended"],
            "sender_entity_type": sender_e.get("type", "unknown"),
            "sender_entity_id": sender_e.get("id", None),
            "receiver_entity_type": recv_e.get("type", "unknown"),
            "receiver_entity_id": recv_e.get("id", None)
        })

    # Sort descending by anomaly score
    all_txns.sort(key=lambda x: x["ai_anomaly_score"], reverse=True)
    return {
        "total_transactions": len(all_txns),
        "anomalies_flagged_count": sum(1 for t in all_txns if t["ai_is_smurfing_anomaly"]),
        "transactions": all_txns
    }

@app.post("/api/nlp/classify")
def classify_nlp_report(req: NLPClassifyRequest):
    text = req.report_text.strip()
    if not text:
        raise HTTPException(status_code=400, detail="Empty text provided")
        
    vec = models.tfidf_vec.transform([text])
    pred_label = models.nlp_clf.predict(vec)[0]
    probs = models.nlp_clf.predict_proba(vec)[0]
    classes = list(models.nlp_clf.classes_)
    
    prob_dict = {classes[i]: round(float(probs[i]), 3) for i in range(len(classes))}
    
    # Extract entities (persons, phones, vehicles, accounts, FIRs, sections)
    import re
    phones = re.findall(r"\b[6-9]\d{9}\b", text)
    vehicles = re.findall(r"\b[A-Z]{2}\s?\d{2}\s?[A-Z]{1,3}\s?\d{4}\b", text)
    accounts = re.findall(r"\b(?:HDFC|ICICI|SBI|Axis|PNB|Bank of Baroda)-\d{10,16}\b", text, re.IGNORECASE)
    firs = re.findall(r"\bFIR-\d{3,5}\b", text)
    sections = re.findall(r"\b(?:IPC\s+\d+[A-Z]?|NDPS(?:\s+Act)?(?:\s+Sec\s+\d+(?:\/\d+)?)?|PMLA(?:\s+Sec\s+\d+)?)\b", text, re.IGNORECASE)
    
    STOPWORDS = set([
        'confidential', 'special task force', 'intelligence cable', 'source', 'sigint',
        'surveillance', 'investigation', 'crime branch', 'financial intelligence unit',
        'police station', 'first information report', 'case diary', 'textile market',
        'burner phone', 'commercial contraband', 'money exchange', 'logistics carrier',
        'mumbai corridor', 'trading payments', 'structuring violations', 'inbound transfers',
        'black suv', 'white sedan', 'fir', 'stf', 'cid', 'fiu', 'pmla', 'ndps', 'ipc',
        'act', 'sec', 'section', 'date', 'subject', 'priority', 'field informant',
        'january', 'february', 'march', 'april', 'may', 'june', 'july', 'august',
        'september', 'october', 'november', 'december', 'monday', 'tuesday', 'wednesday',
        'thursday', 'friday', 'saturday', 'sunday', 'delhi', 'mumbai', 'pune', 'surat',
        'lucknow', 'bengaluru', 'nagpur', 'hyderabad', 'kolkata', 'chennai', 'ahmedabad',
        'the', 'this', 'that', 'with', 'from', 'near', 'under', 'into', 'over'
    ])

    NON_NAME_WORDS = set([
        'is', 'was', 'are', 'were', 'has', 'had', 'been', 'being', 'having', 'driving',
        'operating', 'currently', 'absconding', 'arrested', 'lodged', 'registered',
        'sighted', 'seen', 'fled', 'stole', 'intercepted', 'disclosed', 'confirms',
        'revealed', 'layered', 'belonging', 'transferred', 'moving', 'scheduled',
        'near', 'under', 'toward', 'towards', 'against', 'between', 'through',
        'during', 'interrogation', 'vehicle', 'phone', 'account', 'cash', 'for',
        'consignment', 'contraband', 'racket', 'transit', 'corridor', 'syndicate',
        'and', 'in', 'to', 'at', 'by', 'on', 'with', 'from'
    ])

    extracted_persons = set()
    # 1. Database suspects
    for p in dataset.persons:
        name = p.get("name", "")
        if name and re.search(r'\b' + re.escape(name) + r'\b', text, re.IGNORECASE):
            extracted_persons.add(name)

    # 2. Contextual cues (accused, suspect, named, against, confirms that, alias, arrested, etc.)
    cues = (
        r'(?:'
        r'field\s+informant\s+confirms\s+that|confirms\s+that|'
        r'prime\s+suspect|suspects?\s+identified\s+in\s+this\s+financial\s+trail\s+include|'
        r'suspects?\s+include|suspects?|accused|conspirators?|co-conspirators?|'
        r'receivers?|handlers?|operators?|drivers?|carriers?|couriers?|informants?|'
        r'associates?|masterminds?|kingpins?|accomplices?|wanted|absconders?|'
        r'interrogation\s+(?:of|revealed)|communications?\s+with|meeting\s+with|'
        r'along\s+with|traced\s+to|belonging\s+to|identified\s+as|named\s+in\s+fir|named|'
        r'alias|against|arrested|apprehended|complaint\s+against|charges\s+against|'
        r'dr\.?|mr\.?|mrs\.?|ms\.?|shri|smt|inspector|sub-inspector|si|constable|'
        r'names?|complainants?|witnesses?|victims?'
        r')'
        r'(?:\s*[:=-]\s*|\s+)'
        r'([A-Za-z]+(?:\s+[A-Za-z]+){0,2})'
    )
    for m in re.finditer(cues, text, re.IGNORECASE):
        raw = m.group(1).strip()
        tokens = raw.split()
        clean = []
        for t in tokens:
            t_clean = re.sub(r'[^a-zA-Z]', '', t)
            if not t_clean or t_clean.lower() in NON_NAME_WORDS or t_clean.lower() in STOPWORDS:
                break
            clean.append(t_clean.capitalize())
        if clean:
            cand_name = " ".join(clean)
            if len(cand_name) >= 3 and cand_name.lower() not in STOPWORDS:
                extracted_persons.add(cand_name)

    # 3. Open-vocabulary 2-token Proper Noun patterns (e.g. John Smith, Vikram Malhotra, Kunal Khan)
    prop_noun = r'\b([A-Z][a-z]{2,15}\s+[A-Z][a-z]{2,15})\b'
    for m in re.finditer(prop_noun, text):
        cand = m.group(1).strip()
        parts = cand.split()
        if len(parts) == 2:
            w1, w2 = parts
            if (w1.lower() not in STOPWORDS and w2.lower() not in STOPWORDS and 
                w1.lower() not in NON_NAME_WORDS and w2.lower() not in NON_NAME_WORDS):
                extracted_persons.add(cand)

    threat = "HIGH" if ("NDPS" in pred_label or "PMLA" in pred_label) else "MEDIUM"

    return {
        "predicted_statute": pred_label,
        "threat_level": threat,
        "confidence": round(float(np.max(probs)), 3),
        "class_probabilities": prob_dict,
        "extracted_entities": {
            "persons": sorted(list(extracted_persons)),
            "phone_numbers": sorted(list(set(phones))),
            "vehicle_numbers": sorted(list(set(vehicles))),
            "bank_accounts": sorted(list(set(accounts))),
            "firs": sorted(list(set(firs))),
            "sections": sorted(list(set(sections)))
        }
    }

@app.post("/api/retrain")
def retrain_models():
    new_metrics = run_training_pipeline()
    models.load_all()
    return {
        "status": "SUCCESS",
        "message": "AI Models successfully retrained and reloaded into memory",
        "new_accuracy": new_metrics.get("syndicatenet", {}).get("final_accuracy", 1.0),
        "timestamp": new_metrics.get("metadata", {}).get("timestamp")
    }

# --- OSINT Live Criminal Analysis Endpoints ---

@app.post("/api/osint/scan/username")
def scan_osint_username(req: OSINTUserScanRequest):
    import time, concurrent.futures, urllib.request, json
    t0 = time.perf_counter()
    handle = req.handle.strip().lstrip('@')
    if not handle:
        raise HTTPException(status_code=400, detail="Handle cannot be empty")

    platforms = [
        ("GitHub", "https://github.com/{handle}", "https://api.github.com/users/{handle}"),
        ("Telegram", "https://t.me/{handle}", "https://t.me/{handle}"),
        ("GitLab", "https://gitlab.com/{handle}", "https://gitlab.com/api/v4/users?username={handle}"),
        ("HackerNews", "https://news.ycombinator.com/user?id={handle}", "https://hacker-news.firebaseio.com/v0/user/{handle}.json"),
        ("Chess.com", "https://www.chess.com/member/{handle}", "https://api.chess.com/pub/player/{handle}"),
        ("Pastebin", "https://pastebin.com/u/{handle}", "https://pastebin.com/u/{handle}"),
        ("Medium", "https://medium.com/@{handle}", "https://medium.com/@{handle}"),
        ("Pinterest", "https://www.pinterest.com/{handle}/", "https://www.pinterest.com/{handle}/"),
        ("Steam", "https://steamcommunity.com/id/{handle}", "https://steamcommunity.com/id/{handle}"),
        ("Linktree", "https://linktr.ee/{handle}", "https://linktr.ee/{handle}")
    ]

    def check_platform(name, url_template, api_url):
        t_sub = time.perf_counter()
        target_url = url_template.format(handle=handle)
        api_check = (api_url or url_template).format(handle=handle)
        status = "NOT_FOUND"
        code = 404
        profile_data = {}
        try:
            r = urllib.request.Request(api_check, headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"})
            with urllib.request.urlopen(r, timeout=2.8) as res:
                lat = round((time.perf_counter() - t_sub) * 1000, 1)
                code = res.status
                if name == "Telegram":
                    html = res.read(4096).decode("utf-8", errors="ignore")
                    if "tgme_page_title" in html or "tgme_action_button_new" in html:
                        status = "CONFIRMED"
                    else:
                        status = "NOT_FOUND"
                        code = 404
                elif code in (200, 301, 302):
                    status = "CONFIRMED"
                    try:
                        raw = res.read(1024).decode("utf-8", errors="ignore")
                        if raw.startswith(("{", "[")):
                            d = json.loads(raw)
                            if isinstance(d, list) and len(d) > 0: d = d[0]
                            if isinstance(d, dict):
                                profile_data["name"] = d.get("name") or d.get("username") or d.get("id")
                                if "bio" in d and d["bio"]: profile_data["bio"] = str(d["bio"])[:80]
                                if "location" in d and d["location"]: profile_data["location"] = str(d["location"])
                    except:
                        pass
                return {"platform": name, "status": status, "profile_url": target_url, "latency_ms": lat, "http_code": code, "details": profile_data}
        except urllib.error.HTTPError as e:
            lat = round((time.perf_counter() - t_sub) * 1000, 1)
            st = "NOT_FOUND" if e.code == 404 else ("RESTRICTED" if e.code in (401, 403) else "ERROR")
            return {"platform": name, "status": st, "profile_url": target_url, "latency_ms": lat, "http_code": e.code, "details": {}}
        except Exception:
            lat = round((time.perf_counter() - t_sub) * 1000, 1)
            return {"platform": name, "status": "TIMEOUT_OR_BLOCKED", "profile_url": target_url, "latency_ms": lat, "http_code": 0, "details": {}}

    with concurrent.futures.ThreadPoolExecutor(max_workers=8) as ex:
        results = list(ex.map(lambda p: check_platform(p[0], p[1], p[2]), platforms))

    confirmed_count = sum(1 for r in results if r["status"] == "CONFIRMED")
    exposure_score = min(100.0, round((confirmed_count / max(len(platforms), 1)) * 100.0, 1))
    total_latency_ms = round((time.perf_counter() - t0) * 1000, 1)

    return {
        "handle": handle,
        "total_platforms_scanned": len(platforms),
        "confirmed_footprints_count": confirmed_count,
        "digital_exposure_score": exposure_score,
        "execution_latency_ms": total_latency_ms,
        "platforms": results
    }

@app.post("/api/osint/scan/phone")
def scan_osint_phone(req: OSINTPhoneScanRequest):
    import time, re
    t0 = time.perf_counter()
    raw_phone = req.phone.strip()
    digits = re.sub(r"[^0-9]", "", raw_phone)
    if len(digits) > 10 and digits.startswith("91"):
        digits = digits[2:]
    if len(digits) != 10:
        digits = digits[-10:] if len(digits) >= 10 else digits.zfill(10)

    prefix_4 = digits[:4]
    prefix_2 = digits[:2]

    # Department of Telecommunications (DoT) Circle Series
    circle = "National GSM / Roaming Circle"
    carrier = "Telecom Operator (Unregistered / MVNO)"

    circle_map = {
        "9810": ("Delhi NCR", "Bharti Airtel Ltd"),
        "9811": ("Delhi NCR", "Vodafone Idea Ltd"),
        "9818": ("Delhi NCR", "Bharti Airtel Ltd"),
        "9871": ("Delhi NCR", "Bharti Airtel Ltd"),
        "9910": ("Delhi NCR", "Bharti Airtel Ltd"),
        "9999": ("Delhi NCR", "Vodafone Idea Ltd"),
        "9820": ("Mumbai Metro", "Vodafone Idea Ltd"),
        "9821": ("Mumbai Metro", "Vodafone Idea Ltd"),
        "9819": ("Mumbai Metro", "Bharti Airtel Ltd"),
        "9892": ("Mumbai Metro", "Bharti Airtel Ltd"),
        "9920": ("Mumbai Metro", "Vodafone Idea Ltd"),
        "9822": ("Maharashtra & Goa (Pune)", "Vodafone Idea Ltd"),
        "9823": ("Maharashtra & Goa (Nagpur)", "Vodafone Idea Ltd"),
        "9850": ("Maharashtra & Goa (Nashik/Pune)", "Bharti Airtel Ltd"),
        "9881": ("Maharashtra & Goa (Pune)", "Bharti Airtel Ltd"),
        "9697": ("Gujarat (Surat Intercept Hub)", "Bharti Airtel Ltd"),
        "9824": ("Gujarat (Ahmedabad)", "Vodafone Idea Ltd"),
        "9825": ("Gujarat (Surat)", "Vodafone Idea Ltd"),
        "9879": ("Gujarat (Vadodara)", "Vodafone Idea Ltd"),
        "9898": ("Gujarat (Rajkot/Surat)", "Bharti Airtel Ltd"),
        "9844": ("Karnataka (Bengaluru)", "Vodafone Idea Ltd"),
        "9845": ("Karnataka (Bengaluru)", "Bharti Airtel Ltd"),
        "9880": ("Karnataka (Bengaluru)", "Bharti Airtel Ltd"),
        "9848": ("AP & Telangana (Hyderabad)", "Bharti Airtel Ltd"),
        "9849": ("AP & Telangana (Hyderabad)", "Bharti Airtel Ltd"),
        "9866": ("AP & Telangana (Hyderabad)", "Bharti Airtel Ltd"),
        "9830": ("Kolkata Metro", "Vodafone Idea Ltd"),
        "9831": ("Kolkata Metro", "Bharti Airtel Ltd"),
        "9814": ("Punjab & Chandigarh", "Vodafone Idea Ltd"),
        "9876": ("Punjab & Chandigarh", "Bharti Airtel Ltd"),
        "9838": ("UP East (Lucknow)", "Bharti Airtel Ltd"),
        "9839": ("UP East (Varanasi/Lucknow)", "Vodafone Idea Ltd"),
        "9837": ("UP West (Noida/Agra)", "Vodafone Idea Ltd"),
        "9828": ("Rajasthan (Jaipur)", "Vodafone Idea Ltd"),
        "9829": ("Rajasthan (Jaipur)", "Bharti Airtel Ltd")
    }

    if prefix_4 in circle_map:
        circle, carrier = circle_map[prefix_4]
    elif prefix_2 in ("70", "80", "81", "82", "83", "63", "62"):
        carrier = "Reliance Jio Infocomm Ltd"
        circle = "Pan-India LTE / 5G Circle"
    elif prefix_2 in ("94", "95"):
        carrier = "Bharat Sanchar Nigam Ltd (BSNL)"
        circle = "State Government Telecom Circle"

    # Cross-reference with Case Intelligence CDRs
    matched_cdrs = [c for c in dataset.cdrs if c.get("caller_phone") == digits or c.get("receiver_phone") == digits or digits in c.get("caller_phone", "") or digits in c.get("receiver_phone", "")]
    total_calls = len(matched_cdrs)
    night_calls = sum(1 for c in matched_cdrs if any(t in c.get("timestamp", "") for t in [" 23:", " 00:", " 01:", " 02:", " 03:", " 04:"]))
    nocturnal_ratio = round(night_calls / max(total_calls, 1), 3)

    cities = list(set(c.get("city", "Surat") for c in matched_cdrs))
    matched_person_id = dataset.person_by_phone.get(digits) or dataset.person_by_phone.get(f"+91-{digits}") or dataset.person_by_phone.get(f"+91{digits}")
    suspect_info = None
    if matched_person_id:
        p = dataset.person_by_id.get(matched_person_id, {})
        suspect_info = {
            "person_id": matched_person_id,
            "name": p.get("name", "Unknown"),
            "role": p.get("predicted_role", "Suspect"),
            "threat_score": p.get("threat_score", 65.0)
        }

    burner_risk = 35.0
    if nocturnal_ratio > 0.35: burner_risk += 35.0
    if total_calls > 10: burner_risk += 15.0
    if suspect_info: burner_risk += 15.0
    burner_risk = min(100.0, burner_risk)

    return {
        "phone_raw": raw_phone,
        "formatted_e164": f"+91 {digits[:5]} {digits[5:]}",
        "telecom_circle": circle,
        "primary_carrier": carrier,
        "status": "ACTIVE_SIM_IDENTIFIED",
        "case_intercepts_count": total_calls,
        "night_calls_count": night_calls,
        "nocturnal_ratio": nocturnal_ratio,
        "cities_pinged": cities or [circle.split()[0]],
        "matched_suspect": suspect_info,
        "burner_risk_score": burner_risk,
        "latency_ms": round((time.perf_counter() - t0) * 1000, 2)
    }

@app.post("/api/osint/scan/network")
def scan_osint_network(req: OSINTNetworkScanRequest):
    import time, socket, urllib.request, json
    t0 = time.perf_counter()
    target = req.target.strip().replace("https://", "").replace("http://", "").split("/")[0]
    if not target:
        raise HTTPException(status_code=400, detail="Target cannot be empty")

    try:
        ip = socket.gethostbyname(target)
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"DNS Resolution failed for target '{target}': {e}")

    try:
        host, _, _ = socket.gethostbyaddr(ip)
    except:
        host = "No PTR record configured"

    geo = {}
    try:
        r = urllib.request.Request(f"http://ip-api.com/json/{ip}", headers={"User-Agent": "CrimeNetOSINT/1.0"})
        with urllib.request.urlopen(r, timeout=3.0) as res:
            geo = json.loads(res.read().decode("utf-8"))
    except Exception as e:
        geo = {"error": str(e)}

    is_private = ip.startswith(("10.", "192.168.", "172.16.", "127."))
    threat_score = 15.0
    if "hosting" in geo.get("isp", "").lower() or "cloud" in geo.get("isp", "").lower():
        threat_score += 30.0
    if is_private:
        threat_score = 0.0

    return {
        "target": target,
        "resolved_ip": ip,
        "reverse_dns": host,
        "country": geo.get("country", "Unknown"),
        "city": geo.get("city", "Unknown"),
        "region": geo.get("regionName", "Unknown"),
        "isp": geo.get("isp", "Unknown"),
        "org": geo.get("org", "Unknown"),
        "as_number": geo.get("as", "Unknown"),
        "is_private_network": is_private,
        "threat_score": min(100.0, threat_score),
        "latency_ms": round((time.perf_counter() - t0) * 1000, 2)
    }
