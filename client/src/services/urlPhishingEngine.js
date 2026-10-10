/**
 * AegisEdge v3.0 — Precision On-Device URL Phishing, Typosquatting & Shannon Entropy Engine
 * 100% Client-side. Zero external lookups.
 * Built for zero false positives on legitimate banking, government, and global websites.
 */

// Multi-part ccTLDs and Official Sovereign Extensions
const MULTI_PART_TLDS = new Set([
  'bank.in', 'gov.in', 'nic.in', 'mil.in', 'edu.in', 'ac.in', 'res.in', 'co.in', 'org.in', 'net.in',
  'co.uk', 'gov.uk', 'ac.uk', 'org.uk', 'net.uk',
  'com.au', 'gov.au', 'edu.au', 'net.au', 'org.au',
  'co.jp', 'ne.jp', 'ac.jp', 'go.jp',
  'com.br', 'gov.br', 'edu.br',
  'co.za', 'gov.za',
  'com.sg', 'gov.sg', 'edu.sg'
]);

// Regulated sovereign/banking TLDs where domains are strictly vetted by authorities (RBI/IDRBT/NIC/GoI)
const SOVEREIGN_TLDS = new Set([
  'bank.in', 'gov.in', 'nic.in', 'mil.in', 'gov'
]);

// Comprehensive Verified Official Banking, Government, Fintech & Global Brands Registry
export const LEGITIMATE_PORTALS = [
  // --- Indian Public & Private Sector Banks ---
  { domain: 'onlinesbi.sbi', name: 'State Bank of India (SBI)', category: 'Banking', aliases: ['sbi.bank.in', 'sbi.co.in', 'onlinesbi.com', 'statebankofindia.com', 'sbicard.com', 'sbimf.com', 'yono.sbi'] },
  { domain: 'hdfcbank.com', name: 'HDFC Bank', category: 'Banking', aliases: ['hdfcbank.bank.in', 'hdfc.com', 'hdfcsec.com'] },
  { domain: 'icicibank.com', name: 'ICICI Bank', category: 'Banking', aliases: ['icicibank.bank.in', 'icicidirect.com', 'imobile.icicibank.com'] },
  { domain: 'axisbank.com', name: 'Axis Bank', category: 'Banking', aliases: ['axisbank.bank.in'] },
  { domain: 'kotak.com', name: 'Kotak Mahindra Bank', category: 'Banking', aliases: ['kotak.bank.in', 'kotaksecurities.com'] },
  { domain: 'pnbindia.in', name: 'Punjab National Bank (PNB)', category: 'Banking', aliases: ['pnb.bank.in', 'pnbnet.net.in'] },
  { domain: 'bankofbaroda.in', name: 'Bank of Baroda (BOB)', category: 'Banking', aliases: ['bankofbaroda.bank.in', 'bobfinancial.com'] },
  { domain: 'canarabank.com', name: 'Canara Bank', category: 'Banking', aliases: ['canarabank.bank.in'] },
  { domain: 'unionbankofindia.co.in', name: 'Union Bank of India', category: 'Banking', aliases: ['unionbankofindia.bank.in'] },
  { domain: 'bankofindia.co.in', name: 'Bank of India (BOI)', category: 'Banking', aliases: ['bankofindia.bank.in'] },
  { domain: 'indianbank.in', name: 'Indian Bank', category: 'Banking', aliases: ['indianbank.bank.in'] },
  { domain: 'centralbankofindia.co.in', name: 'Central Bank of India', category: 'Banking' },
  { domain: 'indusind.com', name: 'IndusInd Bank', category: 'Banking', aliases: ['indusind.bank.in'] },
  { domain: 'yesbank.in', name: 'YES Bank', category: 'Banking', aliases: ['yesbank.bank.in'] },
  { domain: 'idfcfirstbank.com', name: 'IDFC FIRST Bank', category: 'Banking' },
  { domain: 'federalbank.co.in', name: 'Federal Bank', category: 'Banking' },
  { domain: 'rblbank.com', name: 'RBL Bank', category: 'Banking' },
  { domain: 'aubank.in', name: 'AU Small Finance Bank', category: 'Banking' },
  { domain: 'bandhanbank.com', name: 'Bandhan Bank', category: 'Banking' },
  { domain: 'rbi.org.in', name: 'Reserve Bank of India (RBI)', category: 'Regulatory' },

  // --- Indian Fintech & UPI Payments ---
  { domain: 'phonepe.com', name: 'PhonePe UPI', category: 'Fintech' },
  { domain: 'paytm.com', name: 'Paytm UPI', category: 'Fintech', aliases: ['paytmbank.com'] },
  { domain: 'bhimupi.org.in', name: 'NPCI BHIM UPI', category: 'Payments', aliases: ['npci.org.in', 'upiqr.in'] },
  { domain: 'cred.club', name: 'CRED Financial', category: 'Fintech' },
  { domain: 'razorpay.com', name: 'Razorpay Payments', category: 'Fintech' },
  { domain: 'groww.in', name: 'Groww Investments', category: 'Fintech' },
  { domain: 'zerodha.com', name: 'Zerodha Broking', category: 'Fintech' },
  { domain: 'billdesk.io', name: 'BillDesk Payments', category: 'Fintech', aliases: ['billdesk.com'] },
  { domain: 'mobikwik.com', name: 'MobiKwik', category: 'Fintech' },

  // --- Indian Government & Public Portals ---
  { domain: 'incometax.gov.in', name: 'Income Tax e-Filing Portal', category: 'Government' },
  { domain: 'uidai.gov.in', name: 'UIDAI Aadhaar Portal', category: 'Government' },
  { domain: 'indiapost.gov.in', name: 'India Post Official', category: 'Government' },
  { domain: 'pmkisan.gov.in', name: 'PM Kisan Samman Nidhi', category: 'Government' },
  { domain: 'cybercrime.gov.in', name: 'National Cyber Crime Reporting Portal', category: 'Cybersecurity' },
  { domain: 'passportindia.gov.in', name: 'Passport Seva Online Portal', category: 'Government' },
  { domain: 'parivahan.gov.in', name: 'Parivahan Sewa (MoRTH)', category: 'Government' },
  { domain: 'epfindia.gov.in', name: 'Employees Provident Fund Organization (EPFO)', category: 'Government' },
  { domain: 'digilocker.gov.in', name: 'DigiLocker National Wallet', category: 'Government' },
  { domain: 'cowin.gov.in', name: 'CoWIN Health Portal', category: 'Government' },
  { domain: 'irctc.co.in', name: 'IRCTC Railway Ticketing', category: 'Public Sector', aliases: ['indianrail.gov.in'] },
  { domain: 'india.gov.in', name: 'National Portal of India', category: 'Government' },
  { domain: 'mygov.in', name: 'MyGov India', category: 'Government' },
  { domain: 'sancharsaathi.gov.in', name: 'Sanchar Saathi (DoT)', category: 'Government', aliases: ['ceir.gov.in'] },
  { domain: 'cert-in.org.in', name: 'CERT-In Indian Computer Emergency Response Team', category: 'Cybersecurity' },
  { domain: 'mha.gov.in', name: 'Ministry of Home Affairs', category: 'Government' },
  { domain: 'meity.gov.in', name: 'Ministry of Electronics & IT', category: 'Government' },
  { domain: 'gst.gov.in', name: 'GST Portal', category: 'Government' },

  // --- State Electricity Boards & Utilities ---
  { domain: 'torrentpower.com', name: 'Torrent Power', category: 'Utility' },
  { domain: 'tatapower.com', name: 'Tata Power', category: 'Utility' },
  { domain: 'adanielectricity.com', name: 'Adani Electricity', category: 'Utility' },
  { domain: 'mahadiscom.in', name: 'MSEDCL Maharashtra Electricity', category: 'Utility' },
  { domain: 'tnebnet.org', name: 'TANGEDCO Tamil Nadu Electricity', category: 'Utility' },
  { domain: 'uppcl.org', name: 'UPPCL Uttar Pradesh Power', category: 'Utility' },
  { domain: 'dhbvn.org.in', name: 'DHBVN Haryana Power', category: 'Utility' },
  { domain: 'wbsedcl.in', name: 'WBSEDCL West Bengal Power', category: 'Utility' },

  // --- Global Tech, Telecom & Reputable Platforms ---
  { domain: 'google.com', name: 'Google', category: 'Technology', aliases: ['google.co.in', 'youtube.com', 'gmail.com', 'gstatic.com', 'android.com', 'google.co'] },
  { domain: 'apple.com', name: 'Apple Inc.', category: 'Technology', aliases: ['icloud.com', 'appleid.apple.com'] },
  { domain: 'microsoft.com', name: 'Microsoft Corporation', category: 'Technology', aliases: ['windows.com', 'live.com', 'office.com', 'outlook.com', 'azure.com', 'bing.com', 'github.com', 'linkedin.com'] },
  { domain: 'amazon.in', name: 'Amazon India', category: 'E-Commerce', aliases: ['amazon.com', 'primevideo.com', 'aws.amazon.com'] },
  { domain: 'flipkart.com', name: 'Flipkart', category: 'E-Commerce', aliases: ['myntra.com'] },
  { domain: 'meta.com', name: 'Meta Platforms', category: 'Social', aliases: ['facebook.com', 'instagram.com', 'whatsapp.com', 'threads.net', 'fb.com'] },
  { domain: 'twitter.com', name: 'X / Twitter', category: 'Social', aliases: ['x.com'] },
  { domain: 'netflix.com', name: 'Netflix', category: 'Entertainment' },
  { domain: 'spotify.com', name: 'Spotify', category: 'Entertainment' },
  { domain: 'hotstar.com', name: 'Disney+ Hotstar', category: 'Entertainment', aliases: ['jiocinema.com'] },
  { domain: 'jio.com', name: 'Reliance Jio', category: 'Telecom' },
  { domain: 'airtel.in', name: 'Bharti Airtel', category: 'Telecom' },
  { domain: 'myvi.in', name: 'Vodafone Idea (Vi)', category: 'Telecom' },
  { domain: 'bsnl.co.in', name: 'BSNL India', category: 'Telecom' },
  { domain: 'wikipedia.org', name: 'Wikipedia Foundation', category: 'Reference', aliases: ['wikimedia.org'] },
  { domain: 'cloudflare.com', name: 'Cloudflare', category: 'Infrastructure' },
  { domain: 'zoom.us', name: 'Zoom Communications', category: 'Technology' },
  { domain: 'zomato.com', name: 'Zomato', category: 'Services' },
  { domain: 'swiggy.com', name: 'Swiggy', category: 'Services' }
];

// High-Risk TLDs frequently abused in smishing/phishing campaigns
const SUSPICIOUS_TLDS = new Set([
  'xyz', 'top', 'tk', 'icu', 'buzz', 'club', 'work', 'click', 'site',
  'online', 'ru', 'cn', 'cc', 'link', 'vip', 'monster', 'rest', 'live',
  'cam', 'fit', 'surf', 'gq', 'cf', 'ga', 'ml', 'country', 'kim', 'racing'
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
          matrix[i - 1][j - 1] + 1,
          Math.min(matrix[i][j - 1] + 1, matrix[i - 1][j] + 1)
        );
      }
    }
  }

  return matrix[b.length][a.length];
}

/**
 * Calculate Shannon Entropy of a domain string
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
 * Extract clean hostname and correct eTLD+1 domain structure
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

    if (parts.length <= 1) {
      return {
        isValid: true,
        hostname: host,
        pathname: parsed.pathname,
        tld: host,
        mainDomain: host,
        registeredDomain: host,
        subdomains: []
      };
    }

    // Check multi-part ccTLD (e.g. sbi.bank.in, incometax.gov.in, bbc.co.uk)
    let tld = parts.slice(-1)[0];
    let registeredDomain = '';
    let subdomains = [];

    if (parts.length >= 3) {
      const candidateTwoPart = parts.slice(-2).join('.');
      if (MULTI_PART_TLDS.has(candidateTwoPart)) {
        tld = candidateTwoPart;
        registeredDomain = parts.slice(-3).join('.');
        subdomains = parts.slice(0, -3);
      }
    }

    if (!registeredDomain) {
      registeredDomain = parts.slice(-2).join('.');
      subdomains = parts.slice(0, -2);
    }

    return {
      isValid: true,
      hostname: host,
      pathname: parsed.pathname,
      tld,
      mainDomain: registeredDomain,
      registeredDomain,
      subdomains
    };
  } catch {
    return {
      isValid: false,
      hostname: rawUrl.toLowerCase(),
      pathname: '',
      tld: rawUrl.split('.').pop() || '',
      mainDomain: rawUrl.toLowerCase(),
      registeredDomain: rawUrl.toLowerCase(),
      subdomains: []
    };
  }
}

/**
 * Check if a hostname matches a known portal or any of its registered aliases
 */
function findVerifiedPortal(hostname, registeredDomain) {
  for (const portal of LEGITIMATE_PORTALS) {
    const allDomains = [portal.domain, ...(portal.aliases || [])];
    for (const d of allDomains) {
      const cleanD = d.toLowerCase();
      // Match exact domain or subdomain of trusted root
      if (hostname === cleanD || hostname.endsWith('.' + cleanD) || registeredDomain === cleanD) {
        return { portal, matchedDomain: cleanD };
      }
    }
  }
  return null;
}

/**
 * Deep audit a URL for phishing, typosquatting & entropy anomalies
 * Fully hardened against false positives on legitimate websites.
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

  const { hostname, tld, subdomains, registeredDomain } = parseDomainParts(rawUrl);
  const flags = [];
  let riskScore = 0;

  // 1. Check against comprehensive Verified Official Registry
  const verifiedMatch = findVerifiedPortal(hostname, registeredDomain);
  if (verifiedMatch) {
    const latencyMs = Math.round((performance.now() - startTime) * 100) / 100;
    return {
      score: 0,
      riskLevel: 'VERIFIED_OFFICIAL',
      isLegitimate: true,
      closestMatch: verifiedMatch.portal,
      entropy: calculateShannonEntropy(hostname),
      hostname,
      tld,
      flags: [{
        type: 'VERIFIED',
        severity: 'INFO',
        text: `Official verified domain for ${verifiedMatch.portal.name} (${verifiedMatch.matchedDomain})`
      }],
      latencyMs
    };
  }

  // 2. Sovereign / Institutional TLD Immunity (.gov.in, .nic.in, .bank.in, .mil.in)
  // These domains are strictly regulated by government authorities and cannot be registered by public scammers.
  if (SOVEREIGN_TLDS.has(tld)) {
    const latencyMs = Math.round((performance.now() - startTime) * 100) / 100;
    const orgType = tld === 'bank.in'
      ? 'RBI / IDRBT Licensed Scheduled Commercial Bank'
      : 'Government of India Official Statutory Entity';
    return {
      score: 0,
      riskLevel: 'VERIFIED_OFFICIAL',
      isLegitimate: true,
      closestMatch: { name: orgType, domain: registeredDomain, category: 'Institutional' },
      entropy: calculateShannonEntropy(hostname),
      hostname,
      tld,
      flags: [{
        type: 'VERIFIED_SOVEREIGN',
        severity: 'INFO',
        text: `Protected Sovereign / Regulated Institutional Root (.${tld}). Authorized by ${orgType}.`
      }],
      latencyMs
    };
  }

  // 3. High-Risk Disposable TLD Check
  if (SUSPICIOUS_TLDS.has(tld)) {
    riskScore += 35;
    flags.push({
      type: 'SUSPICIOUS_TLD',
      severity: 'HIGH',
      text: `High-abuse top-level domain (.${tld}) frequently used in disposable phishing campaigns.`
    });
  }

  // 4. Shannon Entropy Check (Detect DGA random generated strings)
  const entropy = calculateShannonEntropy(registeredDomain.replace(/\./g, ''));
  if (entropy > 4.1) {
    riskScore += 30;
    flags.push({
      type: 'HIGH_ENTROPY',
      severity: 'MEDIUM',
      text: `Elevated Shannon entropy (${entropy} bits) indicates machine-generated / randomized domain.`
    });
  }

  // 5. Deceptive Subdomain Spoofing Check (e.g. onlinesbi.sbi.kyc-update.xyz)
  // Only triggers if the registered domain (eTLD+1) does NOT belong to the brand!
  let deceptiveBrandFound = null;
  const brandKeywords = [
    { key: 'sbi', name: 'State Bank of India', officialRoots: ['sbi', 'onlinesbi.sbi', 'sbi.bank.in', 'sbi.co.in'] },
    { key: 'hdfc', name: 'HDFC Bank', officialRoots: ['hdfcbank.com', 'hdfcbank.bank.in', 'hdfc.com'] },
    { key: 'icici', name: 'ICICI Bank', officialRoots: ['icicibank.com', 'icicibank.bank.in'] },
    { key: 'axis', name: 'Axis Bank', officialRoots: ['axisbank.com', 'axisbank.bank.in'] },
    { key: 'kotak', name: 'Kotak Mahindra', officialRoots: ['kotak.com', 'kotak.bank.in'] },
    { key: 'pnb', name: 'Punjab National Bank', officialRoots: ['pnbindia.in', 'pnb.bank.in'] },
    { key: 'baroda', name: 'Bank of Baroda', officialRoots: ['bankofbaroda.in', 'bankofbaroda.bank.in'] },
    { key: 'phonepe', name: 'PhonePe', officialRoots: ['phonepe.com'] },
    { key: 'paytm', name: 'Paytm', officialRoots: ['paytm.com', 'paytmbank.com'] },
    { key: 'bhim', name: 'BHIM UPI', officialRoots: ['bhimupi.org.in', 'npci.org.in'] },
    { key: 'aadhaar', name: 'UIDAI Aadhaar', officialRoots: ['uidai.gov.in'] },
    { key: 'incometax', name: 'Income Tax Dept', officialRoots: ['incometax.gov.in'] },
    { key: 'indiapost', name: 'India Post', officialRoots: ['indiapost.gov.in'] },
    { key: 'irctc', name: 'IRCTC', officialRoots: ['irctc.co.in'] }
  ];

  for (const item of brandKeywords) {
    const isBrandInSub = subdomains.some(sub => sub.includes(item.key));
    const isBrandInHost = hostname.includes(item.key);
    const isOfficialRoot = item.officialRoots.some(root => registeredDomain.includes(root) || hostname.endsWith(root));

    if ((isBrandInSub || isBrandInHost) && !isOfficialRoot) {
      deceptiveBrandFound = item;
      riskScore += 50;
      flags.push({
        type: 'SUBDOMAIN_DECEPTION',
        severity: 'CRITICAL',
        text: `Deceptive brand spoofing detected: Embeds '${item.name}' inside an unofficial foreign domain '${registeredDomain}'.`
      });
      break;
    }
  }

  // 6. Precision Typosquatting / Levenshtein Distance Check
  let closestMatch = null;
  let minDistance = Infinity;

  // Only compare candidate base of unverified domain against established brands
  const candidateBase = registeredDomain.split('.')[0];
  if (candidateBase.length >= 4 && !deceptiveBrandFound) {
    for (const portal of LEGITIMATE_PORTALS) {
      const targetBase = portal.domain.split('.')[0];
      if (Math.abs(candidateBase.length - targetBase.length) <= 2) {
        const dist = calculateLevenshtein(candidateBase, targetBase);
        if (dist === 1 || (dist === 2 && candidateBase.length >= 7)) {
          if (dist < minDistance) {
            minDistance = dist;
            closestMatch = {
              ...portal,
              distance: dist,
              similarityPercent: Math.round((1 - dist / Math.max(candidateBase.length, targetBase.length)) * 100)
            };
          }
        }
      }
    }
  }

  if (closestMatch && minDistance <= 2) {
    riskScore += 45;
    flags.push({
      type: 'TYPOSQUATTING',
      severity: 'CRITICAL',
      text: `Typosquatting alert: Lookalike variant of ${closestMatch.name} (${closestMatch.domain}) with only ${closestMatch.distance} character deviation!`
    });
  }

  // 7. Context-Aware Keyword Combinations
  // Phishing lure keywords are only high risk if paired with suspicious TLDs, brand spoofing, or unverified hosts
  const suspiciousKeywords = ['kyc-update', 'pan-link', 'claim-reward', 'refund-claim', 'yono-rewards', 'unblock-account', 'verify-now'];
  const matchedLures = suspiciousKeywords.filter(kw => hostname.includes(kw));
  if (matchedLures.length > 0) {
    riskScore += matchedLures.length * 20;
    flags.push({
      type: 'PHISHING_LURE',
      severity: 'HIGH',
      text: `High-risk smishing lure patterns found in hostname: [${matchedLures.join(', ')}]`
    });
  }

  // IP Address as Host Check
  if (/^(\d{1,3}\.){3}\d{1,3}$/.test(hostname)) {
    riskScore += 40;
    flags.push({
      type: 'IP_LITERAL_HOST',
      severity: 'HIGH',
      text: `Direct IP literal '${hostname}' used as host instead of registered domain.`
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
