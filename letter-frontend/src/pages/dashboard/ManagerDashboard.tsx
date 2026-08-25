import React, { useEffect, useState } from 'react';
import dashboardService, { ManagerDashboardData } from '@/services/dashboardService';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import StatCard from '@/components/dashboard/StatCard';
import RecentDocumentsTable from '@/components/dashboard/RecentDocumentsTable';
import RecentActivityList from '@/components/dashboard/RecentActivityList';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorState from '@/components/common/ErrorState';

export const ManagerDashboard: React.FC = () => {
  const [data, setData] = useState<ManagerDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await dashboardService.getManagerDashboardData();
      setData(result);
    } catch (err: any) {
      setError(err.message || 'Failed to load manager dashboard metrics.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (isLoading) {
    return (
      <div className="py-16 flex justify-center items-center">
        <LoadingSpinner size="lg" label="Loading Department Manager Dashboard..." />
      </div>
    );
  }

  if (error) {
    return <ErrorState title="Dashboard Unavailable" description={error} onRetry={fetchData} />;
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <DashboardHeader
        title="Department Manager Overview"
        subtitle="Review pending letter approvals, monitor unit correspondence processing, and manage workflow sign-offs."
        roleBadge="DEPARTMENT MANAGER"
      />

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
        {data.stats.map((stat) => (
          <StatCard
            key={stat.id}
            title={stat.title}
            value={stat.value}
            description={stat.description}
            trend={stat.trend}
            trendType={stat.trendType}
            highlight={stat.highlight}
          />
        ))}
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Letters Requiring Approval */}
        <div className="lg:col-span-2">
          <RecentDocumentsTable
            documents={data.pendingApprovals}
            title="Letters Pending Approval"
            subtitle="Letters awaiting sign-off and verification"
            emptyTitle="No Pending Approvals"
            emptyDescription="All submitted department letters have been processed."
          />
        </div>

        {/* Right 1 Col: Department Recent Activities */}
        <div>
          <RecentActivityList
            activities={data.recentActivities}
            title="Unit Activity Stream"
          />
        </div>
      </div>
    </div>
  );
};

export default ManagerDashboard;
