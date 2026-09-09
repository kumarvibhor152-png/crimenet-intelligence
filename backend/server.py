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
    # Construct feature row with defaults for missing
    means = np.array(models.norm_stats["means"])
    stds = np.array(models.norm_stats["stds"])
    
    row = np.copy(means)
    data_dict = data.dict()
    for k, v in data_dict.items():
        if k in FEATURE_NAMES:
            idx = FEATURE_NAMES.index(k)
            row[idx] = float(v)
            
    norm_row = (row - means) / stds
    tensor_input = torch.tensor(norm_row, dtype=torch.float32).unsqueeze(0)
    
    with torch.no_grad():
        logits, threat = models.syndicatenet(tensor_input)
        probs = torch.softmax(logits, dim=1).squeeze().numpy()
        pred_idx = int(np.argmax(probs))
        threat_val = float(threat.squeeze().numpy())

    return {
        "predicted_role": ROLE_CLASSES[pred_idx],
        "confidence": round(float(probs[pred_idx]), 4),
        "threat_score": round(threat_val, 1),
        "role_probabilities": {ROLE_CLASSES[i]: round(float(probs[i]), 4) for i in range(len(ROLE_CLASSES))}
    }

@app.post("/api/predict/link")
def predict_criminal_link(req: LinkPredictRequest):
    u = req.person_a_id
    v = req.person_b_id
    if u == v:
        return {
            "person_a_id": u,
            "person_b_id": v,
            "criminal_link_probability": 1.0,
            "direct_contact": True,
            "common_associates_count": 0,
            "status": "Identical Subject"
        }
        
    pair_key1 = f"{u}_{v}"
    pair_key2 = f"{v}_{u}"
    link_info = models.link_cache.get(pair_key1) or models.link_cache.get(pair_key2)
    
    if not link_info:
        return {
            "person_a_id": u,
            "person_b_id": v,
            "criminal_link_probability": 0.05,
            "direct_contact": False,
            "common_associates_count": 0,
            "status": "Unconnected / Isolated"
        }

    person_a = dataset.person_by_id.get(u, {})
    person_b = dataset.person_by_id.get(v, {})

    return {
        "person_a": {"id": u, "name": person_a.get("name", u)},
        "person_b": {"id": v, "name": person_b.get("name", v)},
        **link_info
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
    
    # Extract entities (phones, vehicles, accounts, IPC sections)
    import re
    phones = re.findall(r"\b[6-9]\d{9}\b", text)
    vehicles = re.findall(r"\b[A-Z]{2}\d{2,4}[A-Z]{1,2}\d{4}\b", text)
    accounts = re.findall(r"\b(?:HDFC|ICICI|SBI|Axis|PNB|Bank of Baroda)-\d{10,14}\b", text)
    
    threat = "HIGH" if ("NDPS" in pred_label or "PMLA" in pred_label) else "MEDIUM"

    return {
        "predicted_statute": pred_label,
        "threat_level": threat,
        "confidence": round(float(np.max(probs)), 3),
        "class_probabilities": prob_dict,
        "extracted_entities": {
            "phone_numbers": list(set(phones)),
            "vehicle_numbers": list(set(vehicles)),
            "bank_accounts": list(set(accounts))
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
