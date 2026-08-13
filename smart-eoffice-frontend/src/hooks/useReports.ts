import { useState, useEffect, useCallback } from 'react';
import { useAuth } from './useAuth';
import reportService from '@/services/reportService';
import departmentService from '@/services/departmentService';
import {
  ReportFilters,
  ReportDateRange,
  FullReportData,
  ReportExportFormat,
} from '@/types/report';
import { Department } from '@/types/department';

export interface UseReportsReturn {
  filters: ReportFilters;
  data: FullReportData | null;
  departments: Department[];
  isLoading: boolean;
  isExporting: boolean;
  error: string | null;
  setDateRange: (range: ReportDateRange) => void;
  setDepartmentId: (deptId: string) => void;
  setCustomDates: (startDate: string, endDate: string) => void;
  resetFilters: () => void;
  refetch: () => void;
  exportReport: (format: ReportExportFormat) => Promise<void>;
}

export const useReports = (): UseReportsReturn => {
  const { user } = useAuth();
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isExporting, setIsExporting] = useState(false);

  const initialDeptId =
    user?.role === 'DEPARTMENT_MANAGER' && user?.department
      ? String(user.department)
      : 'all';

  const [filters, setFilters] = useState<ReportFilters>({
    dateRange: '30days',
    departmentId: initialDeptId,
  });

  const [data, setData] = useState<FullReportData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    departmentService
      .getDepartments()
      .then((deptList) => {
        if (isMounted) {
          setDepartments(deptList);
        }
      })
      .catch((err) => {
        console.error('Failed to load departments for report filter', err);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const fetchReportData = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const reportData = await reportService.getFullReport(filters);
      setData(reportData);
    } catch (err: any) {
      console.error('Error fetching report analytics:', err);
      setError('Unable to load reports. Please check network connection and try again.');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchReportData();
  }, [fetchReportData]);

  const setDateRange = (dateRange: ReportDateRange) => {
    setFilters((prev) => ({
      ...prev,
      dateRange,
      startDate: dateRange === 'custom' ? prev.startDate : undefined,
      endDate: dateRange === 'custom' ? prev.endDate : undefined,
    }));
  };

  const setDepartmentId = (departmentId: string) => {
    setFilters((prev) => ({
      ...prev,
      departmentId,
    }));
  };

  const setCustomDates = (startDate: string, endDate: string) => {
    setFilters((prev) => ({
      ...prev,
      dateRange: 'custom',
      startDate,
      endDate,
    }));
  };

  const resetFilters = () => {
    setFilters({
      dateRange: '30days',
      departmentId: initialDeptId,
    });
  };

  const handleExport = async (format: ReportExportFormat) => {
    setIsExporting(true);
    try {
      await reportService.exportReport(format, filters);
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setIsExporting(false);
    }
  };

  return {
    filters,
    data,
    departments,
    isLoading,
    isExporting,
    error,
    setDateRange,
    setDepartmentId,
    setCustomDates,
    resetFilters,
    refetch: fetchReportData,
    exportReport: handleExport,
  };
};

export default useReports;
