import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from '@/pages/auth/Login';
import LandingPage from '@/pages/LandingPage';
import Dashboard from '@/pages/dashboard/Dashboard';
import Profile from '@/pages/profile/Profile';
import Documents from '@/pages/documents/Documents';
import DocumentDetails from '@/pages/documents/DocumentDetails';
import DocumentPreview from '@/pages/documents/DocumentPreview';
import Archives from '@/pages/archives/Archives';
import ApprovalQueue from '@/pages/approvals/ApprovalQueue';
import Users from '@/pages/users/Users';
import Departments from '@/pages/departments/Departments';
import AuditLogs from '@/pages/audit/AuditLogs';
import ReportsPage from '@/pages/reports/ReportsPage';
import ProtectedRoute from '@/routes/ProtectedRoute';
import RoleRoute from '@/routes/RoleRoute';
import AppShell from '@/components/layout/AppShell';

export const AppRoutes: React.FC = () => {
  return (
    <BrowserRouter>
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
          <Route path="/documents" element={<Documents />} />
          <Route path="/documents/:id" element={<DocumentDetails />} />
          <Route path="/documents/:id/preview" element={<DocumentPreview />} />
          <Route path="/archives" element={<Archives />} />
          <Route path="/reports" element={<ReportsPage />} />

          {/* Role Protected Route: DEPARTMENT_MANAGER */}
          <Route
            path="/approvals"
            element={
              <RoleRoute allowedRoles={['DEPARTMENT_MANAGER']}>
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
