/**
 * Composite Threat Scorer Engine
 * Computes multi-vector Threat Score (0 to 100) combining NLP, URL Heuristics & APK Privilege Audits.
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
  if (!targetUrl && nlpResult.extractedLinks.length > 0) {
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

  const roundedScore = Math.min(100, Math.round(compositeScore));

  // Determine Overall Threat Tier
  let verdict = 'SAFE';
  let badgeColor = 'emerald';
  let riskTitle = 'Verified Authentic / Low Risk';

  if (roundedScore >= 70) {
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
    recommendations.push('Message appears authentic. Standard security hygiene recommended.');
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
