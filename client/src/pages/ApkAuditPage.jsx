import React, { useState } from 'react';
import { SAMPLE_SCAM_APKS, auditAPK, PERMISSION_CATALOG } from '../services/apkAuditorEngine.js';
import { useThreat } from '../context/ThreatContext.jsx';

export default function ApkAuditPage() {
  const { scanComposite } = useThreat();
  const [selectedApk, setSelectedApk] = useState(SAMPLE_SCAM_APKS[0]);
  const [auditResult, setAuditResult] = useState(() => auditAPK(SAMPLE_SCAM_APKS[0]));

  const handleSelect = (apk) => {
    setSelectedApk(apk);
    const res = auditAPK(apk);
    setAuditResult(res);
    scanComposite({ apkAudit: res, messageText: `APK Scan: ${apk.appName} (${apk.packageName})` });
  };

  return (
    <div className="space-y-8">
      
      {/* Header */}
      <div className="border-b border-zinc-800 pb-5">
        <span className="text-xs font-mono text-red-500 uppercase tracking-wider block font-bold">
          Static Manifest Privilege Analysis
        </span>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
          Static APK Privilege &amp; Trojan Auditor
        </h1>
        <p className="text-xs text-zinc-400 mt-1">
          Inspects AndroidManifest permissions before package installation. Intercepts dangerous combinations such as Accessibility Abuse and SMS Reading trojans.
        </p>
      </div>

      {/* Package Selector Cards */}
      <div className="space-y-3">
        <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
          Select APK Package to Audit:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {SAMPLE_SCAM_APKS.map((apk) => {
            const active = selectedApk.id === apk.id;
            return (
              <button
                key={apk.id}
                onClick={() => handleSelect(apk)}
                className={`p-4 rounded-2xl text-left border transition flex flex-col justify-between ${
                  active
                    ? 'bg-red-950/60 border-red-600 text-white shadow-lg shadow-red-900/20'
                    : 'bg-[#121217] border-zinc-800 text-zinc-300 hover:bg-zinc-800/60'
                }`}
              >
                <div>
                  <span className="text-xl block mb-1">
                    {apk.id.includes('safe') || apk.id.includes('official') ? '🛡️' : '⚠️'}
                  </span>
                  <strong className="block text-xs font-bold truncate">{apk.appName}</strong>
                  <span className="text-[10px] text-zinc-500 font-mono block mt-0.5 truncate">
                    {apk.packageName}
                  </span>
                </div>
                <div className="mt-3 pt-2 border-t border-zinc-800/80 flex justify-between items-center text-[10px] text-zinc-400">
                  <span>{apk.fileSizeMB} MB</span>
                  <span className="font-mono text-red-400 font-bold">
                    {apk.declaredPermissions.length} Perms
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Audit Findings */}
      {auditResult && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left: Score Card & Threat Indicators (6 cols) */}
          <div className="lg:col-span-6 bg-[#121217] border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
              <div>
                <h3 className="font-bold text-white text-base">APK Risk Profile</h3>
                <span className="text-xs text-zinc-500 font-mono">
                  {selectedApk.claimedPurpose}
                </span>
              </div>
              <span
                className={`px-3 py-1 rounded-full text-xs font-mono font-bold uppercase ${
                  auditResult.riskLevel === 'CRITICAL'
                    ? 'bg-red-950 text-red-400 border border-red-800'
                    : auditResult.riskLevel === 'SUSPICIOUS'
                    ? 'bg-amber-950 text-amber-400 border border-amber-800'
                    : 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                }`}
              >
                {auditResult.riskLevel}
              </span>
            </div>

            {/* Score Bar */}
            <div className="space-y-1.5">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-zinc-300">Trojan Threat Score:</span>
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

            {/* Malicious Profile Flags */}
            <div className="space-y-3">
              <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider block">
                Malware Capability Warnings:
              </span>
              {auditResult.flags.length > 0 ? (
                <div className="space-y-2">
                  {auditResult.flags.map((flag, idx) => (
                    <div
                      key={idx}
                      className={`p-3.5 rounded-xl text-xs space-y-1 border ${
                        flag.severity === 'INFO' || flag.type === 'VERIFIED_OFFICIAL'
                          ? 'bg-emerald-950/40 border-emerald-800 text-emerald-200'
                          : flag.severity === 'CRITICAL'
                          ? 'bg-red-950/50 border-red-800 text-red-200'
                          : 'bg-amber-950/50 border-amber-800 text-amber-200'
                      }`}
                    >
                      <strong className={`block font-bold text-[11px] uppercase flex items-center gap-1.5 ${
                        flag.severity === 'INFO' || flag.type === 'VERIFIED_OFFICIAL' ? 'text-emerald-400' : 'text-red-400'
                      }`}>
                        <span>{flag.severity === 'INFO' || flag.type === 'VERIFIED_OFFICIAL' ? '🛡️' : '🚨'}</span>
                        <span>{flag.type}</span>
                      </strong>
                      <p className="text-[11px] leading-relaxed">{flag.text}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 bg-emerald-950/40 border border-emerald-800 text-emerald-300 rounded-xl text-xs">
                  ✅ Clean APK Package: Zero dangerous accessibility services, SMS interceptors, or overlay trojans found.
                </div>
              )}
            </div>

          </div>

          {/* Right: Declared Permissions Audit Table (6 cols) */}
          <div className="lg:col-span-6 bg-[#121217] border border-zinc-800 rounded-3xl p-6 sm:p-8 space-y-4 shadow-xl">
            <h3 className="font-bold text-white text-base">
              Declared Android Permissions ({selectedApk.declaredPermissions.length})
            </h3>
            <p className="text-xs text-zinc-400">
              Breakdown of Android permissions declared in AndroidManifest.xml:
            </p>

            <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
              {selectedApk.declaredPermissions.map((perm, idx) => {
                const info = PERMISSION_CATALOG[perm] || {
                  name: perm.split('.').pop(),
                  severity: 'NORMAL',
                  description: 'Standard Android application permission.'
                };

                return (
                  <div
                    key={idx}
                    className="p-3 bg-zinc-900/90 rounded-xl border border-zinc-800 space-y-1 text-xs"
                  >
                    <div className="flex items-center justify-between">
                      <strong className="text-zinc-200 text-xs">{info.name}</strong>
                      <span
                        className={`px-2 py-0.5 rounded text-[9px] font-mono font-bold uppercase ${
                          info.severity === 'EXTREME'
                            ? 'bg-red-950 text-red-400 border border-red-800'
                            : info.severity === 'HIGH'
                            ? 'bg-amber-950 text-amber-400 border border-amber-800'
                            : 'bg-zinc-800 text-zinc-400'
                        }`}
                      >
                        {info.severity}
                      </span>
                    </div>
                    <code className="text-[10px] text-zinc-500 font-mono block">
                      {perm}
                    </code>
                    <p className="text-[11px] text-zinc-400 mt-1">
                      {info.description}
                    </p>
                  </div>
                );
              })}
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
