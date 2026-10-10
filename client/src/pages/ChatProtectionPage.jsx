import React, { useState } from 'react';
import { analyzeEmailWhatsApp, EXTENDED_SCAM_SAMPLES } from '../services/emailWhatsAppEngine.js';
import { evaluateThreatMultiVector } from '../services/compositeThreatScorer.js';
import { useThreat } from '../context/ThreatContext.jsx';

export default function ChatProtectionPage() {
  const { scanComposite } = useThreat();
  const [inputText, setInputText] = useState(EXTENDED_SCAM_SAMPLES[0].text);
  const [selectedSample, setSelectedSample] = useState(EXTENDED_SCAM_SAMPLES[0].id);
  const [emailResult, setEmailResult] = useState(() => analyzeEmailWhatsApp(EXTENDED_SCAM_SAMPLES[0].text));
  const [compositeResult, setCompositeResult] = useState(() => evaluateThreatMultiVector({ messageText: EXTENDED_SCAM_SAMPLES[0].text }));
  const [neutralized, setNeutralized] = useState(false);

  const handleScan = (text = inputText) => {
    setNeutralized(false);
    const eResult = analyzeEmailWhatsApp(text);
    const cResult = scanComposite({ messageText: text });
    setEmailResult(eResult);
    setCompositeResult(cResult);
  };

  const handleSelectSample = (sample) => {
    setSelectedSample(sample.id);
    setInputText(sample.text);
    handleScan(sample.text);
  };

  const getPlatformIcon = (platform) => {
    switch (platform) {
      case 'email': return '📧';
      case 'whatsapp': return '📱';
      case 'telegram': return '✈️';
      default: return '💬';
    }
  };

  const getPlatformColor = (platform) => {
    switch (platform) {
      case 'email': return { bg: 'bg-blue-950/50', border: 'border-blue-800/60', text: 'text-blue-400' };
      case 'whatsapp': return { bg: 'bg-green-950/50', border: 'border-green-800/60', text: 'text-green-400' };
      case 'telegram': return { bg: 'bg-cyan-950/50', border: 'border-cyan-800/60', text: 'text-cyan-400' };
      default: return { bg: 'bg-zinc-900', border: 'border-zinc-800', text: 'text-zinc-400' };
    }
  };

  return (
    <div className="space-y-8">
      
      {/* Page Header */}
      <div className="border-b border-zinc-800/80 pb-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="px-3 py-1 bg-purple-950/60 text-purple-400 border border-purple-800/60 rounded-full text-[10px] font-mono font-bold tracking-wider">
            NEW MODULE
          </span>
          <span className="px-3 py-1 bg-zinc-800 text-zinc-300 rounded-full text-[10px] font-semibold">
            Multi-Platform Protection
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          Email, WhatsApp & Chat Shield
        </h1>
        <p className="text-xs text-zinc-400 mt-1 max-w-2xl">
          Advanced on-device scanner for email phishing headers, WhatsApp chain forwards, Telegram crypto fraud, romance scams, and social engineering attacks. Auto-detects platform type.
        </p>
      </div>

      {/* Sample Cards */}
      <div className="space-y-3">
        <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
          Test Attack Scenarios (Multi-Platform):
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {EXTENDED_SCAM_SAMPLES.map((sample) => {
            const active = selectedSample === sample.id;
            const platColor = getPlatformColor(sample.platform);
            return (
              <button
                key={sample.id}
                onClick={() => handleSelectSample(sample)}
                className={`p-4 rounded-2xl text-left border transition-all duration-200 ${
                  active
                    ? 'bg-red-950/60 border-red-600 text-white shadow-lg shadow-red-900/20'
                    : 'bg-[#121217] border-zinc-800 text-zinc-300 hover:bg-zinc-800/60 hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-lg">{getPlatformIcon(sample.platform)}</span>
                  <span className={`px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase ${platColor.bg} ${platColor.border} ${platColor.text} border`}>
                    {sample.platform}
                  </span>
                </div>
                <strong className="block text-xs font-bold">{sample.title}</strong>
                <p className="text-[10px] text-zinc-500 mt-1 line-clamp-2">{sample.text}</p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Main Analysis Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

        {/* Left: Input & Scanner (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-[#121217] border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-5 shadow-xl">
            <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
              <div>
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  <span>{getPlatformIcon(emailResult?.platform || 'auto')}</span>
                  Chat Content Scanner
                </h2>
                <p className="text-[11px] text-zinc-400">
                  Paste any email body, WhatsApp forward, or Telegram message
                </p>
              </div>
              {emailResult && (
                <span className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold uppercase border ${getPlatformColor(emailResult.platform).bg} ${getPlatformColor(emailResult.platform).border} ${getPlatformColor(emailResult.platform).text}`}>
                  {emailResult.platform} Detected
                </span>
              )}
            </div>

            <textarea
              rows={8}
              value={inputText}
              onChange={(e) => {
                setInputText(e.target.value);
                setSelectedSample(null);
              }}
              placeholder="Paste email content with headers, WhatsApp forward, or Telegram message..."
              className="w-full bg-[#181822] border border-zinc-700 rounded-2xl p-4 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-600 focus:border-transparent transition font-sans leading-relaxed"
            />

            <div className="flex flex-wrap items-center justify-between gap-3">
              <button
                onClick={() => handleScan(inputText)}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold text-sm rounded-xl flex items-center gap-2 shadow-lg shadow-red-900/40 transition"
              >
                🛡️ Scan for Threats (On-Device)
              </button>
              <div className="flex items-center gap-2 text-[10px] text-zinc-400 font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                Zero Cloud • 100% Local
              </div>
            </div>
          </div>

          {/* Category Breakdown */}
          {emailResult && emailResult.categories.length > 0 && (
            <div className="bg-[#121217] border border-zinc-800 rounded-3xl p-6 space-y-4 shadow-xl">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                Detected Scam Categories
              </h3>
              <div className="flex flex-wrap gap-2">
                {emailResult.categories.map((cat, idx) => (
                  <span
                    key={idx}
                    className="px-3 py-1.5 bg-red-950/50 text-red-300 border border-red-800/60 rounded-xl text-xs font-semibold"
                  >
                    {cat.replace(/_/g, ' ')}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right: Analysis Results (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {emailResult && (
            <div className="bg-[#121217] border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-5 shadow-xl">
              <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
                <h3 className="font-bold text-white text-base">Threat Analysis</h3>
                <span className="text-xs font-mono text-zinc-400">
                  {emailResult.latencyMs} ms
                </span>
              </div>

              {/* Combined Score */}
              <div className="flex items-center justify-center">
                <div className={`w-28 h-28 rounded-full flex flex-col items-center justify-center border-4 ${
                  compositeResult.verdict === 'CRITICAL'
                    ? 'border-red-500 shadow-lg shadow-red-900/40'
                    : compositeResult.verdict === 'SUSPICIOUS'
                    ? 'border-amber-500 shadow-lg shadow-amber-900/40'
                    : 'border-emerald-500 shadow-lg shadow-emerald-900/40'
                }`}>
                  <span className="text-3xl font-extrabold font-mono text-white">
                    {compositeResult.compositeScore}
                  </span>
                  <span className="text-[9px] text-zinc-400 uppercase tracking-widest font-semibold">
                    / 100 Risk
                  </span>
                </div>
              </div>

              {/* Verdict Badge */}
              <div className="text-center">
                <span className={`inline-block px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider font-mono ${
                  compositeResult.verdict === 'CRITICAL'
                    ? 'bg-red-950/60 text-red-400 border border-red-800'
                    : compositeResult.verdict === 'SUSPICIOUS'
                    ? 'bg-amber-950/60 text-amber-400 border border-amber-800'
                    : 'bg-emerald-950/60 text-emerald-400 border border-emerald-800'
                }`}>
                  {compositeResult.verdict}
                </span>
              </div>

              {/* Explanation */}
              <div className={`p-4 rounded-2xl border text-xs leading-relaxed ${
                compositeResult.verdict === 'CRITICAL'
                  ? 'bg-red-950/40 border-red-800 text-red-200'
                  : compositeResult.verdict === 'SUSPICIOUS'
                  ? 'bg-amber-950/40 border-amber-800 text-amber-200'
                  : 'bg-emerald-950/40 border-emerald-800 text-emerald-200'
              }`}>
                <div className="flex items-start gap-2">
                  <span className="text-sm">
                    {compositeResult.verdict === 'CRITICAL' ? '🚨' : compositeResult.verdict === 'SUSPICIOUS' ? '⚠️' : '✅'}
                  </span>
                  <p>{emailResult.plainExplanation}</p>
                </div>
              </div>

              {/* Detected Cues */}
              {emailResult.cuesFound.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider block">
                    Detected Threat Indicators ({emailResult.cuesFound.length}):
                  </span>
                  <div className="space-y-1.5 max-h-60 overflow-y-auto pr-1">
                    {emailResult.cuesFound.map((cue, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2.5 bg-zinc-900/80 rounded-xl border border-zinc-800/80 text-[11px]">
                        <div className="flex items-center gap-2">
                          <span className="text-red-400">⚠</span>
                          <span className="text-zinc-200 font-medium">{cue.label}</span>
                        </div>
                        <span className="px-2 py-0.5 bg-red-950/60 text-red-400 rounded text-[9px] font-mono font-bold border border-red-800/60">
                          +{cue.weight}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Neutralize Button */}
              {compositeResult.verdict === 'CRITICAL' && (
                <div className="pt-2 border-t border-zinc-800">
                  {neutralized ? (
                    <div className="p-3 bg-emerald-950 text-emerald-300 border border-emerald-800 rounded-xl text-center text-xs font-bold">
                      🛡️ Threat Neutralized & Sender Flagged!
                    </div>
                  ) : (
                    <button
                      onClick={() => setNeutralized(true)}
                      className="w-full py-3 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-red-900/40 transition"
                    >
                      🛡️ 1-Tap Neutralize Threat
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Platform Detection Info */}
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4 text-[11px] text-zinc-400 space-y-2">
            <strong className="text-zinc-200 block text-xs">Platform Auto-Detection:</strong>
            <p>AegisEdge automatically identifies the message platform from content structure:</p>
            <div className="grid grid-cols-2 gap-2 pt-1">
              <div className="flex items-center gap-2">
                <span>📧</span>
                <span>Email headers (From:, Subject:)</span>
              </div>
              <div className="flex items-center gap-2">
                <span>📱</span>
                <span>WhatsApp forwards & links</span>
              </div>
              <div className="flex items-center gap-2">
                <span>✈️</span>
                <span>Telegram groups & channels</span>
              </div>
              <div className="flex items-center gap-2">
                <span>💬</span>
                <span>Generic SMS / Chat</span>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
