import React, { useState } from 'react';
import { Calendar, Filter, RefreshCw, Search } from 'lucide-react';
import { AuditLogFilters } from '@/types/audit';
import { User } from '@/types/user';
import Select from '@/components/common/Select';
import Button from '@/components/common/Button';

const ACTION_OPTIONS = [
  { value: '', label: 'All Actions' },
  { value: 'CREATE', label: 'Create' },
  { value: 'UPDATE', label: 'Update' },
  { value: 'DELETE', label: 'Delete' },
  { value: 'LOGIN', label: 'Login' },
  { value: 'LOGOUT', label: 'Logout' },
  { value: 'APPROVE', label: 'Approve' },
  { value: 'REJECT', label: 'Reject' },
  { value: 'ARCHIVE', label: 'Archive' },
  { value: 'RESTORE', label: 'Restore' },
  { value: 'DOWNLOAD', label: 'Download' },
  { value: 'PERMISSION_CHANGE', label: 'Permission Change' },
];

const ENTITY_TYPE_OPTIONS = [
  { value: '', label: 'All Entity Types' },
  { value: 'DOCUMENT', label: 'Document' },
  { value: 'USER', label: 'User' },
  { value: 'DEPARTMENT', label: 'Department' },
  { value: 'WORKFLOW', label: 'Workflow' },
  { value: 'ARCHIVE', label: 'Archive' },
  { value: 'SYSTEM', label: 'System' },
];

interface AuditLogFiltersProps {
  filters: AuditLogFilters;
  users: User[];
  onSearchChange: (q: string) => void;
  onUserChange: (userId: string) => void;
  onActionChange: (action: string) => void;
  onEntityTypeChange: (entityType: string) => void;
  onStartDateChange: (date: string) => void;
  onEndDateChange: (date: string) => void;
  onReset: () => void;
}

export const AuditLogFilterBar: React.FC<AuditLogFiltersProps> = ({
  filters,
  users,
  onSearchChange,
  onUserChange,
  onActionChange,
  onEntityTypeChange,
  onStartDateChange,
  onEndDateChange,
  onReset,
}) => {
  const [searchValue, setSearchValue] = useState(filters.search || '');

  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onSearchChange(searchValue);
    }
  };

  const userOptions = [
    { value: '', label: 'All Users' },
    ...users.map((u) => ({
      value: String(u.id),
      label: `${u.full_name} (${u.email})`,
    })),
  ];

  const hasActiveFilters =
    filters.search ||
    filters.userId ||
    filters.action ||
    filters.entityType ||
    filters.startDate ||
    filters.endDate;

  return (
    <div className="bg-[#ECEAE3] border border-[#292A27]/10 rounded-[1.5rem] p-4 md:p-6 mb-6 shadow-sm">
      <div className="flex flex-col gap-4">
        {/* Top row: Search + Reset */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative flex-grow">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8A8983]" />
            <input
              type="text"
              placeholder="Search by user, entity, IP, details…"
              value={searchValue}
              onChange={(e) => setSearchValue(e.target.value)}
              onKeyDown={handleSearchKeyDown}
              onBlur={() => onSearchChange(searchValue)}
              className="w-full pl-9 pr-4 py-2.5 bg-[#F9F8F6] text-[#252622] border border-[#D8D7D1] rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#526A55] placeholder-[#8A8983]"
              aria-label="Search audit logs"
            />
          </div>
          {hasActiveFilters && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setSearchValue('');
                onReset();
              }}
              className="whitespace-nowrap"
            >
              <RefreshCw className="w-4 h-4 mr-1.5 text-[#6B6A64]" /> Reset Filters
            </Button>
          )}
        </div>

        {/* Filter grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3">
          {/* User Filter */}
          <div>
            <label className="block text-xs font-semibold text-[#6B6A64] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-[#526A55]" /> User
            </label>
            <Select
              options={userOptions}
              value={filters.userId || ''}
              onChange={onUserChange}
              placeholder="All Users"
            />
          </div>

          {/* Action Type Filter */}
          <div>
            <label className="block text-xs font-semibold text-[#6B6A64] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-[#526A55]" /> Action Type
            </label>
            <Select
              options={ACTION_OPTIONS}
              value={filters.action || ''}
              onChange={onActionChange}
              placeholder="All Actions"
            />
          </div>

          {/* Entity Type Filter */}
          <div>
            <label className="block text-xs font-semibold text-[#6B6A64] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-[#526A55]" /> Entity Type
            </label>
            <Select
              options={ENTITY_TYPE_OPTIONS}
              value={filters.entityType || ''}
              onChange={onEntityTypeChange}
              placeholder="All Entity Types"
            />
          </div>

          {/* Date Range */}
          <div>
            <label className="block text-xs font-semibold text-[#6B6A64] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-[#526A55]" /> Date Range
            </label>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={filters.startDate || ''}
                onChange={(e) => onStartDateChange(e.target.value)}
                className="flex-1 px-2 py-2.5 bg-[#F9F8F6] text-[#252622] border border-[#D8D7D1] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#526A55]"
                aria-label="Start date"
              />
              <span className="text-[#6B6A64] text-xs font-medium">–</span>
              <input
                type="date"
                value={filters.endDate || ''}
                onChange={(e) => onEndDateChange(e.target.value)}
                className="flex-1 px-2 py-2.5 bg-[#F9F8F6] text-[#252622] border border-[#D8D7D1] rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-[#526A55]"
                aria-label="End date"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuditLogFilterBar;
