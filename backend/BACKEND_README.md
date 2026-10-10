# Sentinel AI — On-Device Threat, Phishing & Scam Detection Engine

**Hackathon Team:** Creative Criminals  
**Problem Statement:** PS-05 — On-Device Threat, Phishing, and Scam Detection  
**Engineer:** Agravat Kevin (Senior Python Backend Engineer & Local Threat Detection Specialist)  
**Teammates:**
- **Sujal Bendkar:** Architecture & Integration Lead
- **Agravat Kevin:** Backend & Detection Engine Lead
- **Vishvrajsinh Sisodiya:** Frontend Developer
- **Hirva Chaniyara:** Product Strategy, QA Coordination & Presentation

---

## 1. Executive Summary & Privacy Architecture

Sentinel AI provides real-time, explainable threat scoring for suspicious URLs, text messages, SMS, and emails while keeping **all analyzed content strictly on the local device**.

### Fixed Privacy & Architectural Guarantees
- **Zero Outbound Network Traffic:** Scanning logic contains no `socket` connections, no DNS lookups (`gethostbyname`), no HTTP client calls, no external threat intelligence APIs, and no cloud inference.
- **In-Memory Ephemeral Analysis:** Scanned text and URLs are held exclusively in local process memory during lexical evaluation.
- **Zero Logging of User Content:** Submitted messages, credentials, and sensitive parameters are never printed to server logs or exception traces.
- **Deterministic & Explainable:** Every risk score (0–100) maps directly to concrete, inspectable evidence objects (`code`, `title`, `detail`, `severity`).
- **Core Functionality Independent of Cloud & Heavy ML:** The detection engine is 100% operational with its deterministic rules and offline heuristics. An optional local linear text classifier is bundled with measured evaluation provenance.

---

## 2. Project Structure

```
hackathon/
├── app.py                          # Production Flask API & security boundaries
├── requirements.txt                # Fixed minimal dependencies (Flask, pytest)
├── README.md                       # Complete backend documentation & integration guide
├── detector/
│   ├── __init__.py                 # Public package interface
│   ├── risk_engine.py              # Centralized 0-100 scoring, deduplication & recommendations
│   ├── url_analyzer.py             # Purely local URL structural & heuristic analyzer
│   ├── message_analyzer.py         # Local message & contextual scam detector
│   ├── ml_classifier.py            # Optional offline scikit-learn text classifier
│   └── data/
│       ├── __init__.py
│       ├── constants.py            # Offline datasets (shorteners, brands, abusive TLDs)
│       ├── model.joblib            # Serialized local ML artifact (TF-IDF + LogisticRegression)
│       └── model_metadata.json     # Documented training provenance & measured metrics
├── scripts/
│   └── train_eval_local_ml.py      # Reproducible model training & held-out evaluation script
└── tests/
    ├── __init__.py
    ├── test_api.py                 # Flask endpoints, HTTP statuses, and error validation
    ├── test_url_analyzer.py        # URL structures, homoglyphs, brands, and edge cases
    ├── test_message_analyzer.py    # Scam messages, OTPs, warnings, and links
    ├── test_risk_engine.py         # Severity brackets, scoring bounds, deduplication
    ├── test_security_privacy.py    # Mock socket & network interception verification
    └── test_ml_classifier.py       # Local ML predictions & graceful fallback tests
```

---

## 3. Quick Start & Execution

### Prerequisites
- Python 3.9+ (Python 3.11+ recommended)
- Virtual environment (`venv`)

### Installation
```bash
# 1. Create and activate a local virtual environment
python3 -m venv .venv
source .venv/bin/activate

# 2. Install dependencies
pip install -r requirements.txt
```

### Running the API Server
```bash
python3 app.py
```
The server will start on `http://127.0.0.1:5000` with CORS preconfigured for local frontend development.

---

## 4. API Endpoints & Contract Specification

### A. Health Check
`GET /api/health`

**Sample Response (HTTP 200):**
```json
{
  "capabilities": [
    "on_device_url_analysis",
    "on_device_message_analysis",
    "explainable_heuristic_risk_engine"
  ],
  "offline_mode": true,
  "service": "Sentinel AI Detection Engine",
  "status": "healthy",
  "version": "1.0.0"
}
```

---

### B. URL Threat Analysis
`POST /api/scan/url`

**Request Headers:** `Content-Type: application/json`  
**Request Body:**
```json
{
  "url": "https://paypal.com.account-update.xyz/login"
}
```

**Success Response (HTTP 200):**
```json
{
  "disclaimer": "This heuristic assessment cannot guarantee safety. Zero indicators detected does not verify content as completely safe.",
  "offline_analysis": true,
  "reasons": [
    {
      "code": "HIGH_RISK_TLD",
      "detail": "TLD '.xyz' is associated with disproportionate rates of malicious activity and free registration campaigns.",
      "severity": "LOW",
      "title": "High-Abuse Top-Level Domain"
    },
    {
      "code": "DECEPTIVE_BRAND_IMPERSONATION",
      "detail": "Target brand 'paypal' embedded inside deceptive subdomain 'paypal.com.account-update'.",
      "severity": "HIGH",
      "title": "Deceptive Brand in Subdomain"
    },
    {
      "code": "SENSITIVE_CREDENTIAL_PATH",
      "detail": "URL targets sensitive path '/login' on an unverified host.",
      "severity": "MEDIUM",
      "title": "Sensitive Action Path on Untrusted Host"
    }
  ],
  "recommendations": [
    "Do not use links or contact details provided in this content. Navigate manually to the verified official website or use official phone numbers.",
    "Treat this content as untrusted. Do not interact with links or submit sensitive details."
  ],
  "risk_level": "CRITICAL",
  "risk_score": 100,
  "scan_type": "url",
  "status": "success"
}
```

---

### C. Message & Scam Threat Analysis
`POST /api/scan/message`

**Request Headers:** `Content-Type: application/json`  
**Request Body:**
```json
{
  "message": "Urgent: Your account is suspended. Send your OTP immediately to verify."
}
```

**Success Response (HTTP 200):**
```json
{
  "disclaimer": "This heuristic assessment cannot guarantee safety. Zero indicators detected does not verify content as completely safe.",
  "offline_analysis": true,
  "reasons": [
    {
      "code": "CREDENTIAL_HARVESTING_REQUEST",
      "detail": "Message explicitly prompts recipient for sensitive authentication data ('Send your OTP').",
      "severity": "CRITICAL",
      "title": "Direct Credential or OTP Request"
    },
    {
      "code": "URGENCY_OR_COERCION_TACTIC",
      "detail": "Employs pressure language threatening account termination or immediate penalties ('account is suspended').",
      "severity": "MEDIUM",
      "title": "Artificial Urgency or Coercion Pressure"
    }
  ],
  "recommendations": [
    "Do NOT provide passwords, OTPs, PINs, or verification codes. Legitimate providers never ask for security codes via SMS or email.",
    "Pause and ignore artificial deadlines. Attackers manufacture urgency and threats of immediate suspension to bypass critical thinking.",
    "Treat this content as untrusted. Do not interact with links or submit sensitive details."
  ],
  "risk_level": "CRITICAL",
  "risk_score": 90,
  "scan_type": "message",
  "status": "success"
}
```

---

## 5. Risk Scoring Engine Architecture

The risk engine (`detector/risk_engine.py`) maps cumulative evidence to a deterministic **0 to 100** integer scale.

### Severity Thresholds
| Range | Severity Level | Meaning |
|---|---|---|
| **0 – 24** | `LOW` | Benign or baseline indicators; no high-confidence threat detected. |
| **25 – 49** | `MEDIUM` | Ambiguous signals, URL shorteners, or unencrypted transport; caution required. |
| **50 – 74** | `HIGH` | Multiple correlated threat indicators; likely phishing or scam attempt. |
| **75 – 100** | `CRITICAL` | Severe indicators (active credential harvesting, deceptive '@' authority, brand spoofing). |

### Anti-Inflation & Explainability Principles
1. **Deduplication:** Repeated identical indicators are merged; repeating an indicator will not inflate the score.
2. **Category Caps & Diminishing Returns:** Indicators are grouped into categories (`host_structure`, `deception`, `credentials`, `coercion`, `financial`). Subsequent indicators within the same category contribute diminishing marginal weights (100% for 1st, 50% for 2nd, 25% for 3rd, subject to a strict category cap).
3. **Synergy Boost:** Coordinated attacks triggering 3 or more independent threat categories receive a synergy adjustment reflecting multi-stage attack sophistication.
4. **Contextual Mitigation:** Educational advisories (e.g., *"Security Tip: Never share your OTP"*) and verified official brand domains receive automatic negative risk adjustments to prevent false alarms.
5. **No False Guarantees:** A score of 0 explicitly includes the disclaimer that lack of heuristic evidence does not certify the item as 100% benign.

---

## 6. Frontend Contract (Notes for Vishvrajsinh Sisodiya)

The frontend can safely rely on these guaranteed fields in every successful scan:
1. `status` (`"success"`)
2. `scan_type` (`"url"` or `"message"`)
3. `risk_score` (Integer from `0` to `100`)
4. `risk_level` (`"LOW"`, `"MEDIUM"`, `"HIGH"`, or `"CRITICAL"`)
5. `reasons` (Array of objects with `code`, `title`, `detail`, `severity`)
6. `recommendations` (Array of actionable advice strings)
7. `offline_analysis` (`true`)
8. `disclaimer` (String noting heuristic limitations)

In case of error, the response format is consistently:
```json
{
  "status": "error",
  "error": {
    "code": "MISSING_FIELD",
    "message": "Required field 'url' is missing."
  }
}
```
HTTP status codes used:
- `200`: Success
- `400`: Missing required field / Malformed JSON
- `413`: Payload Too Large (URL > 4096 chars, Message > 20000 chars)
- `415`: Unsupported Media Type (Must be `application/json`)
- `422`: Unprocessable Entity (Wrong field types)
- `500`: Internal Server Error (Sanitized, no stack traces leaked)

---

## 7. Architecture & Integration (Notes for Sujal Bendkar)

### Python Module Signatures
```python
from detector.url_analyzer import analyze_url
from detector.message_analyzer import analyze_message

# URL Analysis
url_result: dict = analyze_url("https://example.com")

# Message Analysis
msg_result: dict = analyze_message("Example suspicious message")
```

Both functions accept a single string, perform full input sanitization, and return dictionaries adhering to the Sentinel AI scan response format.

---

## 8. Optional Local Machine Learning (Documented Evaluation)

For demonstration and edge-case classification, an optional on-device classifier is included:
- **Algorithm:** Scikit-Learn TF-IDF N-gram Vectorizer (unigrams + bigrams) + L2 Regularized Logistic Regression.
- **Location:** Serialized model at `detector/data/model.joblib`.
- **Training Set:** 28 synthetic, labeled communications (14 scam, 14 benign).
- **Held-out Test Set:** 12 independent test communications (6 scam, 6 benign).
- **Measured Evaluation Metrics (Held-out Test Split):**
  - **Precision:** 0.8333
  - **Recall:** 0.8333
  - **F1 Score:** 0.8333
  - **False Positive Rate:** 0.1667 (1 benign message with loan keyword flagged)
  - **Confusion Matrix:** True Negatives = 5, False Positives = 1, False Negatives = 1, True Positives = 5
- **Fallback Architecture:** If scikit-learn is uninstalled or `model.joblib` is deleted, `detector/ml_classifier.py` returns `None` and the rule-based engine continues operating without errors.

---

## 9. Test Suite Verification

Run all tests via pytest:
```bash
pytest -v
```

### Verified Test Results (49 Passed in 0.79s):
```
tests/test_api.py::TestAPIEndpoints::test_health_endpoint PASSED
tests/test_api.py::TestAPIEndpoints::test_valid_url_scan PASSED
tests/test_api.py::TestAPIEndpoints::test_valid_message_scan PASSED
tests/test_api.py::TestAPIEndpoints::test_missing_required_field_url PASSED
tests/test_api.py::TestAPIEndpoints::test_missing_required_field_message PASSED
tests/test_api.py::TestAPIEndpoints::test_invalid_content_type PASSED
tests/test_api.py::TestAPIEndpoints::test_invalid_json_body PASSED
tests/test_api.py::TestAPIEndpoints::test_wrong_field_type PASSED
tests/test_api.py::TestAPIEndpoints::test_oversized_url_request PASSED
tests/test_api.py::TestAPIEndpoints::test_oversized_message_request PASSED
tests/test_api.py::TestAPIEndpoints::test_options_cors_preflight PASSED
tests/test_message_analyzer.py::TestMessageAnalyzer::test_otp_request PASSED
tests/test_message_analyzer.py::TestMessageAnalyzer::test_urgent_payment_demand PASSED
tests/test_message_analyzer.py::TestMessageAnalyzer::test_prize_requiring_advance_fee PASSED
tests/test_message_analyzer.py::TestMessageAnalyzer::test_ordinary_greeting PASSED
tests/test_message_analyzer.py::TestMessageAnalyzer::test_legitimate_security_education PASSED
tests/test_message_analyzer.py::TestMessageAnalyzer::test_warning_about_phishing PASSED
tests/test_message_analyzer.py::TestMessageAnalyzer::test_message_containing_suspicious_url PASSED
tests/test_message_analyzer.py::TestMessageAnalyzer::test_empty_message PASSED
tests/test_message_analyzer.py::TestMessageAnalyzer::test_oversized_message_handled PASSED
tests/test_message_analyzer.py::TestMessageAnalyzer::test_gift_card_payment_scam PASSED
tests/test_ml_classifier.py::TestMLClassifier::test_local_model_prediction_structure PASSED
tests/test_ml_classifier.py::TestMLClassifier::test_benign_text_prediction PASSED
tests/test_ml_classifier.py::TestMLClassifier::test_graceful_fallback_when_model_missing PASSED
tests/test_risk_engine.py::TestRiskEngine::test_threshold_mapping PASSED
tests/test_risk_engine.py::TestRiskEngine::test_score_bounded_between_zero_and_hundred PASSED
tests/test_risk_engine.py::TestRiskEngine::test_deduplication_prevents_inflation PASSED
tests/test_risk_engine.py::TestRiskEngine::test_diminishing_returns_within_category PASSED
tests/test_risk_engine.py::TestRiskEngine::test_recommendation_generation PASSED
tests/test_risk_engine.py::TestRiskEngine::test_response_contract_fields PASSED
tests/test_security_privacy.py::TestSecurityAndPrivacy::test_no_outbound_network_calls_during_url_scan PASSED
tests/test_security_privacy.py::TestSecurityAndPrivacy::test_no_outbound_network_calls_during_message_scan PASSED
tests/test_security_privacy.py::TestSecurityAndPrivacy::test_sensitive_content_never_leaked_in_error_responses PASSED
tests/test_security_privacy.py::TestSecurityAndPrivacy::test_server_error_boundary_sanitizes_stack_trace PASSED
tests/test_url_analyzer.py::TestURLAnalyzer::test_normal_https_url PASSED
tests/test_url_analyzer.py::TestURLAnalyzer::test_unencrypted_http_url PASSED
tests/test_url_analyzer.py::TestURLAnalyzer::test_ip_literal_hostname PASSED
tests/test_url_analyzer.py::TestURLAnalyzer::test_deceptive_subdomain PASSED
tests/test_url_analyzer.py::TestURLAnalyzer::test_deceptive_hyphenated_brand PASSED
tests/test_url_analyzer.py::TestURLAnalyzer::test_malformed_url PASSED
tests/test_url_analyzer.py::TestURLAnalyzer::test_excessively_long_url PASSED
tests/test_url_analyzer.py::TestURLAnalyzer::test_url_containing_at_symbol_authority PASSED
tests/test_url_analyzer.py::TestURLAnalyzer::test_punycode_indicator PASSED
tests/test_url_analyzer.py::TestURLAnalyzer::test_shortened_url PASSED
tests/test_url_analyzer.py::TestURLAnalyzer::test_benign_url_with_brand_in_path_only PASSED
tests/test_url_analyzer.py::TestURLAnalyzer::test_dangerous_schemes PASSED
tests/test_url_analyzer.py::TestURLAnalyzer::test_open_redirect_parameter PASSED
tests/test_url_analyzer.py::TestURLAnalyzer::test_official_brand_domain_not_flagged PASSED
tests/test_url_analyzer.py::TestURLAnalyzer::test_empty_or_non_string_url PASSED
============================== 49 passed in 0.79s ==============================
```

---

## 10. Known Limitations & Defensive Boundaries

1. **Shortened URLs:** Because the engine strictly avoids network calls, shortened links (`bit.ly`, `tiny.cc`) cannot be expanded to inspect their destination target. They are scored as an uncertainty signal (`LOW`/`MEDIUM`) rather than conclusive proof.
2. **Domain Registration Age:** The engine does not query WHOIS over the network; brand lookalikes are determined via lexical analysis, typosquatting patterns, and subdomain hierarchy rather than domain creation timestamps.
3. **Novel Scam Slang:** Rule-based heuristics cover established phishing, credential theft, and coercion patterns. Emerging social engineering patterns outside the vocabulary are supplemented by the local ML classifier.
