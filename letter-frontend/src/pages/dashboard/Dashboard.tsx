import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import AdminDashboard from './AdminDashboard';
import ManagerDashboard from './ManagerDashboard';
import EmployeeDashboard from './EmployeeDashboard';

export const Dashboard: React.FC = () => {
  const { user } = useAuth();

  switch (user?.role) {
    case 'ADMIN':
      return <AdminDashboard />;
    case 'DEPARTMENT_MANAGER':
      return <ManagerDashboard />;
    case 'EMPLOYEE':
    default:
      return <EmployeeDashboard />;
  }
};

export default Dashboard;
