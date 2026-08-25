import { Role } from '@/types/auth';

export interface SubNavigationItem {
  label: string;
  path: string;
}

export interface NavigationItem {
  label: string;
  path: string;
  badge?: string;
  children?: SubNavigationItem[];
}

export const NAVIGATION_BY_ROLE: Record<Role, NavigationItem[]> = {
  ADMIN: [
    { label: 'Dashboard', path: '/dashboard' },
    {
      label: 'Letters',
      path: '/letters',
      children: [
        { label: 'All Letters', path: '/letters' },
        { label: '📥 Incoming Letters', path: '/letters?direction=INCOMING' },
        { label: '📤 Outgoing Letters', path: '/letters?direction=OUTGOING' },
        { label: '🏢 Internal Letters', path: '/letters?direction=INTERNAL' },
      ],
    },
    { label: 'My Tasks', path: '/tasks' },
    { label: 'Approvals', path: '/approvals' },
    { label: 'Letter Tracking', path: '/letters/track' },
    { label: 'Reports', path: '/reports' },
    { label: 'Users', path: '/users' },
    { label: 'Departments', path: '/departments' },
    { label: 'Archives', path: '/archives' },
    { label: 'Audit Logs', path: '/audit-logs' },
  ],
  DEPARTMENT_MANAGER: [
    { label: 'Dashboard', path: '/dashboard' },
    {
      label: 'Letters',
      path: '/letters',
      children: [
        { label: 'All Letters', path: '/letters' },
        { label: '📥 Incoming Letters', path: '/letters?direction=INCOMING' },
        { label: '📤 Outgoing Letters', path: '/letters?direction=OUTGOING' },
        { label: '🏢 Internal Letters', path: '/letters?direction=INTERNAL' },
      ],
    },
    { label: 'My Tasks', path: '/tasks' },
    { label: 'Approvals', path: '/approvals' },
    { label: 'Letter Tracking', path: '/letters/track' },
    { label: 'Reports', path: '/reports' },
    { label: 'Archives', path: '/archives' },
  ],
  EMPLOYEE: [
    { label: 'Dashboard', path: '/dashboard' },
    {
      label: 'My Letters',
      path: '/letters',
      children: [
        { label: 'All Letters', path: '/letters' },
        { label: '📥 Incoming Letters', path: '/letters?direction=INCOMING' },
        { label: '📤 Outgoing Letters', path: '/letters?direction=OUTGOING' },
        { label: '🏢 Internal Letters', path: '/letters?direction=INTERNAL' },
      ],
    },
    { label: 'My Tasks', path: '/tasks' },
    { label: 'Letter Tracking', path: '/letters/track' },
    { label: 'Reports', path: '/reports' },
    { label: 'Archives', path: '/archives' },
  ],
  REGISTRY_OFFICER: [
    { label: 'Dashboard', path: '/dashboard' },
    {
      label: 'Letters',
      path: '/letters',
      children: [
        { label: 'All Letters', path: '/letters' },
        { label: '📥 Incoming Letters', path: '/letters?direction=INCOMING' },
        { label: '📤 Outgoing Letters', path: '/letters?direction=OUTGOING' },
        { label: '🏢 Internal Letters', path: '/letters?direction=INTERNAL' },
      ],
    },
    { label: 'Letter Tracking', path: '/letters/track' },
    { label: 'Archives', path: '/archives' },
  ],
};

export const getNavItemsForRole = (role?: Role): NavigationItem[] => {
  if (!role) return NAVIGATION_BY_ROLE.EMPLOYEE;
  return NAVIGATION_BY_ROLE[role] || NAVIGATION_BY_ROLE.EMPLOYEE;
};

