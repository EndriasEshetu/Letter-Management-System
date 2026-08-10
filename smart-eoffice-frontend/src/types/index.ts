/**
 * Core User Roles for SITA Smart E-Office System
 */
export enum UserRole {
  ADMIN = 'ADMIN',
  DEPARTMENT_MANAGER = 'DEPARTMENT_MANAGER',
  EMPLOYEE = 'EMPLOYEE',
}

/**
 * Common Navigation Item Interface for App Architecture
 */
export interface NavItem {
  label: string;
  path: string;
  icon?: string;
  badge?: string;
  roles?: UserRole[];
}

/**
 * System Status Response Interface
 */
export interface SystemStatus {
  appName: string;
  organization: string;
  phase: string;
  initialized: boolean;
  apiBaseUrl: string;
}
