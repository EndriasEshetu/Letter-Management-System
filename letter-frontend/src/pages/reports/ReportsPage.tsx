import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import useReports from '@/hooks/useReports';
import ReportFilters from '@/components/reports/ReportFilters';
import ReportSummaryCards from '@/components/reports/ReportSummaryCards';
import DocumentStatsChart from '@/components/reports/DocumentStatsChart';
import ApprovalStatsChart from '@/components/reports/ApprovalStatsChart';
import DepartmentStatsChart from '@/components/reports/DepartmentStatsChart';
import ActivityChart from '@/components/reports/ActivityChart';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorState from '@/components/common/ErrorState';
import EmptyState from '@/components/common/EmptyState';
import { BarChart3 } from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const { user } = useAuth();
  const {
    filters,
    data,
    departments,
    isLoading,
    isExporting,
    error,
    setDateRange,
    setDepartmentId,
    setCustomDates,
    resetFilters,
    refetch,
    exportReport,
  } = useReports();

  const canChangeDepartment = user?.role === 'ADMIN';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 pb-6 border-b border-[#D8D7D1]">
        <div>
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-[#526A55]/10 text-[#526A55] rounded-2xl">
              <BarChart3 className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#292A27]">
                Reports & Analytics
              </h1>
              <p className="text-sm text-[#6B6A64] mt-1 font-medium">
                Monitor document activity, workflow performance, and organizational activity.
              </p>
            </div>
          </div>
        </div>

        {data?.generatedAt && (
          <div className="mt-4 sm:mt-0 text-xs text-[#6B6A64] font-medium bg-[#ECEAE3] px-3 py-1.5 rounded-xl border border-[#D8D7D1]/60">
            Last updated: <span className="text-[#292A27] font-semibold">{data.generatedAt}</span>
          </div>
        )}
      </div>

      {/* Report Filter Controls */}
      <ReportFilters
        filters={filters}
        departments={departments}
        isExporting={isExporting}
        canChangeDepartment={canChangeDepartment}
        onDateRangeChange={setDateRange}
        onDepartmentChange={setDepartmentId}
        onCustomDatesChange={setCustomDates}
        onReset={resetFilters}
        onExport={exportReport}
      />

      {/* Loading State */}
      {isLoading && (
        <div className="py-24 flex flex-col items-center justify-center">
          <LoadingSpinner size="lg" />
          <p className="mt-4 text-sm font-semibold text-[#6B6A64]">
            Loading report analytics...
          </p>
        </div>
      )}

      {/* Error State */}
      {!isLoading && error && (
        <div className="my-8">
          <ErrorState
            title="Unable to load reports."
            description={error}
            retryLabel="Try Again"
            onRetry={refetch}
          />
        </div>
      )}

      {/* Empty State */}
      {!isLoading && !error && (!data || !data.overview || data.overview.totalDocuments === 0) && (
        <div className="my-8">
          <EmptyState
            title="No analytics data available"
            description="No analytics data available for the selected period or department filter."
            actionLabel="Reset Filters"
            onAction={resetFilters}
          />
        </div>
      )}

      {/* Report Content */}
      {!isLoading && !error && data && data.overview.totalDocuments > 0 && (
        <div className="space-y-8">
          {/* Summary Metric Cards */}
          <ReportSummaryCards overview={data.overview} />

          {/* Document Statistics Section */}
          <DocumentStatsChart stats={data.documentStats} />

          {/* Approval Statistics Section */}
          <ApprovalStatsChart stats={data.approvalStats} />

          {/* Department Performance Breakdown */}
          {user?.role === 'ADMIN' && (
            <DepartmentStatsChart stats={data.departmentStats} />
          )}

          {/* Activity Trends */}
          <ActivityChart stats={data.activityStats} />
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
