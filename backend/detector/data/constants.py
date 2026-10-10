"""
Sentinel AI - Detection Engine Data Constants
Local, offline knowledge base for heuristic and structural inspection.
No external network lookups or cloud dependencies.
"""

from typing import Set, Dict, List

# Common URL shortening services.
# Used strictly as an uncertainty indicator, never contacted over the network.
KNOWN_SHORTENERS: Set[str] = {
    "bit.ly",
    "tinyurl.com",
    "t.co",
    "goo.gl",
    "ow.ly",
    "is.gd",
    "buff.ly",
    "adf.ly",
    "bit.do",
    "mcaf.ee",
    "su.pr",
    "rebrand.ly",
    "cutt.ly",
    "shorturl.at",
    "tiny.cc",
    "rb.gy",
    "lnkd.in",
    "t.ly",
    "bl.ink",
    "qr.ae",
    "trib.al",
    "ift.tt",
    "wp.me",
    "po.st",
    "dlvr.it",
}

# TLDs historically associated with high abuse rates in automated phishing campaigns.
# Used as a structural factor with low-to-medium weight, not conclusive proof.
SUSPICIOUS_TLDS: Set[str] = {
    "tk",
    "ml",
    "ga",
    "cf",
    "gq",
    "top",
    "xyz",
    "buzz",
    "work",
    "fit",
    "surf",
    "click",
    "icu",
    "cam",
    "monster",
    "country",
    "kim",
    "gdn",
    "racing",
    "stream",
}

# High-profile brands frequently targeted for credential harvesting and impersonation.
HIGH_TARGET_BRANDS: Dict[str, Dict[str, List[str]]] = {
    "paypal": {
        "official_domains": ["paypal.com", "paypal-community.com"],
        "keywords": ["paypal", "pay-pal"],
    },
    "apple": {
        "official_domains": ["apple.com", "icloud.com"],
        "keywords": ["appleid", "apple-id", "icloud"],
    },
    "google": {
        "official_domains": ["google.com", "gmail.com", "accounts.google.com"],
        "keywords": ["google", "gmail"],
    },
    "microsoft": {
        "official_domains": ["microsoft.com", "live.com", "office.com", "outlook.com"],
        "keywords": ["microsoft", "office365", "outlook", "onedrive"],
    },
    "amazon": {
        "official_domains": ["amazon.com", "amazon.co.uk", "amazon.ca", "amazon.de"],
        "keywords": ["amazon", "prime-video"],
    },
    "netflix": {
        "official_domains": ["netflix.com"],
        "keywords": ["netflix"],
    },
    "chase": {
        "official_domains": ["chase.com"],
        "keywords": ["chasebank", "chase-online"],
    },
    "wellsfargo": {
        "official_domains": ["wellsfargo.com"],
        "keywords": ["wellsfargo", "wells-fargo"],
    },
    "bankofamerica": {
        "official_domains": ["bankofamerica.com", "bofa.com"],
        "keywords": ["bankofamerica", "bofa"],
    },
    "facebook": {
        "official_domains": ["facebook.com", "fb.com", "meta.com"],
        "keywords": ["facebook", "meta-security"],
    },
    "instagram": {
        "official_domains": ["instagram.com"],
        "keywords": ["instagram"],
    },
    "whatsapp": {
        "official_domains": ["whatsapp.com"],
        "keywords": ["whatsapp"],
    },
    "fedex": {
        "official_domains": ["fedex.com"],
        "keywords": ["fedex", "fed-ex"],
    },
    "ups": {
        "official_domains": ["ups.com"],
        "keywords": ["ups-tracking", "ups-delivery"],
    },
    "dhl": {
        "official_domains": ["dhl.com"],
        "keywords": ["dhl-express", "dhl-parcel"],
    },
    "usps": {
        "official_domains": ["usps.com"],
        "keywords": ["usps-tracking", "usps-post"],
    },
    "binance": {
        "official_domains": ["binance.com"],
        "keywords": ["binance"],
    },
    "coinbase": {
        "official_domains": ["coinbase.com"],
        "keywords": ["coinbase"],
    },
    "metamask": {
        "official_domains": ["metamask.io"],
        "keywords": ["metamask"],
    },
    "sbi": {
        "official_domains": ["onlinesbi.sbi", "sbi.co.in", "sbi.bank.in", "onlinesbi.com", "statebankofindia.com", "yono.sbi", "sbicard.com"],
        "keywords": ["onlinesbi", "yono", "sbi-bank", "sbi-card"],
    },
    "hdfc": {
        "official_domains": ["hdfcbank.com", "hdfcbank.bank.in", "hdfc.com"],
        "keywords": ["hdfcbank", "hdfc-bank"],
    },
    "icici": {
        "official_domains": ["icicibank.com", "icicibank.bank.in", "icicidirect.com"],
        "keywords": ["icicibank", "icici-bank", "imobile"],
    },
    "axis": {
        "official_domains": ["axisbank.com", "axisbank.bank.in"],
        "keywords": ["axisbank", "axis-bank"],
    },
    "kotak": {
        "official_domains": ["kotak.com", "kotak.bank.in"],
        "keywords": ["kotakbank", "kotak-bank"],
    },
    "pnb": {
        "official_domains": ["pnbindia.in", "pnb.bank.in"],
        "keywords": ["pnbindia", "pnb-bank"],
    },
    "baroda": {
        "official_domains": ["bankofbaroda.in", "bankofbaroda.bank.in"],
        "keywords": ["bankofbaroda", "bob-bank"],
    },
    "phonepe": {
        "official_domains": ["phonepe.com"],
        "keywords": ["phonepe", "phone-pe"],
    },
    "paytm": {
        "official_domains": ["paytm.com", "paytmbank.com"],
        "keywords": ["paytm", "pay-tm"],
    },
    "npci": {
        "official_domains": ["npci.org.in", "bhimupi.org.in", "upiqr.in"],
        "keywords": ["npci", "bhim-upi"],
    },
    "incometax": {
        "official_domains": ["incometax.gov.in"],
        "keywords": ["incometax", "itr-refund"],
    },
    "uidai": {
        "official_domains": ["uidai.gov.in"],
        "keywords": ["uidai", "aadhaar"],
    },
    "irctc": {
        "official_domains": ["irctc.co.in", "indianrail.gov.in"],
        "keywords": ["irctc", "indianrail"],
    },
    "indiapost": {
        "official_domains": ["indiapost.gov.in"],
        "keywords": ["indiapost", "india-post"],
    },
}

# Sensitive path components often seen in phishing kits
SENSITIVE_PATHS: Set[str] = {
    "login",
    "signin",
    "sign-in",
    "log-in",
    "verify",
    "verification",
    "verify-account",
    "account-update",
    "reset-password",
    "password-reset",
    "auth",
    "authenticate",
    "secure",
    "security-update",
    "wallet",
    "recover",
    "recovery",
    "billing",
    "confirm",
    "confirm-identity",
    "kyc",
    "webscr",
    "ebayisapi.dll",
    "banking",
    "unlock-account",
}

# Parameter names commonly associated with open redirect vulnerabilities or tracking hops
SUSPICIOUS_REDIRECT_PARAMS: Set[str] = {
    "url",
    "redirect",
    "redirect_url",
    "redirect_uri",
    "next",
    "target",
    "dest",
    "destination",
    "goto",
    "return",
    "return_to",
    "link",
    "r",
    "out",
    "forward",
}

# Dangerous or anomalous URI schemes
DANGEROUS_SCHEMES: Set[str] = {
    "javascript",
    "data",
    "file",
    "vbscript",
    "blob",
}

# Common leetspeak substitutions used in brand lookalikes / typosquatting
LEET_SUBSTITUTIONS: Dict[str, str] = {
    "0": "o",
    "1": "l",
    "3": "e",
    "4": "a",
    "5": "s",
    "7": "t",
    "8": "b",
    "@": "a",
}
