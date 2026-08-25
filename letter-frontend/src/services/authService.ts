import api from './api';
import { AuthResponse, AuthUser, ChangePasswordPayload, LoginCredentials } from '@/types/auth';

/**
 * Fallback Mock Users for development when local backend is offline.
 */
const MOCK_USERS: Record<string, AuthUser> = {
  'admin@sita.gov.et': {
    id: 1,
    full_name: 'Abebe Bikila (Admin)',
    email: 'admin@sita.gov.et',
    role: 'ADMIN',
    department_id: 1,
    department_name: 'ICT & Innovation Governance',
  },
  'manager@sita.gov.et': {
    id: 2,
    full_name: 'Tariku Eshetu (Manager)',
    email: 'manager@sita.gov.et',
    role: 'DEPARTMENT_MANAGER',
    department_id: 2,
    department_name: 'Document Management & Archives',
  },
  'employee@sita.gov.et': {
    id: 3,
    full_name: 'Endrias Eshetu (Employee)',
    email: 'employee@sita.gov.et',
    role: 'EMPLOYEE',
    department_id: 2,
    department_name: 'Document Management & Archives',
  },
};

export const authService = {
  /**
   * Authenticate user with credentials
   */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await api.post<AuthResponse>('/auth/login', credentials);
      return response.data;
    } catch (error: any) {
      // If backend server is not running locally (Network Error), offer mock dev authentication
      if (error.code === 'ERR_NETWORK' || !error.response) {
        console.warn('[authService] Backend offline/unreachable. Attempting mock fallback authentication for dev preview.');
        const normalizedEmail = credentials.email.toLowerCase().trim();
        const matchedUser = MOCK_USERS[normalizedEmail] || {
          id: 99,
          full_name: 'Demo SITA Officer',
          email: credentials.email,
          role: normalizedEmail.includes('admin') ? 'ADMIN' : normalizedEmail.includes('manager') ? 'DEPARTMENT_MANAGER' : 'EMPLOYEE',
          department_id: 1,
          department_name: 'Technology Agency',
        };

        if (credentials.password.length < 4) {
          throw new Error('Invalid email or password.');
        }

        const mockToken = `mock_jwt_token_${matchedUser.id}_${Date.now()}`;
        return {
          token: mockToken,
          user: matchedUser,
          message: 'Authenticated via local development fallback',
        };
      }

      // Process backend error message
      const serverMessage = error.response?.data?.message || 'Invalid email or password.';
      throw new Error(serverMessage);
    }
  },

  /**
   * Fetch current authenticated user info
   */
  async getCurrentUser(): Promise<AuthUser> {
    try {
      const response = await api.get<{ user: AuthUser } | AuthUser>('/auth/me');
      if ('user' in response.data) {
        return response.data.user;
      }
      return response.data;
    } catch (error: any) {
      // Check for cached mock session if backend offline
      if (error.code === 'ERR_NETWORK' || !error.response) {
        const storedUser = localStorage.getItem('sita_auth_user');
        if (storedUser) {
          return JSON.parse(storedUser);
        }
      }
      throw error;
    }
  },

  /**
   * Change user password
   */
  async changePassword(payload: ChangePasswordPayload): Promise<{ message: string }> {
    try {
      const response = await api.post<{ message: string }>('/auth/change-password', payload);
      return response.data;
    } catch (error: any) {
      if (error.code === 'ERR_NETWORK' || !error.response) {
        if (payload.new_password !== payload.confirm_password) {
          throw new Error('New password and confirm password do not match.');
        }
        return { message: 'Password updated successfully (Dev Mode)' };
      }
      const serverMessage = error.response?.data?.message || 'Failed to change password.';
      throw new Error(serverMessage);
    }
  },
};

export default authService;
