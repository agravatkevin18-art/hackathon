import React, { useState, useEffect } from 'react';
import FloatingThreatHUD from './FloatingThreatHUD.jsx';
import { evaluateThreatMultiVector } from '../services/compositeThreatScorer.js';
import { HACKATHON_SCAM_SCENARIOS } from '../services/scamSamples.js';
import { useThreat } from '../context/ThreatContext.jsx';

export default function PhoneSimulator({ externalScenario = null }) {
  const { scanMessage } = useThreat();
  const [currentScenario, setCurrentScenario] = useState(
    externalScenario || HACKATHON_SCAM_SCENARIOS[0]
  );
  const [analysisResult, setAnalysisResult] = useState(null);
  const [showHUD, setShowHUD] = useState(true);

  // Analyze whenever scenario changes
  useEffect(() => {
    if (currentScenario) {
      const res = scanMessage(currentScenario.text);
      setAnalysisResult(res);
      setShowHUD(true);
    }
  }, [currentScenario, scanMessage]);

  // Handle external prop changes
  useEffect(() => {
    if (externalScenario) {
      setCurrentScenario(externalScenario);
    }
  }, [externalScenario]);

  return (
    <div className="flex flex-col items-center">
      {/* Smartphone Outer Bezel */}
      <div className="w-[320px] sm:w-[360px] h-[680px] bg-[#0E0E12] border-4 border-zinc-700 rounded-[44px] shadow-2xl p-3 flex flex-col relative overflow-hidden ring-1 ring-zinc-800">
        
        {/* Notch / Dynamic Island */}
        <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-28 h-5 bg-black rounded-full z-30 flex items-center justify-center">
          <span className="w-2.5 h-2.5 rounded-full bg-zinc-900 mr-2 border border-zinc-800"></span>
          <span className="w-1.5 h-1.5 rounded-full bg-blue-900/60"></span>
        </div>

        {/* Screen Area */}
        <div className="w-full h-full bg-[#1A1A22] rounded-[36px] overflow-hidden flex flex-col relative scanline-effect text-white">
          
          {/* Status Bar */}
          <div className="h-10 pt-2 px-6 flex justify-between items-center text-[10px] text-zinc-400 font-mono z-20">
            <span>09:41</span>
            <div className="flex items-center gap-1.5">
              <span>5G</span>
              <span>📶</span>
              <span className="text-emerald-400">92%</span>
            </div>
          </div>

          {/* App Header (Android Messages) */}
          <div className="px-4 py-2 bg-zinc-900/90 border-b border-zinc-800 flex items-center justify-between text-xs z-20">
            <div className="flex items-center gap-2">
              <span className="text-zinc-400">←</span>
              <div className="w-7 h-7 rounded-full bg-red-950/80 text-red-400 flex items-center justify-center font-bold text-[11px] border border-red-800">
                !
              </div>
              <div>
                <strong className="block text-zinc-200 text-xs">
                  {currentScenario?.category || 'SMS Alert'}
                </strong>
                <span className="text-[10px] text-zinc-400">Unknown Sender</span>
              </div>
            </div>
            <span className="text-[10px] text-zinc-500 font-mono">Today</span>
          </div>

          {/* SMS Chat Feed */}
          <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs z-10 flex flex-col justify-start">
            <div className="flex flex-col items-start max-w-[90%]">
              <div className="bg-[#242430] text-zinc-200 p-3.5 rounded-2xl rounded-tl-sm border border-zinc-700/60 shadow space-y-1">
                <p className="leading-relaxed">
                  {currentScenario?.text}
                </p>
                <div className="text-[9px] text-zinc-500 text-right">09:40 AM • Delivered</div>
              </div>
            </div>

            {/* Floating HUD Overlay on Phone Screen */}
            {showHUD && analysisResult && (
              <div className="mt-2 animate-bounce-in z-30">
                <FloatingThreatHUD
                  result={analysisResult}
                  onNeutralize={() => {}}
                  onDismiss={() => setShowHUD(false)}
                />
              </div>
            )}
          </div>

          {/* Quick Scenario Pills for Phone Tester */}
          <div className="p-3 bg-zinc-900/95 border-t border-zinc-800 z-20 space-y-2">
            <span className="text-[10px] text-zinc-400 block font-semibold uppercase tracking-wider">
              Simulate Inbound SMS:
            </span>
            <div className="flex gap-1.5 overflow-x-auto pb-1 text-[10px]">
              {HACKATHON_SCAM_SCENARIOS.slice(0, 4).map((sc) => (
                <button
                  key={sc.id}
                  onClick={() => setCurrentScenario(sc)}
                  className={`px-2.5 py-1 rounded-full whitespace-nowrap transition font-medium ${
                    currentScenario?.id === sc.id
                      ? 'bg-red-600 text-white font-bold'
                      : 'bg-zinc-800 text-zinc-300 hover:bg-zinc-700'
                  }`}
                >
                  {sc.title.split(' ')[1]}
                </button>
              ))}
            </div>
          </div>

          {/* Android Navigation Bar */}
          <div className="h-5 flex justify-center items-center pb-1">
            <div className="w-28 h-1 bg-zinc-500 rounded-full"></div>
          </div>

        </div>
      </div>
    </div>
  );
}
