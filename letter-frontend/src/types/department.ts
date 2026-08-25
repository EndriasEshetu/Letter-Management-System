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
