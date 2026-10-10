import React from 'react';
import { useThreat } from '../context/ThreatContext.jsx';

export default function ScanHistoryPage() {
  const { scanHistory, totalScans, totalThreatsBlocked, totalSafeVerified, averageLatency, clearHistory } = useThreat();

  const getVerdictStyle = (verdict) => {
    switch (verdict) {
      case 'CRITICAL':
        return { bg: 'bg-red-950/50', border: 'border-red-800', text: 'text-red-400', dot: 'bg-red-500' };
      case 'SUSPICIOUS':
        return { bg: 'bg-amber-950/50', border: 'border-amber-800', text: 'text-amber-400', dot: 'bg-amber-500' };
      default:
        return { bg: 'bg-emerald-950/50', border: 'border-emerald-800', text: 'text-emerald-400', dot: 'bg-emerald-500' };
    }
  };

  const getTypeIcon = (type) => {
    switch (type) {
      case 'message': return '💬';
      case 'url': return '🔗';
      case 'composite': return '🧪';
      default: return '📋';
    }
  };

  const formatTime = (isoString) => {
    const d = new Date(isoString);
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  };

  return (
    <div className="space-y-8">

      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-3 py-1 bg-cyan-950/60 text-cyan-400 border border-cyan-800/60 rounded-full text-[10px] font-mono font-bold tracking-wider">
              SESSION LOG
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Scan History & Threat Timeline
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Complete audit trail of all threat scans performed during this session. All data stays in local browser memory.
          </p>
        </div>
        {scanHistory.length > 0 && (
          <button
            onClick={clearHistory}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 text-xs font-semibold rounded-xl border border-zinc-700 transition"
          >
            Clear History
          </button>
        )}
      </div>

      {/* Session Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono">
        <div className="p-5 bg-[#121217] rounded-2xl border border-zinc-800 shadow-xl">
          <span className="text-zinc-500 block text-[10px] uppercase font-semibold">Total Scans</span>
          <strong className="text-2xl text-cyan-400 block">{totalScans}</strong>
        </div>
        <div className="p-5 bg-[#121217] rounded-2xl border border-zinc-800 shadow-xl">
          <span className="text-zinc-500 block text-[10px] uppercase font-semibold">Threats Blocked</span>
          <strong className="text-2xl text-red-400 block">{totalThreatsBlocked}</strong>
        </div>
        <div className="p-5 bg-[#121217] rounded-2xl border border-zinc-800 shadow-xl">
          <span className="text-zinc-500 block text-[10px] uppercase font-semibold">Verified Safe</span>
          <strong className="text-2xl text-emerald-400 block">{totalSafeVerified}</strong>
        </div>
        <div className="p-5 bg-[#121217] rounded-2xl border border-zinc-800 shadow-xl">
          <span className="text-zinc-500 block text-[10px] uppercase font-semibold">Avg Latency</span>
          <strong className="text-2xl text-amber-400 block">{averageLatency} ms</strong>
        </div>
      </div>

      {/* Scan Timeline */}
      <div className="bg-[#121217] border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-5 shadow-xl">
        <div className="flex items-center justify-between border-b border-zinc-800/80 pb-4">
          <h3 className="font-bold text-white text-base">
            Scan Timeline ({scanHistory.length} entries)
          </h3>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></span>
            <span className="text-[11px] text-cyan-400 font-mono font-semibold">Live</span>
          </div>
        </div>

        {scanHistory.length === 0 ? (
          <div className="text-center py-16 space-y-4">
            <span className="text-4xl block">🔍</span>
            <p className="text-sm text-zinc-400">
              No scans recorded yet in this session.
            </p>
            <p className="text-xs text-zinc-500">
              Use the Command Center, URL Audit, or Chat Protection pages to scan content. All scans will appear here automatically.
            </p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[600px] overflow-y-auto pr-1">
            {scanHistory.map((entry, idx) => {
              const style = getVerdictStyle(entry.verdict);
              return (
                <div
                  key={entry.id}
                  className={`flex items-start gap-4 p-4 ${style.bg} border ${style.border} rounded-2xl transition hover:brightness-110`}
                  style={{ animationDelay: `${idx * 50}ms` }}
                >
                  {/* Timeline Connector */}
                  <div className="flex flex-col items-center flex-shrink-0">
                    <div className={`w-3 h-3 rounded-full ${style.dot} shadow-md`}></div>
                    {idx < scanHistory.length - 1 && (
                      <div className="w-0.5 h-8 bg-zinc-800 mt-1"></div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{getTypeIcon(entry.inputType)}</span>
                        <strong className={`text-xs font-bold ${style.text}`}>{entry.verdict}</strong>
                        <span className="text-[10px] text-zinc-500 font-mono">
                          Score: {entry.compositeScore}/100
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-zinc-500 font-mono">
                        <span>{entry.latencyMs} ms</span>
                        <span>•</span>
                        <span>{formatTime(entry.timestamp)}</span>
                      </div>
                    </div>

                    <p className="text-xs text-zinc-300 mt-1 truncate">
                      {entry.inputPreview}
                    </p>

                    <div className="flex items-center gap-2 mt-1.5 text-[10px]">
                      <span className="text-zinc-500">{entry.riskTitle}</span>
                      {entry.cuesCount > 0 && (
                        <span className="px-1.5 py-0.5 bg-zinc-900 text-zinc-400 rounded text-[9px] font-mono border border-zinc-800">
                          {entry.cuesCount} cues
                        </span>
                      )}
                      {entry.urlFlags > 0 && (
                        <span className="px-1.5 py-0.5 bg-zinc-900 text-zinc-400 rounded text-[9px] font-mono border border-zinc-800">
                          {entry.urlFlags} URL flags
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Data Retention Notice */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4 text-[11px] text-zinc-400 flex items-start gap-3">
        <span className="text-lg flex-shrink-0">🔒</span>
        <div>
          <strong className="text-zinc-200 block mb-1">Privacy Notice — Session-Only Storage</strong>
          <p>Scan history is stored exclusively in browser memory (React state) and is automatically purged when you close this tab or refresh the page. No scan data is persisted to disk, cookies, localStorage, or any external service.</p>
        </div>
      </div>

    </div>
  );
}
