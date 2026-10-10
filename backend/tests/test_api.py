"""
API integration tests for Sentinel AI Flask Endpoints (app.py).
Tests status codes, JSON schema validation, error formatting, and bounds checking.
"""

import json
import pytest
from app import app, MAX_URL_LENGTH, MAX_MESSAGE_LENGTH


@pytest.fixture
def client():
    app.config["TESTING"] = True
    with app.test_client() as client:
        yield client


class TestAPIEndpoints:
    def test_health_endpoint(self, client):
        """Health endpoint returns 200 with service information and offline_mode=True."""
        response = client.get("/api/health")
        assert response.status_code == 200
        data = response.get_json()
        assert data["status"] == "healthy"
        assert data["offline_mode"] is True
        assert "Sentinel AI" in data["service"]
        assert "version" in data
        assert "capabilities" in data

    def test_valid_url_scan(self, client):
        """POST /api/scan/url with valid JSON returns 200 and schema compliant response."""
        payload = {"url": "https://example.com"}
        response = client.post(
            "/api/scan/url",
            data=json.dumps(payload),
            content_type="application/json"
        )
        assert response.status_code == 200
        data = response.get_json()
        assert data["status"] == "success"
        assert data["scan_type"] == "url"
        assert data["risk_level"] == "LOW"
        assert isinstance(data["risk_score"], int)
        assert isinstance(data["reasons"], list)
        assert isinstance(data["recommendations"], list)
        assert data["offline_analysis"] is True
        assert "disclaimer" in data

    def test_valid_message_scan(self, client):
        """POST /api/scan/message with valid JSON returns 200 and scan_type 'message'."""
        payload = {"message": "Please send your OTP code to 555-0199"}
        response = client.post(
            "/api/scan/message",
            data=json.dumps(payload),
            content_type="application/json"
        )
        assert response.status_code == 200
        data = response.get_json()
        assert data["status"] == "success"
        assert data["scan_type"] == "message"
        assert data["risk_level"] in ("HIGH", "CRITICAL")
        assert data["risk_score"] >= 50
        assert data["offline_analysis"] is True

    def test_missing_required_field_url(self, client):
        """Missing 'url' field returns 400 Bad Request with formatted error."""
        response = client.post(
            "/api/scan/url",
            data=json.dumps({"wrong_key": "https://example.com"}),
            content_type="application/json"
        )
        assert response.status_code == 400
        data = response.get_json()
        assert data["status"] == "error"
        assert data["error"]["code"] == "MISSING_FIELD"

    def test_missing_required_field_message(self, client):
        """Missing 'message' field returns 400 Bad Request."""
        response = client.post(
            "/api/scan/message",
            data=json.dumps({}),
            content_type="application/json"
        )
        assert response.status_code == 400
        data = response.get_json()
        assert data["status"] == "error"
        assert data["error"]["code"] == "MISSING_FIELD"

    def test_invalid_content_type(self, client):
        """Non-JSON content type returns 415 Unsupported Media Type."""
        response = client.post(
            "/api/scan/url",
            data="url=https://example.com",
            content_type="application/x-www-form-urlencoded"
        )
        assert response.status_code == 415
        data = response.get_json()
        assert data["status"] == "error"
        assert data["error"]["code"] == "INVALID_CONTENT_TYPE"

    def test_invalid_json_body(self, client):
        """Malformed JSON payload returns 400 Bad Request."""
        response = client.post(
            "/api/scan/url",
            data="{malformed-json",
            content_type="application/json"
        )
        assert response.status_code == 400
        data = response.get_json()
        assert data["status"] == "error"
        assert data["error"]["code"] == "MALFORMED_JSON"

    def test_wrong_field_type(self, client):
        """Non-string value for 'url' returns 422 Unprocessable Entity."""
        response = client.post(
            "/api/scan/url",
            data=json.dumps({"url": 12345}),
            content_type="application/json"
        )
        assert response.status_code == 422
        data = response.get_json()
        assert data["status"] == "error"
        assert data["error"]["code"] == "INVALID_FIELD_TYPE"

    def test_oversized_url_request(self, client):
        """URL exceeding maximum allowed length returns 413 Payload Too Large."""
        oversized_url = "https://example.com/" + "a" * (MAX_URL_LENGTH + 10)
        response = client.post(
            "/api/scan/url",
            data=json.dumps({"url": oversized_url}),
            content_type="application/json"
        )
        assert response.status_code == 413
        data = response.get_json()
        assert data["status"] == "error"
        assert data["error"]["code"] == "PAYLOAD_TOO_LARGE"

    def test_oversized_message_request(self, client):
        """Message exceeding maximum allowed length returns 413 Payload Too Large."""
        oversized_msg = "A" * (MAX_MESSAGE_LENGTH + 10)
        response = client.post(
            "/api/scan/message",
            data=json.dumps({"message": oversized_msg}),
            content_type="application/json"
        )
        assert response.status_code == 413
        data = response.get_json()
        assert data["status"] == "error"
        assert data["error"]["code"] == "PAYLOAD_TOO_LARGE"

    def test_options_cors_preflight(self, client):
        """OPTIONS preflight requests return 200 with appropriate CORS headers."""
        response = client.open("/api/scan/url", method="OPTIONS")
        assert response.status_code == 200
        assert response.headers.get("Access-Control-Allow-Origin") == "*"
        assert "Content-Type" in response.headers.get("Access-Control-Allow-Headers", "")
