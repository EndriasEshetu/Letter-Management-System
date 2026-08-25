import React from 'react';
import Badge from '@/components/common/Badge';
import { RolePermissionConfig } from '@/types/permission';

const ROLE_PERMISSIONS: RolePermissionConfig[] = [
  {
    role: 'ADMIN',
    label: 'Administrator',
    description: 'Full system administration, user provisioning, department setup, and audit log access.',
    capabilities: [
      { key: 'user_mgmt', label: 'User & Personnel Management', description: 'Create, edit, and deactivate user accounts', allowed: true },
      { key: 'dept_mgmt', label: 'Department Administration', description: 'Manage organization structure and managers', allowed: true },
      { key: 'doc_view', label: 'Document Access & Preview', description: 'View, search, and preview all agency documents', allowed: true },
      { key: 'doc_upload', label: 'Document Creation & Upload', description: 'Upload new documents and file versions', allowed: true },
      { key: 'doc_approve', label: 'Document Approval Rights', description: 'Authorize or reject submitted document requests', allowed: true },
      { key: 'audit_logs', label: 'Audit Logs & Trail', description: 'Inspect full system activity and security logs', allowed: true },
      { key: 'archive_access', label: 'Archive Management', description: 'Browse and restore archived records', allowed: true },
    ],
  },
  {
    role: 'DEPARTMENT_MANAGER',
    label: 'Department Manager',
    description: 'Manages departmental documents, reviews submission requests, and monitors department activity.',
    capabilities: [
      { key: 'user_mgmt', label: 'User & Personnel Management', description: 'Create, edit, and deactivate user accounts', allowed: false },
      { key: 'dept_mgmt', label: 'Department Administration', description: 'Manage organization structure and managers', allowed: false },
      { key: 'doc_view', label: 'Document Access & Preview', description: 'View, search, and preview agency documents', allowed: true },
      { key: 'doc_upload', label: 'Document Creation & Upload', description: 'Upload new documents and file versions', allowed: true },
      { key: 'doc_approve', label: 'Document Approval Rights', description: 'Authorize or reject submitted document requests', allowed: true },
      { key: 'audit_logs', label: 'Audit Logs & Trail', description: 'Inspect full system activity and security logs', allowed: false },
      { key: 'archive_access', label: 'Archive Management', description: 'Browse archived records', allowed: true },
    ],
  },
  {
    role: 'EMPLOYEE',
    label: 'Employee',
    description: 'Standard officer account for creating draft documents, submitting for approval, and viewing files.',
    capabilities: [
      { key: 'user_mgmt', label: 'User & Personnel Management', description: 'Create, edit, and deactivate user accounts', allowed: false },
      { key: 'dept_mgmt', label: 'Department Administration', description: 'Manage organization structure and managers', allowed: false },
      { key: 'doc_view', label: 'Document Access & Preview', description: 'View, search, and preview allowed documents', allowed: true },
      { key: 'doc_upload', label: 'Document Creation & Upload', description: 'Upload new documents and file versions', allowed: true },
      { key: 'doc_approve', label: 'Document Approval Rights', description: 'Authorize or reject submitted document requests', allowed: false },
      { key: 'audit_logs', label: 'Audit Logs & Trail', description: 'Inspect full system activity and security logs', allowed: false },
      { key: 'archive_access', label: 'Archive Management', description: 'Browse archived records', allowed: true },
    ],
  },
];

export const PermissionsPanel: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="bg-[#ECEAE3] border border-[#D8D7D1] rounded-2xl p-5">
        <h3 className="text-base font-bold text-[#292A27]">System Clearance & Role Permissions</h3>
        <p className="text-xs text-[#6B6A64] mt-1">
          Review clearance rules and functional capabilities assigned to each organizational role.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {ROLE_PERMISSIONS.map((config) => (
          <div
            key={config.role}
            className="bg-[#F9F8F5] border border-[#D8D7D1] rounded-2xl p-5 flex flex-col justify-between space-y-4"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-2">
                <h4 className="text-sm font-bold text-[#292A27]">{config.label}</h4>
                <Badge
                  variant={
                    config.role === 'ADMIN'
                      ? 'warning'
                      : config.role === 'DEPARTMENT_MANAGER'
                      ? 'info'
                      : 'neutral'
                  }
                >
                  {config.role}
                </Badge>
              </div>

              <p className="text-xs text-[#6B6A64] leading-relaxed mb-4">{config.description}</p>

              <div className="border-t border-[#D8D7D1]/60 pt-3 space-y-2.5">
                <p className="text-[10px] font-bold uppercase tracking-wider text-[#8A8983]">
                  Capabilities
                </p>

                {config.capabilities.map((cap) => (
                  <div key={cap.key} className="flex items-start gap-2.5 text-xs">
                    <div className="mt-0.5 flex-shrink-0">
                      {cap.allowed ? (
                        <svg className="w-4 h-4 text-[#4A6B4E]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4 text-[#B8B7AF]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      )}
                    </div>
                    <div>
                      <span className={`font-medium ${cap.allowed ? 'text-[#292A27]' : 'text-[#8A8983]'}`}>
                        {cap.label}
                      </span>
                      <p className="text-[10px] text-[#8A8983]">{cap.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PermissionsPanel;
