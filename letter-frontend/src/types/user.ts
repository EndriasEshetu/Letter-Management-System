import { Role, UserStatus } from './auth';

export type UserRole = Role;
export type { UserStatus };

export interface UserDepartment {
  id: number | string;
  name: string;
}

export interface User {
  id: number | string;
  full_name: string;
  email: string;
  phone?: string;
  job_title?: string;
  role: UserRole;
  department_id?: number | null;
  department_name?: string | null;
  unit_name?: string | null;
  department?: UserDepartment | null;
  status?: UserStatus;
  is_active?: boolean;
}

export interface CreateUserPayload {
  full_name: string;
  email: string;
  phone?: string;
  job_title?: string;
  role: UserRole;
  department_id?: number | null;
  status?: UserStatus;
}

export interface UpdateUserPayload {
  full_name?: string;
  email?: string;
  phone?: string;
  job_title?: string;
  role?: UserRole;
  department_id?: number | null;
  status?: UserStatus;
}
