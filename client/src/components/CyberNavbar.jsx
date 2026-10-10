import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useThreat } from '../context/ThreatContext.jsx';
import { checkBackendHealth } from '../services/backendApi.js';

export default function CyberNavbar() {
  const location = useLocation();
  const { totalScans, totalThreatsBlocked } = useThreat();
  const [backendOnline, setBackendOnline] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    // Check local backend health on mount
    checkBackendHealth().then(res => {
      setBackendOnline(res?.online === true);
    });
  }, []);

  const navItems = [
    { to: '/', label: 'Command Center', icon: '🛡️' },
    { to: '/chat-guard', label: 'Chat Guard', icon: '💬', badge: 'NEW' },
    { to: '/simulator', label: 'Phone Simulator', icon: '📱' },
    { to: '/url-audit', label: 'URL Deep Audit', icon: '🔗' },
    { to: '/apk-audit', label: 'APK Auditor', icon: '📦' },
    { to: '/privacy', label: 'Privacy Proof', icon: '🔒' },
    { to: '/history', label: 'Threat Timeline', icon: '⏱️' },
    { to: '/benchmark', label: 'Judges Lab', icon: '⚡' },
    { to: '/report', label: 'Incident Report', icon: '📑' }
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#0A0A10]/95 backdrop-blur-xl border-b border-zinc-800/80 shadow-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          
          {/* Brand Logo & Team Tag */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <Link to="/" className="flex items-center gap-2.5 group">
              <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-600 via-red-700 to-red-900 flex items-center justify-center text-lg shadow-lg shadow-red-900/50 group-hover:scale-105 group-hover:shadow-red-600/50 transition-all duration-300 ring-1 ring-red-500/30">
                🛡️
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-base tracking-tight text-white group-hover:text-red-400 transition-colors">
                    AegisEdge
                  </span>
                  <span className="text-[10px] bg-red-950/90 text-red-400 border border-red-800/80 px-1.5 py-0.5 rounded font-mono font-bold shadow-inner">
                    v3.0 • PS-05
                  </span>
                </div>
                <p className="text-[10px] text-zinc-400 font-medium">
                  Team <strong className="text-zinc-200">Creative Criminals (X8Y9)</strong>
                </p>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden xl:flex items-center gap-1">
            {navItems.map((item) => {
              const active = location.pathname === item.to || (item.to === '/chat-guard' && location.pathname === '/chat-protection');
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 relative ${
                    active
                      ? 'bg-red-600 text-white shadow-md shadow-red-900/50'
                      : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/70'
                  }`}
                >
                  <span className="text-sm">{item.icon}</span>
                  <span>{item.label}</span>
                  {item.badge && !active && (
                    <span className="text-[9px] bg-purple-950 text-purple-300 border border-purple-800/60 px-1 py-0.2 rounded font-mono font-bold leading-none">
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>

          {/* Status Badges & Controls */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Live Scans / Blocked Counter */}
            {totalScans > 0 && (
              <Link
                to="/history"
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-zinc-900/90 border border-zinc-800 text-[11px] font-mono hover:border-zinc-700 transition"
                title="Click to view Threat History"
              >
                <span className="text-zinc-400">{totalScans} scans</span>
                <span className="w-1 h-1 rounded-full bg-zinc-600"></span>
                <span className="text-red-400 font-bold">{totalThreatsBlocked} blocked</span>
              </Link>
            )}

            {/* Backend / Edge Indicator */}
            <div
              className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-mono ${
                backendOnline
                  ? 'bg-cyan-950/50 border-cyan-800/60 text-cyan-400'
                  : 'bg-zinc-900/60 border-zinc-800 text-zinc-400'
              }`}
              title={backendOnline ? 'Local Python Flask sandbox active (127.0.0.1:5000)' : 'Client-side edge engine active (100% offline ready)'}
            >
              <span className={`w-1.5 h-1.5 rounded-full ${backendOnline ? 'bg-cyan-400 animate-pulse' : 'bg-emerald-400'}`}></span>
              <span>{backendOnline ? 'HYBRID LOCAL' : 'EDGE ACTIVE'}</span>
            </div>

            {/* 100% On-Device DPDP Badge */}
            <Link
              to="/privacy"
              className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-950/70 border border-emerald-800/70 text-emerald-400 text-[11px] font-mono hover:bg-emerald-900/40 transition shadow-sm"
              title="Click to view DPDP Act Privacy Dashboard"
            >
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="font-bold">100% ON-DEVICE</span>
              <span className="text-[10px] text-emerald-300/80 font-sans hidden lg:inline">| 0 B Cloud</span>
            </Link>

            {/* Mobile / Compact Menu Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="xl:hidden p-2 rounded-lg bg-zinc-900 text-zinc-300 hover:text-white border border-zinc-800"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? '✕' : '☰'}
            </button>
          </div>

        </div>
      </div>

      {/* Expanded Mobile & Medium Screen Navigation */}
      {(mobileMenuOpen || true) && (
        <div className={`xl:hidden flex overflow-x-auto px-4 py-2.5 bg-[#09090F]/98 border-t border-zinc-800/80 gap-1.5 text-xs no-scrollbar ${!mobileMenuOpen ? 'hidden md:flex' : 'flex flex-wrap'}`}>
          {navItems.map((item) => {
            const active = location.pathname === item.to || (item.to === '/chat-guard' && location.pathname === '/chat-protection');
            return (
              <Link
                key={item.to}
                to={item.to}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex-shrink-0 flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                  active
                    ? 'bg-red-600 text-white font-semibold shadow-md shadow-red-900/40'
                    : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
                {item.badge && !active && (
                  <span className="text-[9px] bg-purple-900 text-purple-200 px-1 rounded font-bold font-mono">
                    {item.badge}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      )}
    </header>
  );
}
