"""
Sentinel AI - Local Threat Detection API
Flask backend providing on-device threat, phishing, and scam detection.

Security & Privacy Guarantees:
- Zero external outbound network requests.
- No third-party cloud inference or external telemetry.
- No persistent storage of scanned content or URLs.
- User input is kept in ephemeral local process memory during scanning only.
- Submitted content is never recorded into server error logs.
"""

import os
import sys

# Ensure backend root is in Python sys.path
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from typing import Dict, Any, Tuple
from flask import Flask, request, jsonify, Response
from werkzeug.exceptions import HTTPException

from detector.url_analyzer import analyze_url
from detector.message_analyzer import analyze_message

# Maximum input constraints to prevent memory exhaustion and DoS
MAX_URL_LENGTH = 4096
MAX_MESSAGE_LENGTH = 20000

app = Flask(__name__)
# Restrict maximum incoming payload size to 256KB
app.config["MAX_CONTENT_LENGTH"] = 256 * 1024


def create_error_response(
    code: str,
    message: str,
    status_code: int
) -> Tuple[Response, int]:
    """Generates standardized error response without leaking internal state."""
    response = jsonify({
        "status": "error",
        "error": {
            "code": code,
            "message": message,
        }
    })
    return response, status_code


@app.after_request
def add_cors_and_security_headers(response: Response) -> Response:
    """Configures CORS for local frontend integration and sets defensive headers."""
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    response.headers["X-Content-Type-Options"] = "nosniff"
    response.headers["X-Frame-Options"] = "DENY"
    return response


@app.route("/api/health", methods=["GET"])
def health_check() -> Tuple[Response, int]:
    """
    Local health verification endpoint.
    Reports operational status without exposing private system details.
    """
    return jsonify({
        "status": "healthy",
        "service": "Sentinel AI Detection Engine",
        "version": "1.0.0",
        "offline_mode": True,
        "capabilities": [
            "on_device_url_analysis",
            "on_device_message_analysis",
            "explainable_heuristic_risk_engine",
        ],
    }), 200


@app.route("/api/scan/url", methods=["POST", "OPTIONS"])
def scan_url_endpoint() -> Tuple[Response, int]:
    """
    Scans a URL string locally for phishing, typosquatting, and deceptive structure.
    """
    if request.method == "OPTIONS":
        return jsonify({"status": "ok"}), 200

    # Content-Type validation
    if not request.is_json:
        return create_error_response(
            code="INVALID_CONTENT_TYPE",
            message="Content-Type must be 'application/json'.",
            status_code=415,
        )

    try:
        body = request.get_json(silent=True)
    except Exception:
        body = None

    if body is None or not isinstance(body, dict):
        return create_error_response(
            code="MALFORMED_JSON",
            message="Request body must be a valid JSON object.",
            status_code=400,
        )

    if "url" not in body:
        return create_error_response(
            code="MISSING_FIELD",
            message="Required field 'url' is missing.",
            status_code=400,
        )

    raw_url = body.get("url")
    if not isinstance(raw_url, str):
        return create_error_response(
            code="INVALID_FIELD_TYPE",
            message="Field 'url' must be a string.",
            status_code=422,
        )

    if len(raw_url) > MAX_URL_LENGTH:
        return create_error_response(
            code="PAYLOAD_TOO_LARGE",
            message=f"URL exceeds maximum allowed length of {MAX_URL_LENGTH} characters.",
            status_code=413,
        )

    try:
        result = analyze_url(raw_url)
        return jsonify(result), 200
    except Exception:
        # Intentionally do NOT log the raw URL to maintain privacy
        return create_error_response(
            code="SCAN_ERROR",
            message="An unexpected error occurred during local URL analysis.",
            status_code=500,
        )


@app.route("/api/scan/message", methods=["POST", "OPTIONS"])
def scan_message_endpoint() -> Tuple[Response, int]:
    """
    Scans a message text locally for credential harvesting, coercion, and scams.
    """
    if request.method == "OPTIONS":
        return jsonify({"status": "ok"}), 200

    if not request.is_json:
        return create_error_response(
            code="INVALID_CONTENT_TYPE",
            message="Content-Type must be 'application/json'.",
            status_code=415,
        )

    try:
        body = request.get_json(silent=True)
    except Exception:
        body = None

    if body is None or not isinstance(body, dict):
        return create_error_response(
            code="MALFORMED_JSON",
            message="Request body must be a valid JSON object.",
            status_code=400,
        )

    if "message" not in body:
        return create_error_response(
            code="MISSING_FIELD",
            message="Required field 'message' is missing.",
            status_code=400,
        )

    raw_message = body.get("message")
    if not isinstance(raw_message, str):
        return create_error_response(
            code="INVALID_FIELD_TYPE",
            message="Field 'message' must be a string.",
            status_code=422,
        )

    if len(raw_message) > MAX_MESSAGE_LENGTH:
        return create_error_response(
            code="PAYLOAD_TOO_LARGE",
            message=f"Message exceeds maximum allowed length of {MAX_MESSAGE_LENGTH} characters.",
            status_code=413,
        )

    try:
        result = analyze_message(raw_message)
        return jsonify(result), 200
    except Exception:
        # Intentionally do NOT log the message contents to maintain privacy
        return create_error_response(
            code="SCAN_ERROR",
            message="An unexpected error occurred during local message analysis.",
            status_code=500,
        )


# Global Error Handlers for RFC Compliance
@app.errorhandler(400)
def handle_bad_request(e: Exception) -> Tuple[Response, int]:
    return create_error_response("BAD_REQUEST", "Bad request syntax or parameters.", 400)


@app.errorhandler(404)
def handle_not_found(e: Exception) -> Tuple[Response, int]:
    return create_error_response("NOT_FOUND", "The requested API endpoint was not found.", 404)


@app.errorhandler(405)
def handle_method_not_allowed(e: Exception) -> Tuple[Response, int]:
    return create_error_response("METHOD_NOT_ALLOWED", "HTTP method is not allowed for this route.", 405)


@app.errorhandler(413)
def handle_payload_too_large(e: Exception) -> Tuple[Response, int]:
    return create_error_response("PAYLOAD_TOO_LARGE", "Request payload exceeds allowed size limit.", 413)


@app.errorhandler(415)
def handle_unsupported_media(e: Exception) -> Tuple[Response, int]:
    return create_error_response("UNSUPPORTED_MEDIA_TYPE", "Unsupported media type. JSON is required.", 415)


@app.errorhandler(500)
def handle_server_error(e: Exception) -> Tuple[Response, int]:
    return create_error_response("INTERNAL_SERVER_ERROR", "Internal server error occurred.", 500)


if __name__ == "__main__":
    # Local development server for Sentinel AI
    # Explicitly binds to localhost; no external telemetry.
    app.run(host="127.0.0.1", port=5000, debug=False)
