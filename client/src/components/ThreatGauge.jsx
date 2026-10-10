import React from 'react';

export default function ThreatGauge({ score = 0, verdict = 'SAFE', latencyMs = 0 }) {
  // Normalize score between 0 and 100
  const clampedScore = Math.max(0, Math.min(100, Math.round(score)));

  // SVG circle calculations (radius = 50, circumference = 2 * PI * 50 = 314.15)
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (clampedScore / 100) * circumference;

  let strokeColor = '#10B981'; // Green
  let verdictColor = 'text-emerald-400';
  let bgColor = 'bg-emerald-950/40 border-emerald-800/60';

  if (clampedScore >= 70) {
    strokeColor = '#EF4444'; // Crimson
    verdictColor = 'text-red-400';
    bgColor = 'bg-red-950/40 border-red-800/60';
  } else if (clampedScore >= 35) {
    strokeColor = '#F59E0B'; // Amber
    verdictColor = 'text-amber-400';
    bgColor = 'bg-amber-950/40 border-amber-800/60';
  }

  return (
    <div className={`flex flex-col items-center justify-center p-6 rounded-2xl border ${bgColor} shadow-lg transition-all`}>
      <div className="relative w-36 h-36 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 120 120">
          {/* Background circle track */}
          <circle
            cx="60"
            cy="60"
            r={radius}
            stroke="#272730"
            strokeWidth="10"
            fill="transparent"
          />
          {/* Progress circle */}
          <circle
            cx="60"
            cy="60"
            r={radius}
            stroke={strokeColor}
            strokeWidth="10"
            fill="transparent"
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
            className="transition-all duration-700 ease-out"
          />
        </svg>

        {/* Center Text */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-3xl font-extrabold font-mono tracking-tight text-white">
            {clampedScore}
          </span>
          <span className="text-[10px] text-zinc-400 uppercase tracking-widest font-semibold">
            / 100 RISK
          </span>
        </div>
      </div>

      {/* Threat Verdict Badge */}
      <div className="mt-3 text-center">
        <span className={`inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider font-mono ${verdictColor} bg-zinc-900 border border-current/30`}>
          {verdict} VERDICT
        </span>
        {latencyMs !== undefined && (
          <p className="text-[10px] text-zinc-400 font-mono mt-1">
            Inference: <strong className="text-zinc-200">{latencyMs} ms</strong> (On-Device)
          </p>
        )}
      </div>
    </div>
  );
}
