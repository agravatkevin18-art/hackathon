"""
Tests for Sentinel AI URL Threat Analyzer (detector/url_analyzer.py).
Ensures accurate offline detection, scoring bounds, and edge-case resilience.
"""

import pytest
from detector.url_analyzer import analyze_url


class TestURLAnalyzer:
    def test_normal_https_url(self):
        """A benign standard HTTPS URL should receive a LOW risk score."""
        res = analyze_url("https://example.com")
        assert res["status"] == "success"
        assert res["scan_type"] == "url"
        assert res["risk_level"] == "LOW"
        assert res["risk_score"] < 25
        assert res["offline_analysis"] is True
        assert len(res["recommendations"]) > 0

    def test_unencrypted_http_url(self):
        """HTTP URL flags unencrypted protocol indicator."""
        res = analyze_url("http://example.com")
        assert res["status"] == "success"
        codes = [r["code"] for r in res["reasons"]]
        assert "UNENCRYPTED_SCHEME" in codes
        # Unencrypted alone should remain LOW
        assert res["risk_level"] == "LOW"

    def test_ip_literal_hostname(self):
        """Raw IP address hostname triggers IP_LITERAL_HOSTNAME indicator."""
        res = analyze_url("http://192.168.1.1/admin")
        codes = [r["code"] for r in res["reasons"]]
        assert "IP_LITERAL_HOSTNAME" in codes
        assert res["risk_score"] >= 40

    def test_deceptive_subdomain(self):
        """Brand embedded in deceptive subdomain triggers DECEPTIVE_BRAND_IMPERSONATION."""
        res = analyze_url("https://paypal.com.account-update.xyz/login")
        codes = [r["code"] for r in res["reasons"]]
        assert "DECEPTIVE_BRAND_IMPERSONATION" in codes
        assert res["risk_level"] in ("HIGH", "CRITICAL")
        assert res["risk_score"] >= 50

    def test_deceptive_hyphenated_brand(self):
        """Brand name in unofficial registered domain triggers impersonation indicator."""
        res = analyze_url("https://paypal-security-update.com/login")
        codes = [r["code"] for r in res["reasons"]]
        assert "DECEPTIVE_BRAND_IMPERSONATION" in codes
        assert res["risk_score"] >= 50

    def test_malformed_url(self):
        """Malformed or syntactically broken URLs are handled gracefully without crashing."""
        res = analyze_url("http://[invalid-ipv6-bracket")
        assert res["status"] == "success"
        assert "risk_score" in res
        assert "risk_level" in res
        assert isinstance(res["reasons"], list)

    def test_excessively_long_url(self):
        """Abnormally long URLs trigger EXCESSIVE_URL_LENGTH."""
        long_url = "https://example.com/login?" + ("param=" + "a" * 50 + "&") * 25
        res = analyze_url(long_url)
        codes = [r["code"] for r in res["reasons"]]
        assert "EXCESSIVE_URL_LENGTH" in codes

    def test_url_containing_at_symbol_authority(self):
        """Confusing authority with '@' triggers CONFUSING_AUTHORITY_USERINFO with critical severity."""
        res = analyze_url("https://google.com@phishing.site/login")
        codes = [r["code"] for r in res["reasons"]]
        assert "CONFUSING_AUTHORITY_USERINFO" in codes
        assert res["risk_level"] in ("HIGH", "CRITICAL")

    def test_punycode_indicator(self):
        """Punycode hostname triggers PUNYCODE_HOSTNAME indicator."""
        res = analyze_url("https://xn--e1afmkfd.xn--p1ai/signin")
        codes = [r["code"] for r in res["reasons"]]
        assert "PUNYCODE_HOSTNAME" in codes
        assert res["risk_score"] >= 25

    def test_shortened_url(self):
        """Shortened link is flagged as uncertainty indicator without external lookup."""
        res = analyze_url("https://bit.ly/3xY8z9")
        codes = [r["code"] for r in res["reasons"]]
        assert "SHORTENED_URL" in codes
        # Shortening alone is an uncertainty indicator, not definitive proof
        assert res["risk_score"] < 50

    def test_benign_url_with_brand_in_path_only(self):
        """A legitimate domain with brand keyword only in path must NOT trigger brand impersonation."""
        res = analyze_url("https://github.com/company/paypal-integration-tool")
        codes = [r["code"] for r in res["reasons"]]
        assert "DECEPTIVE_BRAND_IMPERSONATION" not in codes
        assert res["risk_level"] == "LOW"

    def test_dangerous_schemes(self):
        """Dangerous URI schemes (javascript:, data:) trigger critical threat."""
        res = analyze_url("javascript:alert(document.cookie)")
        codes = [r["code"] for r in res["reasons"]]
        assert "DANGEROUS_SCHEME" in codes
        assert res["risk_level"] == "CRITICAL"
        assert res["risk_score"] >= 75

    def test_open_redirect_parameter(self):
        """Query parameters redirecting to another target are flagged."""
        res = analyze_url("https://example.com/login?redirect=https://evil-destination.com")
        codes = [r["code"] for r in res["reasons"]]
        assert "SUSPICIOUS_REDIRECT_PARAMETER" in codes

    def test_official_brand_domain_not_flagged(self):
        """Official brand domain is not flagged for impersonation."""
        res = analyze_url("https://www.paypal.com/signin")
        codes = [r["code"] for r in res["reasons"]]
        assert "DECEPTIVE_BRAND_IMPERSONATION" not in codes
        assert res["risk_level"] == "LOW"

    def test_empty_or_non_string_url(self):
        """Empty and non-string inputs handled safely."""
        res_empty = analyze_url("")
        assert res_empty["status"] == "success"
        assert res_empty["risk_score"] == 0

        res_none = analyze_url(None)  # type: ignore
        assert res_none["status"] == "success"
        codes = [r["code"] for r in res_none["reasons"]]
        assert "INVALID_URL_TYPE" in codes
