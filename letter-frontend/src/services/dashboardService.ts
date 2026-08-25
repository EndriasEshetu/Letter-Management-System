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
  pendingApprovals: RecentLetterItem[];
  recentActivities: ActivityItem[];
}

export interface EmployeeDashboardData {
  stats: DashboardStat[];
  recentLetters: RecentLetterItem[];
  pendingLetters: RecentLetterItem[];
}

// Mock service fallbacks for development
export const dashboardService = {
  async getAdminDashboardData(): Promise<AdminDashboardData> {
    await new Promise((res) => setTimeout(res, 200));

    return {
      stats: [
        {
          id: 'total_letters',
          title: 'Total Letters',
          value: '12,458',
          description: '+142 registered this week',
          trend: '+3.4%',
          trendType: 'positive',
        },
        {
          id: 'incoming',
          title: 'Incoming Letters',
          value: '4,812',
          description: 'Received from external entities',
          trend: '+2.1%',
          trendType: 'positive',
        },
        {
          id: 'pending',
          title: 'Pending Approval',
          value: '87',
          description: 'Awaiting review or sign-off',
          highlight: true,
          trendType: 'negative',
        },
        {
          id: 'overdue',
          title: 'Overdue Letters',
          value: '14',
          description: 'Past response deadline',
          highlight: true,
          trendType: 'negative',
        },
      ],
      recentActivities: [
        {
          id: 'act-1',
          user: 'Endrias Eshetu',
          action: 'Registered incoming letter from',
          target: 'Ministry of Finance (Ref: LMS/INC/2026/001)',
          timestamp: '15 minutes ago',
          type: 'registration',
        },
        {
          id: 'act-2',
          user: 'Abebe Kebede',
          action: 'Updated department permissions for',
          target: 'Finance & Planning Directorate',
          timestamp: '1 hour ago',
          type: 'security',
        },
        {
          id: 'act-3',
          user: 'System',
          action: 'Performed routine archive backup for',
          target: 'Letter Archive Volume 2026-Q1',
          timestamp: '3 hours ago',
          type: 'system',
        },
        {
          id: 'act-4',
          user: 'Sara Jenkins',
          action: 'Approved letter from',
          target: 'African Union Commission (Ref: LMS/INC/2026/033)',
          timestamp: '5 hours ago',
          type: 'approval',
        },
        {
          id: 'act-5',
          user: 'Tariku Bikila',
          action: 'Dispatched outgoing letter to',
          target: 'Huawei Technologies East Africa (Ref: LMS/OUT/2026/089)',
          timestamp: '6 hours ago',
          type: 'registration',
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
          id: 'pending_approval',
          title: 'Pending Approval',
          value: 42,
          description: 'Letters awaiting your sign-off',
          highlight: true,
        },
        {
          id: 'dept_letters',
          title: 'Department Letters',
          value: '3,840',
          description: 'Total letters in your department',
          trend: '+5.2%',
          trendType: 'positive',
        },
        {
          id: 'approved_month',
          title: 'Approved This Month',
          value: '1,204',
          description: 'Letters processed and approved',
          trend: '+18%',
          trendType: 'positive',
        },
        {
          id: 'overdue',
          title: 'Overdue Letters',
          value: '6',
          description: 'Past response deadline',
          highlight: true,
          trendType: 'negative',
        },
      ],
      pendingApprovals: [
        {
          id: 'ltr-1',
          referenceNumber: 'LMS/INC/2026/001',
          subject: 'Request for Budget Allocation – Q4 FY2026',
          department: 'Finance & Planning',
          status: 'PENDING_APPROVAL',
          date: 'Today, 09:42 AM',
          author: 'Endrias Eshetu',
          letterType: 'INCOMING',
        },
        {
          id: 'ltr-6',
          referenceNumber: 'LMS/INC/2026/078',
          subject: 'Zoning Amendment – Urban Development Plan Approval',
          department: 'Urban Development',
          status: 'PENDING_APPROVAL',
          date: 'Oct 19, 2026',
          author: 'Sara Jenkins',
          letterType: 'REQUEST',
        },
        {
          id: 'ltr-7',
          referenceNumber: 'LMS/OUT/2026/056',
          subject: 'Response to Staff Welfare Committee Grievances',
          department: 'Human Resources',
          status: 'PENDING_APPROVAL',
          date: 'Oct 21, 2026',
          author: 'Tariku Bikila',
          letterType: 'RESPONSE',
        },
      ],
      recentActivities: [
        {
          id: 'm-act-1',
          user: 'Sara Jenkins',
          action: 'Approved incoming letter from',
          target: 'African Union Commission (Ref: LMS/INC/2026/033)',
          timestamp: '10 minutes ago',
          type: 'approval',
        },
        {
          id: 'm-act-2',
          user: 'Michael K.',
          action: 'Added review note on',
          target: 'Audit Request – ICT FY2026 (Ref: LMS/INC/2026/021)',
          timestamp: '2 hours ago',
          type: 'comment',
        },
        {
          id: 'm-act-3',
          user: 'Endrias Eshetu',
          action: 'Forwarded letter to Director for approval:',
          target: 'Budget Allocation Request Q4 (Ref: LMS/INC/2026/001)',
          timestamp: '4 hours ago',
          type: 'registration',
        },
      ],
    };
  },

  async getEmployeeDashboardData(): Promise<EmployeeDashboardData> {
    await new Promise((res) => setTimeout(res, 200));

    return {
      stats: [
        {
          id: 'my_letters',
          title: 'My Letters',
          value: 24,
          description: 'Letters assigned to you',
        },
        {
          id: 'pending_action',
          title: 'Pending Action',
          value: 4,
          description: 'Letters requiring your response',
          highlight: true,
        },
        {
          id: 'completed',
          title: 'Completed',
          value: 18,
          description: 'Letters fully processed',
          trendType: 'positive',
        },
        {
          id: 'response_required',
          title: 'Response Required',
          value: 3,
          description: 'Awaiting your official response',
          highlight: true,
          trendType: 'negative',
        },
      ],
      recentLetters: [
        {
          id: 'ltr-4',
          referenceNumber: 'LMS/INC/2026/033',
          subject: 'Invitation – Regional ICT Innovation Summit 2026',
          department: 'ICT Governance',
          status: 'COMPLETED',
          date: 'Oct 23, 2026',
          author: 'You',
          letterType: 'INVITATION',
        },
        {
          id: 'ltr-2',
          referenceNumber: 'LMS/OUT/2026/089',
          subject: 'Official Response – ICT Infrastructure Partnership Proposal',
          department: 'ICT Governance',
          status: 'APPROVED',
          date: 'Oct 22, 2026',
          author: 'You',
          letterType: 'OUTGOING',
        },
        {
          id: 'ltr-3',
          referenceNumber: 'LMS/INT/2026/045',
          subject: 'Internal Memorandum – Staff Performance Review Schedule 2026',
          department: 'Human Resources',
          status: 'DISPATCHED',
          date: 'Sep 15, 2026',
          author: 'You',
          letterType: 'MEMORANDUM',
        },
      ],
      pendingLetters: [
        {
          id: 'ltr-1',
          referenceNumber: 'LMS/INC/2026/001',
          subject: 'Request for Budget Allocation – Q4 FY2026',
          department: 'Finance & Planning',
          status: 'PENDING_APPROVAL',
          date: 'Today, 09:42 AM',
          author: 'You',
          letterType: 'INCOMING',
        },
        {
          id: 'ltr-5',
          referenceNumber: 'LMS/INC/2026/021',
          subject: 'Audit Report Request – ICT Infrastructure Assessment FY2026',
          department: 'ICT Governance',
          status: 'UNDER_REVIEW',
          date: 'Oct 21, 2026',
          author: 'You',
          letterType: 'REQUEST',
        },
      ],
    };
  },
};

export default dashboardService;
