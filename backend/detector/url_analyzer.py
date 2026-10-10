"""
Sentinel AI - Local URL Threat & Structure Analyzer
Inspects URL syntax, authority headers, homoglyphs, and deceptive patterns strictly on-device.

Guarantees:
- Zero outbound network requests (no DNS, no HTTP fetch, no socket connection).
- Pure string, lexical, and structural analysis.
- Robust error handling for malformed, non-ASCII, and hostile inputs.
"""

import ipaddress
import re
import urllib.parse
from typing import Dict, Any, List, Optional, Tuple

from detector.data.constants import (
    KNOWN_SHORTENERS,
    SUSPICIOUS_TLDS,
    HIGH_TARGET_BRANDS,
    SENSITIVE_PATHS,
    SUSPICIOUS_REDIRECT_PARAMS,
    DANGEROUS_SCHEMES,
    LEET_SUBSTITUTIONS,
)
from detector.risk_engine import (
    Evidence,
    build_scan_response,
)


def is_ip_address(hostname: str) -> bool:
    """Checks whether hostname is an IPv4 or IPv6 address literal."""
    clean_host = hostname.strip("[]")
    try:
        ipaddress.ip_address(clean_host)
        return True
    except ValueError:
        pass

    # Check for integer or hex/octal encoded IP formats (e.g. 0x7f000001 or pure integer)
    if clean_host.isdigit() and len(clean_host) >= 8:
        try:
            int_val = int(clean_host)
            if 0 <= int_val <= 4294967295:
                return True
        except ValueError:
            pass

    # Check for hex IP format (e.g. 0x7f.0x00.0x00.0x01)
    hex_parts = clean_host.split(".")
    if len(hex_parts) == 4 and all(p.startswith("0x") for p in hex_parts):
        try:
            octets = [int(p, 16) for p in hex_parts]
            if all(0 <= o <= 255 for o in octets):
                return True
        except ValueError:
            pass

    return False


def normalize_leetspeak(token: str) -> str:
    """Substitutes common visual lookalike numbers with characters."""
    normalized = []
    for ch in token.lower():
        normalized.append(LEET_SUBSTITUTIONS.get(ch, ch))
    return "".join(normalized)


def extract_domain_parts(hostname: str) -> Tuple[str, List[str], str]:
    """
    Extracts root domain candidates, subdomains, and TLD.
    Purely algorithmic fallback without external network TLD queries.
    """
    parts = hostname.lower().split(".")
    if len(parts) < 2:
        return hostname, [], ""

    tld = parts[-1]
    
    # Handle common two-part ccTLDs like .co.uk, .com.au, .gov.in, .bank.in
    two_part_tlds = {
        "co.uk", "com.au", "gov.uk", "gov.in", "ac.uk", "org.uk", "co.jp", "com.br",
        "bank.in", "nic.in", "mil.in", "edu.in", "ac.in", "co.in", "org.in", "net.in"
    }
    if len(parts) >= 3 and f"{parts[-2]}.{parts[-1]}" in two_part_tlds:
        tld = f"{parts[-2]}.{parts[-1]}"
        main_domain = parts[-3]
        subdomains = parts[:-3]
    else:
        main_domain = parts[-2]
        subdomains = parts[:-2]

    return main_domain, subdomains, tld


def check_brand_deception(
    hostname: str,
    main_domain: str,
    subdomains: List[str]
) -> Optional[Tuple[str, str, str]]:
    """
    Determines if a known brand is being deceptively impersonated in the hostname.
    Returns (brand_name, match_type, detail) or None.
    
    Note: If the domain officially belongs to the brand, this returns None (benign).
    """
    hostname_lower = hostname.lower()

    for brand, info in HIGH_TARGET_BRANDS.items():
        official_domains = info["official_domains"]
        
        # Check if the hostname actually belongs to the official brand
        is_official = any(
            hostname_lower == off or hostname_lower.endswith("." + off)
            for off in official_domains
        )
        if is_official:
            continue

        # Check subdomains for the brand keyword (e.g. paypal.com.attacker.com)
        for sub in subdomains:
            if brand in sub or any(k in sub for k in info["keywords"]):
                return (
                    brand,
                    "subdomain_impersonation",
                    f"Target brand '{brand}' embedded inside deceptive subdomain '{sub}'.",
                )

        # Check if the registered domain name embeds the brand with hyphens or modifiers
        # e.g., 'paypal-security.com' or 'apple-id-verify.com'
        for kw in info["keywords"]:
            if kw in main_domain and main_domain != brand:
                return (
                    brand,
                    "hyphenated_brand_domain",
                    f"Target brand keyword '{kw}' embedded in unverified domain '{main_domain}'.",
                )

        # Check for typosquatting / lookalikes (e.g. 'paypa1' or 'g00gle')
        normalized_main = normalize_leetspeak(main_domain)
        if normalized_main == brand and main_domain != brand:
            return (
                brand,
                "typosquatting",
                f"Typosquatting variant '{main_domain}' mimicking legitimate brand '{brand}'.",
            )

    return None


def analyze_url(url: str) -> Dict[str, Any]:
    """
    Analyzes a URL string purely on-device for threat, phishing, and scam patterns.
    
    Parameters:
        url (str): The raw URL string to inspect.
        
    Returns:
        Dict conforming to the Sentinel AI scan response specification.
    """
    evidence: List[Evidence] = []
    context_modifiers: Dict[str, Any] = {}

    if not isinstance(url, str):
        evidence.append(
            Evidence(
                code="INVALID_URL_TYPE",
                title="Invalid Input Type",
                detail="Expected a string for URL analysis.",
                severity="HIGH",
            )
        )
        return build_scan_response("url", evidence)

    url_clean = url.strip()
    if not url_clean:
        evidence.append(
            Evidence(
                code="EMPTY_URL",
                title="Empty URL Input",
                detail="Provided URL is empty or whitespace only.",
                severity="LOW",
            )
        )
        return build_scan_response("url", evidence)

    # 1. Length checks
    url_len = len(url_clean)
    if url_len > 1500:
        evidence.append(
            Evidence(
                code="EXCESSIVE_URL_LENGTH",
                title="Excessively Long URL",
                detail=f"URL length ({url_len} characters) is unusually long, frequently used in buffer overflow or evasion attempts.",
                severity="HIGH",
            )
        )
    elif url_len > 250:
        evidence.append(
            Evidence(
                code="EXCESSIVE_URL_LENGTH",
                title="Unusually Long URL",
                detail=f"URL length ({url_len} characters) exceeds typical navigation norms.",
                severity="LOW",
            )
        )

    # 2. Scheme and Parsing Safety
    # Pre-check for raw dangerous schemes before standard parsing
    scheme_match = re.match(r"^([a-zA-Z0-9+.-]+):", url_clean)
    raw_scheme = scheme_match.group(1).lower() if scheme_match else ""

    if raw_scheme in DANGEROUS_SCHEMES:
        evidence.append(
            Evidence(
                code="DANGEROUS_SCHEME",
                title="Dangerous Protocol Scheme",
                detail=f"URL uses dangerous scheme '{raw_scheme}:' capable of direct code execution or client-side payload injection.",
                severity="CRITICAL",
            )
        )
        return build_scan_response("url", evidence)

    # If no scheme was provided, prepend http:// solely for parse splitting
    parsed_input = url_clean
    has_implicit_scheme = False
    if not scheme_match:
        parsed_input = "http://" + url_clean
        has_implicit_scheme = True

    try:
        parsed = urllib.parse.urlsplit(parsed_input)
    except Exception as parse_err:
        evidence.append(
            Evidence(
                code="MALFORMED_URL_STRUCTURE",
                title="Malformed URL Structure",
                detail=f"URL failed standard RFC parsing: {str(parse_err)[:100]}",
                severity="HIGH",
            )
        )
        return build_scan_response("url", evidence)

    scheme = parsed.scheme.lower()
    netloc = parsed.netloc
    path = parsed.path
    query = parsed.query

    # Scheme assessment
    if not has_implicit_scheme:
        if scheme == "http":
            evidence.append(
                Evidence(
                    code="UNENCRYPTED_SCHEME",
                    title="Unencrypted HTTP Protocol",
                    detail="URL uses plaintext HTTP rather than HTTPS, exposing traffic to interception.",
                    severity="LOW",
                )
            )
        elif scheme not in ("http", "https"):
            evidence.append(
                Evidence(
                    code="UNCOMMON_SCHEME",
                    title="Unconventional URL Scheme",
                    detail=f"URL specifies uncommon protocol '{scheme}:'.",
                    severity="MEDIUM",
                )
            )

    # Missing or invalid netloc/hostname
    if not netloc:
        evidence.append(
            Evidence(
                code="MISSING_HOSTNAME",
                title="Missing Hostname",
                detail="URL lacks a valid authority/hostname section.",
                severity="HIGH",
            )
        )
        return build_scan_response("url", evidence)

    # 3. Misleading Authority / Userinfo (@ symbol in authority)
    if "@" in netloc:
        userinfo, host_part = netloc.split("@", 1)
        evidence.append(
            Evidence(
                code="CONFUSING_AUTHORITY_USERINFO",
                title="Misleading '@' In Authority Section",
                detail=f"URL employs '@' notation to mislead users into believing '{userinfo[:30]}' is the destination host, whereas requests route to '{host_part[:30]}'.",
                severity="CRITICAL",
            )
        )
        hostname = host_part
    else:
        hostname = netloc

    # Strip port if present
    if ":" in hostname and not hostname.startswith("["):
        hostname = hostname.split(":", 1)[0]
    elif hostname.startswith("[") and "]" in hostname:
        # IPv6 with port like [::1]:8080
        hostname = hostname[:hostname.find("]") + 1]

    hostname_clean = hostname.lower()

    # 4. IP-literal Hostname Check
    if is_ip_address(hostname_clean):
        evidence.append(
            Evidence(
                code="IP_LITERAL_HOSTNAME",
                title="IP Address Literal Hostname",
                detail=f"Destination '{hostname_clean}' is specified as a raw IP address rather than a registered domain name, common in illicit infrastructure.",
                severity="HIGH",
            )
        )

    # 5. Punycode & Non-ASCII Homoglyphs
    if "xn--" in hostname_clean:
        evidence.append(
            Evidence(
                code="PUNYCODE_HOSTNAME",
                title="Internationalized Punycode Domain",
                detail=f"Hostname contains Punycode prefix 'xn--', which can be leveraged for IDN homograph impersonation attacks.",
                severity="MEDIUM",
            )
        )
    
    # Check for non-ASCII characters directly in hostname
    try:
        hostname_clean.encode("ascii")
    except UnicodeEncodeError:
        evidence.append(
            Evidence(
                code="HOMOGLYPH_OR_NON_ASCII",
                title="Non-ASCII Characters in Hostname",
                detail="Hostname contains non-ASCII characters that may visually spoof standard Latin characters.",
                severity="HIGH",
            )
        )

    # 6. Link Shortener Recognition
    if hostname_clean in KNOWN_SHORTENERS:
        evidence.append(
            Evidence(
                code="SHORTENED_URL",
                title="Known URL Shortening Service",
                detail=f"Hostname '{hostname_clean}' is a recognized URL shortener. True destination is concealed until resolution.",
                severity="LOW",
            )
        )

    # 7. Subdomain Depth and Label Analysis
    main_domain, subdomains, tld = extract_domain_parts(hostname_clean)

    if len(subdomains) >= 3:
        evidence.append(
            Evidence(
                code="DEEP_SUBDOMAIN_STRUCTURE",
                title="Excessively Deep Subdomain Hierarchy",
                detail=f"Domain contains {len(subdomains)} subdomain layers ({'.'.join(subdomains)}), commonly engineered to bury legitimate domain names.",
                severity="MEDIUM",
            )
        )

    # Check for suspicious hostname complexity (e.g. multiple hyphens, very long labels)
    hostname_labels = hostname_clean.split(".")
    total_hyphens = sum(label.count("-") for label in hostname_labels)
    if total_hyphens >= 3:
        evidence.append(
            Evidence(
                code="SUSPICIOUS_HOSTNAME_COMPLEXITY",
                title="Unusual Hyphen Count in Domain",
                detail=f"Hostname contains {total_hyphens} hyphens, a frequent trait of auto-generated phishing domains.",
                severity="MEDIUM",
            )
        )

    for label in hostname_labels:
        if len(label) > 35:
            evidence.append(
                Evidence(
                    code="SUSPICIOUS_HOSTNAME_COMPLEXITY",
                    title="Abnormally Long Hostname Label",
                    detail=f"Hostname label '{label[:20]}...' is excessively long ({len(label)} characters).",
                    severity="LOW",
                )
            )
            break

    # 8. High-Risk / Suspicious TLD
    if tld in SUSPICIOUS_TLDS:
        evidence.append(
            Evidence(
                code="HIGH_RISK_TLD",
                title="High-Abuse Top-Level Domain",
                detail=f"TLD '.{tld}' is associated with disproportionate rates of malicious activity and free registration campaigns.",
                severity="LOW",
            )
        )

    # 9. Brand Impersonation & Typosquatting in Hostname
    brand_deception = check_brand_deception(hostname_clean, main_domain, subdomains)
    if brand_deception:
        brand, match_type, detail = brand_deception
        if match_type == "subdomain_impersonation":
            evidence.append(
                Evidence(
                    code="DECEPTIVE_BRAND_IMPERSONATION",
                    title="Deceptive Brand in Subdomain",
                    detail=detail,
                    severity="HIGH",
                )
            )
        elif match_type == "hyphenated_brand_domain":
            evidence.append(
                Evidence(
                    code="DECEPTIVE_BRAND_IMPERSONATION",
                    title="Brand Name in Unofficial Domain",
                    detail=detail,
                    severity="HIGH",
                )
            )
        elif match_type == "typosquatting":
            evidence.append(
                Evidence(
                    code="TYPOSQUATTED_DOMAIN",
                    title="Typosquatting Lookalike Domain",
                    detail=detail,
                    severity="HIGH",
                )
            )

    # Check if this hostname is a sovereign/regulated institutional domain or officially recognized brand domain
    if tld in {"bank.in", "gov.in", "nic.in", "mil.in"}:
        context_modifiers["trusted_brand_domain"] = True
    else:
        for brand, info in HIGH_TARGET_BRANDS.items():
            if any(hostname_clean == off or hostname_clean.endswith("." + off) for off in info["official_domains"]):
                context_modifiers["trusted_brand_domain"] = True
                break

    # 10. Path & Query Inspections
    path_lower = path.lower()
    path_segments = [p for p in path_lower.split("/") if p]

    # Sensitive Path Check (Login, Verify, Recover)
    sensitive_path_found = any(seg in SENSITIVE_PATHS for seg in path_segments)
    if sensitive_path_found:
        # Note requirement: "A brand name appearing in a URL path is not proof of impersonation."
        # If the domain is already marked as trusted, sensitive path is standard behavior.
        # But if the domain is suspicious, untrusted, or has other anomalies, it warrants inspection.
        if not context_modifiers.get("trusted_brand_domain", False):
            # If combining with an IP host, high-risk TLD, or unencrypted scheme:
            if is_ip_address(hostname_clean) or tld in SUSPICIOUS_TLDS or scheme == "http":
                evidence.append(
                    Evidence(
                        code="SENSITIVE_CREDENTIAL_PATH",
                        title="Sensitive Action Path on Untrusted Host",
                        detail=f"URL targets sensitive path '{path[:40]}' on an unverified host.",
                        severity="MEDIUM",
                    )
                )

    # Suspicious Open-Redirect Parameters in Query
    if query:
        query_lower = query.lower()
        parsed_query = urllib.parse.parse_qs(query)
        for param, values in parsed_query.items():
            param_lower = param.lower()
            if param_lower in SUSPICIOUS_REDIRECT_PARAMS:
                for val in values:
                    if val.startswith("http://") or val.startswith("https://") or val.startswith("//"):
                        evidence.append(
                            Evidence(
                                code="SUSPICIOUS_REDIRECT_PARAMETER",
                                title="Potential Open Redirect Target",
                                detail=f"Parameter '{param}' contains an encoded destination URL '{val[:40]}...'.",
                                severity="MEDIUM",
                            )
                        )
                        break

    # Percent Encoding / Obfuscation Checks
    if "%" in url_clean:
        percent_encodings = re.findall(r"%[0-9a-fA-F]{2}", url_clean)
        if len(percent_encodings) > 5:
            evidence.append(
                Evidence(
                    code="SUSPICIOUS_PERCENT_ENCODING",
                    title="Excessive Percent-Encoding",
                    detail=f"Found {len(percent_encodings)} percent-encoded sequences, often employed to evade keyword detection.",
                    severity="LOW",
                )
            )
        # Check for encoded slash (%2f) or dot (%2e) or null byte (%00)
        if re.search(r"%(2f|2e|00)", url_clean, re.IGNORECASE):
            evidence.append(
                Evidence(
                    code="SUSPICIOUS_PERCENT_ENCODING",
                    title="Obfuscated Path Delimiters",
                    detail="URL encodes path separators or directory dots, a frequent signature of path traversal or evasion.",
                    severity="MEDIUM",
                )
            )

    return build_scan_response(
        scan_type="url",
        evidence_list=evidence,
        context_modifiers=context_modifiers,
    )
