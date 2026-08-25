import React, { useEffect, useState } from 'react';
import dashboardService, { AdminDashboardData } from '@/services/dashboardService';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import StatCard from '@/components/dashboard/StatCard';
import RecentActivityList from '@/components/dashboard/RecentActivityList';
import Card from '@/components/common/Card';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorState from '@/components/common/ErrorState';

export const AdminDashboard: React.FC = () => {
  const [data, setData] = useState<AdminDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await dashboardService.getAdminDashboardData();
      setData(result);
    } catch (err: any) {
      setError(err.message || 'Failed to load administrator dashboard metrics.');
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
        <LoadingSpinner size="lg" label="Loading Administrator Dashboard..." />
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
        title="System Administration Dashboard"
        subtitle="SITA Letter Management System governance metrics, correspondence volume, and audit log activity."
        roleBadge="ADMINISTRATOR"
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: System Activity Stream */}
        <div className="lg:col-span-2">
          <RecentActivityList
            activities={data.recentActivities}
            title="Letter Operations & System Audit Trail"
          />
        </div>

        {/* Right 1 Col: Infrastructure & Health Summary */}
        <div className="space-y-6">
          <Card className="space-y-4 bg-[#ECEAE3]">
            <h3 className="text-base font-semibold text-[#292A27]">Vault Capacity & Health</h3>
            
            <div className="space-y-3 text-xs">
              <div>
                <div className="flex justify-between font-medium text-[#292A27] mb-1">
                  <span>Letter Vault Storage Used</span>
                  <span>{data.systemHealth.storageUsedPercent}%</span>
                </div>
                <div className="w-full bg-[#D8D7D1] h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-[#526A55] h-full rounded-full transition-all duration-300"
                    style={{ width: `${data.systemHealth.storageUsedPercent}%` }}
                  />
                </div>
              </div>

              <div className="pt-2 border-t border-[#D8D7D1]/60 flex items-center justify-between">
                <span className="text-[#6B6A64]">Active User Sessions</span>
                <span className="font-semibold text-[#292A27]">{data.systemHealth.activeSessions}</span>
              </div>

              <div className="pt-2 border-t border-[#D8D7D1]/60 flex items-center justify-between">
                <span className="text-[#6B6A64]">System Uptime</span>
                <span className="font-semibold text-[#4A6B4E]">{data.systemHealth.uptimePercent}%</span>
              </div>
            </div>
          </Card>

          <Card className="space-y-3 bg-[#F9F8F5]">
            <h3 className="text-sm font-semibold text-[#292A27]">Admin Quick Reference</h3>
            <p className="text-xs text-[#6B6A64]">
              Manage department workflows, user credentials, and security levels from the left navigation bar.
            </p>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
