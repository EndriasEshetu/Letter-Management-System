import { useState, useEffect, useCallback } from 'react';
import auditService from '@/services/auditService';
import userService from '@/services/userService';
import {
  AuditLog,
  AuditLogFilters,
  PaginatedAuditLogsResponse,
} from '@/types/audit';
import { User } from '@/types/user';

export interface UseAuditLogsReturn {
  logs: AuditLog[];
  users: User[];
  filters: AuditLogFilters;
  total: number;
  totalPages: number;
  currentPage: number;
  isLoading: boolean;
  error: string | null;
  setSearch: (q: string) => void;
  setUserId: (userId: string) => void;
  setAction: (action: string) => void;
  setEntityType: (entityType: string) => void;
  setStartDate: (date: string) => void;
  setEndDate: (date: string) => void;
  setPage: (page: number) => void;
  resetFilters: () => void;
  refetch: () => void;
}

const DEFAULT_FILTERS: AuditLogFilters = {
  search: '',
  userId: '',
  action: '',
  entityType: '',
  startDate: '',
  endDate: '',
  page: 1,
  limit: 20,
};

export const useAuditLogs = (): UseAuditLogsReturn => {
  const [filters, setFilters] = useState<AuditLogFilters>(DEFAULT_FILTERS);
  const [result, setResult] = useState<PaginatedAuditLogsResponse>({
    data: [],
    total: 0,
    page: 1,
    limit: 20,
    totalPages: 1,
  });
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load user list for filter dropdown
  useEffect(() => {
    let isMounted = true;
    userService
      .getUsers({})
      .then((resp) => {
        if (isMounted) {
          const list = Array.isArray(resp) ? resp : resp.data;
          setUsers(list);
        }
      })
      .catch((err) => {
        console.error('Failed to load users for audit filter:', err);
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const fetchLogs = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await auditService.getAuditLogs(filters);
      setResult(data);
    } catch (err: any) {
      console.error('Audit log fetch failed:', err);
      setError('Unable to load audit logs. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const updateFilter = (patch: Partial<AuditLogFilters>) => {
    setFilters((prev) => ({ ...prev, ...patch, page: 1 }));
  };

  const setPage = (page: number) => {
    setFilters((prev) => ({ ...prev, page }));
  };

  const resetFilters = () => {
    setFilters(DEFAULT_FILTERS);
  };

  return {
    logs: result.data,
    users,
    filters,
    total: result.total,
    totalPages: result.totalPages,
    currentPage: result.page,
    isLoading,
    error,
    setSearch: (q) => updateFilter({ search: q }),
    setUserId: (userId) => updateFilter({ userId }),
    setAction: (action) => updateFilter({ action }),
    setEntityType: (entityType) => updateFilter({ entityType }),
    setStartDate: (startDate) => updateFilter({ startDate }),
    setEndDate: (endDate) => updateFilter({ endDate }),
    setPage,
    resetFilters,
    refetch: fetchLogs,
  };
};

export default useAuditLogs;
