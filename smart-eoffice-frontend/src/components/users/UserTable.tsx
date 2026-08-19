import React from 'react';
import Avatar from '@/components/common/Avatar';
import Badge from '@/components/common/Badge';

import { User, UserRole } from '@/types/user';

interface UserTableProps {
  users: User[];
  onEditUser?: (user: User) => void;
  onToggleStatus?: (user: User) => void;
}

const roleBadges: Record<UserRole, { label: string; variant: 'info' | 'warning' | 'neutral' }> = {
  ADMIN: { label: 'Administrator', variant: 'warning' },
  DEPARTMENT_MANAGER: { label: 'Dept Manager', variant: 'info' },
  EMPLOYEE: { label: 'Employee', variant: 'neutral' },
};

export const UserTable: React.FC<UserTableProps> = ({
  users,
  onEditUser,
  onToggleStatus,
}) => {
  return (
    <div className="overflow-x-auto rounded-2xl border border-[#D8D7D1] bg-[#F9F8F5]">
      <table className="w-full text-left text-xs text-[#292A27]">
        <thead className="bg-[#ECEAE3] text-[11px] uppercase font-bold text-[#6B6A64] border-b border-[#D8D7D1]">
          <tr>
            <th scope="col" className="py-3.5 px-4 sm:px-6">Employee</th>
            <th scope="col" className="py-3.5 px-4">Contact</th>
            <th scope="col" className="py-3.5 px-4">Department</th>
            <th scope="col" className="py-3.5 px-4">Clearance</th>
            <th scope="col" className="py-3.5 px-4">Status</th>
            <th scope="col" className="py-3.5 px-4 text-right">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-[#D8D7D1]/60">
          {users.map((user) => {
            const roleInfo = roleBadges[user.role] || roleBadges.EMPLOYEE;
            const isActive = user.status === 'ACTIVE' || user.is_active !== false;

            return (
              <tr key={user.id} className="hover:bg-[#ECEAE3]/50 transition-colors">
                {/* Employee Name + Avatar + Job Title */}
                <td className="py-3.5 px-4 sm:px-6">
                  <div className="flex items-center gap-3">
                    <Avatar name={user.full_name} size="md" />
                    <div className="min-w-0">
                      <span className="font-bold text-[#292A27] text-sm block truncate">
                        {user.full_name}
                      </span>
                      <span className="text-[11px] text-[#6B6A64] block truncate">
                        {user.job_title || 'Staff Member'} · <span className="font-mono text-[10px] text-[#8A8983]">#{String(user.id)}</span>
                      </span>
                    </div>
                  </div>
                </td>

                {/* Contact Email + Phone */}
                <td className="py-3.5 px-4">
                  <span className="block font-medium text-[#292A27] truncate max-w-[180px]">
                    {user.email}
                  </span>
                  {user.phone && (
                    <span className="block text-[11px] text-[#8A8983]">{user.phone}</span>
                  )}
                </td>

                {/* Department */}
                <td className="py-3.5 px-4">
                  <span className="font-semibold text-[#526A55] bg-[#526A55]/10 px-2.5 py-1 rounded-full text-[11px] whitespace-nowrap">
                    {user.department_name || 'General'}
                  </span>
                </td>

                {/* Clearance / Role */}
                <td className="py-3.5 px-4">
                  <Badge variant={roleInfo.variant}>{roleInfo.label}</Badge>
                </td>

                {/* Status */}
                <td className="py-3.5 px-4">
                  <Badge variant={isActive ? 'success' : 'neutral'} dot>
                    {isActive ? 'Active' : 'Inactive'}
                  </Badge>
                </td>

                {/* Actions */}
                <td className="py-3.5 px-4 text-right">
                  <div className="flex items-center justify-end gap-1.5">
                    {onEditUser && (
                      <button
                        type="button"
                        onClick={() => onEditUser(user)}
                        className="p-1.5 text-[#6B6A64] hover:text-[#526A55] hover:bg-[#D8D7D1]/50 rounded-lg transition-colors focus:outline-none"
                        aria-label={`Edit ${user.full_name}`}
                        title="Edit User"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                    )}

                    {onToggleStatus && (
                      <button
                        type="button"
                        onClick={() => onToggleStatus(user)}
                        className={`p-1.5 rounded-lg transition-colors focus:outline-none ${
                          isActive
                            ? 'text-[#8B3232] hover:bg-[#8B3232]/10'
                            : 'text-[#4A6B4E] hover:bg-[#4A6B4E]/10'
                        }`}
                        aria-label={isActive ? `Deactivate ${user.full_name}` : `Activate ${user.full_name}`}
                        title={isActive ? 'Deactivate Account' : 'Activate Account'}
                      >
                        {isActive ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        )}
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default UserTable;
