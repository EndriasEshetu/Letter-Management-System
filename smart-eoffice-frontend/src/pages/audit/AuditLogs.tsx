import React from 'react';
import { Shield } from 'lucide-react';
import { useAuditLogs } from '@/hooks/useAuditLogs';
import AuditLogFilterBar from '@/components/audit-logs/AuditLogFilters';
import AuditLogTable from '@/components/audit-logs/AuditLogTable';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import EmptyState from '@/components/common/EmptyState';
import ErrorState from '@/components/common/ErrorState';
import Pagination from '@/components/common/Pagination';

export const AuditLogs: React.FC = () => {
  const {
    logs,
    users,
    filters,
    total,
    totalPages,
    currentPage,
    isLoading,
    error,
    setSearch,
    setUserId,
    setAction,
    setEntityType,
    setStartDate,
    setEndDate,
    setPage,
    resetFilters,
    refetch,
  } = useAuditLogs();

  const pageStart = total === 0 ? 0 : (currentPage - 1) * (filters.limit || 20) + 1;
  const pageEnd = Math.min(currentPage * (filters.limit || 20), total);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 pb-6 border-b border-[#D8D7D1]">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-[#526A55]/10 text-[#526A55] rounded-2xl">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#292A27]">
              Audit Logs
            </h1>
            <p className="text-sm text-[#6B6A64] mt-1 font-medium">
              Review system activity and administrative audit history.
            </p>
          </div>
        </div>

        {!isLoading && total > 0 && (
          <div className="mt-4 sm:mt-0 text-xs text-[#6B6A64] font-medium bg-[#ECEAE3] px-3 py-1.5 rounded-xl border border-[#D8D7D1]/60">
            Showing{' '}
            <span className="text-[#292A27] font-bold">
              {pageStart}–{pageEnd}
            </span>{' '}
            of{' '}
            <span className="text-[#292A27] font-bold">{total}</span> records
          </div>
        )}
      </div>

      {/* Filters */}
      <AuditLogFilters
        filters={filters}
        users={users}
        onSearchChange={setSearch}
        onUserChange={setUserId}
        onActionChange={setAction}
        onEntityTypeChange={setEntityType}
        onStartDateChange={setStartDate}
        onEndDateChange={setEndDate}
        onReset={resetFilters}
      />

      {/* Loading State */}
      {isLoading && (
        <div className="py-24 flex flex-col items-center justify-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-sm font-semibold text-[#6B6A64]">Loading audit logs…</p>
        </div>
      )}

      {/* Error State */}
      {!isLoading && error && (
        <div className="my-8">
          <ErrorState
            title="Unable to load audit logs."
            description={error}
            retryLabel="Try Again"
            onRetry={refetch}
          />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && logs.length === 0 && (
        <div className="my-8">
          <EmptyState
            title="No audit logs found."
            description="No records match your current filters. Try adjusting your filters."
            actionLabel="Reset Filters"
            onAction={resetFilters}
          />
        </div>
      )}

      {/* Table */}
      {!isLoading && !error && logs.length > 0 && (
        <div className="space-y-6">
          <AuditLogTable logs={logs} />

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-2">
              <p className="text-xs text-[#6B6A64] font-medium">
                Page <span className="font-bold text-[#292A27]">{currentPage}</span> of{' '}
                <span className="font-bold text-[#292A27]">{totalPages}</span>
              </p>
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default AuditLogs;
