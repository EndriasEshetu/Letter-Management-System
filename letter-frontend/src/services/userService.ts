import api from './api';
import { User, CreateUserPayload, UpdateUserPayload } from '@/types/user';

/* ─── Mock User Dataset (Dev Offline Fallback) ──────────── */

export let mockUsers: User[] = [
  {
    id: 'usr-101',
    full_name: 'Abebe Bikila',
    email: 'admin@sita.gov.et',
    phone: '+251 91 123 4567',
    job_title: 'Main Administrator',
    role: 'ADMIN',
    department_id: null,
    department_name: null,
    status: 'ACTIVE',
    is_active: true,
  },
  // Department 1: App Development Directorate
  {
    id: 'usr-201',
    full_name: 'Endrias Eshetu',
    email: 'endrias.eshetu@sita.gov.et',
    phone: '+251 91 234 5678',
    job_title: 'Senior Software Engineer & Officer',
    role: 'EMPLOYEE',
    department_id: 1,
    department_name: 'App Development Directorate',
    status: 'ACTIVE',
    is_active: true,
  },
  {
    id: 'usr-202',
    full_name: 'Sara Jenkins',
    email: 'sara.jenkins@sita.gov.et',
    phone: '+251 92 345 6789',
    job_title: 'Frontend Systems Officer',
    role: 'EMPLOYEE',
    department_id: 1,
    department_name: 'App Development Directorate',
    status: 'ACTIVE',
    is_active: true,
  },
  {
    id: 'usr-203',
    full_name: 'Michael Kebede',
    email: 'michael.k@sita.gov.et',
    phone: '+251 93 456 7890',
    job_title: 'Full-Stack Developer & Officer',
    role: 'EMPLOYEE',
    department_id: 1,
    department_name: 'App Development Directorate',
    status: 'ACTIVE',
    is_active: true,
  },
  {
    id: 'usr-204',
    full_name: 'Dawit Tadesse',
    email: 'dawit.t@sita.gov.et',
    phone: '+251 94 567 8901',
    job_title: 'QA & Testing Officer',
    role: 'EMPLOYEE',
    department_id: 1,
    department_name: 'App Development Directorate',
    status: 'ACTIVE',
    is_active: true,
  },
  // Department 2: ICT Infrastructure Development Directorate
  {
    id: 'usr-301',
    full_name: 'Tariku Bikila',
    email: 'tariku.b@sita.gov.et',
    phone: '+251 91 567 1122',
    job_title: 'Network Operations Officer',
    role: 'EMPLOYEE',
    department_id: 2,
    department_name: 'ICT Infrastructure Development Directorate',
    status: 'ACTIVE',
    is_active: true,
  },
  {
    id: 'usr-302',
    full_name: 'Almaz Kebede',
    email: 'almaz.k@sita.gov.et',
    phone: '+251 92 678 2233',
    job_title: 'Cybersecurity Infrastructure Officer',
    role: 'EMPLOYEE',
    department_id: 2,
    department_name: 'ICT Infrastructure Development Directorate',
    status: 'ACTIVE',
    is_active: true,
  },
  {
    id: 'usr-303',
    full_name: 'Ermias Wolde',
    email: 'ermias.w@sita.gov.et',
    phone: '+251 93 789 3344',
    job_title: 'Datacenter & Server Officer',
    role: 'EMPLOYEE',
    department_id: 2,
    department_name: 'ICT Infrastructure Development Directorate',
    status: 'ACTIVE',
    is_active: true,
  },
  // Department 3: Science and Technology Directorate
  {
    id: 'usr-401',
    full_name: 'Bethlehem Tessema',
    email: 'bethlehem.t@sita.gov.et',
    phone: '+251 91 890 4455',
    job_title: 'Senior Scientific Research Officer',
    role: 'EMPLOYEE',
    department_id: 3,
    department_name: 'Science and Technology Directorate',
    status: 'ACTIVE',
    is_active: true,
  },
  {
    id: 'usr-402',
    full_name: 'Samuel Girma',
    email: 'samuel.g@sita.gov.et',
    phone: '+251 92 901 5566',
    job_title: 'Technology Standards & Transfer Officer',
    role: 'EMPLOYEE',
    department_id: 3,
    department_name: 'Science and Technology Directorate',
    status: 'ACTIVE',
    is_active: true,
  },
  // Department 4: Incubation Development Directorate
  {
    id: 'usr-501',
    full_name: 'Yonas Mulugeta',
    email: 'yonas.m@sita.gov.et',
    phone: '+251 91 012 6677',
    job_title: 'Incubation & Accelerator Officer',
    role: 'EMPLOYEE',
    department_id: 4,
    department_name: 'Incubation Development Directorate',
    status: 'ACTIVE',
    is_active: true,
  },
  {
    id: 'usr-502',
    full_name: 'Tigist Assefa',
    email: 'tigist.a@sita.gov.et',
    phone: '+251 92 123 7788',
    job_title: 'Startup Liaison Officer',
    role: 'EMPLOYEE',
    department_id: 4,
    department_name: 'Incubation Development Directorate',
    status: 'ACTIVE',
    is_active: true,
  },
];

export interface UserFilterParams {
  search?: string;
  department_id?: string;
  role?: string;
  status?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedUsersResponse {
  data: User[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export const userService = {
  /**
   * Get paginated & filtered users list
   */
  async getUsers(params?: UserFilterParams): Promise<PaginatedUsersResponse> {
    try {
      const response = await api.get<PaginatedUsersResponse>('/users', { params });
      const payload = response.data ?? ({} as PaginatedUsersResponse);
      return {
        data: Array.isArray(payload.data) ? payload.data : [],
        total: payload.total ?? 0,
        page: payload.page ?? params?.page ?? 1,
        limit: payload.limit ?? params?.limit ?? 10,
        totalPages: payload.totalPages ?? 1,
      };
    } catch (error: any) {
      if (error.code === 'ERR_NETWORK' || !error.response) {
        let filtered = [...mockUsers];

        if (params?.search) {
          const q = params.search.toLowerCase();
          filtered = filtered.filter(
            (u) =>
              u.full_name.toLowerCase().includes(q) ||
              u.email.toLowerCase().includes(q) ||
              (u.job_title && u.job_title.toLowerCase().includes(q))
          );
        }

        if (params?.role && params.role !== 'ALL') {
          filtered = filtered.filter((u) => u.role === params.role);
        }

        if (params?.department_id && params.department_id !== 'ALL') {
          const deptFilter = params.department_id.toLowerCase();
          filtered = filtered.filter(
            (u) =>
              String(u.department_id) === String(params.department_id) ||
              u.department_name?.toLowerCase() === deptFilter
          );
        }

        if (params?.status && params.status !== 'ALL') {
          filtered = filtered.filter((u) => u.status === params.status);
        }

        const page = params?.page || 1;
        const limit = params?.limit || 10;
        const total = filtered.length;
        const totalPages = Math.ceil(total / limit) || 1;
        const startIndex = (page - 1) * limit;
        const data = filtered.slice(startIndex, startIndex + limit);

        await new Promise((r) => setTimeout(r, 200));
        return { data, total, page, limit, totalPages };
      }
      throw error;
    }
  },

  /**
   * Create a new user
   */
  async createUser(payload: CreateUserPayload): Promise<User> {
    try {
      const response = await api.post<User>('/users', payload);
      return response.data;
    } catch (error: any) {
      if (error.code === 'ERR_NETWORK' || !error.response) {
        await new Promise((r) => setTimeout(r, 300));
        const newUser: User = {
          id: `usr-${Date.now()}`,
          full_name: payload.full_name,
          email: payload.email,
          phone: payload.phone || '+251 90 000 0000',
          job_title: payload.job_title || 'Staff Officer',
          role: payload.role,
          department_id: payload.department_id,
          department_name:
            payload.department_id === 1
              ? 'App Development Directorate'
              : payload.department_id === 2
              ? 'ICT Infrastructure Development Directorate'
              : payload.department_id === 3
              ? 'Science and Technology Directorate'
              : 'Incubation Development Directorate',
          status: payload.status || 'ACTIVE',
          is_active: payload.status !== 'INACTIVE',
        };

        mockUsers.unshift(newUser);
        return newUser;
      }
      throw error;
    }
  },

  /**
   * Update an existing user
   */
  async updateUser(id: string | number, payload: UpdateUserPayload): Promise<User> {
    try {
      const response = await api.put<User>(`/users/${id}`, payload);
      return response.data;
    } catch (error: any) {
      if (error.code === 'ERR_NETWORK' || !error.response) {
        await new Promise((r) => setTimeout(r, 300));
        const user = mockUsers.find((u) => String(u.id) === String(id));
        if (user) {
          Object.assign(user, payload);
          return { ...user };
        }
      }
      throw error;
    }
  },

  /**
   * Toggle user active/inactive status
   */
  async toggleUserStatus(id: string | number): Promise<User> {
    try {
      const response = await api.patch<User>(`/users/${id}/toggle-status`);
      return response.data;
    } catch (error: any) {
      if (error.code === 'ERR_NETWORK' || !error.response) {
        await new Promise((r) => setTimeout(r, 200));
        const user = mockUsers.find((u) => String(u.id) === String(id));
        if (user) {
          user.status = user.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE';
          user.is_active = user.status === 'ACTIVE';
          return { ...user };
        }
      }
      throw error;
    }
  },

  /**
   * Delete user account permanently
   */
  async deleteUser(id: string | number): Promise<void> {
    try {
      await api.delete(`/users/${id}`);
    } catch (error: any) {
      if (error.code === 'ERR_NETWORK' || !error.response) {
        await new Promise((r) => setTimeout(r, 200));
        const idx = mockUsers.findIndex((u) => String(u.id) === String(id));
        if (idx !== -1) {
          mockUsers.splice(idx, 1);
        }
        return;
      }
      const serverMessage = error.response?.data?.message || 'Failed to delete user account.';
      throw new Error(serverMessage);
    }
  },

  /**
   * Retrieve active employees/officers belonging to a specific department
   */
  async getDepartmentEmployees(departmentIdOrName?: number | string): Promise<User[]> {
    if (!departmentIdOrName) return [];

    try {
      const response = await api.get<PaginatedUsersResponse>('/users', {
        params: {
          department_id: String(departmentIdOrName),
          status: 'ACTIVE',
          limit: 100,
        },
      });
      const users = Array.isArray(response.data?.data) ? response.data.data : [];
      if (users.length > 0) {
        return users;
      }
    } catch {
      // Fallback
    }

    // Fallback using mock dataset
    const deptStr = String(departmentIdOrName).toLowerCase().trim();
    return mockUsers.filter((u) => {
      const matchesDept =
        String(u.department_id) === String(departmentIdOrName) ||
        (u.department_name && u.department_name.toLowerCase().trim() === deptStr) ||
        (u.department_name && deptStr.includes(u.department_name.toLowerCase().trim())) ||
        (u.department_name && u.department_name.toLowerCase().includes(deptStr));

      return matchesDept && u.is_active;
    });
  },
};

export default userService;
