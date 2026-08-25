import api from './api';
import { User, CreateUserPayload, UpdateUserPayload } from '@/types/user';

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
   * Get paginated & filtered users list from backend API
   */
  async getUsers(params?: UserFilterParams): Promise<PaginatedUsersResponse> {
    const response = await api.get<PaginatedUsersResponse>('/users', { params });
    return response.data;
  },

  /**
   * Create a new user via backend API
   */
  async createUser(payload: CreateUserPayload): Promise<User> {
    const response = await api.post<User>('/users', payload);
    return response.data;
  },

  /**
   * Update an existing user via backend API
   */
  async updateUser(id: string | number, payload: UpdateUserPayload): Promise<User> {
    const response = await api.put<User>(`/users/${id}`, payload);
    return response.data;
  },

  /**
   * Toggle user active/inactive status via backend API
   */
  async toggleUserStatus(id: string | number): Promise<User> {
    const response = await api.patch<User>(`/users/${id}/toggle-status`);
    return response.data;
  },
};

export default userService;
