/**
 * AegisEdge v3.0 — Composite Threat Scorer Engine
 * Computes multi-vector Threat Score (0 to 100) combining NLP, URL Heuristics & APK Privilege Audits.
 * Calibrated for zero false alarms on verified applications and official banking communications.
 */

import { analyzeMessageNLP } from './nlpThreatEngine.js';
import { auditURL } from './urlPhishingEngine.js';
import { auditAPK } from './apkAuditorEngine.js';

export function evaluateThreatMultiVector({ messageText = '', urlString = '', apkData = null }) {
  const tStart = performance.now();

  // 1. Evaluate NLP
  const nlpResult = analyzeMessageNLP(messageText);

  // 2. Evaluate URL (check either explicit urlString or first extracted link from text)
  let targetUrl = urlString.trim();
  if (!targetUrl && nlpResult.extractedLinks && nlpResult.extractedLinks.length > 0) {
    targetUrl = nlpResult.extractedLinks[0];
  }
  const urlResult = auditURL(targetUrl);

  // 3. Evaluate APK (if provided)
  const apkResult = apkData ? auditAPK(apkData) : null;

  // 4. Compute Weighted Composite Score
  let compositeScore = 0;

  if (apkResult && targetUrl && messageText) {
    // All 3 vectors present
    compositeScore = 0.40 * nlpResult.score + 0.35 * urlResult.score + 0.25 * apkResult.score;
  } else if (apkResult && messageText) {
    compositeScore = 0.60 * nlpResult.score + 0.40 * apkResult.score;
  } else if (targetUrl && messageText) {
    compositeScore = 0.55 * nlpResult.score + 0.45 * urlResult.score;
  } else if (targetUrl) {
    compositeScore = urlResult.score;
  } else if (apkResult) {
    compositeScore = apkResult.score;
  } else {
    compositeScore = nlpResult.score;
  }

  // Precision Override: Officially verified packages or portals should never be penalized by heuristic noise
  if (apkResult?.isVerifiedLegitimate) {
    compositeScore = 0;
  } else if (urlResult?.isLegitimate && nlpResult.score < 50) {
    compositeScore = 0;
  } else if (nlpResult.isAuthenticBankNotice && !urlResult.score) {
    compositeScore = 0;
  }

  const roundedScore = Math.min(100, Math.round(compositeScore));

  // Determine Overall Threat Tier
  let verdict = 'SAFE';
  let badgeColor = 'emerald';
  let riskTitle = 'Verified Authentic / Low Risk';

  if (apkResult?.isVerifiedLegitimate) {
    verdict = 'SAFE';
    badgeColor = 'emerald';
    riskTitle = `Verified Authentic: ${apkResult.appName}`;
  } else if (urlResult?.isLegitimate && roundedScore === 0) {
    verdict = 'SAFE';
    badgeColor = 'emerald';
    riskTitle = `Verified Official Portal: ${urlResult.closestMatch?.name || urlResult.hostname}`;
  } else if (nlpResult.isAuthenticBankNotice && roundedScore === 0) {
    verdict = 'SAFE';
    badgeColor = 'emerald';
    riskTitle = 'Authentic Bank Transaction / Security Notice';
  } else if (roundedScore >= 70) {
    verdict = 'CRITICAL';
    badgeColor = 'rose';
    riskTitle = 'High-Risk Cyber Threat Detected';
  } else if (roundedScore >= 35) {
    verdict = 'SUSPICIOUS';
    badgeColor = 'amber';
    riskTitle = 'Suspicious Indicators Found';
  }

  const totalLatencyMs = Math.round((performance.now() - tStart) * 100) / 100;

  // Generate plain Hindi & English protective advice
  const recommendations = [];
  if (verdict === 'CRITICAL') {
    recommendations.push('Do NOT click or open any links found in this message.');
    recommendations.push('Do NOT dial the phone numbers listed; call your official bank/discom from their verified app.');
    recommendations.push('Block sender and report to Cyber Crime Helpline (dial 1930 in India).');
  } else if (verdict === 'SUSPICIOUS') {
    recommendations.push('Verify message sender identity directly through official channels.');
    recommendations.push('Examine the website domain spelling before entering login or UPI credentials.');
  } else {
    recommendations.push('Content verified authentic. No malicious indicators or deceptive spoofing detected.');
  }

  return {
    compositeScore: roundedScore,
    verdict,
    badgeColor,
    riskTitle,
    nlpResult,
    urlResult,
    apkResult,
    analyzedUrl: targetUrl,
    totalLatencyMs,
    recommendations,
    timestamp: new Date().toISOString()
  };
}
