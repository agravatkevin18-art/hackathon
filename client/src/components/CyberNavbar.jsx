import React from 'react';
import { Link, useLocation } from 'react-router-dom';

export default function CyberNavbar() {
  const location = useLocation();

  const navItems = [
    { to: '/', label: 'Command Center', icon: '🛡️' },
    { to: '/simulator', label: 'Phone Simulator', icon: '📱' },
    { to: '/url-audit', label: 'URL Deep Audit', icon: '🔗' },
    { to: '/apk-audit', label: 'APK Auditor', icon: '📦' },
    { to: '/benchmark', label: 'Judges Lab', icon: '⚡' },
    { to: '/report', label: 'Incident Report', icon: '📑' }
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#0E0E12]/95 backdrop-blur-md border-b border-zinc-800 shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Brand Logo & Team Tag */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-2 group">
              <span className="w-9 h-9 rounded-xl bg-gradient-to-br from-red-600 to-red-800 flex items-center justify-center text-lg shadow-lg shadow-red-900/40 group-hover:scale-105 transition">
                🛡️
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-base tracking-tight text-white group-hover:text-red-400 transition">
                    AegisEdge
                  </span>
                  <span className="text-[10px] bg-red-950/80 text-red-400 border border-red-800/80 px-1.5 py-0.5 rounded font-mono font-bold">
                    PS-05
                  </span>
                </div>
                <p className="text-[10px] text-zinc-400">
                  Code Carnival 3.0 • Team <strong className="text-zinc-200">Creative Criminals (X8Y9)</strong>
                </p>
              </div>
            </Link>
          </div>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const active = location.pathname === item.to;
              return (
                <Link
                  key={item.to}
                  to={item.to}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    active
                      ? 'bg-red-600 text-white shadow-md shadow-red-900/40'
                      : 'text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </nav>

          {/* On-Device Status Indicator */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-950/60 border border-emerald-800/60 text-emerald-400 text-[11px] font-mono">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span className="hidden sm:inline font-semibold">100% ON-DEVICE</span>
              <span className="text-[10px] text-zinc-400 font-sans hidden lg:inline">| 0 B Cloud</span>
            </div>
          </div>

        </div>
      </div>

      {/* Mobile Nav Bar */}
      <div className="md:hidden flex overflow-x-auto px-4 py-2 bg-zinc-900/90 border-t border-zinc-800 gap-1 text-xs">
        {navItems.map((item) => {
          const active = location.pathname === item.to;
          return (
            <Link
              key={item.to}
              to={item.to}
              className={`flex-shrink-0 px-2.5 py-1 rounded text-xs font-medium ${
                active ? 'bg-red-600 text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </header>
  );
}
