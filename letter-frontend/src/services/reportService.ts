import api from './api';
import {
  ReportFilters,
  AnalyticsOverview,
  DocumentStats,
  ApprovalStats,
  DepartmentStats,
  ActivityStats,
  FullReportData,
  ReportExportFormat,
} from '@/types/report';

/**
 * Dynamic Mock Aggregator for Offline / Development Fallback Mode
 */
function getMockReportData(filters: ReportFilters): FullReportData {
  const isFilteredDept = Boolean(filters.departmentId && filters.departmentId !== 'all');
  const multiplier = isFilteredDept ? 0.25 : 1.0;

  let timeScale = 1.0;
  switch (filters.dateRange) {
    case 'today':
      timeScale = 0.05;
      break;
    case '7days':
      timeScale = 0.2;
      break;
    case '30days':
      timeScale = 0.5;
      break;
    case '90days':
      timeScale = 0.8;
      break;
    case 'this_year':
      timeScale = 1.0;
      break;
    default:
      timeScale = 0.5;
  }

  const baseDocs = Math.round(12458 * timeScale * multiplier);
  const baseApproved = Math.round(baseDocs * 0.68);
  const basePending = Math.round(baseDocs * 0.18);
  const baseRejected = Math.round(baseDocs * 0.08);
  const baseArchived = Math.round(baseDocs * 0.06);

  const overview: AnalyticsOverview = {
    totalDocuments: baseDocs,
    pendingApprovals: basePending,
    approvedDocuments: baseApproved,
    rejectedDocuments: baseRejected,
    archivedDocuments: baseArchived,
    activeUsers: isFilteredDept ? 14 : 142,
    departmentsCount: isFilteredDept ? 1 : 5,
    totalDocumentsTrend: '+3.4%',
    pendingApprovalsTrend: '-2.1%',
    approvedTrend: '+5.8%',
    rejectedTrend: '-1.2%',
  };

  const documentStats: DocumentStats = {
    byStatus: [
      { status: 'APPROVED', label: 'Approved', count: baseApproved, percentage: 68 },
      { status: 'PENDING_APPROVAL', label: 'Pending Approval', count: basePending, percentage: 18 },
      { status: 'REJECTED', label: 'Rejected', count: baseRejected, percentage: 8 },
      { status: 'ARCHIVED', label: 'Archived', count: baseArchived, percentage: 6 },
    ],
    byCategory: [
      { category: 'Finance / Reports', count: Math.round(baseDocs * 0.35) },
      { category: 'Legal / Contracts', count: Math.round(baseDocs * 0.25) },
      { category: 'HR / Policies', count: Math.round(baseDocs * 0.2) },
      { category: 'Facilities / Ops', count: Math.round(baseDocs * 0.12) },
      { category: 'General Admin', count: Math.round(baseDocs * 0.08) },
    ],
    timeline: [
      { period: 'Mon', uploaded: Math.round(14 * timeScale), approved: Math.round(10 * timeScale), rejected: Math.round(2 * timeScale) },
      { period: 'Tue', uploaded: Math.round(22 * timeScale), approved: Math.round(16 * timeScale), rejected: Math.round(1 * timeScale) },
      { period: 'Wed', uploaded: Math.round(28 * timeScale), approved: Math.round(20 * timeScale), rejected: Math.round(3 * timeScale) },
      { period: 'Thu', uploaded: Math.round(35 * timeScale), approved: Math.round(24 * timeScale), rejected: Math.round(2 * timeScale) },
      { period: 'Fri', uploaded: Math.round(42 * timeScale), approved: Math.round(31 * timeScale), rejected: Math.round(4 * timeScale) },
      { period: 'Sat', uploaded: Math.round(8 * timeScale), approved: Math.round(5 * timeScale), rejected: Math.round(0 * timeScale) },
      { period: 'Sun', uploaded: Math.round(5 * timeScale), approved: Math.round(4 * timeScale), rejected: Math.round(0 * timeScale) },
    ],
  };

  const approvalStats: ApprovalStats = {
    pendingCount: basePending,
    approvedCount: baseApproved,
    rejectedCount: baseRejected,
    changesRequestedCount: Math.round(baseDocs * 0.04),
    avgDurationDays: 1.8,
    approvalRatePercent: 89.2,
    timeline: [
      { period: 'W1', approved: Math.round(45 * timeScale), rejected: Math.round(5 * timeScale), avgDurationHours: 14.2 },
      { period: 'W2', approved: Math.round(62 * timeScale), rejected: Math.round(8 * timeScale), avgDurationHours: 12.8 },
      { period: 'W3', approved: Math.round(78 * timeScale), rejected: Math.round(6 * timeScale), avgDurationHours: 10.5 },
      { period: 'W4', approved: Math.round(91 * timeScale), rejected: Math.round(9 * timeScale), avgDurationHours: 9.1 },
    ],
  };

  const departmentStats: DepartmentStats = {
    departments: [
      { id: 1, name: 'Finance & Planning', code: 'DEP-FIN', submitted: Math.round(420 * timeScale), approved: Math.round(350 * timeScale), rejected: Math.round(30 * timeScale), pending: Math.round(40 * timeScale), totalMembers: 14 },
      { id: 2, name: 'ICT Governance', code: 'DEP-ICT', submitted: Math.round(510 * timeScale), approved: Math.round(440 * timeScale), rejected: Math.round(25 * timeScale), pending: Math.round(45 * timeScale), totalMembers: 18 },
      { id: 3, name: 'Human Resources', code: 'DEP-HR', submitted: Math.round(290 * timeScale), approved: Math.round(245 * timeScale), rejected: Math.round(15 * timeScale), pending: Math.round(30 * timeScale), totalMembers: 9 },
      { id: 4, name: 'Legal Services', code: 'DEP-LGL', submitted: Math.round(210 * timeScale), approved: Math.round(180 * timeScale), rejected: Math.round(10 * timeScale), pending: Math.round(20 * timeScale), totalMembers: 6 },
      { id: 5, name: 'Public Works', code: 'DEP-PWK', submitted: Math.round(340 * timeScale), approved: Math.round(280 * timeScale), rejected: Math.round(20 * timeScale), pending: Math.round(40 * timeScale), totalMembers: 12 },
    ],
  };

  const activityStats: ActivityStats = {
    timeline: [
      { period: 'Jan', uploads: Math.round(120 * timeScale), approvals: Math.round(100 * timeScale), comments: Math.round(340 * timeScale), archives: Math.round(20 * timeScale) },
      { period: 'Feb', uploads: Math.round(155 * timeScale), approvals: Math.round(130 * timeScale), comments: Math.round(410 * timeScale), archives: Math.round(35 * timeScale) },
      { period: 'Mar', uploads: Math.round(180 * timeScale), approvals: Math.round(160 * timeScale), comments: Math.round(520 * timeScale), archives: Math.round(42 * timeScale) },
      { period: 'Apr', uploads: Math.round(210 * timeScale), approvals: Math.round(195 * timeScale), comments: Math.round(610 * timeScale), archives: Math.round(50 * timeScale) },
    ],
    byType: [
      { type: 'upload', label: 'Document Uploads', count: Math.round(665 * timeScale) },
      { type: 'approval', label: 'Workflow Approvals', count: Math.round(585 * timeScale) },
      { type: 'comment', label: 'Review Notes / Comments', count: Math.round(1880 * timeScale) },
      { type: 'archive', label: 'Vault Archivals', count: Math.round(147 * timeScale) },
    ],
  };

  return {
    overview,
    documentStats,
    approvalStats,
    departmentStats,
    activityStats,
    filters,
    generatedAt: new Date().toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }),
  };
}

export const reportService = {
  async getFullReport(filters: ReportFilters): Promise<FullReportData> {
    try {
      const response = await api.get<FullReportData>('/reports/full', {
        params: filters,
      });
      return response.data;
    } catch (error: any) {
      if (error.code === 'ERR_NETWORK' || !error.response || error.response.status === 404) {
        await new Promise((resolve) => setTimeout(resolve, 300));
        return getMockReportData(filters);
      }
      throw error;
    }
  },

  async exportReport(format: ReportExportFormat, filters: ReportFilters): Promise<void> {
    try {
      const response = await api.get(`/reports/export/${format}`, {
        params: filters,
        responseType: 'blob',
      });
      const blob = new Blob([response.data], {
        type: format === 'csv' ? 'text/csv' : 'application/pdf',
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `SITA_Report_${filters.dateRange}_${Date.now()}.${format}`);
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (error: any) {
      if (error.code === 'ERR_NETWORK' || !error.response || error.response.status === 404) {
        const reportData = getMockReportData(filters);

        if (format === 'csv') {
          const csvRows = [
            ['Smart E-Office Report & Analytics Summary'],
            [`Generated At`, reportData.generatedAt],
            [`Date Range Filter`, filters.dateRange],
            [`Department Filter`, filters.departmentId || 'All Departments'],
            [''],
            ['Metric', 'Value'],
            ['Total Documents', reportData.overview.totalDocuments],
            ['Pending Approvals', reportData.overview.pendingApprovals],
            ['Approved Documents', reportData.overview.approvedDocuments],
            ['Rejected Documents', reportData.overview.rejectedDocuments],
            ['Archived Documents', reportData.overview.archivedDocuments],
            ['Active Users', reportData.overview.activeUsers],
            ['Departments', reportData.overview.departmentsCount],
            [''],
            ['Department', 'Submitted', 'Approved', 'Rejected', 'Pending'],
            ...reportData.departmentStats.departments.map((d) => [
              d.name,
              d.submitted,
              d.approved,
              d.rejected,
              d.pending,
            ]),
          ];

          const csvContent = 'data:text/csv;charset=utf-8,' + csvRows.map((e) => e.join(',')).join('\n');
          const encodedUri = encodeURI(csvContent);
          const link = document.createElement('a');
          link.setAttribute('href', encodedUri);
          link.setAttribute('download', `SITA_Report_${filters.dateRange}_${Date.now()}.csv`);
          document.body.appendChild(link);
          link.click();
          link.remove();
        } else {
          window.print();
        }
        return;
      }
      throw error;
    }
  },
};

export default reportService;
