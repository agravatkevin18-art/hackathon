import React from 'react';
import { Routes, Route } from 'react-router-dom';
import CyberNavbar from './components/CyberNavbar.jsx';
import Footer from './components/Footer.jsx';
import AnimatedBackground from './components/AnimatedBackground.jsx';
import Dashboard from './pages/Dashboard.jsx';
import ChatProtectionPage from './pages/ChatProtectionPage.jsx';
import SimulatorPage from './pages/SimulatorPage.jsx';
import UrlAuditPage from './pages/UrlAuditPage.jsx';
import ApkAuditPage from './pages/ApkAuditPage.jsx';
import PrivacyDashboard from './pages/PrivacyDashboard.jsx';
import ScanHistoryPage from './pages/ScanHistoryPage.jsx';
import BenchmarkPage from './pages/BenchmarkPage.jsx';
import ReportPage from './pages/ReportPage.jsx';

export default function App() {
  return (
    <div className="min-h-screen bg-[#07070B] text-zinc-100 flex flex-col font-sans relative selection:bg-red-600 selection:text-white">
      {/* 60fps Particle Network Canvas Background */}
      <AnimatedBackground />

      {/* Main Navbar */}
      <CyberNavbar />

      {/* Main App Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 relative z-10">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/chat-guard" element={<ChatProtectionPage />} />
          <Route path="/chat-protection" element={<ChatProtectionPage />} />
          <Route path="/simulator" element={<SimulatorPage />} />
          <Route path="/url-audit" element={<UrlAuditPage />} />
          <Route path="/apk-audit" element={<ApkAuditPage />} />
          <Route path="/privacy" element={<PrivacyDashboard />} />
          <Route path="/history" element={<ScanHistoryPage />} />
          <Route path="/benchmark" element={<BenchmarkPage />} />
          <Route path="/report" element={<ReportPage />} />
          <Route path="*" element={<Dashboard />} />
        </Routes>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
