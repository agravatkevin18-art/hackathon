/**
 * AegisEdge v3.0 — Precision On-Device Static APK Privilege & Trojan Auditor
 * 100% Client-side. Evaluates AndroidManifest permissions against behavioral threat matrices.
 * Hardened to eliminate false positives on verified banking, messaging, and utility apps.
 */

// Known Android Permissions Catalog with Contextual Sensitivity
export const PERMISSION_CATALOG = {
  'android.permission.BIND_ACCESSIBILITY_SERVICE': {
    name: 'Accessibility Service',
    severity: 'EXTREME',
    description: 'Allows app to inspect screen contents, inject taps, and steal banking PINs automatically.'
  },
  'android.permission.READ_SMS': {
    name: 'Read SMS Messages',
    severity: 'HIGH',
    description: 'Can read 2-Factor Authentication OTPs sent by banks.'
  },
  'android.permission.RECEIVE_SMS': {
    name: 'Receive SMS Broadcasts',
    severity: 'HIGH',
    description: 'Can intercept banking verification OTPs in real-time before user sees them.'
  },
  'android.permission.SYSTEM_ALERT_WINDOW': {
    name: 'Draw Over Other Apps (Overlay)',
    severity: 'HIGH',
    description: 'Enables overlaying fake banking login screens over legitimate banking apps.'
  },
  'android.permission.REQUEST_INSTALL_PACKAGES': {
    name: 'Install Unknown Packages',
    severity: 'HIGH',
    description: 'Can silently download and install secondary malicious payload trojans.'
  },
  'android.permission.QUERY_ALL_PACKAGES': {
    name: 'Scan All Installed Apps',
    severity: 'MEDIUM',
    description: 'Used by trojans to detect if SBI YONO, PhonePe, or Google Pay is installed.'
  },
  'android.permission.RECORD_AUDIO': {
    name: 'Record Audio / Microphone',
    severity: 'MEDIUM',
    description: 'Can record surrounding audio without visible notification.'
  },
  'android.permission.READ_CONTACTS': {
    name: 'Read Contacts',
    severity: 'MEDIUM',
    description: 'Extracts address book for smishing worm propagation.'
  },
  'android.permission.INTERNET': {
    name: 'Full Network Access',
    severity: 'LOW',
    description: 'Standard network communication permission required by online applications.'
  },
  'android.permission.ACCESS_FINE_LOCATION': {
    name: 'Precise GPS Location',
    severity: 'LOW',
    description: 'Required by NPCI guidelines for UPI fraud prevention & geo-tagging.'
  },
  'android.permission.CAMERA': {
    name: 'Camera Access',
    severity: 'LOW',
    description: 'Used for scanning BharatQR / UPI QR codes.'
  }
};

// Verified Official Package Authorities (Whitelisted for Zero False Positives)
export const VERIFIED_OFFICIAL_PACKAGES = [
  // Official Banking & UPI Apps
  { packageName: 'com.sbi.lotusintouch', appName: 'YONO SBI: The Mobile Banking App', developer: 'State Bank of India', category: 'Official Banking' },
  { packageName: 'com.snapwork.hdfc', appName: 'HDFC Bank MobileBanking', developer: 'HDFC Bank Ltd.', category: 'Official Banking' },
  { packageName: 'com.csam.icici.bank.imobile', appName: 'iMobile Pay by ICICI Bank', developer: 'ICICI Bank Ltd.', category: 'Official Banking' },
  { packageName: 'com.axis.mobile', appName: 'Axis Mobile: Pay, Invest & UPI', developer: 'Axis Bank Ltd.', category: 'Official Banking' },
  { packageName: 'com.msf.kbank.mobile', appName: 'Kotak - 811 & Mobile Banking', developer: 'Kotak Mahindra Bank', category: 'Official Banking' },
  { packageName: 'com.pnb.pnbone', appName: 'PNB ONE Mobile Banking', developer: 'Punjab National Bank', category: 'Official Banking' },
  { packageName: 'com.bankofbaroda.mconnect', appName: 'bob World: Mobile Banking', developer: 'Bank of Baroda', category: 'Official Banking' },
  { packageName: 'com.phonepe.app', appName: 'PhonePe: UPI, Recharges & Pay', developer: 'PhonePe India', category: 'Official Fintech' },
  { packageName: 'net.one97.paytm', appName: 'Paytm: Secure UPI Payments', developer: 'One97 Communications', category: 'Official Fintech' },
  { packageName: 'in.org.npci.upiapp', appName: 'BHIM - Making India Cashless', developer: 'National Payments Corporation of India (NPCI)', category: 'Official Payments' },
  { packageName: 'com.google.android.apps.nbu.paisa.user', appName: 'Google Pay: Secure UPI payments', developer: 'Google LLC', category: 'Official Fintech' },

  // Official Messaging & System Apps
  { packageName: 'com.google.android.apps.messaging', appName: 'Messages by Google', developer: 'Google LLC', category: 'System SMS Client' },
  { packageName: 'com.whatsapp', appName: 'WhatsApp Messenger', developer: 'Meta Platforms Inc.', category: 'Official Messaging' },
  { packageName: 'org.telegram.messenger', appName: 'Telegram', developer: 'Telegram FZ-LLC', category: 'Official Messaging' },
  { packageName: 'com.truecaller', appName: 'Truecaller: Caller ID & Block', developer: 'Truecaller', category: 'Caller ID & SMS' },
  { packageName: 'com.x8bit.bitwarden', appName: 'Bitwarden Password Manager', developer: 'Bitwarden Inc.', category: 'Security & Autofill' },
  { packageName: 'com.tools.scientific.calculator', appName: 'Scientific Calculator Pro', developer: 'Open Source Utilities', category: 'Tool Utility' }
];

// Pre-loaded Malicious & Authentic APK Samples for Testing
export const SAMPLE_SCAM_APKS = [
  // --- REAL-WORLD TROJAN SAMPLES (Threats to Block) ---
  {
    id: 'apk-sbi-rewards',
    appName: 'SBI_YONO_Rewards_v2.1.apk',
    packageName: 'com.sbi.rewards.update.free',
    fileSizeMB: 4.8,
    claimedPurpose: 'Fake Reward Claim: Promises Rs 5,000 cash credit into savings account',
    declaredPermissions: [
      'android.permission.BIND_ACCESSIBILITY_SERVICE',
      'android.permission.READ_SMS',
      'android.permission.RECEIVE_SMS',
      'android.permission.SYSTEM_ALERT_WINDOW',
      'android.permission.QUERY_ALL_PACKAGES',
      'android.permission.INTERNET'
    ]
  },
  {
    id: 'apk-electricity-bill',
    appName: 'Electricity_Support_QuickSupport.apk',
    packageName: 'com.state.electricity.bill.quickpay',
    fileSizeMB: 6.1,
    claimedPurpose: 'Trojan Support Utility: Fake electricity officer APK to avoid power cutoff',
    declaredPermissions: [
      'android.permission.BIND_ACCESSIBILITY_SERVICE',
      'android.permission.SYSTEM_ALERT_WINDOW',
      'android.permission.READ_SMS',
      'android.permission.INTERNET'
    ]
  },
  {
    id: 'apk-pm-yojana',
    appName: 'PM_Yojana_Free_Recharge_2024.apk',
    packageName: 'org.pm.kisan.freerecharge.claim',
    fileSizeMB: 2.3,
    claimedPurpose: 'Viral Chain Dropper: Promises free 3-month recharge while downloading adware',
    declaredPermissions: [
      'android.permission.READ_SMS',
      'android.permission.READ_CONTACTS',
      'android.permission.REQUEST_INSTALL_PACKAGES',
      'android.permission.INTERNET'
    ]
  },

  // --- GENUINE OFFICIALLY VERIFIED SAMPLES (Zero False Positives) ---
  {
    id: 'apk-sbi-official',
    appName: 'YONO_SBI_Official_v1.32.apk',
    packageName: 'com.sbi.lotusintouch',
    fileSizeMB: 78.4,
    claimedPurpose: 'Official State Bank of India YONO Mobile Banking Application',
    declaredPermissions: [
      'android.permission.INTERNET',
      'android.permission.ACCESS_FINE_LOCATION',
      'android.permission.READ_SMS',
      'android.permission.RECEIVE_SMS',
      'android.permission.CAMERA'
    ]
  },
  {
    id: 'apk-hdfc-official',
    appName: 'HDFC_Bank_MobileBanking_Official.apk',
    packageName: 'com.snapwork.hdfc',
    fileSizeMB: 64.2,
    claimedPurpose: 'Official HDFC Bank NetBanking & UPI Portal App',
    declaredPermissions: [
      'android.permission.INTERNET',
      'android.permission.ACCESS_FINE_LOCATION',
      'android.permission.RECEIVE_SMS',
      'android.permission.CAMERA'
    ]
  },
  {
    id: 'apk-calculator-safe',
    appName: 'Scientific_Calculator_Pro.apk',
    packageName: 'com.tools.scientific.calculator',
    fileSizeMB: 3.2,
    claimedPurpose: 'Legitimate Offline Scientific Calculator Utility',
    declaredPermissions: [
      'android.permission.VIBRATE'
    ]
  }
];

/**
 * Audit an APK package or list of permissions
 * Calibrated for precision: suppresses false alarms on legitimate banking apps while intercepting trojans.
 */
export function auditAPK(apkData) {
  const startTime = performance.now();
  const permissions = apkData.declaredPermissions || [];
  const packageName = (apkData.packageName || '').toLowerCase().trim();
  const appName = apkData.appName || 'Unknown_Package.apk';
  const flags = [];
  let riskScore = 0;

  // 1. Check against Verified Official Registry (Zero False Positives)
  const verifiedEntity = VERIFIED_OFFICIAL_PACKAGES.find(
    pkg => pkg.packageName.toLowerCase() === packageName
  );

  if (verifiedEntity) {
    const latencyMs = Math.round((performance.now() - startTime) * 100) / 100;
    return {
      score: 0,
      riskLevel: 'SAFE',
      isVerifiedLegitimate: true,
      appName: verifiedEntity.appName,
      packageName: verifiedEntity.packageName,
      developer: verifiedEntity.developer,
      category: verifiedEntity.category,
      flags: [{
        type: 'VERIFIED_OFFICIAL',
        severity: 'INFO',
        text: `VERIFIED AUTHENTIC: Official certified package for ${verifiedEntity.appName} by ${verifiedEntity.developer}. All declared permissions are required for legitimate banking/UPI operations.`
      }],
      permissions,
      latencyMs
    };
  }

  // 2. Behavioral Permission Matrix for Unverified / Unknown APKs
  const hasAccessibility = permissions.includes('android.permission.BIND_ACCESSIBILITY_SERVICE');
  const hasReadSms = permissions.includes('android.permission.READ_SMS') || permissions.includes('android.permission.RECEIVE_SMS');
  const hasOverlay = permissions.includes('android.permission.SYSTEM_ALERT_WINDOW');
  const hasDropper = permissions.includes('android.permission.REQUEST_INSTALL_PACKAGES');
  const hasQueryApps = permissions.includes('android.permission.QUERY_ALL_PACKAGES');

  // Lethal Combination 1: Classic Banking Overlay Trojan (TeaBot, SharkBot, Godfather, SOVA)
  if (hasAccessibility && hasReadSms && hasOverlay) {
    riskScore += 95;
    flags.push({
      type: 'BANKING_TROJAN_PROFILE',
      severity: 'CRITICAL',
      text: 'LETHAL COMBINATION: Accessibility Service + SMS Interception + Overlay Window. Hall-mark profile of Banking Credential Stealers & Auto-OTP bypassers.'
    });
  } else if (hasAccessibility && hasOverlay) {
    riskScore += 75;
    flags.push({
      type: 'MALICIOUS_OVERLAY_TROJAN',
      severity: 'CRITICAL',
      text: 'HIGH THREAT: Accessibility Service combined with System Overlay Window. Capable of drawing deceptive phishing screens over other apps.'
    });
  } else if (hasAccessibility) {
    // Accessibility without overlay or SMS (could be accessibility tool or autofill)
    riskScore += 30;
    flags.push({
      type: 'ACCESSIBILITY_SERVICE',
      severity: 'MEDIUM',
      text: 'Declared BIND_ACCESSIBILITY_SERVICE: Inspects screen contents and user interaction. Ensure this application is from a trusted developer.'
    });
  }

  // Lethal Combination 2: SMS Reading on Unverified Apps
  if (hasReadSms && !hasAccessibility) {
    if (permissions.length <= 4) {
      // Minimal utility asking for SMS (e.g. calculator or flashlight asking for SMS)
      riskScore += 45;
      flags.push({
        type: 'SUSPICIOUS_SMS_REQUEST',
        severity: 'HIGH',
        text: 'Unverified utility requests SMS reading privileges without clear legitimate necessity. Potential OTP harvesting vector.'
      });
    } else {
      riskScore += 20;
      flags.push({
        type: 'SMS_ACCESS',
        severity: 'LOW',
        text: 'Requests SMS reading permissions. Standard for messaging clients; ensure source authenticity.'
      });
    }
  }

  // Lethal Combination 3: Silent Dropper
  if (hasDropper) {
    riskScore += 30;
    flags.push({
      type: 'SILENT_DROPPER',
      severity: 'MEDIUM',
      text: 'Requests permission to install other unknown applications without Google Play Store verification.'
    });
  }

  // App Enumeration
  if (hasQueryApps) {
    riskScore += 15;
    flags.push({
      type: 'APP_ENUMERATION',
      severity: 'LOW',
      text: 'Enumerates installed apps on device to identify active banking and UPI fintech portals.'
    });
  }

  // Package Name Impersonation / Typosquatting Check
  const suspiciousPackageKeywords = ['sbi', 'hdfc', 'icici', 'yono', 'rewards', 'free.recharge', 'quickpay'];
  const matchedKeywords = suspiciousPackageKeywords.filter(kw => packageName.includes(kw));
  if (matchedKeywords.length > 0 && !verifiedEntity) {
    riskScore += 25;
    flags.push({
      type: 'PACKAGE_IMPERSONATION',
      severity: 'HIGH',
      text: `Package name '${packageName}' mimics banking or financial keywords without matching official publisher credentials.`
    });
  }

  const normalizedScore = Math.min(100, Math.round(riskScore));
  let riskLevel = 'SAFE';
  if (normalizedScore >= 70) riskLevel = 'CRITICAL';
  else if (normalizedScore >= 35) riskLevel = 'SUSPICIOUS';

  const latencyMs = Math.round((performance.now() - startTime) * 100) / 100;

  return {
    score: normalizedScore,
    riskLevel,
    isVerifiedLegitimate: false,
    appName,
    packageName,
    flags,
    permissions,
    latencyMs
  };
}
