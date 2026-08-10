import React from 'react';
import { CheckCircle2, Server, Globe, FileCode2, Layers, Cpu } from 'lucide-react';

export const LandingPage: React.FC = () => {
  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

  const systemChecklist = [
    { name: 'React 19 & TypeScript Engine', status: 'Configured', detail: 'Vite 6 + React 19 Strict Setup' },
    { name: 'Tailwind CSS Styling Foundation', status: 'Active', detail: 'SITA Custom Government Theme & CSS Reset' },
    { name: 'React Router Architecture', status: 'Ready', detail: 'Route paths established for Phase 2+' },
    { name: 'Axios Centralized API Client', status: 'Connected', detail: `Base URL: ${apiBaseUrl}` },
    { name: 'PDF Viewer Dependencies', status: 'Installed', detail: '@react-pdf-viewer/core & default-layout ready' },
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Hero Welcome Card */}
      <div className="bg-white rounded-2xl border border-slate-200 p-8 sm:p-12 shadow-xl shadow-slate-200/50 relative overflow-hidden">
        {/* Top Accent Gradient Bar */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-900 via-blue-700 to-indigo-800" />
        
        <div className="flex flex-col items-center text-center space-y-6">
          {/* SITA Official Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 border border-blue-200 text-blue-800 font-semibold text-xs tracking-wide uppercase shadow-xs">
            <Globe className="w-4 h-4 text-blue-600" />
            <span>Sidama Innovation and Technology Agency (SITA)</span>
          </div>

          {/* Main Title & Subtitle */}
          <div className="space-y-3">
            <h1 className="text-4xl sm:text-5xl font-extrabold text-slate-900 tracking-tight">
              Smart E-Office
            </h1>
            <p className="text-xl sm:text-2xl font-medium text-slate-600">
              Document Management System
            </p>
          </div>

          {/* Status Message Prompt Requirement */}
          <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-6 py-4 flex items-center gap-3 text-emerald-800 font-semibold text-base sm:text-lg shadow-sm">
            <CheckCircle2 className="w-6 h-6 text-emerald-600 shrink-0" />
            <span>Frontend application initialized successfully.</span>
          </div>

          <p className="text-sm text-slate-500 max-w-xl leading-relaxed">
            Phase 1 project foundation established for the Sidama Innovation & Technology Agency. Ready for Phase 2 authentication, role management, and core workflow integration.
          </p>
        </div>
      </div>

      {/* System Status Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Core Tech Stack */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="p-2 rounded-lg bg-slate-100 text-slate-700">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Approved Tech Stack</h3>
              <p className="text-xs text-slate-500">Configured & Validated</p>
            </div>
          </div>
          <div className="mt-4 space-y-2.5 text-sm text-slate-600">
            <div className="flex justify-between items-center py-1">
              <span className="font-medium text-slate-700">Core Framework</span>
              <span className="bg-slate-100 px-2.5 py-0.5 rounded text-xs font-semibold text-slate-800">React 19 + TypeScript</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="font-medium text-slate-700">Build Tool</span>
              <span className="bg-slate-100 px-2.5 py-0.5 rounded text-xs font-semibold text-slate-800">Vite 6</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="font-medium text-slate-700">Styling</span>
              <span className="bg-slate-100 px-2.5 py-0.5 rounded text-xs font-semibold text-slate-800">Tailwind CSS v4</span>
            </div>
            <div className="flex justify-between items-center py-1">
              <span className="font-medium text-slate-700">Routing & API</span>
              <span className="bg-slate-100 px-2.5 py-0.5 rounded text-xs font-semibold text-slate-800">React Router v7 + Axios</span>
            </div>
          </div>
        </div>

        {/* Phase Checklist */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100">
            <div className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Phase 1 Architecture</h3>
              <p className="text-xs text-slate-500">Foundational Components</p>
            </div>
          </div>
          <div className="mt-4 space-y-3">
            {systemChecklist.slice(0, 4).map((item, idx) => (
              <div key={idx} className="flex items-start gap-2.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-semibold text-slate-800">{item.name}</p>
                  <p className="text-xs text-slate-500">{item.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Environment Config Info Card */}
      <div className="bg-slate-900 text-slate-200 rounded-xl p-6 shadow-md border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-lg bg-slate-800 text-blue-400">
            <Server className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">Centralized API Endpoint</h4>
            <p className="text-xs text-slate-400 font-mono mt-0.5">VITE_API_BASE_URL: {apiBaseUrl}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <FileCode2 className="w-4 h-4 text-slate-400" />
          <span className="text-xs text-slate-400 font-mono">src/services/api.ts</span>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
