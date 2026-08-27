import api from './api';
import { User, CreateUserPayload, UpdateUserPayload } from '@/types/user';

/* ─── Mock User Dataset (Dev Offline Fallback) ──────────── */

let mockUsers: User[] = [
  {
    id: 'usr-101',
    full_name: 'Endrias Eshetu',
    email: 'endrias.e@sita.gov.et',
    phone: '+251 91 123 4567',
    job_title: 'Software Systems Lead',
    role: 'DEPARTMENT_MANAGER',
    department_id: 1,
    department_name: 'App Development Directorate',
    status: 'ACTIVE',
    is_active: true,
  },
  {
    id: 'usr-102',
    full_name: 'Sara Jenkins',
    email: 'sara.j@sita.gov.et',
    phone: '+251 92 234 5678',
    job_title: 'Chief IT Architect',
    role: 'ADMIN',
    department_id: null,
    department_name: null,
    status: 'ACTIVE',
    is_active: true,
  },
  {
    id: 'usr-103',
    full_name: 'Abebe Kebede',
    email: 'abebe.k@sita.gov.et',
    phone: '+251 93 345 6789',
    job_title: 'Research Lead',
    role: 'DEPARTMENT_MANAGER',
    department_id: 3,
    department_name: 'Science and Technology Directorate',
    status: 'ACTIVE',
    is_active: true,
  },
  {
    id: 'usr-104',
    full_name: 'Tariku Bikila',
    email: 'tariku.b@sita.gov.et',
    phone: '+251 94 456 7890',
    job_title: 'Incubation Manager',
    role: 'DEPARTMENT_MANAGER',
    department_id: 4,
    department_name: 'Incubation Development Directorate',
    status: 'ACTIVE',
    is_active: true,
  },
  {
    id: 'usr-105',
    full_name: 'Abebe Demissie',
    email: 'abebe.d@sita.gov.et',
    phone: '+251 95 567 8901',
    job_title: 'Senior Registry Officer',
    role: 'REGISTRY_OFFICER',
    department_id: null,
    department_name: null,
    unit_name: 'Central Registry',
    status: 'ACTIVE',
    is_active: true,
  },
  {
    id: 'usr-106',
    full_name: 'Michael Kassa',
    email: 'michael.k@sita.gov.et',
    phone: '+251 96 678 9012',
    job_title: 'Infrastructure Specialist',
    role: 'EMPLOYEE',
    department_id: 2,
    department_name: 'ICT Infrastructure Development Directorate',
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
      return response.data;
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
};

export default userService;
