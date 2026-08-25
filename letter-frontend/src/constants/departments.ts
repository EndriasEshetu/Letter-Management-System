import { SelectOption } from '@/components/common/Select';

export interface OfficialDirectorate {
  id: number;
  code: string;
  name: string;
  shortCode: string;
  description: string;
}

export const OFFICIAL_DIRECTORATES: OfficialDirectorate[] = [
  {
    id: 1,
    code: 'APP_DEVELOPMENT',
    name: 'App Development Directorate',
    shortCode: 'DIR-APP',
    description: 'Web & mobile application software engineering, portal development, and digital services.',
  },
  {
    id: 2,
    code: 'ICT_INFRASTRUCTURE_DEVELOPMENT',
    name: 'ICT Infrastructure Development Directorate',
    shortCode: 'DIR-INF',
    description: 'Network infrastructure, data center operations, cybersecurity, and hardware systems.',
  },
  {
    id: 3,
    code: 'SCIENCE_AND_TECHNOLOGY',
    name: 'Science and Technology Directorate',
    shortCode: 'DIR-SCT',
    description: 'Scientific research innovation, technology transfer, emerging tech policies, and standards.',
  },
  {
    id: 4,
    code: 'INCUBATION_DEVELOPMENT',
    name: 'Incubation Development Directorate',
    shortCode: 'DIR-INC',
    description: 'Tech startup incubation, innovation hub mentoring, entrepreneurship support, and grants.',
  },
];

/* ─── Form Select Options ──────────────────────────────────── */

export const DEPARTMENT_SELECT_OPTIONS: SelectOption[] = OFFICIAL_DIRECTORATES.map((d) => ({
  value: d.name,
  label: d.name,
}));

export const DEPARTMENT_CODE_OPTIONS: SelectOption[] = OFFICIAL_DIRECTORATES.map((d) => ({
  value: d.code,
  label: d.name,
}));

export const DEPARTMENT_FILTER_OPTIONS: SelectOption[] = [
  { value: 'ALL', label: 'All Directorates' },
  ...DEPARTMENT_SELECT_OPTIONS,
];

/* ─── Helper Functions ─────────────────────────────────────── */

export const getDepartmentByCodeOrName = (val?: string): OfficialDirectorate | undefined => {
  if (!val) return undefined;
  const normalized = val.toUpperCase().replace(/\s+/g, '_');
  return OFFICIAL_DIRECTORATES.find(
    (d) =>
      d.code === normalized ||
      d.name.toLowerCase() === val.toLowerCase() ||
      d.shortCode.toLowerCase() === val.toLowerCase()
  );
};

export const formatDepartmentName = (val?: string): string => {
  if (!val) return 'App Development Directorate';
  const found = getDepartmentByCodeOrName(val);
  return found ? found.name : val;
};
