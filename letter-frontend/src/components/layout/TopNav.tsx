import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import Avatar from "@/components/common/Avatar";
import Dropdown, { DropdownItem } from "@/components/common/Dropdown";
import NotificationBell from "@/components/notifications/NotificationBell";

interface TopNavProps {
  onOpenMobileSidebar: () => void;
}

const getRoleDisplayLabel = (role?: string): string => {
  switch (role) {
    case "ADMIN":
      return "ADMINISTRATOR";
    case "DEPARTMENT_MANAGER":
      return "DEPARTMENT MANAGER";
    case "EMPLOYEE":
      return "EMPLOYEE";
    default:
      return "OFFICER";
  }
};

export const TopNav: React.FC<TopNavProps> = ({ onOpenMobileSidebar }) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");
  const displayName = (user?.full_name || "Officer").replace(
    /\s+\((?:ADMIN(?:ISTRATOR)?|DEPARTMENT\s*MANAGER|MANAGER|EMPLOYEE)\)\s*$/i,
    "",
  );

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const dropdownItems: DropdownItem[] = [
    {
      label: "My Profile",
      onClick: () => navigate("/profile"),
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.75}
            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
          />
        </svg>
      ),
    },
    {
      label: "Sign Out",
      onClick: handleLogout,
      danger: true,
      dividerBefore: true,
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.75}
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
          />
        </svg>
      ),
    },
  ];

  return (
    <header className="sticky top-0 z-30 h-16 bg-[#F5F3ED] border-b border-[#D8D7D1] px-4 sm:px-6 flex items-center justify-between">
      {/* Left Area: Mobile Drawer Toggle & Search */}
      <div className="flex items-center space-x-3 flex-1 max-w-md">
        {/* Mobile Hamburger Button */}
        <button
          type="button"
          onClick={onOpenMobileSidebar}
          className="md:hidden p-2 rounded-xl text-[#292A27] hover:bg-[#ECEAE3] transition-colors focus:outline-none focus:ring-2 focus:ring-[#526A55]"
          aria-label="Open navigation"
        >
          <svg
            className="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M4 6h16M4 12h16M4 18h16"
            />
          </svg>
        </button>

        {/* Global Search Input Field (UI Only) */}
        <div className="relative w-full">
          <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-[#6B6A64]">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search documents..."
            className="w-full pl-10 pr-4 py-2 bg-[#ECEAE3]/80 border border-[#D8D7D1] text-[#252622] placeholder-[#8A8983] rounded-full text-xs font-medium transition-all duration-200 focus:outline-none focus:bg-[#F9F8F5] focus:border-[#526A55] focus:ring-2 focus:ring-[#526A55]/20"
            aria-label="Search documents"
          />
        </div>
      </div>

      {/* Right Area: Notification Bell & User Profile Dropdown */}
      <div className="flex items-center space-x-4">
        {/* Notification Bell UI */}
        <NotificationBell />

        {/* Vertical Divider */}
        <div className="h-6 w-px bg-[#D8D7D1]" aria-hidden="true" />

        {/* User Info & Dropdown Trigger */}
        <Dropdown
          align="right"
          items={dropdownItems}
          trigger={
            <div className="flex items-center space-x-3 cursor-pointer py-1 px-1.5 rounded-xl hover:bg-[#ECEAE3]/60 transition-colors">
              <div className="text-right hidden sm:block">
                <span className="block text-xs font-semibold text-[#292A27] leading-tight">
                  {displayName}
                </span>
                <span className="block text-[9px] font-bold text-[#6B6A64] tracking-wider uppercase leading-tight">
                  {getRoleDisplayLabel(user?.role)}
                </span>
              </div>
              <Avatar name={displayName} size="md" />
            </div>
          }
        />
      </div>
    </header>
  );
};

export default TopNav;
