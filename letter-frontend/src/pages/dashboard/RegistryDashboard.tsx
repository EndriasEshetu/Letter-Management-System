import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import dashboardService, { RegistryDashboardData } from '@/services/dashboardService';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import StatCard from '@/components/dashboard/StatCard';
import RecentActivityList from '@/components/dashboard/RecentActivityList';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorState from '@/components/common/ErrorState';
import { RegisterLetterModal } from '@/components/letters';
import { LetterDirection } from '@/types/letter';

export const RegistryDashboard: React.FC = () => {
  const navigate = useNavigate();
  const [data, setData] = useState<RegistryDashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [registerDirection, setRegisterDirection] = useState<LetterDirection | undefined>('INCOMING');

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const result = await dashboardService.getRegistryDashboardData();
      setData(result);
    } catch (err: any) {
      setError(err.message || 'Failed to load registry dashboard metrics.');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenRegister = (dir: LetterDirection) => {
    setRegisterDirection(dir);
    setIsRegisterOpen(true);
  };

  if (isLoading) {
    return (
      <div className="py-16 flex justify-center items-center">
        <LoadingSpinner size="lg" label="Loading Central Registry Dashboard..." />
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
        title="Central Registry Dashboard"
        subtitle="Manage official letter registration, reference numbering, incoming scanning, and courier dispatch."
        roleBadge="REGISTRY OFFICER"
      />

      {/* Quick Action Bar */}
      <div className="flex items-center space-x-3 bg-[#ECEAE3] p-4 rounded-2xl border border-[#D8D7D1]">
        <span className="text-xs font-bold uppercase tracking-wider text-[#292A27]">Quick Actions:</span>
        <Button variant="primary" size="sm" onClick={() => handleOpenRegister('INCOMING')}>
          📥 Register Incoming Letter
        </Button>
        <Button variant="secondary" size="sm" onClick={() => handleOpenRegister('OUTGOING')}>
          📤 Register Outgoing Letter
        </Button>
        <Button variant="outline" size="sm" onClick={() => navigate('/letters/track')}>
          🔍 Track Reference Number
        </Button>
      </div>

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
        {/* Left 2 Cols: Activity Stream */}
        <div className="lg:col-span-2 space-y-6">
          <RecentActivityList
            activities={data.recentActivities}
            title="Registry Operations & Letter Log"
          />
        </div>

        {/* Right 1 Col: Registry Tasks & Quick Links */}
        <div className="space-y-6">
          <Card>
            <h3 className="text-sm font-bold text-[#292A27] mb-3">Registry Workflow Tasks</h3>
            <div className="space-y-2 text-xs">
              <div
                onClick={() => navigate('/letters?direction=INCOMING&status=REGISTERED')}
                className="p-3 rounded-xl bg-[#526A55]/10 border border-[#526A55]/20 flex items-center justify-between cursor-pointer hover:bg-[#526A55]/15 transition-colors"
              >
                <div>
                  <p className="font-bold text-[#526A55]">Pending Admin Routing</p>
                  <p className="text-[#6B6A64]">Newly registered incoming letters</p>
                </div>
                <span className="text-lg font-bold text-[#526A55]">3</span>
              </div>

              <div
                onClick={() => navigate('/letters?direction=OUTGOING&status=APPROVED')}
                className="p-3 rounded-xl bg-[#C48D3F]/10 border border-[#C48D3F]/20 flex items-center justify-between cursor-pointer hover:bg-[#C48D3F]/15 transition-colors"
              >
                <div>
                  <p className="font-bold text-[#8A5D19]">Ready for Dispatch</p>
                  <p className="text-[#6B6A64]">Approved outgoing correspondence</p>
                </div>
                <span className="text-lg font-bold text-[#8A5D19]">2</span>
              </div>

              <div
                onClick={() => navigate('/letters?direction=INTERNAL')}
                className="p-3 rounded-xl bg-[#6B5A8E]/10 border border-[#6B5A8E]/20 flex items-center justify-between cursor-pointer hover:bg-[#6B5A8E]/15 transition-colors"
              >
                <div>
                  <p className="font-bold text-[#4A3A6B]">Internal Memos</p>
                  <p className="text-[#6B6A64]">Registered internal correspondence</p>
                </div>
                <span className="text-lg font-bold text-[#4A3A6B]">4</span>
              </div>
            </div>
          </Card>

          <Card className="bg-[#ECEAE3]">
            <h3 className="text-sm font-bold text-[#292A27] mb-2">Standard Numbering Formats</h3>
            <div className="space-y-2 text-xs text-[#6B6A64]">
              <div>
                <span className="font-mono font-bold text-[#526A55]">IN/YYYY/NNNNN</span>
                <p className="text-[11px]">Incoming external correspondence</p>
              </div>
              <div>
                <span className="font-mono font-bold text-[#C48D3F]">OUT/YYYY/NNNNN</span>
                <p className="text-[11px]">Outgoing external correspondence</p>
              </div>
              <div>
                <span className="font-mono font-bold text-[#6B5A8E]">INT/YYYY/NNNNN</span>
                <p className="text-[11px]">Inter-departmental internal memos</p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Register Modal */}
      <RegisterLetterModal
        open={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onSuccess={fetchData}
        initialDirection={registerDirection}
      />
    </div>
  );
};

export default RegistryDashboard;
