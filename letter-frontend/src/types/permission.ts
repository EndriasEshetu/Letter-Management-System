import { Role } from './auth';

export interface PermissionCapability {
  key: string;
  label: string;
  description: string;
  allowed: boolean;
}

export interface RolePermissionConfig {
  role: Role;
  label: string;
  description: string;
  capabilities: PermissionCapability[];
}
