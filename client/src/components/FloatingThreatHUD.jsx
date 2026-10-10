import React, { useState } from 'react';

export default function FloatingThreatHUD({ result, onNeutralize, onDismiss }) {
  const [neutralized, setNeutralized] = useState(false);

  if (!result) return null;

  const score = result.compositeScore;
  const isCritical = score >= 70;
  const isSuspicious = score >= 35 && score < 70;

  const handleNeutralizeClick = () => {
    setNeutralized(true);
    if (onNeutralize) onNeutralize();
  };

  return (
    <div className="w-full bg-[#16161D] border-2 border-red-600 rounded-2xl shadow-2xl p-4 text-white overflow-hidden relative threat-glow">
      {/* Top Banner */}
      <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
        <div className="flex items-center gap-2">
          <span className="w-7 h-7 rounded-lg bg-red-600 flex items-center justify-center text-sm shadow">
            🛡️
          </span>
          <div>
            <h4 className="text-xs font-bold text-red-500 uppercase tracking-wider">
              AegisEdge On-Device Threat Shield
            </h4>
            <span className="text-[10px] text-zinc-400">
              Active Protection • Sub-50ms Local Inspection
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          <span className="px-2 py-0.5 rounded bg-red-950 text-red-400 font-mono text-xs font-bold border border-red-800">
            {score}/100 RISK
          </span>
          {onDismiss && (
            <button
              onClick={onDismiss}
              className="text-zinc-500 hover:text-zinc-300 text-sm px-1.5 py-0.5 rounded"
              title="Dismiss"
            >
              ✕
            </button>
          )}
        </div>
      </div>

      {/* Threat Summary Body */}
      <div className="py-3 space-y-2 text-xs">
        {neutralized ? (
          <div className="p-3 bg-emerald-950/80 border border-emerald-800 text-emerald-300 rounded-xl flex items-center gap-2">
            <span className="text-lg">✅</span>
            <div>
              <strong className="block font-semibold">Threat Neutralized Successfully!</strong>
              <span className="text-[11px] text-emerald-400">
                Malicious link blocked, sender flagged, and no credentials were leaked.
              </span>
            </div>
          </div>
        ) : (
          <>
            <div className="flex items-start gap-2 text-zinc-200">
              <span className="text-red-500 font-bold">⚠️</span>
              <p className="leading-snug">
                {result.nlpResult?.plainExplanation || 'High risk phishing / extortion message intercepted.'}
              </p>
            </div>

            {/* Detected Factors */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              {result.nlpResult?.cuesFound?.slice(0, 3).map((cue, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 bg-red-950/70 text-red-300 border border-red-900 rounded text-[10px] font-medium"
                >
                  {cue.label}
                </span>
              ))}
              {result.urlResult?.flags?.slice(0, 2).map((flag, idx) => (
                <span
                  key={'url-' + idx}
                  className="px-2 py-0.5 bg-amber-950/70 text-amber-300 border border-amber-900 rounded text-[10px] font-medium"
                >
                  {flag.text}
                </span>
              ))}
            </div>

            {/* Extracted Phone / Link alert */}
            {result.nlpResult?.extractedPhones?.length > 0 && (
              <div className="bg-zinc-900/90 p-2 rounded-lg border border-zinc-800 flex items-center justify-between text-[11px]">
                <span className="text-zinc-400">Suspicious Helpline:</span>
                <span className="font-mono text-red-400 font-bold">
                  {result.nlpResult.extractedPhones.join(', ')}
                </span>
              </div>
            )}
          </>
        )}
      </div>

      {/* Action Buttons */}
      {!neutralized && (
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-800">
          <button
            onClick={handleNeutralizeClick}
            className="w-full py-2 px-3 bg-red-600 hover:bg-red-700 active:bg-red-800 text-white rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 shadow-lg shadow-red-900/50 transition"
          >
            <span>🛡️</span>
            <span>1-Tap Neutralize</span>
          </button>

          <button
            onClick={onDismiss}
            className="w-full py-2 px-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl font-semibold text-xs border border-zinc-700 transition"
          >
            Dismiss Alert
          </button>
        </div>
      )}
    </div>
  );
}
