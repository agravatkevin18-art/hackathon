"""
Sentinel AI - Explainable Local Risk Engine
Unified, deterministic scoring and recommendation mechanism shared by URL and message analyzers.

Engineering Rationale & Scoring Mechanics:
- Scale: 0 to 100 integer range.
- Thresholds:
    * LOW: 0 - 24 (Benign / informational indicators; no high-confidence threat found)
    * MEDIUM: 25 - 49 (Ambiguous or moderate suspicious signals; caution warranted)
    * HIGH: 50 - 74 (Strong multiple indicators consistent with malicious campaigns)
    * CRITICAL: 75 - 100 (Severe indicators like active credential harvesting or deceptive authority)
- Diminishing Returns & Deduplication:
    * Evidence items are grouped by category (e.g. host_structure, credential_theft, urgency).
    * Within each category, secondary and tertiary indicators contribute diminishing weights
      (100% for 1st, 50% for 2nd, 25% for subsequent, subject to a per-category cap).
    * Duplicate codes are completely collapsed.
- Context Adjustments:
    * Educational/defensive context signals mitigate false positives.
- Non-Probabilistic Assessment:
    * Scores represent cumulative heuristic risk index, NOT statistical probability of malice.
    * A low score does not guarantee safety; this limitation is explicitly reported.
"""

from dataclasses import dataclass
from typing import List, Dict, Any, Optional, Tuple

# Strict threshold definitions
SEVERITY_THRESHOLDS = {
    "LOW": (0, 24),
    "MEDIUM": (25, 49),
    "HIGH": (50, 74),
    "CRITICAL": (75, 100),
}

# Base weight mapping for individual evidence severities
SEVERITY_BASE_WEIGHTS: Dict[str, int] = {
    "LOW": 10,
    "MEDIUM": 25,
    "HIGH": 50,
    "CRITICAL": 75,
}

# Explicit indicator weights
INDICATOR_WEIGHT_OVERRIDES: Dict[str, int] = {
    # Benign / Empty placeholders
    "EMPTY_URL": 0,
    "EMPTY_MESSAGE": 0,
    "EDUCATIONAL_SECURITY_CONTEXT": 0,

    # Structural / Uncertainty indicators
    "SHORTENED_URL": 15,
    "UNENCRYPTED_SCHEME": 10,
    "HIGH_RISK_TLD": 15,
    "EXCESSIVE_URL_LENGTH": 12,
    "DEEP_SUBDOMAIN_STRUCTURE": 15,
    "SUSPICIOUS_HOSTNAME_COMPLEXITY": 15,
    "SUSPICIOUS_REDIRECT_PARAMETER": 20,
    "SUSPICIOUS_PERCENT_ENCODING": 15,
    
    # High-risk URL indicators
    "IP_LITERAL_HOSTNAME": 45,
    "PUNYCODE_HOSTNAME": 35,
    "HOMOGLYPH_OR_NON_ASCII": 50,
    "CONFUSING_AUTHORITY_USERINFO": 75,
    "DECEPTIVE_BRAND_IMPERSONATION": 65,
    "TYPOSQUATTED_DOMAIN": 55,
    "DANGEROUS_SCHEME": 80,
    "SENSITIVE_CREDENTIAL_PATH": 20,
    
    # Message indicators
    "CREDENTIAL_HARVESTING_REQUEST": 65,
    "URGENCY_OR_COERCION_TACTIC": 30,
    "FINANCIAL_SCAM_PATTERN": 55,
    "AUTHORITY_IMPERSONATION": 35,
    "OFFICIAL_CHANNEL_BYPASS": 30,
    "HIGH_RISK_EMBEDDED_LINK": 55,
}

# Category mappings to prevent runaway score inflation
INDICATOR_CATEGORIES: Dict[str, str] = {
    "SHORTENED_URL": "anonymity",
    "UNENCRYPTED_SCHEME": "transport",
    "HIGH_RISK_TLD": "host_reputation",
    "EXCESSIVE_URL_LENGTH": "obfuscation",
    "DEEP_SUBDOMAIN_STRUCTURE": "host_structure",
    "SUSPICIOUS_HOSTNAME_COMPLEXITY": "host_structure",
    "SUSPICIOUS_REDIRECT_PARAMETER": "redirection",
    "SUSPICIOUS_PERCENT_ENCODING": "obfuscation",
    "IP_LITERAL_HOSTNAME": "host_structure",
    "PUNYCODE_HOSTNAME": "homoglyph",
    "HOMOGLYPH_OR_NON_ASCII": "homoglyph",
    "CONFUSING_AUTHORITY_USERINFO": "deception",
    "DECEPTIVE_BRAND_IMPERSONATION": "deception",
    "TYPOSQUATTED_DOMAIN": "deception",
    "DANGEROUS_SCHEME": "execution",
    "SENSITIVE_CREDENTIAL_PATH": "intent",
    
    # Message categories
    "CREDENTIAL_HARVESTING_REQUEST": "credentials",
    "URGENCY_OR_COERCION_TACTIC": "coercion",
    "FINANCIAL_SCAM_PATTERN": "financial",
    "AUTHORITY_IMPERSONATION": "impersonation",
    "OFFICIAL_CHANNEL_BYPASS": "bypass",
    "HIGH_RISK_EMBEDDED_LINK": "embedded_threat",
}

CATEGORY_CAPS: Dict[str, int] = {
    "general": 85,
    "transport": 15,
    "anonymity": 20,
    "host_reputation": 25,
    "obfuscation": 25,
    "host_structure": 50,
    "homoglyph": 55,
    "redirection": 25,
    "deception": 80,
    "execution": 85,
    "intent": 30,
    "credentials": 80,
    "coercion": 40,
    "financial": 65,
    "impersonation": 50,
    "bypass": 35,
    "embedded_threat": 65,
}


@dataclass(frozen=True)
class Evidence:
    """Standardized threat indicator representation."""
    code: str
    title: str
    detail: str
    severity: str  # "LOW", "MEDIUM", "HIGH", "CRITICAL"

    def to_dict(self) -> Dict[str, str]:
        return {
            "code": self.code,
            "title": self.title,
            "detail": self.detail,
            "severity": self.severity,
        }


def get_risk_level_for_score(score: int) -> str:
    """Maps integer score (0-100) to standard severity label."""
    if score >= 75:
        return "CRITICAL"
    if score >= 50:
        return "HIGH"
    if score >= 25:
        return "MEDIUM"
    return "LOW"


def deduplicate_evidence(evidence_list: List[Evidence]) -> List[Evidence]:
    """Removes duplicate evidence entries based on code and detail."""
    seen_keys = set()
    unique_evidence = []
    for item in evidence_list:
        key = (item.code, item.detail)
        if key not in seen_keys:
            seen_keys.add(key)
            unique_evidence.append(item)
    return unique_evidence


def calculate_risk_score(
    evidence_list: List[Evidence],
    context_modifiers: Optional[Dict[str, Any]] = None,
) -> Tuple[int, str]:
    """
    Computes calibrated score (0-100) using deduplicated evidence,
    diminishing returns per category, and contextual modifiers.
    """
    if not evidence_list:
        return 0, "LOW"

    grouped_by_category: Dict[str, List[int]] = {}
    seen_codes = set()
    has_critical_evidence = False

    for item in evidence_list:
        if item.severity.upper() == "CRITICAL":
            has_critical_evidence = True
        if item.code in seen_codes:
            continue
        seen_codes.add(item.code)

        base_weight = INDICATOR_WEIGHT_OVERRIDES.get(
            item.code,
            SEVERITY_BASE_WEIGHTS.get(item.severity.upper(), 10)
        )
        category = INDICATOR_CATEGORIES.get(item.code, "general")
        grouped_by_category.setdefault(category, []).append(base_weight)

    # Apply diminishing returns per category
    total_raw_score = 0.0
    for category, weights in grouped_by_category.items():
        weights.sort(reverse=True)
        cat_sum = 0.0
        multipliers = [1.0, 0.5, 0.25, 0.1]
        for idx, w in enumerate(weights):
            mult = multipliers[idx] if idx < len(multipliers) else 0.05
            cat_sum += w * mult
        
        cap = CATEGORY_CAPS.get(category, 80)
        total_raw_score += min(cat_sum, cap)

    # Multi-category synergy boost:
    distinct_categories = len(grouped_by_category)
    if distinct_categories >= 4:
        total_raw_score += 15.0
    elif distinct_categories >= 3:
        total_raw_score += 10.0

    # Ensure multiple CRITICAL items or high-confidence threats cross threshold
    if has_critical_evidence and total_raw_score < 75.0:
        total_raw_score = max(total_raw_score, 75.0)

    # Context mitigation (e.g. educational / benign defensive context)
    if context_modifiers:
        if context_modifiers.get("is_educational_or_defensive", False):
            total_raw_score = max(0.0, total_raw_score * 0.2)
        if context_modifiers.get("trusted_brand_domain", False):
            total_raw_score = max(0.0, total_raw_score * 0.15)

    final_score = int(round(max(0.0, min(100.0, total_raw_score))))
    risk_level = get_risk_level_for_score(final_score)

    return final_score, risk_level


def generate_recommendations(
    evidence_list: List[Evidence],
    risk_level: str,
    scan_type: str = "url",
) -> List[str]:
    """Generates defensive, actionable guidance tailored to observed evidence."""
    recommendations: List[str] = []
    codes = {e.code for e in evidence_list}

    if "CREDENTIAL_HARVESTING_REQUEST" in codes:
        recommendations.append(
            "Do NOT provide passwords, OTPs, PINs, or verification codes. Legitimate providers never ask for security codes via SMS or email."
        )

    if "FINANCIAL_SCAM_PATTERN" in codes:
        recommendations.append(
            "Refuse requests for wire transfers, cryptocurrency deposits, or gift cards. Verify any fee requests through official customer support channels."
        )

    if "URGENCY_OR_COERCION_TACTIC" in codes:
        recommendations.append(
            "Pause and ignore artificial deadlines. Attackers manufacture urgency and threats of immediate suspension to bypass critical thinking."
        )

    if "AUTHORITY_IMPERSONATION" in codes or "DECEPTIVE_BRAND_IMPERSONATION" in codes or "TYPOSQUATTED_DOMAIN" in codes:
        recommendations.append(
            "Do not use links or contact details provided in this content. Navigate manually to the verified official website or use official phone numbers."
        )

    if "CONFUSING_AUTHORITY_USERINFO" in codes:
        recommendations.append(
            "This link uses deceptive '@' notation to disguise its real destination. Avoid opening it."
        )

    if "SHORTENED_URL" in codes:
        recommendations.append(
            "This link uses an obfuscated URL shortener. Expand or verify the actual destination safely before browsing."
        )

    if "IP_LITERAL_HOSTNAME" in codes or "DANGEROUS_SCHEME" in codes:
        recommendations.append(
            "The link points directly to a raw IP address or dangerous execution scheme. High risk of malicious payload."
        )

    if risk_level in ("HIGH", "CRITICAL"):
        if not any("Do NOT" in r for r in recommendations):
            recommendations.append("Treat this content as untrusted. Do not interact with links or submit sensitive details.")
    elif risk_level == "MEDIUM":
        recommendations.append("Proceed with caution. Independently verify the sender and destination identity.")
    else:  # LOW
        if not recommendations:
            recommendations.append("No obvious heuristic indicators were detected. Continue exercising standard digital security hygiene.")

    seen = set()
    deduped_recs = []
    for rec in recommendations:
        if rec not in seen:
            seen.add(rec)
            deduped_recs.append(rec)

    return deduped_recs


def build_scan_response(
    scan_type: str,
    evidence_list: List[Evidence],
    context_modifiers: Optional[Dict[str, Any]] = None,
) -> Dict[str, Any]:
    """Constructs the canonical JSON response payload complying with API contract."""
    unique_evidence = deduplicate_evidence(evidence_list)
    risk_score, risk_level = calculate_risk_score(unique_evidence, context_modifiers)
    reasons = [item.to_dict() for item in unique_evidence]
    recs = generate_recommendations(unique_evidence, risk_level, scan_type=scan_type)

    return {
        "status": "success",
        "scan_type": scan_type,
        "risk_level": risk_level,
        "risk_score": risk_score,
        "reasons": reasons,
        "recommendations": recs,
        "offline_analysis": True,
        "disclaimer": "This heuristic assessment cannot guarantee safety. Zero indicators detected does not verify content as completely safe.",
    }
