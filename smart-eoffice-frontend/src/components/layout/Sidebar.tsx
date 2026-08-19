import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { getNavItemsForRole } from '@/routes/navigation';

interface SidebarProps {
  onCloseMobile?: () => void;
}

// Icon helper mapping navigation paths to clean outline SVG icons
const getNavIcon = (path: string) => {
  switch (path) {
    case '/dashboard':
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
        </svg>
      );
    case '/documents':
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-6l-2-2H5a2 2 0 00-2 2z" />
        </svg>
      );
    case '/users':
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5 5 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      );
    case '/departments':
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5m0 0v-5a2 2 0 012-2h2a2 2 0 012 2v5m-4 0h4" />
        </svg>
      );
    case '/approvals':
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      );
    case '/archives':
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M5 8h14M5 8a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v1a2 2 0 01-2 2M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
        </svg>
      );
    case '/audit-logs':
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      );
    default:
      return (
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      );
  }
};

export const Sidebar: React.FC<SidebarProps> = ({ onCloseMobile }) => {
  const { user } = useAuth();
  const location = useLocation();
  const navItems = getNavItemsForRole(user?.role);

  const isProfileActive = location.pathname === '/profile';

  return (
    <aside
      className="w-64 h-full bg-[#ECEAE3] border-r border-[#D8D7D1] flex flex-col justify-between select-none"
      aria-label="Sidebar Navigation"
    >
      {/* Top Section: Branding + Nav Items */}
      <div className="flex-1 overflow-y-auto px-4 py-6">
        {/* Branding Logo Header */}
        <div className="flex items-center space-x-3 px-3 mb-8">
          <div className="w-9 h-9 bg-[#526A55] text-[#F5F3ED] rounded-xl flex items-center justify-center font-bold text-base shadow-sm flex-shrink-0">
            S
          </div>
          <div className="min-w-0">
            <h1 className="text-base font-bold text-[#292A27] tracking-tight truncate">
              Smart E-Office
            </h1>
            <p className="text-[10px] font-medium text-[#6B6A64] tracking-wide uppercase truncate">
              SITA Document System
            </p>
          </div>
        </div>

        {/* Navigation Items List */}
        <nav className="space-y-1.5" aria-label="Main Navigation">
          {navItems.map((item) => {
            const isActive =
              location.pathname === item.path ||
              (item.path !== '/dashboard' && location.pathname.startsWith(item.path));

            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onCloseMobile}
                aria-current={isActive ? 'page' : undefined}
                className={({ isActive: linkActive }) => {
                  const active = isActive || linkActive;
                  return `flex items-center space-x-3 px-3.5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-150 motion-reduce:transition-none focus:outline-none focus-visible:ring-2 focus-visible:ring-[#526A55] ${
                    active
                      ? 'bg-[#AEBDA5]/70 text-[#292A27] shadow-sm'
                      : 'text-[#292A27] hover:bg-[#D8D7D1]/40'
                  }`;
                }}
              >
                <span className="flex-shrink-0 text-[#292A27]">{getNavIcon(item.path)}</span>
                <span className="truncate">{item.label}</span>
                {item.badge && (
                  <span className="ml-auto text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#526A55] text-[#F5F3ED]">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom Profile Navigation Link */}
      <div className="p-4 border-t border-[#D8D7D1]/70">
        <NavLink
          to="/profile"
          onClick={onCloseMobile}
          className={`flex items-center space-x-3 px-3.5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-150 ${
            isProfileActive
              ? 'bg-[#AEBDA5]/70 text-[#292A27] shadow-sm'
              : 'text-[#292A27] hover:bg-[#D8D7D1]/40'
          }`}
        >
          <svg className="w-5 h-5 flex-shrink-0 text-[#292A27]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="truncate">Profile</span>
        </NavLink>
      </div>
    </aside>
  );
};

export default Sidebar;
