"""
DRISHTI-CRIMENEXUS Backend Launcher.
Trains AI models if not already trained, then boots FastAPI server on port 8000.
"""
import sys
import os
import uvicorn
from pathlib import Path

# Ensure UTF-8 output on Windows consoles
if sys.platform == "win32":
    sys.stdout.reconfigure(encoding="utf-8")

from backend.train_models import run_training_pipeline

if __name__ == "__main__":
    models_dir = Path(__file__).resolve().parent / "backend" / "models"
    if not (models_dir / "syndicatenet.pt").exists():
        print("Model weights not detected. Training models now...")
        run_training_pipeline()

    print("=================================================================")
    print("  [*] DRISHTI-CRIMENEXUS AI BACKEND LAUNCHING ON PORT 8000       ")
    print("  API Docs: http://127.0.0.1:8000/docs                           ")
    print("  Health:   http://127.0.0.1:8000/api/health                     ")
    print("=================================================================")
    uvicorn.run("backend.server:app", host="127.0.0.1", port=8000, reload=False, log_level="info")
