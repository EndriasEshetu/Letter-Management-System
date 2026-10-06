import api from './api';
import {
  Department,
  CreateDepartmentPayload,
  UpdateDepartmentPayload,
  SystemCapacityInfo,
  DepartmentDetails,
} from '@/types/department';
import { OFFICIAL_DIRECTORATES } from '@/constants/departments';
import { mockUsers } from './userService';

export const departmentService = {
  /**
   * Get list of all departments from backend API
   */
  async getDepartments(): Promise<Department[]> {
    try {
      const response = await api.get<Department[]>('/departments');
      return Array.isArray(response.data) ? response.data : [];
    } catch (error: any) {
      if (error.code === 'ERR_NETWORK' || !error.response) {
        return OFFICIAL_DIRECTORATES.map((d) => {
          const members = mockUsers.filter((u) => u.department_id === d.id);
          return {
            id: d.id,
            name: d.name,
            code: d.shortCode,
            description: d.description,
            member_count: members.length,
          };
        });
      }
      throw error;
    }
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

  /**
   * Get comprehensive details of a specific department including manager and staff roster
   */
  async getDepartmentDetails(id: number | string): Promise<DepartmentDetails> {
    try {
      const response = await api.get<DepartmentDetails>(`/departments/${id}`);
      return response.data;
    } catch (error: any) {
      if (error.code === 'ERR_NETWORK' || !error.response || error.response?.status === 404) {
        const found = OFFICIAL_DIRECTORATES.find(
          (d) =>
            String(d.id) === String(id) ||
            d.name.toLowerCase() === String(id).toLowerCase() ||
            d.code.toLowerCase() === String(id).toLowerCase() ||
            d.shortCode.toLowerCase() === String(id).toLowerCase()
        );
        const deptId = found ? found.id : id;
        const deptName = found ? found.name : String(id);
        const deptEmployees = mockUsers
          .filter(
            (u) =>
              String(u.department_id) === String(deptId) ||
              u.department_name?.toLowerCase() === deptName.toLowerCase()
          )
          .map((u) => ({
            id: u.id,
            full_name: u.full_name,
            email: u.email,
            phone: u.phone,
            job_title: u.job_title,
            role: u.role,
            status: (u.status || 'ACTIVE') as 'ACTIVE' | 'INACTIVE',
            is_active: u.is_active ?? true,
          }));

        return {
          id: deptId,
          name: deptName,
          code: found ? found.shortCode : 'DIR',
          description: found ? found.description : '',
          member_count: deptEmployees.length,
          employees: deptEmployees,
          stats: {
            total_employees: deptEmployees.length,
            active_employees: deptEmployees.filter((e) => e.is_active).length,
            inactive_employees: deptEmployees.filter((e) => !e.is_active).length,
          },
        };
      }
      throw error;
    }
  },
};

export default departmentService;
