import api from './api';
import { AuthResponse, AuthUser, ChangePasswordPayload, LoginCredentials } from '@/types/auth';

export const authService = {
  /**
   * Authenticate user with credentials via backend API
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/auth/login', credentials);
      return response.data;
    } catch (error: any) {
      const serverMessage = error.response?.data?.message || error.message || 'Authentication failed.';
      throw new Error(serverMessage);
    }
  },

  /**
   * Fetch current authenticated user info from backend API
   */
  async getCurrentUser(): Promise<AuthUser> {
    const response = await api.get<{ user: AuthUser } | AuthUser>('/auth/me');
    if ('user' in response.data) {
      return response.data.user;
    }
    return response.data;
  },

  /**
   * Change user password via backend API
   */
  async changePassword(payload: ChangePasswordPayload): Promise<{ message: string }> {
    try {
      const response = await api.post<{ message: string }>('/auth/change-password', payload);
      return response.data;
    } catch (error: any) {
      const serverMessage = error.response?.data?.message || error.message || 'Failed to change password.';
      throw new Error(serverMessage);
    }
  },
};

export default authService;
