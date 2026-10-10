"""
Security and Privacy Verification Suite for Sentinel AI.
Ensures zero network traffic, no external socket connections during analysis,
strict absence of sensitive user data in logs, and secure error boundaries.
"""

import socket
import urllib.request
import http.client
from unittest.mock import patch
import pytest
from app import app
from detector.url_analyzer import analyze_url
from detector.message_analyzer import analyze_message


class TestSecurityAndPrivacy:
    def test_no_outbound_network_calls_during_url_scan(self):
        """Verifies that URL analysis never invokes network sockets or HTTP handlers."""
        with patch.object(socket, "socket") as mock_socket, \
             patch.object(socket, "gethostbyname") as mock_gethost, \
             patch.object(urllib.request, "urlopen") as mock_urlopen, \
             patch.object(http.client.HTTPConnection, "connect") as mock_connect:

            # Execute scan on an external-looking phishing URL
            result = analyze_url("https://paypal.com.account-update.xyz/login?user=victim")
            
            # Assert that no networking functions were ever called
            mock_socket.assert_not_called()
            mock_gethost.assert_not_called()
            mock_urlopen.assert_not_called()
            mock_connect.assert_not_called()
            
            assert result["offline_analysis"] is True

    def test_no_outbound_network_calls_during_message_scan(self):
        """Verifies that message analysis never triggers network activity."""
        with patch.object(socket, "socket") as mock_socket, \
             patch.object(socket, "gethostbyname") as mock_gethost, \
             patch.object(urllib.request, "urlopen") as mock_urlopen:

            msg = "Your bank account is frozen. Visit http://185.220.101.5/verify and send your OTP."
            result = analyze_message(msg)

            mock_socket.assert_not_called()
            mock_gethost.assert_not_called()
            mock_urlopen.assert_not_called()
            assert result["offline_analysis"] is True

    def test_sensitive_content_never_leaked_in_error_responses(self):
        """Ensures raw user credentials or sensitive tokens are not mirrored back in error diagnostics."""
        app.config["TESTING"] = True
        client = app.test_client()

        # Send invalid payload with sensitive token string
        secret_content = "CONFIDENTIAL_SUPER_SECRET_OTP_987654"
        response = client.post(
            "/api/scan/url",
            json={"url": 12345, "secret": secret_content}
        )
        assert response.status_code == 422
        body = response.get_data(as_text=True)
        assert secret_content not in body
        assert "Traceback" not in body

    def test_server_error_boundary_sanitizes_stack_trace(self):
        """Simulates an internal error to ensure stack traces and system paths are never leaked."""
        app.config["TESTING"] = True
        client = app.test_client()

        with patch("app.analyze_url", side_effect=RuntimeError("Internal kernel error")):
            response = client.post(
                "/api/scan/url",
                json={"url": "https://example.com"}
            )
            assert response.status_code == 500
            data = response.get_json()
            assert data["status"] == "error"
            assert data["error"]["code"] == "SCAN_ERROR"
            assert "Internal kernel error" not in data["error"]["message"]
            assert "Traceback" not in response.get_data(as_text=True)
