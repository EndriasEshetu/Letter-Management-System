import api from './api';
import { Department, CreateDepartmentPayload, SystemCapacityInfo } from '@/types/department';

/* ─── Mock Department Dataset (Dev Offline Fallback) ────── */

let mockDepartments: Department[] = [
  {
    id: 1,
    name: 'Finance & Planning',
    code: 'DEP-FIN',
    description: 'Budgeting, financial forecasting, and expenditure control',
    manager_id: 'usr-101',
    manager_name: 'Endrias Eshetu',
    member_count: 14,
    created_at: '2025-01-15',
  },
  {
    id: 2,
    name: 'ICT Governance',
    code: 'DEP-ICT',
    description: 'Infrastructure, systems security, and hardware management',
    manager_id: 'usr-102',
    manager_name: 'Sara Jenkins',
    member_count: 18,
    created_at: '2025-01-15',
  },
  {
    id: 3,
    name: 'Human Resources',
    code: 'DEP-HR',
    description: 'Personnel recruitment, training, and staff welfare',
    manager_id: 'usr-103',
    manager_name: 'Abebe Kebede',
    member_count: 9,
    created_at: '2025-02-01',
  },
  {
    id: 4,
    name: 'Legal Services',
    code: 'DEP-LGL',
    description: 'Regulatory compliance, contract review, and policy archives',
    manager_id: 'usr-104',
    manager_name: 'Tariku Bikila',
    member_count: 6,
    created_at: '2025-03-10',
  },
  {
    id: 5,
    name: 'Public Works',
    code: 'DEP-PWK',
    description: 'Facilities management and campus infrastructure projects',
    manager_id: 'usr-105',
    manager_name: 'Tigist Haile',
    member_count: 12,
    created_at: '2025-04-20',
  },
];

export const departmentService = {
  /**
   * Get list of all departments
   */
  async getDepartments(): Promise<Department[]> {
    try {
      const response = await api.get<Department[]>('/departments');
      return response.data;
    } catch (error: any) {
      if (error.code === 'ERR_NETWORK' || !error.response) {
        await new Promise((r) => setTimeout(r, 200));
        return [...mockDepartments];
      }
      throw error;
    }
  },

  /**
   * Get system capacity and license usage summary
   */
  async getSystemCapacity(): Promise<SystemCapacityInfo> {
    try {
      const response = await api.get<SystemCapacityInfo>('/system/capacity');
      return response.data;
    } catch (error: any) {
      if (error.code === 'ERR_NETWORK' || !error.response) {
        const totalMembers = mockDepartments.reduce((acc, d) => acc + d.member_count, 0);
        return {
          total_licenses: 100,
          used_licenses: totalMembers,
          utilization_percent: Math.round((totalMembers / 100) * 100),
        };
      }
      throw error;
    }
  },

  /**
   * Create a new department
   */
  async createDepartment(payload: CreateDepartmentPayload): Promise<Department> {
    try {
      const response = await api.post<Department>('/departments', payload);
      return response.data;
    } catch (error: any) {
      if (error.code === 'ERR_NETWORK' || !error.response) {
        await new Promise((r) => setTimeout(r, 300));
        const newDept: Department = {
          id: mockDepartments.length + 1,
          name: payload.name,
          code: payload.code,
          description: payload.description || '',
          manager_id: payload.manager_id,
          manager_name: 'Unassigned',
          member_count: 1,
          created_at: new Date().toISOString().split('T')[0],
        };
        mockDepartments.push(newDept);
        return newDept;
      }
      throw error;
    }
  },

  async updateDepartment(id: number | string, payload: UpdateDepartmentPayload): Promise<Department> {
    try {
      const response = await api.put<Department>(`/departments/${id}`, payload);
      return response.data;
    } catch (error: any) {
      if (error.code === 'ERR_NETWORK' || !error.response) {
        await new Promise((r) => setTimeout(r, 300));
        const department = mockDepartments.find((d) => String(d.id) === String(id));
        if (department) {
          Object.assign(department, payload);
          return { ...department };
        }
      }
      throw error;
    }
  },

  async assignManager(
    id: number | string,
    managerId: number | string,
    managerName: string
  ): Promise<Department> {
    try {
      const response = await api.post<Department>(`/departments/${id}/assign-manager`, {
        manager_id: managerId,
      });
      return response.data;
    } catch (error: any) {
      if (error.code === 'ERR_NETWORK' || !error.response) {
        await new Promise((r) => setTimeout(r, 300));
        const department = mockDepartments.find((d) => String(d.id) === String(id));
        if (department) {
          department.manager_id = managerId;
          department.manager_name = managerName;
          return { ...department };
        }
      }
      throw error;
    }
  },
};

export default departmentService;
