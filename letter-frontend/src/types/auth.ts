export type Role = 'ADMIN' | 'DEPARTMENT_MANAGER' | 'EMPLOYEE' | 'REGISTRY_OFFICER';
export type UserStatus = 'ACTIVE' | 'INACTIVE';

export interface AuthUser {
  id: number | string;
  full_name: string;
  email: string;
  role: Role;
  department_id?: number | null;
  department_name?: string | null;
  unit_name?: string | null;
  phone?: string;
  job_title?: string;
  status?: UserStatus;
  is_active?: boolean;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthResponse {
  token: string;
  user: AuthUser;
  message?: string;
}

export interface ChangePasswordPayload {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
