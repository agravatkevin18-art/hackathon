"""
Tests for Sentinel AI Message Threat Analyzer (detector/message_analyzer.py).
Validates scam detection, context mitigation, false positive handling, and link nesting.
"""

import pytest
from detector.message_analyzer import analyze_message


class TestMessageAnalyzer:
    def test_otp_request(self):
        """Direct OTP/credential solicitation is flagged as high/critical risk."""
        msg = "Dear user, please send your OTP verification code to keep your account active."
        res = analyze_message(msg)
        assert res["status"] == "success"
        codes = [r["code"] for r in res["reasons"]]
        assert "CREDENTIAL_HARVESTING_REQUEST" in codes
        assert res["risk_level"] in ("HIGH", "CRITICAL")
        assert res["risk_score"] >= 50

    def test_urgent_payment_demand(self):
        """Urgent demand threatening suspension triggers urgency and coercion."""
        msg = "URGENT: Immediate payment required within 24 hours or your account will be suspended."
        res = analyze_message(msg)
        codes = [r["code"] for r in res["reasons"]]
        assert "URGENCY_OR_COERCION_TACTIC" in codes
        assert res["risk_score"] >= 25

    def test_prize_requiring_advance_fee(self):
        """Advance-fee lottery or prize claims trigger financial scam indicator."""
        msg = "Congratulations! You have won $1,000,000 in the international lottery. Pay $250 processing fee to claim."
        res = analyze_message(msg)
        codes = [r["code"] for r in res["reasons"]]
        assert "FINANCIAL_SCAM_PATTERN" in codes
        assert res["risk_score"] >= 45

    def test_ordinary_greeting(self):
        """Everyday benign conversation returns low score and zero false alarms."""
        msg = "Hey Sahil, are we still meeting for lunch at 1 PM today?"
        res = analyze_message(msg)
        assert res["status"] == "success"
        assert res["risk_level"] == "LOW"
        assert res["risk_score"] == 0
        assert len(res["reasons"]) == 0

    def test_legitimate_security_education(self):
        """Security tips mentioning OTPs must NOT trigger credential harvesting."""
        msg = "Security Tip: Never share your OTP or password with anyone. Our bank will never ask for your credentials."
        res = analyze_message(msg)
        codes = [r["code"] for r in res["reasons"]]
        assert "CREDENTIAL_HARVESTING_REQUEST" not in codes
        assert "EDUCATIONAL_SECURITY_CONTEXT" in codes
        assert res["risk_level"] == "LOW"
        assert res["risk_score"] < 25

    def test_warning_about_phishing(self):
        """General fraud warning discussing scams must not be treated as a threat."""
        msg = "Fraud advisory: Beware of scammers impersonating the tax department and asking for gift cards."
        res = analyze_message(msg)
        assert "EDUCATIONAL_SECURITY_CONTEXT" in [r["code"] for r in res["reasons"]]
        assert res["risk_level"] == "LOW"
        assert res["risk_score"] < 25

    def test_message_containing_suspicious_url(self):
        """Message containing a deceptive link extracts and scores the embedded threat."""
        msg = "Your parcel delivery failed. Confirm address immediately at https://usps.com.tracking-update.xyz/login"
        res = analyze_message(msg)
        codes = [r["code"] for r in res["reasons"]]
        assert "HIGH_RISK_EMBEDDED_LINK" in codes
        assert res["risk_level"] in ("HIGH", "CRITICAL")
        assert res["risk_score"] >= 50

    def test_empty_message(self):
        """Empty string handled cleanly with low score."""
        res = analyze_message("   ")
        assert res["status"] == "success"
        assert res["risk_level"] == "LOW"
        assert res["risk_score"] == 0
        codes = [r["code"] for r in res["reasons"]]
        assert "EMPTY_MESSAGE" in codes

    def test_oversized_message_handled(self):
        """Large benign text handled gracefully without timeout or crash."""
        large_text = "Good morning everyone. " * 500
        res = analyze_message(large_text)
        assert res["status"] == "success"
        assert res["risk_level"] == "LOW"

    def test_gift_card_payment_scam(self):
        """Gift card coercion triggers financial scam indicator."""
        msg = "Official notice from IRS: To avoid arrest warrant, pay penalty immediately using Apple gift cards."
        res = analyze_message(msg)
        codes = [r["code"] for r in res["reasons"]]
        assert "FINANCIAL_SCAM_PATTERN" in codes
        assert "URGENCY_OR_COERCION_TACTIC" in codes
        assert res["risk_level"] in ("HIGH", "CRITICAL")
