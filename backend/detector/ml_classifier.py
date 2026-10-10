"""
Sentinel AI - Optional Local Machine Learning Classifier
Provides a lightweight local text classification pipeline for scam detection.

Design & Fallback Contract:
- 100% offline, executing purely on-device via bundled local model artifact.
- Completely optional: If scikit-learn is not available or model asset is missing,
  safely falls back without disrupting the core rule-based detection engine.
- Never reports speculative probabilities or claims unsupported accuracy.
"""

import os
from typing import Optional, Dict, Any

MODEL_PATH = os.path.join(os.path.dirname(__file__), "data", "model.joblib")
METADATA_PATH = os.path.join(os.path.dirname(__file__), "data", "model_metadata.json")

_pipeline = None
_metadata = None
_is_loaded = False


def load_local_model() -> bool:
    """Attempts to safely load the local serialized model pipeline."""
    global _pipeline, _metadata, _is_loaded
    if _is_loaded:
        return _pipeline is not None

    if not os.path.exists(MODEL_PATH):
        _is_loaded = True
        _pipeline = None
        return False

    try:
        import joblib
        _pipeline = joblib.load(MODEL_PATH)
        if os.path.exists(METADATA_PATH):
            import json
            with open(METADATA_PATH, "r", encoding="utf-8") as f:
                _metadata = json.load(f)
        _is_loaded = True
        return True
    except Exception:
        _pipeline = None
        _is_loaded = True
        return False


def classify_text_locally(text: str) -> Optional[Dict[str, Any]]:
    """
    Classifies message text using the local model if available.
    
    Returns:
        Dict with prediction ('scam' or 'benign'), confidence score, and model metadata,
        or None if model is unavailable.
    """
    if not load_local_model() or _pipeline is None:
        return None

    try:
        # Predict probability for class 1 (scam)
        probs = _pipeline.predict_proba([text])[0]
        # Class order is typically [0: benign, 1: scam]
        classes = list(_pipeline.classes_)
        scam_idx = classes.index(1) if 1 in classes else 1
        scam_prob = float(probs[scam_idx])

        return {
            "prediction": "scam" if scam_prob >= 0.5 else "benign",
            "scam_confidence": round(scam_prob, 4),
            "model_version": _metadata.get("version", "1.0.0") if _metadata else "1.0.0",
            "model_type": _metadata.get("algorithm", "TF-IDF + LogisticRegression") if _metadata else "local_linear",
        }
    except Exception:
        return None
