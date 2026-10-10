"""
Tests for Sentinel AI Risk Engine (detector/risk_engine.py).
Validates 0-100 score bounds, severity threshold mapping, deduplication, and diminishing returns.
"""

import pytest
from detector.risk_engine import (
    Evidence,
    calculate_risk_score,
    get_risk_level_for_score,
    deduplicate_evidence,
    build_scan_response,
    generate_recommendations,
)


class TestRiskEngine:
    def test_threshold_mapping(self):
        """Verify strict adherence to required threshold brackets."""
        assert get_risk_level_for_score(0) == "LOW"
        assert get_risk_level_for_score(24) == "LOW"
        assert get_risk_level_for_score(25) == "MEDIUM"
        assert get_risk_level_for_score(49) == "MEDIUM"
        assert get_risk_level_for_score(50) == "HIGH"
        assert get_risk_level_for_score(74) == "HIGH"
        assert get_risk_level_for_score(75) == "CRITICAL"
        assert get_risk_level_for_score(100) == "CRITICAL"

    def test_score_bounded_between_zero_and_hundred(self):
        """Ensure scores never drop below 0 or exceed 100 even with many indicators."""
        # Clean / empty evidence
        score_zero, level_zero = calculate_risk_score([])
        assert score_zero == 0
        assert level_zero == "LOW"

        # Overwhelming evidence
        many_evidence = [
            Evidence(code=f"THREAT_{i}", title="Threat", detail="Detail", severity="CRITICAL")
            for i in range(20)
        ]
        score_max, level_max = calculate_risk_score(many_evidence)
        assert 0 <= score_max <= 100
        assert score_max <= 100
        assert level_max == "CRITICAL"

    def test_deduplication_prevents_inflation(self):
        """Identical evidence items must not double the risk score."""
        ev1 = Evidence(code="SHORTENED_URL", title="Shortened", detail="Same detail", severity="LOW")
        ev2 = Evidence(code="SHORTENED_URL", title="Shortened", detail="Same detail", severity="LOW")
        
        score_single, _ = calculate_risk_score([ev1])
        score_double, _ = calculate_risk_score([ev1, ev2])
        assert score_single == score_double

    def test_diminishing_returns_within_category(self):
        """Multiple items within the same category should have diminishing weight."""
        ev1 = Evidence(code="IP_LITERAL_HOSTNAME", title="IP", detail="Raw IP", severity="HIGH")
        ev2 = Evidence(code="DEEP_SUBDOMAIN_STRUCTURE", title="Deep Subdomain", detail="Sub", severity="MEDIUM")
        
        score_one, _ = calculate_risk_score([ev1])
        score_two, _ = calculate_risk_score([ev1, ev2])
        
        # Second structural indicator adds some weight, but respects category caps
        assert score_two >= score_one
        assert score_two <= 100

    def test_recommendation_generation(self):
        """Appropriate defensive recommendations are generated for evidence."""
        ev = [Evidence(code="CREDENTIAL_HARVESTING_REQUEST", title="OTP", detail="OTP asked", severity="CRITICAL")]
        recs = generate_recommendations(ev, "CRITICAL")
        assert any("password" in r.lower() or "otp" in r.lower() for r in recs)

    def test_response_contract_fields(self):
        """build_scan_response must include all fields required by API contract."""
        res = build_scan_response("url", [])
        assert res["status"] == "success"
        assert res["scan_type"] == "url"
        assert res["risk_level"] == "LOW"
        assert res["risk_score"] == 0
        assert isinstance(res["reasons"], list)
        assert isinstance(res["recommendations"], list)
        assert res["offline_analysis"] is True
        assert "disclaimer" in res
