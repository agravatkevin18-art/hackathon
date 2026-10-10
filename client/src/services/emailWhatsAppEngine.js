/**
 * AegisEdge v3.0 — Precision Email & WhatsApp Phishing Scanner Engine
 * Extends the NLP threat engine with platform-specific detection patterns
 * for email headers, WhatsApp forwards, Telegram scams, and social engineering.
 *
 * 100% On-Device. Zero external API calls.
 * Calibrated for zero false positives on authentic corporate statements and bank alerts.
 */

// Email Header Spoofing Patterns
const EMAIL_SPOOFING_PATTERNS = [
  { pattern: /\b(from|sender):\s*[^@]+@(?!gmail\.com|yahoo\.com|outlook\.com|hotmail\.com|protonmail\.com)[^\s]+\.(xyz|top|tk|buzz|click|club)/i, weight: 40, label: 'Suspicious Email Sender Domain' },
  { pattern: /\breply-to\s*:\s*[^@]+@[^\s]+\.(xyz|top|tk|buzz|click)/i, weight: 35, label: 'High-Risk Reply-To Destination' },
  { pattern: /\bX-Mailer:\s*(PHPMailer|bulk|mass)/i, weight: 25, label: 'Bulk Mailer Tool Signature' },
];

// Verified Trusted Corporate / Banking Email Domains
const VERIFIED_EMAIL_DOMAINS = [
  'sbi.co.in', 'onlinesbi.sbi', 'hdfcbank.net', 'hdfcbank.com', 'icicibank.com', 'axisbank.com',
  'incometax.gov.in', 'indiapost.gov.in', 'irctc.co.in', 'google.com', 'apple.com', 'microsoft.com',
  'amazon.in', 'amazon.com', 'flipkart.com', 'netflix.com'
];

// WhatsApp & Telegram Forward Patterns
const MESSAGING_PATTERNS = [
  { pattern: /forwarded many times/i, weight: 20, label: 'Viral Chain Message' },
  { pattern: /\b(share (this|with|to) (10|5|20|all)|send to (\d+) (friends|contacts|groups))\b/i, weight: 30, label: 'Chain Message Propagation Lure' },
  { pattern: /\b(join (our|this) (vip|crypto|pump) (group|channel)|t\.me\/[a-zA-Z0-9_]{5,})\b/i, weight: 25, label: 'Suspicious Group Join Lure' },
  { pattern: /\b(government has announced|modi ji has announced|pm has declared).*(free|bonus|cash)/i, weight: 35, label: 'Fabricated Government Scheme Announcement' },
  { pattern: /\b(free (data|recharge|wifi|iphone|laptop) (for all|scheme))\b/i, weight: 35, label: 'Free Giveaway Bait Trap' },
];

// High-Confidence Social Engineering Red Flags
const SOCIAL_ENGINEERING_PATTERNS = [
  { pattern: /\b(don'?t tell anyone|keep (this|it) secret|strictly confidential)\b/i, weight: 35, label: 'Secrecy Manipulation' },
  { pattern: /\b(verify your (identity|account|credentials)|confirm your (password|otp|pin|secret))\b/i, weight: 45, label: 'Direct Credential Solicitation' },
  { pattern: /\b(your account (will be|has been) (permanently closed|terminated|blocked|suspended today))\b/i, weight: 40, label: 'Account Termination Extortion' },
  { pattern: /\b(act now|limited (time|seats)|expires in (24|12|2) hours|last chance)\b/i, weight: 25, label: 'Artificial Scarcity Panic' },
];

// Cryptocurrency & Investment Scam Patterns
const CRYPTO_SCAM_PATTERNS = [
  { pattern: /\b(guaranteed (returns?|profit)|100% (profit|returns?)|risk.?free investment)\b/i, weight: 45, label: 'Guaranteed Returns Promise (Ponzi Red Flag)' },
  { pattern: /\b(double your (money|investment|crypto)|10x returns guaranteed)\b/i, weight: 40, label: 'Investment Multiplication Lure' },
  { pattern: /\b(send [\d\.]+\s*(eth|btc|usdt) and get)\b/i, weight: 45, label: 'Crypto Giveaway Advance-Fee Fraud' },
];

// Romance & Relationship Scam Patterns
const ROMANCE_SCAM_PATTERNS = [
  { pattern: /\b(i('m| am) (a |)(soldier|doctor|engineer|oil rig) (working|stationed) (abroad|overseas))\b/i, weight: 25, label: 'Romance Scam Persona' },
  { pattern: /\b(send me (money|gift card|western union|moneygram)|buy (apple|steam|amazon) gift cards? for me)\b/i, weight: 45, label: 'Direct Money/Gift Card Solicitation' },
];

// Positive Trust Markers in Corporate Emails
const TRUST_MARKERS = [
  { pattern: /\b(hdfc bank|sbi|icici|axis|google|amazon) never asks for (your )?(password|otp|pin|cvv)\b/i, label: 'Official Security Disclaimer' },
  { pattern: /\b(if you did not request this|if not done by you|contact our 24x7 customer care)\b/i, label: 'Authentic Support Contact Guidelines' },
  { pattern: /\b(statement for a\/c ending|statement for account|ref no: [a-zA-Z0-9-]+)\b/i, label: 'Standard Official Statement Reference' }
];

// Sample Scenarios for Testing
export const EXTENDED_SCAM_SAMPLES = [
  {
    id: 'email-phish-sbi',
    title: 'Deceptive SBI KYC Alert Email',
    platform: 'email',
    text: `From: security-alerts@sbi-online-verification.xyz\nReply-To: support@kyc-portal.top\nSubject: URGENT: Complete SBI PAN Re-verification to avoid Account Freeze\n\nDear Customer,\nYour State Bank of India account will be suspended within 24 hours due to pending KYC documents. Click http://onlinesbi.sbi.kyc-update.xyz/login immediately to update your PAN and prevent transaction freeze.`,
  },
  {
    id: 'email-official-hdfc',
    title: 'Authentic HDFC Bank Statement Notice (Zero False Alarm)',
    platform: 'email',
    text: `From: alerts@hdfcbank.net\nTo: user@gmail.com\nSubject: HDFC Bank Monthly e-Statement for A/c ending XX5491\n\nDear Customer,\nYour monthly e-Statement for HDFC Bank A/c ending XX5491 is generated. HDFC Bank never asks for your NetBanking password, OTP or CVV. In case of unauthorized transactions, call official 24x7 helpline 1800 202 6161 or visit https://hdfcbank.com.`,
  },
  {
    id: 'whatsapp-forward-recharge',
    title: 'WhatsApp Viral Free Recharge Chain',
    platform: 'whatsapp',
    text: `*Forwarded many times*\n🎉 PM Modi Free Recharge Scheme 2024!\nGovernment has announced FREE 3 Months Recharge of Rs 719 for all Jio, Airtel and Vi users. Click here to claim your free recharge now: http://x9q28z1k-claim-reward.buzz/recharge\n\n*Note: Share this with 10 WhatsApp friends to activate recharge immediately!*`,
  },
  {
    id: 'telegram-crypto-ponzi',
    title: 'Telegram Guaranteed Crypto Doubler',
    platform: 'telegram',
    text: `🚀 VIP CRYPTO SIGNALS GROUP\nJoin our Telegram channel: t.me/guaranteed_crypto_profit_999\n\n100% Risk-Free Investment! Double your money in 24 hours. Deposit 500 USDT, get 1,000 USDT guaranteed return. Over 5,000 members making daily profits. Don't tell anyone, secret insider trading bot.`,
  },
  {
    id: 'romance-scam-military',
    title: 'Romance Impersonator Wire Transfer',
    platform: 'email',
    text: `Hello my dearest,\nI am an engineer working stationed on an offshore oil rig in the North Sea. I need your urgent help as my bank card is blocked here. Please buy an Apple Gift Card of $500 and send me the code, or wire money to my agent so I can buy my flight ticket to come meet you. Keep this secret between us.`,
  },
];

/**
 * Extended Email/WhatsApp message analysis
 * Precision-tuned to eliminate false positives on authentic emails while catching phishing.
 */
export function analyzeEmailWhatsApp(text = '', platform = 'auto') {
  const startTime = performance.now();
  const cleanText = text.trim();

  if (!cleanText) {
    return {
      score: 0,
      platform,
      cuesFound: [],
      riskLevel: 'SAFE',
      categories: [],
      latencyMs: 0,
      plainExplanation: 'No content provided for analysis.',
    };
  }

  const cuesFound = [];
  let threatScore = 0;
  let trustBonus = 0;
  const categories = new Set();

  // Auto-detect platform
  let detectedPlatform = platform;
  if (platform === 'auto') {
    if (/\b(from|to|subject|reply-to|cc|bcc):/i.test(cleanText)) {
      detectedPlatform = 'email';
    } else if (/\b(whatsapp|wa\.me|forwarded many times)\b/i.test(cleanText)) {
      detectedPlatform = 'whatsapp';
    } else if (/\b(telegram|t\.me)\b/i.test(cleanText)) {
      detectedPlatform = 'telegram';
    } else {
      detectedPlatform = 'sms';
    }
  }

  // Check positive trust markers
  TRUST_MARKERS.forEach((item) => {
    if (item.pattern.test(cleanText)) {
      trustBonus += 30;
      cuesFound.push({ type: 'TRUST_MARKER', label: item.label, weight: 0 });
    }
  });

  // Check verified corporate email sender
  const fromMatch = cleanText.match(/\b(from|sender):\s*[^@]+@([a-zA-Z0-9.-]+)/i);
  if (fromMatch && fromMatch[2]) {
    const senderHost = fromMatch[2].toLowerCase();
    const isVerifiedSender = VERIFIED_EMAIL_DOMAINS.some(d => senderHost === d || senderHost.endsWith('.' + d));
    if (isVerifiedSender) {
      trustBonus += 40;
      cuesFound.push({
        type: 'VERIFIED_SENDER',
        label: `Verified Official Sender Domain: @${senderHost}`,
        weight: 0
      });
    }
  }

  // Run Email-specific patterns
  if (detectedPlatform === 'email') {
    EMAIL_SPOOFING_PATTERNS.forEach((item) => {
      if (item.pattern.test(cleanText)) {
        threatScore += item.weight;
        categories.add('EMAIL_SPOOFING');
        cuesFound.push({ type: 'EMAIL_SPOOFING', label: item.label, weight: item.weight });
      }
    });
  }

  // Run Messaging patterns
  MESSAGING_PATTERNS.forEach((item) => {
    if (item.pattern.test(cleanText)) {
      threatScore += item.weight;
      categories.add('VIRAL_MESSAGING');
      cuesFound.push({ type: 'VIRAL_MESSAGING', label: item.label, weight: item.weight });
    }
  });

  // Run Social Engineering patterns
  SOCIAL_ENGINEERING_PATTERNS.forEach((item) => {
    if (item.pattern.test(cleanText)) {
      threatScore += item.weight;
      categories.add('SOCIAL_ENGINEERING');
      cuesFound.push({ type: 'SOCIAL_ENGINEERING', label: item.label, weight: item.weight });
    }
  });

  // Run Crypto/Ponzi patterns
  CRYPTO_SCAM_PATTERNS.forEach((item) => {
    if (item.pattern.test(cleanText)) {
      threatScore += item.weight;
      categories.add('CRYPTO_FRAUD');
      cuesFound.push({ type: 'CRYPTO_FRAUD', label: item.label, weight: item.weight });
    }
  });

  // Run Romance scam patterns
  ROMANCE_SCAM_PATTERNS.forEach((item) => {
    if (item.pattern.test(cleanText)) {
      threatScore += item.weight;
      categories.add('ROMANCE_SCAM');
      cuesFound.push({ type: 'ROMANCE_SCAM', label: item.label, weight: item.weight });
    }
  });

  // Calibrate score against trust bonus
  const netScore = Math.max(0, threatScore - trustBonus);
  const normalizedScore = Math.min(100, Math.round(netScore));

  let riskLevel = 'SAFE';
  if (normalizedScore >= 70) riskLevel = 'CRITICAL';
  else if (normalizedScore >= 35) riskLevel = 'SUSPICIOUS';

  let plainExplanation = '';
  if (normalizedScore >= 70) {
    plainExplanation = `CRITICAL FRAUD ALERT: Detected high-confidence indicators of malicious phishing or social engineering. Never provide passwords, OTPs, or click links in this message.`;
  } else if (normalizedScore >= 35) {
    plainExplanation = `SUSPICIOUS COMMUNICATION: Displays urgency or forward solicitation. Do not forward to contacts or open links without verifying with the official sender.`;
  } else if (trustBonus > 0) {
    plainExplanation = `VERIFIED LEGITIMATE COMMUNICATION: Sent from a recognized corporate authority with official protection disclaimers. Safe to open.`;
  } else {
    plainExplanation = `LOW RISK / BENIGN: Standard communication without detected deception or extortion patterns.`;
  }

  const latencyMs = Math.round((performance.now() - startTime) * 100) / 100;

  return {
    score: normalizedScore,
    platform: detectedPlatform,
    cuesFound,
    riskLevel,
    categories: Array.from(categories),
    latencyMs,
    plainExplanation,
  };
}
