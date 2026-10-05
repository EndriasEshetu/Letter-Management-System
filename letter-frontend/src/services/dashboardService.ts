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

function normalizeActivity(item: Record<string, unknown>): ActivityItem {
  return {
    id: String(item.id ?? ''),
    user: String(item.user ?? item.userName ?? 'System'),
    avatar: item.avatar ? String(item.avatar) : undefined,
    action: String(item.action ?? ''),
    target: String(item.target ?? item.entityType ?? ''),
    timestamp: String(item.timestamp ?? ''),
    type: item.type as ActivityItem['type'],
  };
}

function normalizeAdminPayload(raw: unknown): AdminDashboardData {
  const data = (raw && typeof raw === 'object' ? raw : {}) as Record<string, unknown>;
  const activities = Array.isArray(data.recentActivities) ? data.recentActivities : [];
  return {
    stats: Array.isArray(data.stats) ? (data.stats as DashboardStat[]) : [],
    recentActivities: activities.map((item) =>
      normalizeActivity((item && typeof item === 'object' ? item : {}) as Record<string, unknown>),
    ),
    systemHealth: (data.systemHealth as AdminDashboardData['systemHealth']) ?? undefined,
  };
}

export const dashboardService = {
  async getAdminDashboardData(): Promise<AdminDashboardData> {
    const response = await api.get<AdminDashboardData>('/dashboard/admin');
    return normalizeAdminPayload(response.data);
  },

  async getRegistryDashboardData(): Promise<RegistryDashboardData> {
    const response = await api.get<RegistryDashboardData>('/dashboard/registry');
    const data = response.data ?? ({} as RegistryDashboardData);
    return { ...data, stats: data.stats ?? [] };
  },

  async getManagerDashboardData(): Promise<ManagerDashboardData> {
    const response = await api.get<ManagerDashboardData>('/dashboard/manager');
    const data = response.data ?? ({} as ManagerDashboardData);
    return { ...data, stats: data.stats ?? [] };
  },

  async getEmployeeDashboardData(): Promise<EmployeeDashboardData> {
    const response = await api.get<EmployeeDashboardData>('/dashboard/employee');
    const data = response.data ?? ({} as EmployeeDashboardData);
    return { ...data, stats: data.stats ?? [] };
  },
};

export default dashboardService;
