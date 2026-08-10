import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';

export const Dashboard: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const getRoleBadgeStyle = (role?: string) => {
    switch (role) {
      case 'ADMIN':
        return 'bg-[#8B3232]/10 text-[#8B3232] border-[#8B3232]/20';
      case 'DEPARTMENT_MANAGER':
        return 'bg-[#C48D3F]/10 text-[#8A5D19] border-[#C48D3F]/20';
      default:
        return 'bg-[#526A55]/10 text-[#526A55] border-[#526A55]/20';
    }
  };

  return (
    <div className="max-w-5xl mx-auto flex flex-col justify-center items-center py-6">
        <Card className="max-w-xl w-full text-center space-y-6">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-[#526A55]/10 text-[#526A55] rounded-2xl mx-auto mb-2">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-[#6B6A64]">Phase 2 Authenticated Shell</span>
            <h2 className="text-2xl md:text-3xl font-semibold text-[#292A27] mt-1">Smart E-Office</h2>
          </div>

          <div className="py-4 border-y border-[#D8D7D1]/60 space-y-2">
            <p className="text-lg font-medium text-[#292A27]">
              Welcome, <span className="font-semibold text-[#526A55]">{user?.full_name || 'User'}</span>
            </p>
            <div className="flex items-center justify-center space-x-2">
              <span className="text-xs text-[#6B6A64]">Role:</span>
              <span className={`text-xs font-semibold px-3 py-1 rounded-full border ${getRoleBadgeStyle(user?.role)}`}>
                {user?.role || 'EMPLOYEE'}
              </span>
            </div>
            {user?.email && <p className="text-xs text-[#6B6A64]">{user.email}</p>}
            {user?.department_name && (
              <p className="text-xs font-medium text-[#292A27]">Department: {user.department_name}</p>
            )}
          </div>

          <p className="text-xs text-[#8A8983] italic">
            Authentication and user context state re-hydration verified successfully.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="primary" onClick={() => navigate('/profile')}>
              Manage Password & Profile
            </Button>
            <Button variant="secondary" onClick={handleLogout}>
              Logout
            </Button>
          </div>
        </Card>
    </div>
  );
};

export default Dashboard;
