import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import TopNav from './TopNav';

interface AppShellProps {
  children?: React.ReactNode;
}

export const AppShell: React.FC<AppShellProps> = ({ children }) => {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-[#F5F3ED] text-[#252622]">
      {/* ─── Desktop Sidebar (Fixed Left) ────────────────────── */}
      <div className="hidden md:flex md:w-64 md:flex-col md:fixed md:inset-y-0 z-30">
        <Sidebar />
      </div>

      {/* ─── Mobile Drawer Sidebar (Slide-over Overlay) ────────── */}
      {mobileOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          {/* Dark Backdrop */}
          <div
            className="fixed inset-0 bg-[#292A27]/40 backdrop-blur-xs transition-opacity"
            aria-hidden="true"
            onClick={() => setMobileOpen(false)}
          />

          {/* Drawer Container */}
          <div className="relative flex-1 max-w-xs w-full bg-[#ECEAE3] flex flex-col shadow-2xl z-10">
            {/* Mobile Close Button */}
            <div className="absolute top-4 right-3 z-20">
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                className="p-2 text-[#292A27] hover:bg-[#D8D7D1] rounded-xl transition-colors focus:outline-none focus:ring-2 focus:ring-[#526A55]"
                aria-label="Close navigation"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <Sidebar onCloseMobile={() => setMobileOpen(false)} />
          </div>
        </div>
      )}

      {/* ─── Main Section (Header + Outlet Content Area) ─────── */}
      <div className="md:pl-64 flex flex-col flex-1 min-w-0 min-h-screen">
        {/* Top Navigation Header */}
        <TopNav onOpenMobileSidebar={() => setMobileOpen(true)} />

        {/* Page Content Outlet */}
        <main className="flex-1 bg-[#F5F3ED] p-4 sm:p-6 lg:p-8 overflow-y-auto">
          {children ? children : <Outlet />}
        </main>
      </div>
    </div>
  );
};

export default AppShell;
