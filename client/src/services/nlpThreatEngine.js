/**
 * On-Device NLP Threat & Smishing Scanner
 * Operates 100% client-side in RAM. No external API calls.
 * Evaluates semantic urgency, extortion patterns, and impersonation cues in English, Hindi & Hinglish.
 */

// Psychological Panic & Urgency Keywords
const URGENCY_PATTERNS = [
  { pattern: /\b(immediately|urgent|urgently|immediate|hurry|rush)\b/i, weight: 20, label: 'Immediate Action Urgency' },
  { pattern: /\b(within \d+\s*(hours?|hrs?|mins?|minutes?|days?))\b/i, weight: 25, label: 'Strict Artificial Deadline' },
  { pattern: /\b(tonight at \d+[:.]?\d*\s*(pm|am)?|today by midnight)\b/i, weight: 30, label: 'Same-Day Threat Deadline' },
  { pattern: /\b(disconnected|disconnect|cut off|cut power|electricity cut)\b/i, weight: 35, label: 'Essential Utility Cutoff Threat' },
  { pattern: /\b(suspended|blocked|freeze|frozen|deactivated|terminated)\b/i, weight: 30, label: 'Account Suspension Threat' },
  { pattern: /\b(legal action|police complaint|arrest warrant|court notice|cbi|fir)\b/i, weight: 40, label: 'Law Enforcement Extortion' },
  { pattern: /(बिजली काट|तुरंत भरें|खाता बंद|कार्रवाई|कनेक्शन काट)/i, weight: 35, label: 'Hindi High-Urgency Cue' },
  { pattern: /\b(turant|aaj raat|block ho jayega|kat diya jayega|aakhri mauka)\b/i, weight: 30, label: 'Hinglish Panic Cue' }
];

// Financial Lures & Extortion Cues
const FINANCIAL_LURE_PATTERNS = [
  { pattern: /\b(kyc expired|kyc update|pan link|pan update|aadhaar link)\b/i, weight: 30, label: 'Fake KYC / PAN Verification Trap' },
  { pattern: /\b(lottery|won \u20B9?[\d,]+|cashback|refund of \u20B9?[\d,]+|unclaimed)\b/i, weight: 35, label: 'Financial Lottery / Cashback Bait' },
  { pattern: /\b(claim now|credited to your|click to receive|scratch card)\b/i, weight: 25, label: 'Unverified Money Credit Lure' },
  { pattern: /\b(electricity bill unpaid|bill of \u20B9?[\d,]+ pending)\b/i, weight: 30, label: 'Fake Utility Arrears Trap' },
  { pattern: /\b(part-time job|earn \u20B9?[\d,]+ daily|like youtube videos)\b/i, weight: 35, label: 'Part-Time Task Scam Lure' },
  { pattern: /(लॉटरी|कैशबैक|रिफंड|केवाईसी अपडेट|पैन कार्ड लिंक)/i, weight: 30, label: 'Hindi Financial Bait' }
];

// Institution Impersonation
const INSTITUTION_PATTERNS = [
  { pattern: /\b(sbi|state bank|yono)\b/i, name: 'State Bank of India (SBI)', realDomain: 'onlinesbi.sbi' },
  { pattern: /\b(hdfc|hdfcbank)\b/i, name: 'HDFC Bank', realDomain: 'hdfcbank.com' },
  { pattern: /\b(icici|imobile)\b/i, name: 'ICICI Bank', realDomain: 'icicibank.com' },
  { pattern: /\b(pnb|punjab national)\b/i, name: 'Punjab National Bank', realDomain: 'pnbindia.in' },
  { pattern: /\b(electricity office|power board|tneb|mseb|bescom|uppcl|dhbvn|torrent power)\b/i, name: 'Power Distribution Utility', realDomain: 'Official State Discom' },
  { pattern: /\b(income tax|itr refund|tax department)\b/i, name: 'Income Tax Department', realDomain: 'incometax.gov.in' },
  { pattern: /\b(india post|parcel delayed|speed post)\b/i, name: 'India Post Delivery', realDomain: 'indiapost.gov.in' },
  { pattern: /\b(pm yojana|pm kisan|free recharge)\b/i, name: 'Government Scheme Mimicry', realDomain: 'pmkisan.gov.in' },
  { pattern: /\b(phonepe|paytm|gpay|google pay)\b/i, name: 'UPI Payment App', realDomain: 'Official UPI App' }
];

// Extractor Helpers
const PHONE_EXTRACTOR = /(?:(?:\+?91[\-\s]?)?[6-9]\d{9}|\b\d{4}[\-\s]?\d{3}[\-\s]?\d{3}\b)/g;
const URL_EXTRACTOR = /(https?:\/\/[^\s]+|www\.[^\s]+|[a-zA-Z0-9-]+\.(?:xyz|top|site|club|buzz|tk|icu|work|online|cc|vip|ru|link)[^\s]*)/gi;

/**
 * Analyze an SMS or chat message string
 */
export function analyzeMessageNLP(text = '') {
  const startTime = performance.now();
  const cleanText = text.trim();

  if (!cleanText) {
    return {
      score: 0,
      urgencyLevel: 'LOW',
      cuesFound: [],
      impersonatedEntity: null,
      extractedLinks: [],
      extractedPhones: [],
      latencyMs: 0,
      plainExplanation: 'No text provided for analysis.'
    };
  }

  const cuesFound = [];
  let urgencyRawScore = 0;

  // 1. Check Urgency Patterns
  URGENCY_PATTERNS.forEach((item) => {
    if (item.pattern.test(cleanText)) {
      urgencyRawScore += item.weight;
      cuesFound.push({
        type: 'URGENCY',
        label: item.label,
        weight: item.weight
      });
    }
  });

  // 2. Check Financial Lure Patterns
  FINANCIAL_LURE_PATTERNS.forEach((item) => {
    if (item.pattern.test(cleanText)) {
      urgencyRawScore += item.weight;
      cuesFound.push({
        type: 'FINANCIAL_LURE',
        label: item.label,
        weight: item.weight
      });
    }
  });

  // 3. Check Institution Impersonation
  let impersonatedEntity = null;
  for (const inst of INSTITUTION_PATTERNS) {
    if (inst.pattern.test(cleanText)) {
      impersonatedEntity = inst;
      urgencyRawScore += 15;
      cuesFound.push({
        type: 'IMPERSONATION',
        label: `Impersonating ${inst.name}`,
        weight: 15
      });
      break;
    }
  }

  // 4. Extract phone numbers and URLs
  const extractedPhones = Array.from(new Set(cleanText.match(PHONE_EXTRACTOR) || []));
  const extractedLinks = Array.from(new Set(cleanText.match(URL_EXTRACTOR) || []));

  if (extractedPhones.length > 0 && urgencyRawScore > 20) {
    urgencyRawScore += 15;
    cuesFound.push({
      type: 'CALL_TO_ACTION',
      label: `Suspicious Personal Helpline Number Found: ${extractedPhones.join(', ')}`,
      weight: 15
    });
  }

  if (extractedLinks.length > 0) {
    urgencyRawScore += 15;
    cuesFound.push({
      type: 'LINK_REDIRECT',
      label: `External Web Link Included in Message (${extractedLinks.length} links)`,
      weight: 15
    });
  }

  // Normalise score 0-100
  const normalizedScore = Math.min(100, Math.round(urgencyRawScore));

  let urgencyLevel = 'SAFE';
  if (normalizedScore >= 70) urgencyLevel = 'CRITICAL';
  else if (normalizedScore >= 40) urgencyLevel = 'SUSPICIOUS';

  // Plain Explanation for non-tech users in English & Hindi
  let plainExplanation = '';
  if (normalizedScore >= 70) {
    plainExplanation = `CRITICAL THREAT: This message uses intense psychological panic and fake urgency to force you to call an unauthorized number or tap a link. Genuine banks and electricity boards never threaten immediate disconnection or suspension via personal SMS.`;
  } else if (normalizedScore >= 40) {
    plainExplanation = `SUSPICIOUS ALERT: Contains elements of urgency or financial offers. Do not click links or call helpline numbers provided inside the message.`;
  } else {
    plainExplanation = `LEGITIMATE / LOW RISK: No obvious extortion, panic triggers, or malicious smishing keywords detected.`;
  }

  const latencyMs = Math.round((performance.now() - startTime) * 100) / 100;

  return {
    score: normalizedScore,
    urgencyLevel,
    cuesFound,
    impersonatedEntity,
    extractedLinks,
    extractedPhones,
    latencyMs,
    plainExplanation
  };
}
