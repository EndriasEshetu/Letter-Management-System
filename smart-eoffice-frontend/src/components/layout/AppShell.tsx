import React from 'react';
import { ShieldCheck, FileText, Building2 } from 'lucide-react';

interface AppShellProps {
  children: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* SITA Top Navigation Header */}
      <header className="bg-slate-900 border-b border-slate-800 text-white sticky top-0 z-50 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo & Agency Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center text-white shadow-sm font-bold text-lg">
              <FileText className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold tracking-tight text-white text-lg">
                  Smart E-Office
                </span>
                <span className="bg-blue-500/20 text-blue-300 text-xs font-semibold px-2 py-0.5 rounded-full border border-blue-400/30">
                  SITA
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">
                Sidama Innovation and Technology Agency
              </p>
            </div>
          </div>

          {/* Phase Status Indicator */}
          <div className="flex items-center gap-2 bg-emerald-950/80 border border-emerald-800/60 text-emerald-400 px-3 py-1.5 rounded-full text-xs font-medium">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Phase 1: Foundation Ready</span>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Building2 className="w-4 h-4 text-slate-400" />
            <span>Sidama Innovation and Technology Agency (SITA) &copy; {new Date().getFullYear()}</span>
          </div>
          <div>
            <span>Smart E-Office Document Management System — Phase 1</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default AppShell;
