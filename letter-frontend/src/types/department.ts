export interface Department {
  id: number | string;
  name: string;
  code: string;
  description?: string;
  manager_id?: number | string;
  manager_name?: string;
  member_count: number;
  created_at?: string;
}

export interface CreateDepartmentPayload {
  name: string;
  code: string;
  description?: string;
  manager_id?: number | string;
}

export interface UpdateDepartmentPayload {
  name?: string;
  code?: string;
  description?: string;
  manager_id?: number | string;
  manager_name?: string;
}

export interface SystemCapacityInfo {
  total_licenses: number;
  used_licenses: number;
  utilization_percent: number;
}

export interface DepartmentMember {
  id: number | string;
  full_name: string;
  email: string;
  phone?: string;
  job_title?: string;
  role: string;
  status: 'ACTIVE' | 'INACTIVE';
  is_active: boolean;
  created_at?: string;
}

export interface DepartmentDetails extends Department {
  manager?: {
    id: number | string;
    full_name: string;
    email: string;
    phone?: string;
    job_title?: string;
    status: string;
  } | null;
  employees: DepartmentMember[];
  stats: {
    total_employees: number;
    active_employees: number;
    inactive_employees: number;
  };
}
