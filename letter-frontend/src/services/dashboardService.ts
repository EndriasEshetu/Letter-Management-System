import api from './api';
import { LetterStatus } from '@/components/common/Badge';

export interface DashboardStat {
  id: string;
  title: string;
  value: string | number;
  description?: string;
  trend?: string;
  trendType?: 'positive' | 'negative' | 'neutral';
  highlight?: boolean;
}

export interface ActivityItem {
  id: string;
  user: string;
  avatar?: string;
  action: string;
  target: string;
  timestamp: string;
  type?: 'approval' | 'comment' | 'registration' | 'system' | 'security';
}

export interface RecentLetterItem {
  id: string;
  referenceNumber: string;
  subject: string;
  department: string;
  status: LetterStatus;
  date: string;
  author: string;
  letterType?: string;
}

export interface RegistryDashboardData {
  stats: DashboardStat[];
  recentRegistrations?: RecentLetterItem[];
  pendingDispatches?: RecentLetterItem[];
  recentActivities?: ActivityItem[];
}

export interface AdminDashboardData {
  stats: DashboardStat[];
  recentActivities?: ActivityItem[];
  systemHealth?: {
    storageUsedPercent: number;
    activeSessions: number;
    uptimePercent: number;
  };
}

export interface ManagerDashboardData {
  stats: DashboardStat[];
  pendingApprovals?: RecentLetterItem[];
  recentActivities?: ActivityItem[];
}

export interface EmployeeDashboardData {
  stats: DashboardStat[];
  recentLetters?: RecentLetterItem[];
  pendingLetters?: RecentLetterItem[];
}

export const dashboardService = {
  async getAdminDashboardData(): Promise<AdminDashboardData> {
    const response = await api.get<AdminDashboardData>('/dashboard/admin');
    return response.data;
  },

  async getRegistryDashboardData(): Promise<RegistryDashboardData> {
    const response = await api.get<RegistryDashboardData>('/dashboard/registry');
    return response.data;
  },

  async getManagerDashboardData(): Promise<ManagerDashboardData> {
    const response = await api.get<ManagerDashboardData>('/dashboard/manager');
    return response.data;
  },

  async getEmployeeDashboardData(): Promise<EmployeeDashboardData> {
    const response = await api.get<EmployeeDashboardData>('/dashboard/employee');
    return response.data;
  },
};

export default dashboardService;
