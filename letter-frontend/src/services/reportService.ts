import api from './api';
import {
  ReportFilters,
  FullReportData,
  ReportExportFormat,
} from '@/types/report';

export const reportService = {
  /**
   * Get report analytics data from backend API
   */
  async getReportData(filters: ReportFilters): Promise<FullReportData> {
    const response = await api.get<FullReportData>('/reports/analytics', { params: filters });
    return response.data;
  },

  async getFullReport(filters: ReportFilters): Promise<FullReportData> {
    return this.getReportData(filters);
  },

  /**
   * Export report (CSV / PDF) via backend API
   */
  async exportReport(format: ReportExportFormat, filters: ReportFilters): Promise<void> {
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
    window.URL.revokeObjectURL(url);
  },
};

export default reportService;
