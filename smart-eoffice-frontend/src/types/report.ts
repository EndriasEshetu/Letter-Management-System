import { DocumentStatus } from './document';

export type ReportDateRange = 'today' | '7days' | '30days' | '90days' | 'this_year' | 'custom';

export interface ReportFilters {
  dateRange: ReportDateRange;
  startDate?: string;
  endDate?: string;
  departmentId?: string;
}

export interface AnalyticsOverview {
  totalDocuments: number;
  pendingApprovals: number;
  approvedDocuments: number;
  rejectedDocuments: number;
  archivedDocuments: number;
  activeUsers: number;
  departmentsCount: number;
  totalDocumentsTrend?: string;
  pendingApprovalsTrend?: string;
  approvedTrend?: string;
  rejectedTrend?: string;
}

export interface DocumentsByStatus {
  status: DocumentStatus;
  label: string;
  count: number;
  percentage: number;
}

export interface DocumentsByCategory {
  category: string;
  count: number;
}

export interface DocumentTimelineItem {
  period: string;
  uploaded: number;
  approved: number;
  rejected: number;
}

export interface DocumentStats {
  byStatus: DocumentsByStatus[];
  byCategory: DocumentsByCategory[];
  timeline: DocumentTimelineItem[];
}

export interface ApprovalStats {
  pendingCount: number;
  approvedCount: number;
  rejectedCount: number;
  changesRequestedCount: number;
  avgDurationDays: number;
  approvalRatePercent: number;
  timeline: {
    period: string;
    approved: number;
    rejected: number;
    avgDurationHours: number;
  }[];
}

export interface DepartmentActivityItem {
  id: string | number;
  name: string;
  code: string;
  submitted: number;
  approved: number;
  rejected: number;
  pending: number;
  totalMembers: number;
}

export interface DepartmentStats {
  departments: DepartmentActivityItem[];
}

export interface ActivityTimelineItem {
  period: string;
  uploads: number;
  approvals: number;
  comments: number;
  archives: number;
}

export interface ActivityStats {
  timeline: ActivityTimelineItem[];
  byType: {
    type: string;
    label: string;
    count: number;
  }[];
}

export interface FullReportData {
  overview: AnalyticsOverview;
  documentStats: DocumentStats;
  approvalStats: ApprovalStats;
  departmentStats: DepartmentStats;
  activityStats: ActivityStats;
  filters: ReportFilters;
  generatedAt: string;
}

export type ReportExportFormat = 'csv' | 'pdf';
