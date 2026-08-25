import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Login from '@/pages/auth/Login';
import LandingPage from '@/pages/LandingPage';
import Dashboard from '@/pages/dashboard/Dashboard';
import Profile from '@/pages/profile/Profile';
import { Letters, LetterDetails, LetterPreview, LetterTracking } from '@/pages/letters';
import MyTasks from '@/pages/tasks/MyTasks';
import Archives from '@/pages/archives/Archives';
import ApprovalQueue from '@/pages/approvals/ApprovalQueue';
import Users from '@/pages/users/Users';
import Departments from '@/pages/departments/Departments';
import AuditLogs from '@/pages/audit/AuditLogs';
import ReportsPage from '@/pages/reports/ReportsPage';
import ProtectedRoute from '@/routes/ProtectedRoute';
import RoleRoute from '@/routes/RoleRoute';
import AppShell from '@/components/layout/AppShell';

// Scroll to top on route change helper
const ScrollToTop: React.FC = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [pathname]);
  return null;
};

export const AppRoutes: React.FC = () => {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />

        {/* Protected App Shell Layout */}
        <Route
          element={
            <ProtectedRoute>
              <AppShell />
            </ProtectedRoute>
          }
        >
          {/* Authenticated Routes (All Roles) */}
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/tasks" element={<MyTasks />} />
          <Route path="/letters" element={<Letters />} />
          <Route path="/letters/track" element={<LetterTracking />} />
          <Route path="/letters/:id" element={<LetterDetails />} />
          <Route path="/letters/:id/preview" element={<LetterPreview />} />
          <Route path="/archives" element={<Archives />} />
          <Route path="/reports" element={<ReportsPage />} />

          {/* Role Protected Route: DEPARTMENT_MANAGER & ADMIN */}
          <Route
            path="/approvals"
            element={
              <RoleRoute allowedRoles={['DEPARTMENT_MANAGER', 'ADMIN']}>
                <ApprovalQueue />
              </RoleRoute>
            }
          />

          {/* Role Protected Routes: ADMIN */}
          <Route
            path="/users"
            element={
              <RoleRoute allowedRoles={['ADMIN']}>
                <Users />
              </RoleRoute>
            }
          />
          <Route
            path="/departments"
            element={
              <RoleRoute allowedRoles={['ADMIN']}>
                <Departments />
              </RoleRoute>
            }
          />
          <Route
            path="/audit-logs"
            element={
              <RoleRoute allowedRoles={['ADMIN']}>
                <AuditLogs />
              </RoleRoute>
            }
          />

          {/* Legacy redirects — keep old /documents paths working */}
          <Route path="/documents" element={<Navigate to="/letters" replace />} />
          <Route path="/documents/:id" element={<Navigate to="/letters" replace />} />
          <Route path="/documents/:id/preview" element={<Navigate to="/letters" replace />} />
        </Route>

        {/* Root Redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Catch-all Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
