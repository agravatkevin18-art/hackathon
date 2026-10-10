"""
Sentinel AI - Local Detection Engine Package
Exports clean interfaces for URL and message threat detection.
"""

from detector.url_analyzer import analyze_url
from detector.message_analyzer import analyze_message
from detector.risk_engine import build_scan_response, calculate_risk_score, Evidence

__all__ = [
    "analyze_url",
    "analyze_message",
    "build_scan_response",
    "calculate_risk_score",
    "Evidence",
]
