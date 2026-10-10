/**
 * On-Device Static APK Privilege & Trojan Auditor
 * Audits AndroidManifest.xml and declared permissions for banking trojan indicators.
 * Flags dangerous permission combinations like Accessibility Abuse + READ_SMS.
 */

// Known Dangerous Android Permissions Catalog
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
    description: 'Exfiltrates collected credentials to remote Command & Control server.'
  }
};

// Pre-loaded Malicious APK Samples from Indian Cybercrime Cases
export const SAMPLE_SCAM_APKS = [
  {
    id: 'apk-sbi-rewards',
    appName: 'SBI_YONO_Rewards_v2.1.apk',
    packageName: 'com.sbi.rewards.update.free',
    fileSizeMB: 4.8,
    claimedPurpose: 'Claim 5,000 SBI Reward Points directly into Savings Account',
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
    id: 'apk-pm-yojana',
    appName: 'PM_Yojana_Free_Recharge_2024.apk',
    packageName: 'org.pm.kisan.freerecharge.claim',
    fileSizeMB: 2.3,
    claimedPurpose: 'Government free 3-month mobile recharge scheme claim',
    declaredPermissions: [
      'android.permission.READ_SMS',
      'android.permission.READ_CONTACTS',
      'android.permission.REQUEST_INSTALL_PACKAGES',
      'android.permission.INTERNET'
    ]
  },
  {
    id: 'apk-electricity-bill',
    appName: 'Electricity_Support_QuickSupport.apk',
    packageName: 'com.state.electricity.bill.quickpay',
    fileSizeMB: 6.1,
    claimedPurpose: 'Emergency bill resolution helpline app provided by fake officer',
    declaredPermissions: [
      'android.permission.BIND_ACCESSIBILITY_SERVICE',
      'android.permission.SYSTEM_ALERT_WINDOW',
      'android.permission.READ_SMS',
      'android.permission.INTERNET'
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
 */
export function auditAPK(apkData) {
  const startTime = performance.now();
  const permissions = apkData.declaredPermissions || [];
  const flags = [];
  let riskScore = 0;

  const hasAccessibility = permissions.includes('android.permission.BIND_ACCESSIBILITY_SERVICE');
  const hasReadSms = permissions.includes('android.permission.READ_SMS') || permissions.includes('android.permission.RECEIVE_SMS');
  const hasOverlay = permissions.includes('android.permission.SYSTEM_ALERT_WINDOW');
  const hasDropper = permissions.includes('android.permission.REQUEST_INSTALL_PACKAGES');
  const hasQueryApps = permissions.includes('android.permission.QUERY_ALL_PACKAGES');

  // Lethal Combination 1: Classic Banking Overlay Trojan (TeaBot, Godfather, SharkBot)
  if (hasAccessibility && hasReadSms && hasOverlay) {
    riskScore += 90;
    flags.push({
      type: 'BANKING_TROJAN_PROFILE',
      severity: 'CRITICAL',
      text: 'LETHAL COMBO: Accessibility Service + SMS Interception + Overlay Window. Typical profile of Banking Credential Stealers & Auto-OTP bypassers.'
    });
  } else if (hasAccessibility) {
    riskScore += 45;
    flags.push({
      type: 'ACCESSIBILITY_ABUSE',
      severity: 'HIGH',
      text: 'Declared BIND_ACCESSIBILITY_SERVICE: Can monitor keystrokes, screen taps, and bypass user confirmations.'
    });
  }

  // Lethal Combination 2: OTP Interception
  if (hasReadSms) {
    riskScore += 35;
    flags.push({
      type: 'SMS_OTP_THEFT',
      severity: 'HIGH',
      text: 'Requests SMS reading permissions. Capable of harvesting 2FA transaction authorization codes.'
    });
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

  if (hasQueryApps) {
    riskScore += 20;
    flags.push({
      type: 'APP_ENUMERATION',
      severity: 'MEDIUM',
      text: 'Enumerates all installed apps on device to target specific banking and UPI fintech portals.'
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
    appName: apkData.appName || 'Unknown_Package.apk',
    packageName: apkData.packageName || 'unknown.app.package',
    flags,
    permissions,
    latencyMs
  };
}
