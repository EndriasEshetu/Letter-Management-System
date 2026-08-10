import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import AppShell from '@/components/layout/AppShell';
import LandingPage from '@/pages/LandingPage';

/**
 * Main Application Routing Architecture
 * Phase 1 establishes the root route (/) and routing structure.
 * Future phases will append protected routes (/login, /dashboard, /documents, etc.)
 */
export const AppRoutes: React.FC = () => {
  return (
    <BrowserRouter>
      <AppShell>
        <Routes>
          {/* Phase 1 Landing / Welcome Screen */}
          <Route path="/" element={<LandingPage />} />

          {/* 
            Phase 2+ Future Route Architecture Placeholders:
            <Route path="/login" element={<LoginPage />} />
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route path="/documents" element={<DocumentsPage />} />
            <Route path="/approvals" element={<ApprovalsPage />} />
            <Route path="/users" element={<UsersPage />} />
            <Route path="/departments" element={<DepartmentsPage />} />
            <Route path="/archives" element={<ArchivesPage />} />
            <Route path="/audit-logs" element={<AuditLogsPage />} />
          */}

          {/* Catch-all redirect to root */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AppShell>
    </BrowserRouter>
  );
};

export default AppRoutes;
