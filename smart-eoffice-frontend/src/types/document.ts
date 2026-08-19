import type { DocumentStatus } from '@/components/common/Badge';
export type { DocumentStatus };

export type SecurityLevel = 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL' | 'RESTRICTED';

export interface DocumentItem {
  id: string;
  documentNumber: string;
  title: string;
  description?: string;
  category: string;
  department_id?: number | string;
  department_name: string;
  created_by: string;
  author_id?: number | string;
  status: DocumentStatus;
  securityLevel: SecurityLevel;
  file_name: string;
  file_size: number;
  file_type: string;
  created_at: string;
  updated_at: string;
  tags?: string[];
  version?: string;
  is_new?: boolean;
  versions?: VersionItem[];
}

export interface VersionItem {
  id: string;
  versionNumber: string;
  uploadedBy: string;
  date: string;
  fileSize?: number;
  fileName?: string;
  isCurrent?: boolean;
}

export interface DocumentFilterParams {
  search?: string;
  category?: string;
  department_id?: string;
  status?: string;
  securityLevel?: string;
  start_date?: string;
  end_date?: string;
  page?: number;
  limit?: number;
}

export interface PaginatedDocumentResponse {
  data: DocumentItem[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
