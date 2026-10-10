/**
 * AegisEdge v3.0 — Precision On-Device NLP Threat & Smishing Scanner
 * Operates 100% client-side in RAM. No external API calls.
 * Engineered for zero false positives on authentic bank OTPs, transaction alerts, and utility notices.
 */

import { auditURL } from './urlPhishingEngine.js';

// Coercive Threat Deadlines & Artificial Panics (Excludes standard OTP validity)
const COERCIVE_URGENCY_PATTERNS = [
  { pattern: /\b(disconnected|disconnect|cut off|cut power|electricity cut|power shutoff)\b/i, weight: 35, label: 'Essential Utility Cutoff Threat' },
  { pattern: /\b(account (will be|has been) (suspended|blocked|freeze|frozen|deactivated|terminated|closed))\b/i, weight: 35, label: 'Account Suspension Threat' },
  { pattern: /\b(legal action|police complaint|arrest warrant|court notice|cbi inquiry|fir registered)\b/i, weight: 45, label: 'Law Enforcement Extortion Threat' },
  { pattern: /\b(within (24|12|48|2|1) (hours|hrs|days)|tonight (at|by) \d+[:.]?\d*\s*(pm|am)?|today by midnight)\b/i, weight: 30, label: 'Coercive Artificial Deadline' },
  { pattern: /(बिजली काट|तुरंत भरें|खाता बंद|कार्रवाई|कनेक्शन काट)/i, weight: 35, label: 'Hindi Coercive Panic Cue' },
  { pattern: /\b(turant bhare|aaj raat|block ho jayega|kat diya jayega|aakhri mauka|police case)\b/i, weight: 35, label: 'Hinglish Coercive Cue' }
];

// Financial Lures & Fraudulent Bait (Excludes standard banking transaction receipts)
const FINANCIAL_FRAUD_PATTERNS = [
  { pattern: /\b(kyc expired|kyc update|pan link|pan update|aadhaar link|update your pan)\b/i, weight: 35, label: 'Fake KYC / PAN Verification Trap' },
  { pattern: /\b(lottery|won \u20B9?[\d,]+|kbc lottery|congratulations.*winner|unclaimed prize)\b/i, weight: 40, label: 'Lottery / Prize Bait Scam' },
  { pattern: /\b(scratch card|claim \u20B9?[\d,]+ bonus|free recharge of \u20B9?[\d,]+)\b/i, weight: 30, label: 'Financial Cashback / Free Gift Bait' },
  { pattern: /\b(part[-\s]?time job|earn \u20B9?[\d,]+ daily|like youtube videos|earn money from home)\b/i, weight: 35, label: 'Task / Part-Time Job Scam Lure' },
  { pattern: /(लॉटरी|मुफ्त रिचार्ज|केवाईसी अपडेट|पैन कार्ड लिंक)/i, weight: 30, label: 'Hindi Financial Bait' }
];

// Impersonation of High-Risk Institutions (Used contextually)
const INSTITUTION_PATTERNS = [
  { pattern: /\b(sbi|state bank|yono)\b/i, name: 'State Bank of India (SBI)', officialDomain: 'onlinesbi.sbi' },
  { pattern: /\b(hdfc|hdfcbank)\b/i, name: 'HDFC Bank', officialDomain: 'hdfcbank.com' },
  { pattern: /\b(icici|imobile)\b/i, name: 'ICICI Bank', officialDomain: 'icicibank.com' },
  { pattern: /\b(pnb|punjab national)\b/i, name: 'Punjab National Bank', officialDomain: 'pnbindia.in' },
  { pattern: /\b(electricity office|power board|tneb|mseb|bescom|uppcl|dhbvn|torrent power)\b/i, name: 'Power Distribution Utility', officialDomain: 'Official State Discom' },
  { pattern: /\b(income tax|itr refund|tax department)\b/i, name: 'Income Tax Department', officialDomain: 'incometax.gov.in' },
  { pattern: /\b(india post|parcel delayed|speed post)\b/i, name: 'India Post Delivery', officialDomain: 'indiapost.gov.in' },
  { pattern: /\b(pm yojana|pm kisan|free recharge)\b/i, name: 'Government Scheme Mimicry', officialDomain: 'pmkisan.gov.in' }
];

// Positive Trust & Safety Markers Found in Authentic Bank Communications
const AUTHENTIC_SAFETY_MARKERS = [
  { pattern: /\b(do not share|never share|never disclose|don't share)\s+(your\s+)?(otp|pin|password|cvv|code)\b/i, label: 'Security Advisory: Never Share OTP/PIN' },
  { pattern: /\b(bank (never|will never) (asks?|call|request)\s+(for\s+)?(otp|pin|password|credentials))\b/i, label: 'Official Bank Security Guarantee' },
  { pattern: /\b(if not requested by you|if not done by you|if not initiated by you|forward this sms to)\b/i, label: 'Unauthorized Dispute Instructions' },
  { pattern: /\b(a\/c|account|card)\s*(ending|no\.?|is)?\s*[\*xX]{2,}\d{2,4}\b/i, label: 'Masked Account/Card Identification' },
  { pattern: /\b(otp (is|for)|valid for \d+\s*(minutes?|mins?)|expires in \d+\s*(minutes?|mins?))\b/i, label: 'Standard OTP Security Lifetime' }
];

// Standard Legitimate Transaction Receipt Patterns (Zero Risk)
const AUTHENTIC_TRANSACTION_PATTERNS = [
  /\b(debited by|credited with|withdrawn|transferred to|spent on your)\s+(rs\.?|inr|\u20B9)\s*[\d,]+/i,
  /\b(available (bal|balance)|net avail bal|clear balance)\s*:\s*(rs\.?|inr|\u20B9)\s*[\d,]+/i
];

// Helper Extractors
const PHONE_EXTRACTOR = /(?:(?:\+?91[\-\s]?)?[6-9]\d{9}|\b\d{4}[\-\s]?\d{3}[\-\s]?\d{3}\b)/g;
const URL_EXTRACTOR = /(https?:\/\/[^\s<>'"]+|www\.[^\s<>'"]+)/gi;

/**
 * Analyze an SMS or chat message string
 * Hardened for zero false positives on genuine banking alerts and standard communications.
 */
export function analyzeMessageNLP(text = '') {
  const startTime = performance.now();
  const cleanText = text.trim();

  if (!cleanText) {
    return {
      score: 0,
      urgencyLevel: 'SAFE',
      cuesFound: [],
      impersonatedEntity: null,
      extractedLinks: [],
      extractedPhones: [],
      isAuthenticBankNotice: false,
      latencyMs: 0,
      plainExplanation: 'No text provided for analysis.'
    };
  }

  const cuesFound = [];
  let threatScore = 0;
  let trustBonus = 0;

  // 1. Check for Positive Trust & Authentic Banking Markers
  let hasSafetyDisclaimer = false;
  AUTHENTIC_SAFETY_MARKERS.forEach((item) => {
    if (item.pattern.test(cleanText)) {
      trustBonus += 25;
      hasSafetyDisclaimer = true;
      cuesFound.push({
        type: 'TRUST_INDICATOR',
        label: item.label,
        severity: 'SAFE'
      });
    }
  });

  // Check for genuine transaction alert structure
  const isTransactionReceipt = AUTHENTIC_TRANSACTION_PATTERNS.some(p => p.test(cleanText));
  if (isTransactionReceipt) {
    trustBonus += 30;
    cuesFound.push({
      type: 'TRUST_INDICATOR',
      label: 'Standard Masked Transaction Receipt Format',
      severity: 'SAFE'
    });
  }

  // 2. Check Coercive Urgency & Extortion Patterns (Excludes benign OTP validity windows)
  COERCIVE_URGENCY_PATTERNS.forEach((item) => {
    if (item.pattern.test(cleanText)) {
      threatScore += item.weight;
      cuesFound.push({
        type: 'COERCIVE_URGENCY',
        label: item.label,
        weight: item.weight
      });
    }
  });

  // 3. Check Financial Fraud & Lure Patterns
  FINANCIAL_FRAUD_PATTERNS.forEach((item) => {
    if (item.pattern.test(cleanText)) {
      threatScore += item.weight;
      cuesFound.push({
        type: 'FINANCIAL_LURE',
        label: item.label,
        weight: item.weight
      });
    }
  });

  // 4. Institution Context (Only adds threat if coercive urgency or financial trap is also present)
  let impersonatedEntity = null;
  for (const inst of INSTITUTION_PATTERNS) {
    if (inst.pattern.test(cleanText)) {
      impersonatedEntity = inst;
      if (threatScore > 0) {
        threatScore += 15;
        cuesFound.push({
          type: 'IMPERSONATION',
          label: `Invokes ${inst.name} in high-urgency context`,
          weight: 15
        });
      }
      break;
    }
  }

  // 5. Extract and Audit Embedded URLs
  const extractedLinks = Array.from(new Set(cleanText.match(URL_EXTRACTOR) || []));
  let hasMaliciousLink = false;
  let hasVerifiedLink = false;

  for (const link of extractedLinks) {
    const linkAudit = auditURL(link);
    if (linkAudit.riskLevel === 'VERIFIED_OFFICIAL') {
      hasVerifiedLink = true;
      trustBonus += 35;
      cuesFound.push({
        type: 'VERIFIED_LINK',
        label: `Embedded link points to official domain: ${linkAudit.closestMatch?.domain || linkAudit.hostname}`,
        severity: 'SAFE'
      });
    } else if (linkAudit.score >= 50) {
      hasMaliciousLink = true;
      threatScore += 40;
      cuesFound.push({
        type: 'MALICIOUS_LINK',
        label: `Embedded link flagged as suspicious/phishing: ${linkAudit.hostname}`,
        weight: 40
      });
    }
  }

  // 6. Extract Phone Numbers
  const extractedPhones = Array.from(new Set(cleanText.match(PHONE_EXTRACTOR) || []));
  // A phone number is ONLY suspicious if paired with coercive urgency or financial lures
  if (extractedPhones.length > 0 && threatScore >= 35 && !hasSafetyDisclaimer) {
    threatScore += 15;
    cuesFound.push({
      type: 'CALL_TO_ACTION',
      label: `Suspicious Personal Helpline Number Found: ${extractedPhones.join(', ')}`,
      weight: 15
    });
  }

  // 7. Calculate Net Calibrated Threat Score
  let netScore = threatScore;
  if (hasSafetyDisclaimer || isTransactionReceipt || hasVerifiedLink) {
    // If genuine safety markers or verified links exist, heavily suppress unverified threats
    netScore = Math.max(0, netScore - trustBonus);
  }

  const normalizedScore = Math.min(100, Math.round(netScore));

  let urgencyLevel = 'SAFE';
  if (normalizedScore >= 70) urgencyLevel = 'CRITICAL';
  else if (normalizedScore >= 35) urgencyLevel = 'SUSPICIOUS';

  // Plain Explanation for non-tech users
  let plainExplanation = '';
  if (normalizedScore >= 70) {
    plainExplanation = `CRITICAL THREAT: This message uses intense psychological panic and fake urgency to force you to call an unauthorized number or tap a link. Genuine banks and electricity boards never threaten immediate disconnection or account termination via personal SMS.`;
  } else if (normalizedScore >= 35) {
    plainExplanation = `SUSPICIOUS ALERT: Contains elements of urgency or financial offers. Do not click links or call helpline numbers provided inside the message. Verify with your official app.`;
  } else if (hasSafetyDisclaimer || isTransactionReceipt) {
    plainExplanation = `AUTHENTIC BANK NOTIFICATION: Contains standard security advisories, masked account credentials, and official protection protocols. Safe communication.`;
  } else {
    plainExplanation = `LEGITIMATE / LOW RISK: No coercive extortion, panic triggers, or malicious smishing keywords detected.`;
  }

  const latencyMs = Math.round((performance.now() - startTime) * 100) / 100;

  return {
    score: normalizedScore,
    urgencyLevel,
    cuesFound,
    impersonatedEntity,
    extractedLinks,
    extractedPhones,
    isAuthenticBankNotice: hasSafetyDisclaimer || isTransactionReceipt,
    latencyMs,
    plainExplanation
  };
}
