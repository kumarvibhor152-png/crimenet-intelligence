"""
Automated unit tests for DRISHTI-CRIMENEXUS AI Backend Pipeline.
Tests:
1. Model loading & serialization integrity
2. Suspect inference & role predictions
3. Hawala anomaly scoring
4. Graph link prediction
5. NLP intelligence classification
"""
import unittest
from fastapi.testclient import TestClient
from .server import app, models

class TestAIPipeline(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        cls.client = TestClient(app)

    def test_health_endpoint(self):
        res = self.client.get("/api/health")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["status"], "ONLINE")
        self.assertTrue(data["models_loaded"]["syndicatenet"])
        self.assertTrue(data["models_loaded"]["hawala_autoencoder"])

    def test_model_metrics(self):
        res = self.client.get("/api/models/metrics")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertGreaterEqual(data["accuracy"], 0.90)
        self.assertGreater(len(data["loss_curve"]), 10)
        self.assertGreater(len(data["feature_ranking"]), 5)

    def test_suspects_enriched(self):
        res = self.client.get("/api/suspects")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertEqual(data["count"], 40)
        
        # Test Kunal Khan (P004) - ground truth bridge linchpin
        p004 = next(s for s in data["suspects"] if s["person_id"] == "P004")
        self.assertEqual(p004["ai_predicted_role"], "Syndicate Linchpin / Bridge")
        self.assertGreaterEqual(p004["ai_threat_score"], 80.0)

        # Test Priya Pillai (P016) - narcotics kingpin
        p016 = next(s for s in data["suspects"] if s["person_id"] == "P016")
        self.assertEqual(p016["ai_predicted_role"], "Kingpin")

        # Test Anil Gupta (P007) - fraud kingpin
        p007 = next(s for s in data["suspects"] if s["person_id"] == "P007")
        self.assertEqual(p007["ai_predicted_role"], "Kingpin")

    def test_link_prediction(self):
        # Predict link between two kingpins who avoid direct contact: P016 and P007
        res = self.client.post("/api/predict/link", json={
            "person_a_id": "P016",
            "person_b_id": "P007"
        })
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertGreaterEqual(data["criminal_link_probability"], 0.80)

    def test_hawala_anomalies(self):
        res = self.client.get("/api/hawala/anomalies")
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertGreater(data["anomalies_flagged_count"], 0)
        top_anomaly = data["transactions"][0]
        self.assertGreaterEqual(top_anomaly["ai_anomaly_score"], 50.0)

    def test_nlp_classification(self):
        report = "Surveillance intercepted vehicle MH0451CH4475 carrying suspected narcotics contraband near Mumbai."
        res = self.client.post("/api/nlp/classify", json={"report_text": report})
        self.assertEqual(res.status_code, 200)
        data = res.json()
        self.assertIn("NDPS", data["predicted_statute"])
        self.assertIn("MH0451CH4475", data["extracted_entities"]["vehicle_numbers"])

if __name__ == "__main__":
    unittest.main()
