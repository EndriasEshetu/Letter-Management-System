import { Role } from '@/types/auth';

export interface NavigationItem {
  label: string;
  path: string;
  badge?: string;
}

export const NAVIGATION_BY_ROLE: Record<Role, NavigationItem[]> = {
  ADMIN: [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Letters', path: '/letters' },
    { label: 'Approvals', path: '/approvals' },
    { label: 'Reports', path: '/reports' },
    { label: 'Users', path: '/users' },
    { label: 'Departments', path: '/departments' },
    { label: 'Archives', path: '/archives' },
    { label: 'Audit Logs', path: '/audit-logs' },
  ],
  DEPARTMENT_MANAGER: [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'Letters', path: '/letters' },
    { label: 'Approvals', path: '/approvals' },
    { label: 'Reports', path: '/reports' },
    { label: 'Archives', path: '/archives' },
  ],
  EMPLOYEE: [
    { label: 'Dashboard', path: '/dashboard' },
    { label: 'My Letters', path: '/letters' },
    { label: 'Reports', path: '/reports' },
    { label: 'Archives', path: '/archives' },
  ],
};

export const getNavItemsForRole = (role?: Role): NavigationItem[] => {
  if (!role) return NAVIGATION_BY_ROLE.EMPLOYEE;
  return NAVIGATION_BY_ROLE[role] || NAVIGATION_BY_ROLE.EMPLOYEE;
};
