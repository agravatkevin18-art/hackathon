import React from 'react';
import { Routes, Route } from 'react-router-dom';
import CyberNavbar from './components/CyberNavbar.jsx';
import Footer from './components/Footer.jsx';
import Dashboard from './pages/Dashboard.jsx';
import SimulatorPage from './pages/SimulatorPage.jsx';
import UrlAuditPage from './pages/UrlAuditPage.jsx';
import ApkAuditPage from './pages/ApkAuditPage.jsx';
import BenchmarkPage from './pages/BenchmarkPage.jsx';
import ReportPage from './pages/ReportPage.jsx';

export default function App() {
  return (
    <div className="min-h-screen bg-[#0B0B0E] text-zinc-100 flex flex-col font-sans">
      <CyberNavbar />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/simulator" element={<SimulatorPage />} />
          <Route path="/url-audit" element={<UrlAuditPage />} />
          <Route path="/apk-audit" element={<ApkAuditPage />} />
          <Route path="/benchmark" element={<BenchmarkPage />} />
          <Route path="/report" element={<ReportPage />} />
          <Route path="*" element={<Dashboard />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}
