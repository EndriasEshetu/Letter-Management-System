import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Role } from '@/types/auth';
import Card from '@/components/common/Card';
import Button from '@/components/common/Button';

interface RoleRouteProps {
  allowedRoles: Role[];
  children?: React.ReactNode;
  fallbackToDashboard?: boolean;
}

export const RoleRoute: React.FC<RoleRouteProps> = ({
  allowedRoles,
  children,
  fallbackToDashboard = false,
}) => {
  const { user, isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />;
  }

  const isAuthorized = allowedRoles.includes(user.role);

  if (!isAuthorized) {
    if (fallbackToDashboard) {
      return <Navigate to="/dashboard" replace />;
    }

    return (
      <div className="min-h-screen bg-[#F5F3ED] flex items-center justify-center p-6">
        <Card className="max-w-md w-full text-center space-y-4">
          <div className="w-14 h-14 bg-[#8B3232]/10 text-[#8B3232] rounded-2xl flex items-center justify-center mx-auto">
            <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-[#292A27]">Access Restricted</h2>
          <p className="text-sm text-[#6B6A64]">
            Your role (<strong className="text-[#292A27]">{user.role}</strong>) does not have permission to view this section.
          </p>
          <div className="pt-2">
            <Button onClick={() => (window.location.href = '/dashboard')} variant="secondary" fullWidth>
              Return to Dashboard
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  return children ? <>{children}</> : <Outlet />;
};

export default RoleRoute;
