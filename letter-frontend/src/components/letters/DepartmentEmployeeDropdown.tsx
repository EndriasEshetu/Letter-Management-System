import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { User } from '@/types/user';
import userService from '@/services/userService';
import departmentService from '@/services/departmentService';
import LoadingSpinner from '@/components/common/LoadingSpinner';

export interface DepartmentEmployeeDropdownProps {
  departmentName?: string;
  departmentId?: number | string | null;
  value: string; // selected officerName
  selectedOfficerId?: number | string;
  onChange: (officerName: string, officerId?: number | string, user?: User) => void;
  disabled?: boolean;
  error?: string;
  label?: string;
  required?: boolean;
  className?: string;
  placeholder?: string;
}

// Generate pastel avatar background color based on name string
function getAvatarBg(name: string): string {
  const colors = [
    'bg-[#526A55]/15 text-[#526A55] border-[#526A55]/30',
    'bg-[#2A4D69]/15 text-[#2A4D69] border-[#2A4D69]/30',
    'bg-[#8B5A2B]/15 text-[#8B5A2B] border-[#8B5A2B]/30',
    'bg-[#4B6584]/15 text-[#4B6584] border-[#4B6584]/30',
    'bg-[#576574]/15 text-[#576574] border-[#576574]/30',
    'bg-[#3B7A57]/15 text-[#3B7A57] border-[#3B7A57]/30',
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const index = Math.abs(hash) % colors.length;
  return colors[index];
}

// Extract up to 2 initials from name
function getInitials(name: string): string {
  if (!name) return '??';
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].substring(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export const DepartmentEmployeeDropdown: React.FC<DepartmentEmployeeDropdownProps> = ({
  departmentName,
  departmentId,
  value,
  selectedOfficerId,
  onChange,
  disabled = false,
  error,
  label = 'Select Officer / Employee',
  required = false,
  className = '',
  placeholder = 'Select an employee of this department...',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [employees, setEmployees] = useState<User[]>([]);
  const [resolvedDeptName, setResolvedDeptName] = useState(departmentName || '');
  const [isLoading, setIsLoading] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Load department employees
  const loadEmployees = useCallback(async () => {
    setIsLoading(true);
    try {
      let deptIdentifier = departmentId || departmentName;

      // If we don't have departmentId but have departmentName, try to find department
      if (!departmentId && departmentName) {
        try {
          const depts = await departmentService.getDepartments();
          const found = depts.find(
            (d) =>
              d.name.toLowerCase() === departmentName.toLowerCase() ||
              d.code.toLowerCase() === departmentName.toLowerCase()
          );
          if (found) {
            deptIdentifier = found.id;
            setResolvedDeptName(found.name);
          }
        } catch {
          // keep original
        }
      }

      // Try department roster first
      if (deptIdentifier) {
        try {
          const details = await departmentService.getDepartmentDetails(deptIdentifier);
          if (details && Array.isArray(details.employees) && details.employees.length > 0) {
            setResolvedDeptName(details.name || departmentName || '');
            const mappedUsers: User[] = details.employees.map((e) => ({
              id: e.id,
              full_name: e.full_name,
              email: e.email,
              phone: e.phone || '',
              job_title: e.job_title || 'Officer',
              role: e.role as any,
              department_id: details.id as any,
              department_name: details.name,
              status: e.status,
              is_active: e.is_active,
            }));
            setEmployees(mappedUsers);
            setIsLoading(false);
            return;
          }
        } catch {
          // fallback to userService
        }
      }

      // Fallback via userService
      const staff = await userService.getDepartmentEmployees(deptIdentifier || departmentName || '');
      setEmployees(staff);
    } catch (err) {
      console.error('[DepartmentEmployeeDropdown] Failed to fetch department employees:', err);
      setEmployees([]);
    } finally {
      setIsLoading(false);
    }
  }, [departmentId, departmentName]);

  useEffect(() => {
    loadEmployees();
  }, [loadEmployees]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      // Auto-focus search input when opening
      setTimeout(() => searchInputRef.current?.focus(), 50);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Filter employees based on search query
  const filteredEmployees = useMemo(() => {
    if (!searchQuery.trim()) return employees;
    const q = searchQuery.toLowerCase().trim();
    return employees.filter(
      (e) =>
        e.full_name.toLowerCase().includes(q) ||
        (e.job_title && e.job_title.toLowerCase().includes(q)) ||
        e.email.toLowerCase().includes(q) ||
        e.role.toLowerCase().includes(q)
    );
  }, [employees, searchQuery]);

  // Currently selected employee object (if any)
  const currentSelected = useMemo(() => {
    if (selectedOfficerId) {
      const match = employees.find((e) => String(e.id) === String(selectedOfficerId));
      if (match) return match;
    }
    if (value) {
      return employees.find(
        (e) => e.full_name.toLowerCase().trim() === value.toLowerCase().trim()
      );
    }
    return null;
  }, [employees, selectedOfficerId, value]);

  const handleSelect = (user: User) => {
    onChange(user.full_name, user.id, user);
    setIsOpen(false);
    setSearchQuery('');
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onChange('', undefined);
    setSearchQuery('');
  };

  return (
    <div className={`relative w-full ${className}`} ref={dropdownRef}>
      {label && (
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-xs font-bold uppercase tracking-wider text-[#6B6A64]">
            {label} {required && <span className="text-[#8B3232]">*</span>}
          </label>
          {resolvedDeptName && (
            <span className="text-[11px] font-medium text-[#526A55] bg-[#526A55]/10 px-2 py-0.5 rounded-full truncate max-w-[200px]" title={resolvedDeptName}>
              🏛️ {resolvedDeptName}
            </span>
          )}
        </div>
      )}

      {/* Dropdown Trigger Button */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => !disabled && setIsOpen((prev) => !prev)}
        className={`w-full text-left px-3.5 py-2.5 rounded-xl border transition-all duration-200 flex items-center justify-between gap-3 ${
          error
            ? 'border-[#8B3232] bg-[#8B3232]/05 focus:ring-[#8B3232]'
            : isOpen
            ? 'border-[#526A55] bg-white ring-2 ring-[#526A55]/20 shadow-sm'
            : 'border-[#D8D7D1] bg-[#F9F8F6] hover:bg-[#F2F0EB] focus:border-[#526A55]'
        } ${disabled ? 'opacity-60 cursor-not-allowed bg-[#ECEAE3]' : 'cursor-pointer'}`}
      >
        <div className="flex items-center gap-2.5 min-w-0 flex-1">
          {currentSelected ? (
            <>
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border flex-shrink-0 ${getAvatarBg(
                  currentSelected.full_name
                )}`}
              >
                {getInitials(currentSelected.full_name)}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-[#292A27] truncate">
                    {currentSelected.full_name}
                  </span>
                  <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-[#526A55]/10 text-[#526A55]">
                    {currentSelected.role === 'DEPARTMENT_MANAGER' ? 'Manager' : 'Officer'}
                  </span>
                </div>
                <p className="text-xs text-[#6B6A64] truncate">
                  {currentSelected.job_title || currentSelected.email}
                </p>
              </div>
            </>
          ) : value ? (
            <>
              <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border flex-shrink-0 bg-[#526A55]/15 text-[#526A55] border-[#526A55]/30">
                {getInitials(value)}
              </div>
              <div className="min-w-0 flex-1">
                <span className="text-sm font-semibold text-[#292A27] truncate block">
                  {value}
                </span>
                <span className="text-xs text-[#6B6A64] truncate block">
                  Assigned Personnel
                </span>
              </div>
            </>
          ) : (
            <div className="flex items-center gap-2 text-[#8A8983] text-sm">
              <svg className="w-4 h-4 text-[#8A8983]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>{placeholder}</span>
            </div>
          )}
        </div>

        {/* Action icons */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {(currentSelected || value) && !disabled && (
            <span
              role="button"
              tabIndex={0}
              onClick={handleClear}
              className="p-1 rounded-full text-[#8A8983] hover:text-[#8B3232] hover:bg-[#8B3232]/10 transition-colors"
              title="Clear selection"
            >
              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </span>
          )}
          <svg
            className={`w-4 h-4 text-[#6B6A64] transition-transform duration-200 ${
              isOpen ? 'transform rotate-180 text-[#526A55]' : ''
            }`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </div>
      </button>

      {/* Floating Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-50 mt-1.5 w-full bg-[#FFFFFF] border border-[#D8D7D1] rounded-2xl shadow-xl overflow-hidden animate-in fade-in-50 duration-150">
          {/* Header banner */}
          <div className="px-3 py-2 bg-[#F9F8F6] border-b border-[#D8D7D1]/80 flex items-center justify-between text-xs">
            <span className="font-semibold text-[#292A27] flex items-center gap-1.5 truncate">
              <span>👥</span>
              <span>Employees of {resolvedDeptName || 'Department'}</span>
            </span>
            <span className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-[#526A55]/15 text-[#526A55]">
              {employees.length} available
            </span>
          </div>

          {/* Search filter input */}
          <div className="p-2 border-b border-[#D8D7D1]/60 bg-white">
            <div className="relative">
              <svg
                className="w-4 h-4 absolute left-3 top-2.5 text-[#8A8983]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search staff by name, title, or email..."
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#F9F8F6] text-[#292A27] placeholder-[#8A8983] border border-[#D8D7D1] rounded-lg focus:outline-none focus:border-[#526A55] focus:ring-1 focus:ring-[#526A55]"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2.5 top-2 text-[#8A8983] hover:text-[#292A27]"
                >
                  <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>

          {/* Employee list */}
          <div className="max-h-60 overflow-y-auto divide-y divide-[#D8D7D1]/30 py-1">
            {isLoading ? (
              <div className="py-6 flex flex-col items-center justify-center text-xs text-[#6B6A64]">
                <LoadingSpinner size="sm" />
                <span className="mt-2 font-medium">Loading department employees...</span>
              </div>
            ) : filteredEmployees.length === 0 ? (
              <div className="py-6 px-4 text-center">
                <div className="w-9 h-9 rounded-full bg-[#526A55]/10 text-[#526A55] flex items-center justify-center mx-auto mb-2 text-base">
                  🔍
                </div>
                <p className="text-xs font-semibold text-[#292A27]">
                  {searchQuery ? 'No matching employees' : 'No employees found in this department'}
                </p>
                <p className="text-[11px] text-[#8A8983] mt-1 max-w-[240px] mx-auto">
                  {searchQuery
                    ? `No staff member matches "${searchQuery}". Try a different keyword.`
                    : `No staff currently assigned to ${resolvedDeptName || 'this department'}. Personnel added by Admin will appear here.`}
                </p>
              </div>
            ) : (
              filteredEmployees.map((emp) => {
                const isSelected =
                  (selectedOfficerId && String(emp.id) === String(selectedOfficerId)) ||
                  (value && emp.full_name.toLowerCase().trim() === value.toLowerCase().trim());

                return (
                  <button
                    key={emp.id}
                    type="button"
                    onClick={() => handleSelect(emp)}
                    className={`w-full px-3 py-2.5 text-left flex items-center justify-between gap-3 transition-colors ${
                      isSelected
                        ? 'bg-[#526A55]/10 text-[#292A27]'
                        : 'hover:bg-[#F9F8F6] text-[#292A27]'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0 flex-1">
                      {/* Avatar */}
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs border flex-shrink-0 ${getAvatarBg(
                          emp.full_name
                        )}`}
                      >
                        {getInitials(emp.full_name)}
                      </div>

                      {/* Details */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-xs font-semibold truncate ${
                              isSelected ? 'text-[#526A55]' : 'text-[#292A27]'
                            }`}
                          >
                            {emp.full_name}
                          </span>
                          <span className="text-[10px] font-medium px-1.5 py-0.2 rounded bg-[#292A27]/05 text-[#6B6A64]">
                            {emp.role === 'DEPARTMENT_MANAGER' ? 'Manager' : 'Officer'}
                          </span>
                          {emp.is_active && (
                            <span className="w-1.5 h-1.5 rounded-full bg-[#4A6B4E]" title="Active" />
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-[#6B6A64] truncate">
                          <span>{emp.job_title || 'Department Staff'}</span>
                          <span>•</span>
                          <span className="truncate">{emp.email}</span>
                        </div>
                      </div>
                    </div>

                    {/* Checkmark indicator */}
                    {isSelected && (
                      <div className="flex-shrink-0 text-[#526A55]">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </button>
                );
              })
            )}
          </div>

          {/* Footer refresh button */}
          <div className="px-3 py-1.5 bg-[#F9F8F6] border-t border-[#D8D7D1]/60 flex items-center justify-between text-[11px] text-[#6B6A64]">
            <span>Click to assign officer</span>
            <button
              type="button"
              onClick={loadEmployees}
              className="text-[#526A55] hover:underline font-medium"
            >
              ↻ Refresh roster
            </button>
          </div>
        </div>
      )}

      {error && <p className="mt-1.5 text-xs text-[#8B3232] font-medium">{error}</p>}
    </div>
  );
};

export default DepartmentEmployeeDropdown;
