import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from '@/pages/auth/Login';
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
import ProtectedRoute from '@/routes/ProtectedRoute';
import RoleRoute from '@/routes/RoleRoute';

export const AppRoutes: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public Route */}
        <Route path="/login" element={<Login />} />

        {/* Protected Routes (All Authenticated Roles) */}
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route
          path="/documents"
          element={
            <ProtectedRoute>
              <Documents />
            </ProtectedRoute>
          }
        />
        <Route
          path="/documents/:id"
          element={
            <ProtectedRoute>
              <DocumentDetails />
            </ProtectedRoute>
          }
        />
        <Route
          path="/documents/:id/preview"
          element={
            <ProtectedRoute>
              <DocumentPreview />
            </ProtectedRoute>
          }
        />
        <Route
          path="/archives"
          element={
            <ProtectedRoute>
              <Archives />
            </ProtectedRoute>
          }
        />

        {/* Role Protected Route: DEPARTMENT_MANAGER */}
        <Route
          path="/approvals"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={['DEPARTMENT_MANAGER']}>
                <ApprovalQueue />
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        {/* Role Protected Routes: ADMIN */}
        <Route
          path="/users"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={['ADMIN']}>
                <Users />
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/departments"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={['ADMIN']}>
                <Departments />
              </RoleRoute>
            </ProtectedRoute>
          }
        />
        <Route
          path="/audit-logs"
          element={
            <ProtectedRoute>
              <RoleRoute allowedRoles={['ADMIN']}>
                <AuditLogs />
              </RoleRoute>
            </ProtectedRoute>
          }
        />

        {/* Root Redirect */}
        <Route path="/" element={<Navigate to="/dashboard" replace />} />

        {/* Catch-all Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default AppRoutes;
