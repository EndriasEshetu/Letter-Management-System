import api from './api';
import { Department, CreateDepartmentPayload, UpdateDepartmentPayload, SystemCapacityInfo } from '@/types/department';

export const departmentService = {
  /**
   * Get list of all departments from backend API
   */
  async getDepartments(): Promise<Department[]> {
    const response = await api.get<Department[]>('/departments');
    return response.data;
  },

  /**
   * Get system capacity and license usage summary from backend API
   */
  async getSystemCapacity(): Promise<SystemCapacityInfo> {
    try {
      const response = await api.get<SystemCapacityInfo>('/system/capacity');
      return response.data;
    } catch {
      // Fallback calculated capacity based on active departments
      const depts = await this.getDepartments();
      const totalMembers = depts.reduce((acc, d) => acc + (d.member_count || 0), 0);
      return {
        total_licenses: 100,
        used_licenses: totalMembers,
        utilization_percent: Math.round((totalMembers / 100) * 100),
      };
    }
  },

  /**
   * Create a new department via backend API
   */
  async createDepartment(payload: CreateDepartmentPayload): Promise<Department> {
    const response = await api.post<Department>('/departments', payload);
    return response.data;
  },

  /**
   * Update an existing department via backend API
   */
  async updateDepartment(id: number | string, payload: UpdateDepartmentPayload): Promise<Department> {
    const response = await api.put<Department>(`/departments/${id}`, payload);
    return response.data;
  },

  /**
   * Assign manager to department via backend API
   */
  async assignManager(
    id: number | string,
    managerId: number | string,
    managerName?: string
  ): Promise<Department> {
    const response = await api.post<Department>(`/departments/${id}/assign-manager`, {
      manager_id: managerId,
      manager_name: managerName,
    });
    return response.data;
  },
};

export default departmentService;
