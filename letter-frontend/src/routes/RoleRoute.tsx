import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Role } from '@/types/auth';
import AccessDenied from '@/components/common/AccessDenied';

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

    return <AccessDenied role={user.role} />;
  }

  return children ? <>{children}</> : <Outlet />;
};

export default RoleRoute;
