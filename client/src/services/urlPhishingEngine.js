/**
 * On-Device URL Phishing, Typosquatting & Shannon Entropy Engine
 * 100% Client-side. Analyzes URLs without external lookups.
 */

// Trusted Official Indian Banking and Government Domains
export const LEGITIMATE_PORTALS = [
  { domain: 'onlinesbi.sbi', name: 'State Bank of India (SBI)', category: 'Banking' },
  { domain: 'hdfcbank.com', name: 'HDFC Bank', category: 'Banking' },
  { domain: 'icicibank.com', name: 'ICICI Bank', category: 'Banking' },
  { domain: 'axisbank.com', name: 'Axis Bank', category: 'Banking' },
  { domain: 'kotak.com', name: 'Kotak Mahindra Bank', category: 'Banking' },
  { domain: 'pnbindia.in', name: 'Punjab National Bank', category: 'Banking' },
  { domain: 'bankofbaroda.in', name: 'Bank of Baroda', category: 'Banking' },
  { domain: 'phonepe.com', name: 'PhonePe UPI', category: 'Fintech' },
  { domain: 'paytm.com', name: 'Paytm UPI', category: 'Fintech' },
  { domain: 'bhimupi.org.in', name: 'NPCI BHIM UPI', category: 'Payments' },
  { domain: 'incometax.gov.in', name: 'Income Tax e-Filing Portal', category: 'Government' },
  { domain: 'uidai.gov.in', name: 'UIDAI Aadhaar Portal', category: 'Government' },
  { domain: 'indiapost.gov.in', name: 'India Post Official', category: 'Government' },
  { domain: 'pmkisan.gov.in', name: 'PM Kisan Samman Nidhi', category: 'Government' },
  { domain: 'cybercrime.gov.in', name: 'National Cyber Crime Reporting Portal', category: 'Cybersecurity' }
];

// High-Risk TLDs frequently abused in smishing/phishing campaigns
const SUSPICIOUS_TLDS = new Set([
  'xyz', 'top', 'tk', 'icu', 'buzz', 'club', 'work', 'click', 'site',
  'online', 'ru', 'cn', 'cc', 'link', 'vip', 'monster', 'rest', 'live'
]);

/**
 * Calculate Levenshtein Distance between two strings
 */
export function calculateLevenshtein(a, b) {
  if (a.length === 0) return b.length;
  if (b.length === 0) return a.length;

  const matrix = [];
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          Math.min(
            matrix[i][j - 1] + 1,   // insertion
            matrix[i - 1][j] + 1    // deletion
          )
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Calculate Shannon Entropy of a domain string
 * Obfuscated / randomly generated strings (DGA) have high entropy (> 3.6 - 4.0)
 */
export function calculateShannonEntropy(str = '') {
  if (!str) return 0;
  const len = str.length;
  const frequencies = {};

  for (let i = 0; i < len; i++) {
    const char = str[i];
    frequencies[char] = (frequencies[char] || 0) + 1;
  }

  let entropy = 0;
  Object.values(frequencies).forEach((count) => {
    const p = count / len;
    entropy -= p * Math.log2(p);
  });

  return Math.round(entropy * 100) / 100;
}

/**
 * Extract clean hostname from URL string
 */
export function parseDomainParts(rawUrl = '') {
  let urlStr = rawUrl.trim();
  if (!/^https?:\/\//i.test(urlStr)) {
    urlStr = 'http://' + urlStr;
  }

  try {
    const parsed = new URL(urlStr);
    const host = parsed.hostname.toLowerCase();
    const parts = host.split('.');
    const tld = parts.slice(-1)[0] || '';
    const mainDomain = parts.slice(-2).join('.');
    return {
      isValid: true,
      hostname: host,
      pathname: parsed.pathname,
      tld,
      mainDomain,
      subdomains: parts.slice(0, -2)
    };
  } catch {
    return {
      isValid: false,
      hostname: rawUrl.toLowerCase(),
      pathname: '',
      tld: rawUrl.split('.').pop() || '',
      mainDomain: rawUrl.toLowerCase(),
      subdomains: []
    };
  }
}

/**
 * Deep audit a URL for phishing, typosquatting & entropy anomalies
 */
export function auditURL(rawUrl = '') {
  const startTime = performance.now();
  if (!rawUrl || !rawUrl.trim()) {
    return {
      score: 0,
      riskLevel: 'SAFE',
      isLegitimate: false,
      closestMatch: null,
      entropy: 0,
      flags: [],
      latencyMs: 0
    };
  }

  const { hostname, tld, subdomains, mainDomain } = parseDomainParts(rawUrl);
  const flags = [];
  let riskScore = 0;

  // 1. Exact Match against Whitelisted Official Portals
  const exactMatch = LEGITIMATE_PORTALS.find(
    (p) => hostname === p.domain || hostname.endsWith('.' + p.domain)
  );

  if (exactMatch) {
    const latencyMs = Math.round((performance.now() - startTime) * 100) / 100;
    return {
      score: 0,
      riskLevel: 'VERIFIED_OFFICIAL',
      isLegitimate: true,
      closestMatch: exactMatch,
      entropy: calculateShannonEntropy(hostname),
      flags: [{ type: 'VERIFIED', text: `Official verified domain for ${exactMatch.name}` }],
      latencyMs
    };
  }

  // 2. High-Risk TLD Check
  if (SUSPICIOUS_TLDS.has(tld)) {
    riskScore += 35;
    flags.push({
      type: 'SUSPICIOUS_TLD',
      severity: 'HIGH',
      text: `High-risk top-level domain (.${tld}) frequently used in disposable phishing campaigns.`
    });
  }

  // 3. Shannon Entropy Check
  const entropy = calculateShannonEntropy(hostname.replace(/\./g, ''));
  if (entropy > 3.75) {
    riskScore += 30;
    flags.push({
      type: 'HIGH_ENTROPY',
      severity: 'MEDIUM',
      text: `Elevated Shannon entropy (${entropy} bits) indicates machine-generated / obfuscated domain.`
    });
  }

  // 4. Subdomain Deception Check (e.g. sbi.co.in.fake-site.com)
  const containsBankNameInSubdomain = LEGITIMATE_PORTALS.find((portal) => {
    const baseName = portal.domain.split('.')[0];
    return subdomains.some((sub) => sub.includes(baseName));
  });

  if (containsBankNameInSubdomain) {
    riskScore += 45;
    flags.push({
      type: 'SUBDOMAIN_DECEPTION',
      severity: 'CRITICAL',
      text: `Deceptive Subdomain spoofing detected: Pretends to be ${containsBankNameInSubdomain.name} inside a foreign host.`
    });
  }

  // 5. Typosquatting / Levenshtein Distance Match against Indian Banking Domains
  let closestMatch = null;
  let minDistance = Infinity;

  LEGITIMATE_PORTALS.forEach((portal) => {
    const targetBase = portal.domain.split('.')[0];
    const candidateBase = mainDomain.split('.')[0];
    const dist = calculateLevenshtein(candidateBase, targetBase);

    // If distance is 1 or 2 edits away, it is a deliberate typosquat!
    if (dist > 0 && dist <= 2 && candidateBase.length >= 3) {
      if (dist < minDistance) {
        minDistance = dist;
        closestMatch = {
          ...portal,
          distance: dist,
          similarityPercent: Math.round((1 - dist / Math.max(candidateBase.length, targetBase.length)) * 100)
        };
      }
    }
  });

  if (closestMatch) {
    riskScore += 50;
    flags.push({
      type: 'TYPOSQUATTING',
      severity: 'CRITICAL',
      text: `Typosquatting alert: Looks suspiciously similar to ${closestMatch.name} (${closestMatch.domain}) with only ${closestMatch.distance} character deviation!`
    });
  }

  // 6. Suspicious Keyword Combinations inside URL (kyc, verify, otp, reward, power)
  const suspiciousKeywords = ['kyc', 'pan', 'reward', 'refund', 'yono', 'otp', 'bill', 'update', 'login', 'secure', 'bonus'];
  const matchedKeywords = suspiciousKeywords.filter((kw) => hostname.includes(kw));
  if (matchedKeywords.length > 0) {
    riskScore += matchedKeywords.length * 15;
    flags.push({
      type: 'PHISHING_KEYWORDS',
      severity: 'MEDIUM',
      text: `Phishing lure keywords found in domain: [${matchedKeywords.join(', ')}]`
    });
  }

  // Normalize final score 0-100
  const normalizedScore = Math.min(100, Math.round(riskScore));
  let riskLevel = 'SAFE';
  if (normalizedScore >= 70) riskLevel = 'CRITICAL';
  else if (normalizedScore >= 35) riskLevel = 'SUSPICIOUS';

  const latencyMs = Math.round((performance.now() - startTime) * 100) / 100;

  return {
    score: normalizedScore,
    riskLevel,
    isLegitimate: false,
    closestMatch,
    entropy,
    hostname,
    tld,
    flags,
    latencyMs
  };
}
