import api from './api';
import { Department, CreateDepartmentPayload, UpdateDepartmentPayload, SystemCapacityInfo } from '@/types/department';

/* ─── Mock Department Dataset (Dev Offline Fallback) ────── */

let mockDepartments: Department[] = [
  {
    id: 1,
    name: 'App Development Directorate',
    code: 'DIR-APP',
    description: 'Web & mobile application software engineering, portal development, and digital services.',
    manager_id: 'usr-101',
    manager_name: 'Endrias Eshetu',
    member_count: 14,
    created_at: '2025-01-15',
  },
  {
    id: 2,
    name: 'ICT Infrastructure Development Directorate',
    code: 'DIR-INF',
    description: 'Network infrastructure, data center operations, cybersecurity, and hardware systems.',
    manager_id: 'usr-102',
    manager_name: 'Sara Jenkins',
    member_count: 18,
    created_at: '2025-01-15',
  },
  {
    id: 3,
    name: 'Science and Technology Directorate',
    code: 'DIR-SCT',
    description: 'Scientific research innovation, technology transfer, emerging tech policies, and standards.',
    manager_id: 'usr-103',
    manager_name: 'Abebe Kebede',
    member_count: 12,
    created_at: '2025-02-01',
  },
  {
    id: 4,
    name: 'Incubation Development Directorate',
    code: 'DIR-INC',
    description: 'Tech startup incubation, innovation hub mentoring, entrepreneurship support, and grants.',
    manager_id: 'usr-104',
    manager_name: 'Tariku Bikila',
    member_count: 10,
    created_at: '2025-03-10',
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
