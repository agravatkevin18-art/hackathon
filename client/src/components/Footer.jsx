import React from 'react';

export default function Footer() {
  return (
    <footer className="mt-16 bg-[#0E0E12] border-t border-zinc-800 text-zinc-400 text-xs py-10 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* National Cyber Crime Helpline Banner */}
        <div className="bg-gradient-to-r from-red-950/60 via-zinc-900 to-red-950/60 border border-red-800/60 rounded-2xl p-5 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-red-600/90 flex items-center justify-center text-xl text-white shadow-md">
              🚨
            </span>
            <div>
              <h4 className="font-bold text-sm text-white">
                Victim of Cyber Financial Fraud? Call 1930 Immediately
              </h4>
              <p className="text-[11px] text-zinc-400">
                National Cyber Crime Reporting Portal • Ministry of Home Affairs, Government of India (<a href="https://cybercrime.gov.in" target="_blank" rel="noreferrer" className="text-red-400 underline">cybercrime.gov.in</a>)
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="px-3 py-1.5 bg-red-600 text-white font-mono font-bold text-xs rounded-xl shadow">
              Helpline: 1930
            </span>
          </div>
        </div>

        {/* Hackathon Details & Team Credits */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 border-t border-zinc-800/80">
          <div>
            <h5 className="font-bold text-white text-xs uppercase tracking-wider mb-2">
              Code Carnival 3.0 • PS-05
            </h5>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              Problem Statement: On-device threat, phishing and scam detection. Powered by lightweight on-device NLP, Levenshtein typosquatting detection, and static APK manifest analysis.
            </p>
          </div>

          <div>
            <h5 className="font-bold text-white text-xs uppercase tracking-wider mb-2">
              Team Creative Criminals (X8Y9)
            </h5>
            <ul className="text-[11px] text-zinc-400 space-y-1">
              <li>• <strong className="text-zinc-200">Hirva Chaniyara</strong> (Team Leader & AI Architect)</li>
              <li>• <strong className="text-zinc-200">Vishvrajsinh Sisodiya</strong> (Android & Edge Runtime Lead)</li>
              <li>• <strong className="text-zinc-200">Sujal Bendkar</strong> (Security & Heuristics Engineer)</li>
              <li>• <strong className="text-zinc-200">Agravat Kevin</strong> (UI/UX & Testing Specialist)</li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-white text-xs uppercase tracking-wider mb-2">
              Privacy & Regulatory Assurance
            </h5>
            <p className="text-[11px] text-zinc-400 leading-relaxed">
              100% On-Device execution guarantees zero outbound cloud traffic and zero data storage, ensuring strict compliance with the <strong className="text-zinc-300">Digital Personal Data Protection (DPDP) Act 2023</strong>.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-between text-[11px] text-zinc-500 pt-4 border-t border-zinc-900">
          <span>🏛️ Atmiya Developer Students Club (ADSC) • Atmiya University & KIT</span>
          <span className="font-mono text-zinc-400">AegisEdge v3.0 • Built for Code Carnival 3.0</span>
        </div>

      </div>
    </footer>
  );
}
