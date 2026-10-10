"""
Tests for Sentinel AI Optional Local ML Classifier (detector/ml_classifier.py).
Ensures local execution, safe fallback if model missing, and prediction formatting.
"""

from unittest.mock import patch
import pytest
from detector.ml_classifier import classify_text_locally, load_local_model


class TestMLClassifier:
    def test_local_model_prediction_structure(self):
        """When local model artifact is present, classify_text_locally returns structured metrics."""
        res = classify_text_locally("URGENT: Your bank account is locked. Reply with OTP.")
        assert res is not None
        assert res["prediction"] in ("scam", "benign")
        assert 0.0 <= res["scam_confidence"] <= 1.0
        assert "model_version" in res
        assert "model_type" in res

    def test_benign_text_prediction(self):
        """Benign text is predicted as benign with low scam confidence."""
        res = classify_text_locally("Hey, let's catch up tomorrow for lunch.")
        assert res is not None
        assert res["prediction"] == "benign"

    def test_graceful_fallback_when_model_missing(self):
        """If model file cannot be found, gracefully returns None without throwing exceptions."""
        with patch("os.path.exists", return_value=False):
            with patch("detector.ml_classifier._is_loaded", False):
                with patch("detector.ml_classifier._pipeline", None):
                    result = classify_text_locally("Any sample text")
                    assert result is None
