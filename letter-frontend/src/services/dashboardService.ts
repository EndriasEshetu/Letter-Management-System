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
  recentRegistrations: RecentLetterItem[];
  pendingDispatches: RecentLetterItem[];
  recentActivities: ActivityItem[];
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
          id: 'incoming_routing',
          title: 'Incoming Awaiting Routing',
          value: '5',
          description: 'Registered by Registry Officer, needs department routing',
          highlight: true,
          trendType: 'negative',
        },
        {
          id: 'outgoing_reg',
          title: 'Outgoing Awaiting Ref #',
          value: '3',
          description: 'Manager approved, needs official OUT reference #',
          highlight: true,
          trendType: 'neutral',
        },
        {
          id: 'internal_routing',
          title: 'Internal Awaiting Routing',
          value: '2',
          description: 'Approved memo awaiting routing to receiving dept',
          trendType: 'neutral',
        },
        {
          id: 'overdue_org',
          title: 'Organization Overdue',
          value: '4',
          description: 'Letters past action or response deadline',
          highlight: true,
          trendType: 'negative',
        },
      ],
      recentActivities: [
        {
          id: 'act-1',
          user: 'Abebe Demissie (Registry)',
          action: 'Registered incoming letter from',
          target: 'Ministry of Finance (Ref: IN/2026/00452)',
          timestamp: '15 minutes ago',
          type: 'registration',
        },
        {
          id: 'act-2',
          user: 'Main Administrator',
          action: 'Routed letter IN/2026/00452 to',
          target: 'ICT Governance Directorate',
          timestamp: '45 minutes ago',
          type: 'system',
        },
        {
          id: 'act-3',
          user: 'Tigist Haile (ICT Manager)',
          action: 'Approved outgoing response',
          target: 'Response to MOF (Ref: OUT/2026/00891)',
          timestamp: '2 hours ago',
          type: 'approval',
        },
        {
          id: 'act-4',
          user: 'Tariku Bikila (Dispatch)',
          action: 'Dispatched official email to',
          target: 'Ministry of Finance (Ref: OUT/2026/00891)',
          timestamp: '3 hours ago',
          type: 'registration',
        },
      ],
      systemHealth: {
        storageUsedPercent: 64,
        activeSessions: 128,
        uptimePercent: 99.98,
      },
    };
  },

  async getRegistryDashboardData(): Promise<RegistryDashboardData> {
    await new Promise((res) => setTimeout(res, 200));

    return {
      stats: [
        {
          id: 'registered_today',
          title: 'Registered Today',
          value: '18',
          description: 'Incoming letters verified and uploaded',
          trend: '+4 vs yesterday',
          trendType: 'positive',
        },
        {
          id: 'awaiting_admin',
          title: 'Awaiting Admin Routing',
          value: '5',
          description: 'Sent to Main Admin for department selection',
          highlight: true,
        },
        {
          id: 'ready_dispatch',
          title: 'Ready for Dispatch',
          value: '3',
          description: 'Approved outgoing letters awaiting dispatch recording',
          highlight: true,
        },
        {
          id: 'dispatched_week',
          title: 'Dispatched This Week',
          value: '42',
          description: 'Sent via Official Email, Courier, or Hand Delivery',
          trendType: 'positive',
        },
      ],
      recentRegistrations: [
        {
          id: 'ltr-5',
          referenceNumber: 'IN/2026/00501',
          subject: 'Annual Compliance Audit Notification FY2026',
          department: 'Unassigned',
          status: 'REGISTERED',
          date: 'Today, 08:45 AM',
          author: 'Abebe Demissie',
          letterType: 'NOTIFICATION',
        },
        {
          id: 'ltr-1',
          referenceNumber: 'IN/2026/00452',
          subject: 'Request for Digital Transformation Progress Report',
          department: 'ICT Governance',
          status: 'IN_PROGRESS',
          date: 'Aug 20, 2026',
          author: 'Abebe Demissie',
          letterType: 'REQUEST',
        },
      ],
      pendingDispatches: [
        {
          id: 'ltr-2',
          referenceNumber: 'OUT/2026/00891',
          subject: 'Official Response – SITA Digital Transformation Progress',
          department: 'ICT Governance',
          status: 'READY_FOR_DISPATCH',
          date: 'Today, 09:15 AM',
          author: 'Endrias Eshetu',
          letterType: 'RESPONSE',
        },
      ],
      recentActivities: [
        {
          id: 'act-r1',
          user: 'Abebe Demissie',
          action: 'Registered Incoming Letter',
          target: 'IN/2026/00501 (Ministry of Innovation)',
          timestamp: '15 minutes ago',
          type: 'registration',
        },
        {
          id: 'act-r2',
          user: 'Abebe Demissie',
          action: 'Recorded Dispatch',
          target: 'OUT/2026/00891 via Official Email',
          timestamp: '1 hour ago',
          type: 'system',
        },
        {
          id: 'act-r3',
          user: 'Main Administrator',
          action: 'Routed Incoming Letter',
          target: 'IN/2026/00452 → ICT Governance',
          timestamp: '2 hours ago',
          type: 'approval',
        },
      ],
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
