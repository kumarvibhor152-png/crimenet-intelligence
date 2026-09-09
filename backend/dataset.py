"""
DRISHTI-CRIMENEXUS Dataset & Cross-Reference Engine.
Loads intelligence datasets from backend/data/*.json and builds multi-relational graphs.
"""
import json
from pathlib import Path
from typing import Dict, List, Any, Optional

DATA_DIR = Path(__file__).resolve().parent / "data"

def load_json(filename: str):
    path = DATA_DIR / filename
    if not path.exists():
        raise FileNotFoundError(f"Data file {path} not found")
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)

class CrimeDataset:
    def __init__(self):
        self.persons: List[Dict[str, Any]] = load_json("persons.json")
        self.organizations: List[Dict[str, Any]] = load_json("organizations.json")
        self.prior_cases: List[Dict[str, Any]] = load_json("prior_cases.json")
        self.detailed_firs: List[Dict[str, Any]] = load_json("detailed_firs.json")
        self.cdrs: List[Dict[str, Any]] = load_json("cdrs.json")
        self.financial_txns: List[Dict[str, Any]] = load_json("financial_txns.json")
        self.surveillance_reports: List[Dict[str, Any]] = load_json("surveillance_reports.json")
        self.social_posts: List[Dict[str, Any]] = load_json("social_posts.json")
        self.ground_truth: Dict[str, Any] = load_json("ground_truth.json")
        self.city_coords: Dict[str, Any] = load_json("city_coords.json")
        
        self.build_indexes()
        
    def build_indexes(self):
        self.person_by_id = {p["person_id"]: p for p in self.persons}
        self.org_by_id = {o["org_id"]: o for o in self.organizations}
        
        # Phone index
        self.person_by_phone = {}
        for p in self.persons:
            if p.get("phone"):
                self.person_by_phone[p["phone"]] = p["person_id"]
            if p.get("alt_phone"):
                self.person_by_phone[p["alt_phone"]] = p["person_id"]
                
        # Bank Account index
        self.entity_by_account = {}
        for p in self.persons:
            if p.get("bank_account"):
                self.entity_by_account[p["bank_account"]] = {"type": "person", "id": p["person_id"]}
        for o in self.organizations:
            if o.get("account_no"):
                self.entity_by_account[o["account_no"]] = {"type": "organization", "id": o["org_id"]}
                
        # Aggregate all FIRs (prior + detailed)
        self.all_firs = list(self.prior_cases)
        for df in self.detailed_firs:
            for accused_id in df.get("accused_ids", []):
                self.all_firs.append({
                    "person_id": accused_id,
                    "name": self.person_by_id.get(accused_id, {}).get("name", ""),
                    "fir_no": df["fir_no"],
                    "section": df["sections"],
                    "year": int(df["date"].split("-")[0]),
                    "status": "Active Accused / Pending",
                    "police_station": df.get("police_station", ""),
                    "location_city": df.get("location_city", ""),
                    "narrative": df.get("narrative", "")
                })

# Global singleton dataset
dataset = CrimeDataset()
