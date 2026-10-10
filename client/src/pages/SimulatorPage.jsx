import React, { useState } from 'react';
import PhoneSimulator from '../components/PhoneSimulator.jsx';
import { HACKATHON_SCAM_SCENARIOS } from '../services/scamSamples.js';

export default function SimulatorPage() {
  const [selectedScenario, setSelectedScenario] = useState(HACKATHON_SCAM_SCENARIOS[0]);
  const [customText, setCustomText] = useState('');

  const handleCustomSend = (e) => {
    e.preventDefault();
    if (!customText.trim()) return;
    setSelectedScenario({
      id: 'custom-' + Date.now(),
      title: 'Custom Inbound SMS',
      category: 'User Custom Test',
      language: 'Custom',
      text: customText.trim(),
      expectedVerdict: 'TEST'
    });
  };

  return (
    <div className="space-y-8">
      
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-zinc-800 pb-5">
        <div>
          <span className="text-xs font-mono text-red-500 uppercase tracking-wider block font-bold">
            Interactive Android Handset Testing
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white">
            Mobile Simulator &amp; Floating Threat HUD
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Simulates real-time SMS arrival on an Android smartphone and demonstrates sub-35ms Heads-Up Shield HUD appearance.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="px-3 py-1.5 rounded-xl bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-300">
            Latency: <strong className="text-cyan-400">&lt; 35ms</strong>
          </span>
        </div>
      </div>

      {/* 2-Column Layout: Controls & Phone */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left: Scenario Selector & Live Controls (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          
          <div className="bg-[#121217] border border-zinc-800 rounded-3xl p-6 space-y-4 shadow-xl">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Select Incoming SMS Payload
            </h3>
            <p className="text-xs text-zinc-400">
              Pick any pre-loaded attack scenario to inject into the phone simulator:
            </p>

            <div className="space-y-2">
              {HACKATHON_SCAM_SCENARIOS.map((sc) => {
                const active = selectedScenario.id === sc.id;
                return (
                  <button
                    key={sc.id}
                    onClick={() => setSelectedScenario(sc)}
                    className={`w-full p-3.5 rounded-2xl text-left border transition flex items-start justify-between gap-3 ${
                      active
                        ? 'bg-red-950/60 border-red-600 text-white shadow-lg shadow-red-900/20'
                        : 'bg-zinc-900/70 border-zinc-800 text-zinc-300 hover:bg-zinc-800/60'
                    }`}
                  >
                    <div>
                      <strong className="block text-xs font-semibold">{sc.title}</strong>
                      <p className="text-[11px] text-zinc-400 mt-0.5 line-clamp-2">
                        "{sc.text}"
                      </p>
                    </div>
                    <span className="px-2 py-0.5 text-[10px] rounded font-mono font-bold bg-zinc-800 text-zinc-300 whitespace-nowrap">
                      {sc.language}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Message Injection */}
          <div className="bg-[#121217] border border-zinc-800 rounded-3xl p-6 space-y-3 shadow-xl">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Inject Custom SMS
            </h3>
            <form onSubmit={handleCustomSend} className="space-y-3">
              <textarea
                rows={3}
                value={customText}
                onChange={(e) => setCustomText(e.target.value)}
                placeholder="Type your own test SMS to inject into the phone..."
                className="w-full bg-[#181822] border border-zinc-700 rounded-xl p-3 text-xs text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-red-600 transition"
              />
              <button
                type="submit"
                className="w-full py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-xs rounded-xl shadow transition"
              >
                Send to Phone Simulator
              </button>
            </form>
          </div>

          {/* Technical Info Box */}
          <div className="bg-zinc-900/60 border border-zinc-800 rounded-2xl p-4 text-xs text-zinc-400 space-y-2">
            <strong className="text-zinc-200 block text-xs">How the Real Android HUD Operates:</strong>
            <p className="text-[11px] leading-relaxed">
              In the native Android app implementation, AegisEdge listens for <code className="text-zinc-300 bg-zinc-800 px-1 py-0.5 rounded">android.provider.Telephony.SMS_RECEIVED</code> broadcasts. The C++ TFLite engine scores the message in &lt; 35ms. If risk exceeds 70/100, an Android <code className="text-zinc-300 bg-zinc-800 px-1 py-0.5 rounded">WindowManager</code> floating view overlays the screen before the user can tap the fake link.
            </p>
          </div>

        </div>

        {/* Right: Phone Simulator Display (6 cols) */}
        <div className="lg:col-span-6 flex justify-center sticky top-24">
          <PhoneSimulator externalScenario={selectedScenario} />
        </div>

      </div>

    </div>
  );
}
