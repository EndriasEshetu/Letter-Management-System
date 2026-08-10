import { DocumentStatus } from '@/components/common/Badge';

export interface DashboardStat {
  id: string;
  title: string;
  value: string | number;
  description?: string;
  trend?: string;
  trendType?: 'positive' | 'negative' | 'neutral';
  highlight?: boolean; // For items requiring attention like Pending Approvals
}

export interface ActivityItem {
  id: string;
  user: string;
  avatar?: string;
  action: string;
  target: string;
  timestamp: string;
  type?: 'approval' | 'comment' | 'upload' | 'system' | 'security';
}

export interface RecentDocumentItem {
  id: string;
  documentNumber: string;
  title: string;
  department: string;
  status: DocumentStatus;
  date: string;
  author: string;
}

export interface AdminDashboardData {
  stats: DashboardStat[];
  recentActivities: ActivityItem[];
  systemHealth: {
    storageUsedPercent: number;
    activeSessions: number;
    uptimePercent: number;
  };
}

export interface ManagerDashboardData {
  stats: DashboardStat[];
  pendingApprovals: RecentDocumentItem[];
  recentActivities: ActivityItem[];
}

export interface EmployeeDashboardData {
  stats: DashboardStat[];
  recentDocuments: RecentDocumentItem[];
  pendingDocuments: RecentDocumentItem[];
}

// Mock service fallbacks for development (can be connected to backend APIs)
export const dashboardService = {
  async getAdminDashboardData(): Promise<AdminDashboardData> {
    // Simulated short delay for UI verification
    await new Promise((res) => setTimeout(res, 200));

    return {
      stats: [
        {
          id: 'users',
          title: 'Total Users',
          value: '1,248',
          description: '+12 registered this month',
          trend: '+1.0%',
          trendType: 'positive',
        },
        {
          id: 'departments',
          title: 'Total Departments',
          value: '18',
          description: 'Across SITA governance units',
          trendType: 'neutral',
        },
        {
          id: 'documents',
          title: 'Total Documents',
          value: '12,458',
          description: '+142 uploaded this week',
          trend: '+3.4%',
          trendType: 'positive',
        },
        {
          id: 'system',
          title: 'System Activity',
          value: '99.8%',
          description: 'All services operational',
          trendType: 'positive',
        },
      ],
      recentActivities: [
        {
          id: 'act-1',
          user: 'Endrias Eshetu',
          action: 'Created user account for',
          target: 'Tariku Bikila (ICT Specialist)',
          timestamp: '15 minutes ago',
          type: 'system',
        },
        {
          id: 'act-2',
          user: 'Abebe Kebede',
          action: 'Updated department permissions for',
          target: 'Public Works & Infrastructure',
          timestamp: '1 hour ago',
          type: 'security',
        },
        {
          id: 'act-3',
          user: 'System Admin',
          action: 'Performed routine archive backup',
          target: 'Archive Volume 2026-Q1',
          timestamp: '3 hours ago',
          type: 'system',
        },
        {
          id: 'act-4',
          user: 'Sara Jenkins',
          action: 'Approved structural change request for',
          target: 'Doc #DOC-2026-0891',
          timestamp: '5 hours ago',
          type: 'approval',
        },
      ],
      systemHealth: {
        storageUsedPercent: 68,
        activeSessions: 142,
        uptimePercent: 99.98,
      },
    };
  },

  async getManagerDashboardData(): Promise<ManagerDashboardData> {
    await new Promise((res) => setTimeout(res, 200));

    return {
      stats: [
        {
          id: 'pending',
          title: 'Pending Approvals',
          value: 42,
          description: 'Requires immediate attention',
          highlight: true,
        },
        {
          id: 'dept_docs',
          title: 'Department Documents',
          value: '3,840',
          description: 'Across 4 internal units',
          trend: '+5.2%',
          trendType: 'positive',
        },
        {
          id: 'approved_month',
          title: 'Approved This Month',
          value: '1,204',
          description: 'Processed by department managers',
          trend: '+18%',
          trendType: 'positive',
        },
        {
          id: 'archived',
          title: 'Archived Documents',
          value: '8,392',
          description: 'Historical official records',
          trendType: 'neutral',
        },
      ],
      pendingApprovals: [
        {
          id: 'doc-1',
          documentNumber: 'DOC-2026-0891',
          title: 'Q3 Infrastructure Modernization Report v2.4',
          department: 'Public Works',
          status: 'PENDING_APPROVAL',
          date: 'Oct 24, 2026',
          author: 'Endrias Eshetu',
        },
        {
          id: 'doc-2',
          documentNumber: 'DOC-2026-0885',
          title: 'Budget Allocation FY26 Draft Proposal',
          department: 'Finance & Planning',
          status: 'PENDING_APPROVAL',
          date: 'Oct 21, 2026',
          author: 'Tariku Bikila',
        },
        {
          id: 'doc-3',
          documentNumber: 'DOC-2026-0870',
          title: 'Zoning Amendment Urban Development Plan',
          department: 'Urban Development',
          status: 'PENDING_APPROVAL',
          date: 'Oct 19, 2026',
          author: 'Sara Jenkins',
        },
      ],
      recentActivities: [
        {
          id: 'm-act-1',
          user: 'Sara Jenkins',
          action: 'Approved document',
          target: 'Zoning Map C Revision',
          timestamp: '10 minutes ago',
          type: 'approval',
        },
        {
          id: 'm-act-2',
          user: 'Michael K.',
          action: 'Added review note on',
          target: 'Budget Draft FY26',
          timestamp: '2 hours ago',
          type: 'comment',
        },
        {
          id: 'm-act-3',
          user: 'Endrias Eshetu',
          action: 'Submitted new version of',
          target: 'Q3 Infrastructure Report',
          timestamp: '4 hours ago',
          type: 'upload',
        },
      ],
    };
  },

  async getEmployeeDashboardData(): Promise<EmployeeDashboardData> {
    await new Promise((res) => setTimeout(res, 200));

    return {
      stats: [
        {
          id: 'my_docs',
          title: 'My Documents',
          value: 156,
          description: 'Authored or owned by you',
        },
        {
          id: 'in_review',
          title: 'Pending Sign-off',
          value: 4,
          description: 'Submitted for manager review',
          highlight: true,
        },
        {
          id: 'approved_my',
          title: 'Approved Documents',
          value: 148,
          description: 'Official verified records',
          trendType: 'positive',
        },
        {
          id: 'archived_my',
          title: 'Archived Documents',
          value: 24,
          description: 'Stored in archive vault',
          trendType: 'neutral',
        },
      ],
      recentDocuments: [
        {
          id: 'rdoc-1',
          documentNumber: 'DOC-2026-0890',
          title: 'City Council Minutes - Oct Session',
          department: 'City Clerk',
          status: 'APPROVED',
          date: 'Oct 23, 2026',
          author: 'You',
        },
        {
          id: 'rdoc-2',
          documentNumber: 'DOC-2026-0888',
          title: 'SITA Tech Innovation Grant Summary',
          department: 'ICT & Innovation',
          status: 'APPROVED',
          date: 'Oct 22, 2026',
          author: 'You',
        },
        {
          id: 'rdoc-3',
          documentNumber: 'DOC-2026-0850',
          title: 'Annual Procurement Guidelines 2026',
          department: 'Procurement',
          status: 'ARCHIVED',
          date: 'Sep 15, 2026',
          author: 'You',
        },
      ],
      pendingDocuments: [
        {
          id: 'pdoc-1',
          documentNumber: 'DOC-2026-0891',
          title: 'Q3 Infrastructure Modernization Report v2.4',
          department: 'Public Works',
          status: 'PENDING_APPROVAL',
          date: 'Oct 24, 2026',
          author: 'You',
        },
        {
          id: 'pdoc-2',
          documentNumber: 'DOC-2026-0885',
          title: 'Budget Allocation FY26 Draft Proposal',
          department: 'Finance & Planning',
          status: 'PENDING_APPROVAL',
          date: 'Oct 21, 2026',
          author: 'You',
        },
      ],
    };
  },
};

export default dashboardService;
