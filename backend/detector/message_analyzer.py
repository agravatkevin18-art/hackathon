"""
Sentinel AI - Local Message & Content Threat Analyzer
Inspects text messages, SMS, and emails purely on-device for credential harvesting,
social engineering, financial scams, impersonation, and malicious embedded links.

Guarantees:
- Strictly local computation without outbound requests or cloud inference.
- Multi-token semantic & contextual inspection rather than simplistic single-word matching.
- Defensive and educational false-positive mitigation.
- Safe regex handling and URL extraction without executing or resolving links.
"""

import re
from typing import Dict, Any, List

from detector.risk_engine import (
    Evidence,
    build_scan_response,
)
from detector.url_analyzer import analyze_url

# Regex patterns for educational or defensive context
DEFENSIVE_PATTERNS = [
    re.compile(r"\b(do\s+not|never|don't)\s+(share|give|disclose|send)\s+(your\s+)?(otp|password|pin|code|passcode)\b", re.IGNORECASE),
    re.compile(r"\b(we\s+will|bank\s+will)\s+never\s+(ask|call|text)\s+(for\s+your\s+)?(password|otp|pin|credentials)\b", re.IGNORECASE),
    re.compile(r"\b(security\s+tip|(fraud|scam)\s+(alert|warning|advisory|awareness)|phishing\s+(simulation|advisory|awareness))\b", re.IGNORECASE),
    re.compile(r"\b(beware\s+of|protect\s+yourself\s+against)\s+(phishing|scams|fraudsters)\b", re.IGNORECASE),
]

# Regex patterns for Credential Harvesting
CREDENTIAL_HARVEST_PATTERNS = [
    re.compile(r"\b(send|reply\s+with|text\s+back|submit|enter|provide|verify)\b.{0,30}\b(otp|one[-\s]time\s*(password|pin)|pin\s*code|passcode|recovery\s*code|2fa\s*code|verification\s*code|secret\s*phrase)\b", re.IGNORECASE),
    re.compile(r"\b(enter|confirm|verify)\b.{0,25}\b(your\s+(login|credentials|password|secret\s*pin|cvv|atm\s*pin))\b", re.IGNORECASE),
    re.compile(r"\b(to\s+keep\s+your\s+account\s+active|to\s+avoid\s+suspension)\b.{0,35}\b(send|confirm|verify)\b.{0,20}\b(otp|password|pin)\b", re.IGNORECASE),
    re.compile(r"\b(share\s+the\s+(6|4)[-\s]digit\s+(code|pin|number))\b", re.IGNORECASE),
]

# Regex patterns for Urgency, Coercion, and Intimidation
URGENCY_PATTERNS = [
    re.compile(r"\b(account\s+(has\s+been|is|will\s+be)\s+(suspended|closed|terminated|blocked|disabled|frozen|locked|restricted))\b", re.IGNORECASE),
    re.compile(r"\b(within\s+(24|48|12|1|2)\s*(hours|hrs|hr|minutes|mins))\b", re.IGNORECASE),
    re.compile(r"\b(immediate\s+(action|suspension|termination|verification|payment)\s+required)\b", re.IGNORECASE),
    re.compile(r"\b(final\s+(notice|warning|reminder))\b", re.IGNORECASE),
    re.compile(r"\b(arrest\s*warrant|law\s*enforcement|legal\s*action|police\s*complaint|court\s*summons)\b", re.IGNORECASE),
    re.compile(r"\b(failure\s+to\s+respond\s+will\s+result\s+in)\b", re.IGNORECASE),
]

# Regex patterns for Financial Scams & Advance-Fee Fraud
FINANCIAL_SCAM_PATTERNS = [
    re.compile(r"\b((apple|steam|google\s*play|itunes|amazon)?\s*gift\s*cards?)\b", re.IGNORECASE),
    re.compile(r"\b(congratulations|you\s+have\s+won|lucky\s+winner|selected\s+to\s+receive)\b.{0,40}\b(lottery|jackpot|\$[\d,]+|million|inheritance|prize|grant)\b", re.IGNORECASE),
    re.compile(r"\b(pay|transfer|send|wire)\b.{0,35}\b(advance\s*fee|processing\s*fee|clearance\s*fee|handling\s*charge|release\s*tax)\b", re.IGNORECASE),
    re.compile(r"\b(guaranteed\s+(returns?|profits?)|double\s+your\s+(investment|crypto|bitcoin))\b", re.IGNORECASE),
    re.compile(r"\b(crypto\s*giveaway|send\s+[\d\.]+\s*(eth|btc|sol)\s+and\s+get)\b", re.IGNORECASE),
    re.compile(r"\b(work\s*from\s*home|part[-\s]time\s*job)\b.{0,30}\b(pay\s+upfront|registration\s*deposit|starter\s*kit\s*fee)\b", re.IGNORECASE),
]

# Regex patterns for Authority Impersonation & Channel Bypass
IMPERSONATION_PATTERNS = [
    re.compile(r"\b(notice\s+from|calling\s+from|message\s+from|official\s+support\s+at)\b.{0,30}\b(irs|tax\s+department|social\s+security|chase|wellsfargo|bank\s+of\s+america|citibank|usps|fedex|dhl|ups|apple\s+support|microsoft\s+helpdesk)\b", re.IGNORECASE),
    re.compile(r"\b(usps|fedex|ups|dhl|post\s+office|parcel|package|shipment)\b.{0,40}\b(delivery\s+failed|package\s+(on\s+hold|delayed)|address\s+(missing|incomplete|incorrect)|confirm\s+redelivery)\b", re.IGNORECASE),
    re.compile(r"\b(unauthorized\s+transaction|fraudulent\s+charge\s+of\s+\$?\d+)\b.{0,40}\b(call|click|verify|cancel)\b", re.IGNORECASE),
    re.compile(r"\b(contact\s+strictly\s+via\s+whatsapp|do\s+not\s+call\s+the\s+bank|reply\s+only\s+to\s+this\s+number)\b", re.IGNORECASE),
]

# URL extraction pattern
URL_REGEX = re.compile(
    r"(?:https?://|www\.)[^\s<>'\"`]+",
    re.IGNORECASE,
)


def extract_urls(text: str) -> List[str]:
    """Safely extracts URL strings without network interaction."""
    raw_urls = URL_REGEX.findall(text)
    clean_urls = []
    for u in raw_urls:
        cleaned = re.sub(r"[.,;!?\)\>]+$", "", u)
        if cleaned and cleaned not in clean_urls:
            clean_urls.append(cleaned)
    return clean_urls


def is_educational_context(text: str) -> bool:
    """Detects legitimate cybersecurity education, warnings, and anti-fraud advisories."""
    for pattern in DEFENSIVE_PATTERNS:
        if pattern.search(text):
            return True
    return False


def analyze_message(message: str) -> Dict[str, Any]:
    """
    Analyzes message text purely on-device for scam indicators and social engineering tactics.
    
    Parameters:
        message (str): Text content to inspect.
        
    Returns:
        Dict conforming to Sentinel AI scan response specification.
    """
    evidence: List[Evidence] = []
    context_modifiers: Dict[str, Any] = {}

    if not isinstance(message, str):
        evidence.append(
            Evidence(
                code="INVALID_MESSAGE_TYPE",
                title="Invalid Message Type",
                detail="Expected text string for message analysis.",
                severity="HIGH",
            )
        )
        return build_scan_response("message", evidence)

    cleaned_msg = message.strip()
    if not cleaned_msg:
        evidence.append(
            Evidence(
                code="EMPTY_MESSAGE",
                title="Empty Message Input",
                detail="Provided message contains no text content.",
                severity="LOW",
            )
        )
        return build_scan_response("message", evidence)

    # Check for defensive/educational context
    if is_educational_context(cleaned_msg):
        context_modifiers["is_educational_or_defensive"] = True
        evidence.append(
            Evidence(
                code="EDUCATIONAL_SECURITY_CONTEXT",
                title="Educational or Defensive Context Detected",
                detail="Message appears to be a legitimate security notice, anti-fraud tip, or phishing advisory warning the recipient.",
                severity="LOW",
            )
        )

    # 1. Credential Harvesting Check
    if not context_modifiers.get("is_educational_or_defensive", False):
        for pattern in CREDENTIAL_HARVEST_PATTERNS:
            match = pattern.search(cleaned_msg)
            if match:
                evidence.append(
                    Evidence(
                        code="CREDENTIAL_HARVESTING_REQUEST",
                        title="Direct Credential or OTP Request",
                        detail=f"Message explicitly prompts recipient for sensitive authentication data ('{match.group(0)[:60]}').",
                        severity="CRITICAL",
                    )
                )
                break

    # 2. Urgency and Coercion Check
    for pattern in URGENCY_PATTERNS:
        match = pattern.search(cleaned_msg)
        if match:
            severity = "LOW" if context_modifiers.get("is_educational_or_defensive") else "MEDIUM"
            evidence.append(
                Evidence(
                    code="URGENCY_OR_COERCION_TACTIC",
                    title="Artificial Urgency or Coercion Pressure",
                    detail=f"Employs pressure language threatening account termination or immediate penalties ('{match.group(0)[:60]}').",
                    severity=severity,
                )
            )
            break

    # 3. Financial Scams & Advance-Fee Fraud Check
    for pattern in FINANCIAL_SCAM_PATTERNS:
        match = pattern.search(cleaned_msg)
        if match:
            severity = "LOW" if context_modifiers.get("is_educational_or_defensive") else "HIGH"
            evidence.append(
                Evidence(
                    code="FINANCIAL_SCAM_PATTERN",
                    title="Financial Solicitation or Advance-Fee Scam",
                    detail=f"Contains indicators of financial solicitations, gift-card payments, or advance-fee prize claims ('{match.group(0)[:60]}').",
                    severity=severity,
                )
            )
            break

    # 4. Authority Impersonation Check
    for pattern in IMPERSONATION_PATTERNS:
        match = pattern.search(cleaned_msg)
        if match:
            severity = "LOW" if context_modifiers.get("is_educational_or_defensive") else "MEDIUM"
            evidence.append(
                Evidence(
                    code="AUTHORITY_IMPERSONATION",
                    title="Authority or Carrier Impersonation",
                    detail=f"Message invokes financial institutions, government departments, or postal carriers to establish false authority ('{match.group(0)[:60]}').",
                    severity=severity,
                )
            )
            break

    # 5. Embedded Links Extraction and Nested URL Analysis
    extracted_urls = extract_urls(cleaned_msg)
    if extracted_urls:
        highest_url_score = 0
        nested_reasons = []

        for u in extracted_urls[:5]:
            url_res = analyze_url(u)
            score = url_res.get("risk_score", 0)
            if score > highest_url_score:
                highest_url_score = score
            for r in url_res.get("reasons", []):
                if r["severity"] in ("MEDIUM", "HIGH", "CRITICAL"):
                    nested_reasons.append(r)

        if highest_url_score >= 50 or any(r["severity"] in ("HIGH", "CRITICAL") for r in nested_reasons):
            top_reason = nested_reasons[0] if nested_reasons else None
            detail_msg = (
                f"Contains embedded link flagged as high-risk ({top_reason['title']}: {top_reason['detail']})"
                if top_reason else "Message contains an embedded link flagged with elevated threat indicators."
            )
            evidence.append(
                Evidence(
                    code="HIGH_RISK_EMBEDDED_LINK",
                    title="Suspicious Link Embedded in Message",
                    detail=detail_msg[:160],
                    severity="HIGH" if highest_url_score < 75 else "CRITICAL",
                )
            )
        elif any(r.get("code") == "SHORTENED_URL" for r in nested_reasons):
            evidence.append(
                Evidence(
                    code="SHORTENED_URL",
                    title="Obfuscated Link in Message",
                    detail="Message includes a shortened link concealing its target address.",
                    severity="LOW",
                )
            )

    return build_scan_response(
        scan_type="message",
        evidence_list=evidence,
        context_modifiers=context_modifiers,
    )
