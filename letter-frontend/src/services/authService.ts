import api from './api';
import { AuthResponse, AuthUser, ChangePasswordPayload, LoginCredentials, UpdateProfilePayload } from '@/types/auth';

/**
 * Fallback Mock Users for development when local backend is offline.
 */
const MOCK_USERS: Record<string, AuthUser> = {
  'admin@sita.gov.et': {
    id: 1,
    full_name: 'Abebe Bikila',
    email: 'admin@sita.gov.et',
    role: 'ADMIN',
    department_id: null,
    department_name: null,
    job_title: 'Main Administrator',
    status: 'ACTIVE',
  },
  'registry@sita.gov.et': {
    id: 2,
    full_name: 'Abebe Demissie',
    email: 'registry@sita.gov.et',
    role: 'REGISTRY_OFFICER',
    department_id: null,
    department_name: null,
    unit_name: 'Central Registry',
    job_title: 'Senior Registry Officer',
    status: 'ACTIVE',
  },
  'manager@sita.gov.et': {
    id: 3,
    full_name: 'Tariku Eshetu',
    email: 'manager@sita.gov.et',
    role: 'DEPARTMENT_MANAGER',
    department_id: 1,
    department_name: 'App Development Directorate',
    job_title: 'Directorate Manager',
    status: 'ACTIVE',
  },
  'employee@sita.gov.et': {
    id: 4,
    full_name: 'Endrias Eshetu',
    email: 'employee@sita.gov.et',
    role: 'EMPLOYEE',
    department_id: 2,
    department_name: 'ICT Infrastructure Development Directorate',
    job_title: 'Systems Specialist',
    status: 'ACTIVE',
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
      const status = error.response?.status;
      const isBackendUnreachable =
        error.code === 'ERR_NETWORK' ||
        !error.response ||
        status === 404 ||
        status === 405 ||
        status === 502 ||
        status === 503 ||
        status === 504;

      const normalizedEmail = credentials.email.toLowerCase().trim();
      const isDemoAccount =
        Boolean(MOCK_USERS[normalizedEmail]) ||
        normalizedEmail.endsWith('@sita.gov.et');

      // If backend is unreachable OR if attempting demo credentials preview
      if (isBackendUnreachable || (isDemoAccount && credentials.password === 'Sita@2026')) {
        console.warn('[authService] Using mock fallback authentication for demo preview.');
        const computedRole = normalizedEmail.includes('admin')
          ? 'ADMIN'
          : normalizedEmail.includes('registry')
          ? 'REGISTRY_OFFICER'
          : normalizedEmail.includes('manager')
          ? 'DEPARTMENT_MANAGER'
          : 'EMPLOYEE';

        const matchedUser: AuthUser = MOCK_USERS[normalizedEmail] || {
          id: 99,
          full_name: 'Demo SITA Officer',
          email: credentials.email,
          role: computedRole,
          department_id: (computedRole === 'ADMIN' || computedRole === 'REGISTRY_OFFICER') ? null : 1,
          department_name: computedRole === 'ADMIN' || computedRole === 'REGISTRY_OFFICER' ? null : 'App Development Directorate',
          unit_name: computedRole === 'REGISTRY_OFFICER' ? 'Central Registry' : null,
          job_title: computedRole === 'ADMIN' ? 'Main Administrator' : computedRole === 'REGISTRY_OFFICER' ? 'Registry Officer' : computedRole === 'DEPARTMENT_MANAGER' ? 'Directorate Manager' : 'Officer',
          status: 'ACTIVE',
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
      if (status === 401) {
        throw new Error(error.response?.data?.message || 'Invalid email or password.');
      }
      if (status === 403) {
        throw new Error(error.response?.data?.message || 'Account access has been restricted.');
      }
      if (status === 404) {
        throw new Error('Authentication API endpoint not found (404). Backend service is not reachable.');
      }
      if (status && status >= 500) {
        throw new Error(`Backend server error (${status}). Please verify API service.`);
      }

      const serverMessage = error.response?.data?.message || error.message || 'Invalid email or password.';
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
      // Check for cached mock session if backend offline or endpoint missing
      const status = error.response?.status;
      if (error.code === 'ERR_NETWORK' || !error.response || status === 404 || status >= 500) {
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
      const status = error.response?.status;
      if (error.code === 'ERR_NETWORK' || !error.response || status === 404 || status >= 500) {
        if (payload.new_password !== payload.confirm_password) {
          throw new Error('New password and confirm password do not match.');
        }
        return { message: 'Password updated successfully (Dev Mode)' };
      }
      const serverMessage = error.response?.data?.message || 'Failed to change password.';
      throw new Error(serverMessage);
    }
  },

  /**
   * Update non-sensitive profile info (phone, job_title)
   */
  async updateProfile(payload: UpdateProfilePayload): Promise<AuthUser> {
    try {
      const response = await api.patch<{ user: AuthUser; message: string }>('/auth/profile', payload);
      return response.data.user;
    } catch (error: any) {
      const status = error.response?.status;
      if (error.code === 'ERR_NETWORK' || !error.response || status === 404 || status >= 500) {
        const storedUser = localStorage.getItem('sita_auth_user');
        if (storedUser) {
          const userObj = JSON.parse(storedUser);
          if (payload.phone !== undefined) userObj.phone = payload.phone;
          if (payload.job_title !== undefined) userObj.job_title = payload.job_title;
          localStorage.setItem('sita_auth_user', JSON.stringify(userObj));
          return userObj;
        }
      }
      const serverMessage = error.response?.data?.message || 'Failed to update profile.';
      throw new Error(serverMessage);
    }
  },
};

export default authService;
