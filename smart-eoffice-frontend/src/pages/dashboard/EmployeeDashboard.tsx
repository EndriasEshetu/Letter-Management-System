import React, { useEffect, useState } from 'react';
import dashboardService, { EmployeeDashboardData } from '@/services/dashboardService';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import StatCard from '@/components/dashboard/StatCard';
import RecentDocumentsTable from '@/components/dashboard/RecentDocumentsTable';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorState from '@/components/common/ErrorState';

export const EmployeeDashboard: React.FC = () => {
  const [data, setData] = useState<EmployeeDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await dashboardService.getEmployeeDashboardData();
      setData(result);
    } catch (err: any) {
      setError(err.message || 'Failed to load officer dashboard metrics.');
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
        <LoadingSpinner size="lg" label="Loading Officer Dashboard..." />
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
        title="Officer Dashboard"
        subtitle="Manage your personal document submissions, track approval status, and view recent activity."
        roleBadge="OFFICER"
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

      {/* Main Content Layout Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recently Authored / Verified Documents */}
        <RecentDocumentsTable
          documents={data.recentDocuments}
          title="Recent Documents"
          subtitle="Recently authored or updated records"
          emptyTitle="No Documents Found"
          emptyDescription="You haven't authored any documents yet."
        />

        {/* Pending Submissions */}
        <RecentDocumentsTable
          documents={data.pendingDocuments}
          title="Pending Submissions"
          subtitle="Documents currently in workflow review"
          emptyTitle="No Pending Submissions"
          emptyDescription="You have no documents currently awaiting review."
        />
      </div>
    </div>
  );
};

export default EmployeeDashboard;
