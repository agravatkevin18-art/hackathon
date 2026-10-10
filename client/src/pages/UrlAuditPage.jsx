import React, { useState } from 'react';
import { auditURL, parseDomainParts, LEGITIMATE_PORTALS } from '../services/urlPhishingEngine.js';

const SAMPLE_URLS = [
  { label: 'Phishing: Deceptive Subdomain SBI', url: 'http://onlinesbi.sbi.kyc-update.xyz/login' },
  { label: 'Phishing: Lookalike HDFC Domain', url: 'http://hdfc-verification-portal.top/netbanking' },
  { label: 'Phishing: High Entropy Generated Domain', url: 'http://x9q28z1k-claim-reward.buzz/upi' },
  { label: 'Legitimate: Official SBI Portal', url: 'https://onlinesbi.sbi' },
  { label: 'Legitimate: Official HDFC Bank', url: 'https://hdfcbank.com' },
  { label: 'Legitimate: National Cyber Crime Portal', url: 'https://cybercrime.gov.in' }
];

export default function UrlAuditPage() {
  const [testUrl, setTestUrl] = useState(SAMPLE_URLS[0].url);
  const [auditResult, setAuditResult] = useState(() => auditURL(SAMPLE_URLS[0].url));

  const handleScan = (urlToScan = testUrl) => {
    setAuditResult(auditURL(urlToScan));
  };

  const domainParts = parseDomainParts(testUrl);

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="border-b border-zinc-800 pb-5">
        <span className="text-xs font-mono text-red-500 uppercase tracking-wider block font-bold">
          Algorithmic Domain &amp; Phishing Inspection
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          Deep URL &amp; Typosquatting Laboratory
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Analyzes Levenshtein Distance, Shannon Entropy, and TLD reputation against verified Indian banking portals without external DNS queries.
        </p>
      </div>

      {/* Main Scanner Box */}
      <div className="bg-[#121217] border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
        
        {/* Sample Selectors */}
        <div className="space-y-2">
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
            Select Test Sample URL:
          </span>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {SAMPLE_URLS.map((sample, idx) => (
              <button
                key={idx}
                onClick={() => {
                  setTestUrl(sample.url);
                  handleScan(sample.url);
                }}
                className={`p-3 rounded-xl text-left border text-xs transition ${
                  testUrl === sample.url
                    ? 'bg-red-950/60 border-red-600 text-white font-semibold shadow'
                    : 'bg-zinc-900/70 border-zinc-800 text-zinc-300 hover:bg-zinc-800/80'
                }`}
              >
                <strong className="block text-[11px] truncate">{sample.label}</strong>
                <span className="text-[10px] text-zinc-500 font-mono truncate block mt-0.5">
                  {sample.url}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* URL Input Form */}
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={testUrl}
            onChange={(e) => setTestUrl(e.target.value)}
            placeholder="Enter URL to audit (e.g. http://sbi-verification.xyz)..."
            className="flex-1 bg-[#181822] border border-zinc-700 rounded-xl px-4 py-3 text-xs sm:text-sm text-white placeholder-zinc-500 font-mono focus:outline-none focus:ring-2 focus:ring-red-600 transition"
          />
          <button
            onClick={() => handleScan(testUrl)}
            className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow transition whitespace-nowrap"
          >
            Audit URL
          </button>
        </div>

      </div>

      {/* Audit Findings Grid */}
      {auditResult && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left: Score Card & Flags (7 cols) */}
          <div className="lg:col-span-7 bg-[#121217] border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
            
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <h3 className="font-bold text-white text-base">URL Threat Findings</h3>
                <span className="text-xs text-zinc-500 font-mono">Parsed in {auditResult.latencyMs} ms</span>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-mono font-bold uppercase tracking-wider ${
                  auditResult.riskLevel === 'VERIFIED_OFFICIAL'
                    ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                    : auditResult.riskLevel === 'CRITICAL'
                    ? 'bg-red-950 text-red-400 border border-red-800'
                    : auditResult.riskLevel === 'SUSPICIOUS'
                    ? 'bg-amber-950 text-amber-400 border border-amber-800'
                    : 'bg-zinc-800 text-zinc-300'
                }`}
              >
                {auditResult.riskLevel}
              </span>
            </div>

            {/* Score Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-zinc-300">Phishing Risk Score:</span>
                <span className="font-mono text-red-400">{auditResult.score} / 100</span>
              </div>
              <div className="w-full h-3 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-700 ${
                    auditResult.score >= 70
                      ? 'bg-red-600'
                      : auditResult.score >= 35
                      ? 'bg-amber-500'
                      : 'bg-emerald-500'
                  }`}
                  style={{ width: `${auditResult.score}%` }}
                ></div>
              </div>
            </div>

            {/* Flags List */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
                Detected Anomalies &amp; Flags:
              </span>
              {auditResult.flags.length > 0 ? (
                <div className="space-y-2">
                  {auditResult.flags.map((flag, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl border text-xs flex items-start gap-2.5 ${
                        flag.severity === 'CRITICAL'
                          ? 'bg-red-950/50 border-red-800 text-red-200'
                          : flag.severity === 'HIGH'
                          ? 'bg-amber-950/50 border-amber-800 text-amber-200'
                          : 'bg-zinc-900 border-zinc-800 text-zinc-300'
                      }`}
                    >
                      <span className="text-sm">
                        {flag.severity === 'CRITICAL' ? '🚨' : '⚠️'}
                      </span>
                      <div>
                        <strong className="block font-semibold uppercase text-[11px] mb-0.5">
                          {flag.type}
                        </strong>
                        <p className="text-[11px]">{flag.text}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 bg-emerald-950/40 border border-emerald-800 text-emerald-300 rounded-xl text-xs">
                  ✅ No malicious typosquatting, high-risk TLDs, or deception tricks detected.
                </div>
              )}
            </div>

            {/* Typosquatting Match Card */}
            {auditResult.closestMatch && (
              <div className="p-4 bg-zinc-900 rounded-2xl border border-red-800/80 space-y-2">
                <span className="text-xs font-bold text-red-400 uppercase tracking-wider block">
                  Closest Official Banking Target:
                </span>
                <div className="flex flex-wrap items-center justify-between text-xs gap-2">
                  <div>
                    <strong className="text-white block">{auditResult.closestMatch.name}</strong>
                    <span className="text-zinc-400 font-mono text-[11px]">
                      Real Domain: {auditResult.closestMatch.domain}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="px-2 py-1 bg-red-950 text-red-300 border border-red-800 rounded font-mono text-[10px] font-bold">
                      {auditResult.closestMatch.distance} Edit(s) Deviation
                    </span>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* Right: Technical Metrics & Domain Anatomy (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            <div className="bg-[#121217] border border-zinc-800 rounded-3xl p-6 space-y-4 shadow-xl">
              <h3 className="font-bold text-white text-base">Domain Anatomy</h3>
              
              <div className="space-y-2.5 text-xs font-mono">
                <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800">
                  <span className="text-zinc-500 block text-[10px]">HOSTNAME</span>
                  <strong className="text-zinc-200 break-all">{domainParts.hostname}</strong>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800">
                    <span className="text-zinc-500 block text-[10px]">TLD</span>
                    <strong className="text-amber-400">.{domainParts.tld}</strong>
                  </div>
                  <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800">
                    <span className="text-zinc-500 block text-[10px]">SHANNON ENTROPY</span>
                    <strong className="text-cyan-400">{auditResult.entropy} bits</strong>
                  </div>
                </div>

                <div className="p-3 bg-zinc-950 rounded-xl border border-zinc-800">
                  <span className="text-zinc-500 block text-[10px]">SUBDOMAINS</span>
                  <span className="text-zinc-300">
                    {domainParts.subdomains.length > 0 ? domainParts.subdomains.join('.') : 'None (Apex Domain)'}
                  </span>
                </div>
              </div>

              {/* Entropy Scale explanation */}
              <div className="pt-2 border-t border-zinc-800 text-[11px] text-zinc-400 space-y-1">
                <strong className="text-zinc-300 block">Shannon Entropy Scale:</strong>
                <p>• Normal English domain names typically range from 2.0 to 3.5 bits.</p>
                <p>• Scores above 3.75 bits indicate randomized machine-generated characters (DGA) used by malware command servers.</p>
              </div>

            </div>

            {/* Official Portals Whitelist Snapshot */}
            <div className="bg-[#121217] border border-zinc-800 rounded-3xl p-6 space-y-3 shadow-xl text-xs">
              <h4 className="font-bold text-white text-xs uppercase tracking-wider">
                Local Banking Whitelist (Bloom Filter Catalog)
              </h4>
              <p className="text-[11px] text-zinc-400">
                AegisEdge maintains an encrypted local whitelist of official Indian portals for instant sub-millisecond authentication:
              </p>
              <div className="flex flex-wrap gap-1.5 pt-1">
                {LEGITIMATE_PORTALS.slice(0, 8).map((portal, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 bg-zinc-900 border border-zinc-800 rounded text-[10px] font-mono text-zinc-300"
                  >
                    {portal.domain}
                  </span>
                ))}
              </div>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
