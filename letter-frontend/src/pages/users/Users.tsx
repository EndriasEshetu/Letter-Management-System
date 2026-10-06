import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/common/Toast';
import userService, { UserFilterParams } from '@/services/userService';
import departmentService from '@/services/departmentService';
import { User, CreateUserPayload, UpdateUserPayload } from '@/types/user';
import { Department, SystemCapacityInfo } from '@/types/department';

import AccessDenied from '@/components/common/AccessDenied';
import Button from '@/components/common/Button';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorState from '@/components/common/ErrorState';
import EmptyState from '@/components/common/EmptyState';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import UserFilters from '@/components/users/UserFilters';
import UserTable from '@/components/users/UserTable';
import UserFormModal from '@/components/users/UserFormModal';
import EditUserModal from '@/components/users/EditUserModal';
import DepartmentOverview from '@/components/users/DepartmentOverview';
import PermissionsPanel from '@/components/users/PermissionsPanel';
import DepartmentDetailsModal from '@/components/users/DepartmentDetailsModal';
import { Eye } from 'lucide-react';

type DirectoryTab = 'USERS' | 'DEPARTMENTS' | 'PERMISSIONS';

export const Users: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useToast();

  /* ── Tab State ── */
  const [activeTab, setActiveTab] = useState<DirectoryTab>('USERS');

  /* ── Filter State ── */
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRole, setSelectedRole] = useState('ALL');
  const [selectedDepartment, setSelectedDepartment] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [currentPage, setCurrentPage] = useState(1);

  /* ── Data State ── */
  const [users, setUsers] = useState<User[]>([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [capacity, setCapacity] = useState<SystemCapacityInfo | null>(null);

  /* ── Loading / Error ── */
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* ── Modal State ── */
  const [isAddUserOpen, setIsAddUserOpen] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [editUserTarget, setEditUserTarget] = useState<User | null>(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const [deleteUserTarget, setDeleteUserTarget] = useState<User | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [toggleUserTarget, setToggleUserTarget] = useState<User | null>(null);
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);
  const [selectedDeptDetailsId, setSelectedDeptDetailsId] = useState<number | string | null>(null);

  /* ── Load Users & System Data ── */
  const loadUsersData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    const params: UserFilterParams = {
      search: searchQuery,
      role: selectedRole,
      department_id: selectedDepartment,
      status: selectedStatus,
      page: currentPage,
      limit: 8,
    };

    try {
      const [userRes, deptRes, capRes] = await Promise.all([
        userService.getUsers(params),
        departmentService.getDepartments(),
        departmentService.getSystemCapacity(),
      ]);

      setUsers(userRes.data ?? []);
      setTotalUsers(userRes.total ?? 0);
      setTotalPages(userRes.totalPages ?? 1);
      setDepartments(deptRes);
      setCapacity(capRes);
    } catch (err: any) {
      console.error('[SystemDirectory] Failed to load directory:', err);
      setError('Unable to load directory data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, selectedRole, selectedDepartment, selectedStatus, currentPage]);

  useEffect(() => {
    loadUsersData();
  }, [loadUsersData]);

  /* ── Action Handlers ── */

  const handleCreateUser = async (payload: CreateUserPayload) => {
    setIsCreating(true);
    try {
      await userService.createUser(payload);
      addToast({
        type: 'success',
        title: 'Personnel Created',
        message: `Successfully created account for "${payload.full_name}".`,
      });
      setIsAddUserOpen(false);
      loadUsersData();
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'User Creation Failed',
        message: 'Could not create personnel account. Please try again.',
      });
    } finally {
      setIsCreating(false);
    }
  };

  const handleConfirmToggleStatus = async () => {
    if (!toggleUserTarget) return;
    setIsTogglingStatus(true);
    try {
      await userService.toggleUserStatus(toggleUserTarget.id);
      const isNowActive = toggleUserTarget.status !== 'ACTIVE';
      addToast({
        type: isNowActive ? 'success' : 'warning',
        title: isNowActive ? 'Account Activated' : 'Account Deactivated',
        message: `User "${toggleUserTarget.full_name}" is now ${isNowActive ? 'active' : 'inactive'}.`,
      });
      setToggleUserTarget(null);
      loadUsersData();
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Action Failed',
        message: 'Could not update user status.',
      });
    } finally {
      setIsTogglingStatus(false);
    }
  };

  const handleUpdateUser = async (payload: UpdateUserPayload) => {
    if (!editUserTarget) return;
    setIsUpdating(true);
    try {
      await userService.updateUser(editUserTarget.id, payload);
      addToast({
        type: 'success',
        title: 'Personnel Information Updated',
        message: `Successfully updated account for "${payload.full_name || editUserTarget.full_name}".`,
      });
      setEditUserTarget(null);
      loadUsersData();
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Update Failed',
        message: err.message || 'Could not update personnel information.',
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteUserTarget) return;
    setIsDeleting(true);
    try {
      await userService.deleteUser(deleteUserTarget.id);
      addToast({
        type: 'success',
        title: 'Personnel Account Deleted',
        message: `Account "${deleteUserTarget.full_name}" has been permanently removed from the system.`,
      });
      setDeleteUserTarget(null);
      loadUsersData();
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Deletion Failed',
        message: err.message || 'Could not delete personnel account.',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  /* ── Admin Access Check ── */
  const isAdmin = user?.role === 'ADMIN';

  if (!isAdmin) {
    return (
      <AccessDenied
        title="Access Restricted"
        description="System Directory and User Management is restricted to Administrators only."
        role={user?.role}
      />
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#526A55] bg-[#526A55]/10 px-2.5 py-1 rounded-md">
            SYSTEM DIRECTORY
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#292A27] tracking-tight mt-2">
            System Directory
          </h1>
          <p className="text-sm text-[#6B6A64] mt-1">
            Manage organizational access and departmental structure.
          </p>
        </div>

        {/* Action Button: Add New User */}
        <Button
          variant="primary"
          size="md"
          onClick={() => setIsAddUserOpen(true)}
          className="self-start sm:self-auto"
        >
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          ADD NEW USER
        </Button>
      </div>

      {/* ── Directory Tabs ── */}
      <div className="flex items-center gap-2 border-b border-[#D8D7D1] pb-3 overflow-x-auto">
        {(['USERS', 'DEPARTMENTS', 'PERMISSIONS'] as DirectoryTab[]).map((tab) => {
          const isActive = activeTab === tab;
          return (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2 text-xs font-bold rounded-xl uppercase tracking-wider transition-all duration-150 whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-[#526A55] ${
                isActive
                  ? 'bg-[#526A55] text-[#F5F3ED] shadow-xs'
                  : 'bg-[#ECEAE3] text-[#292A27] hover:bg-[#D8D7D1]/60'
              }`}
            >
              {tab}
            </button>
          );
        })}
      </div>

      {/* ── Main Tab Content ── */}

      {/* 1. USERS TAB */}
      {activeTab === 'USERS' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left 2 Cols: Filters + User Table + Pagination */}
          <div className="lg:col-span-2 space-y-4">
            <UserFilters
              searchQuery={searchQuery}
              onSearchChange={(q) => {
                setSearchQuery(q);
                setCurrentPage(1);
              }}
              selectedRole={selectedRole}
              onRoleChange={(r) => {
                setSelectedRole(r);
                setCurrentPage(1);
              }}
              selectedDepartment={selectedDepartment}
              onDepartmentChange={(d) => {
                setSelectedDepartment(d);
                setCurrentPage(1);
              }}
              selectedStatus={selectedStatus}
              onStatusChange={(s) => {
                setSelectedStatus(s);
                setCurrentPage(1);
              }}
              departments={departments}
            />

            <div className="flex items-center justify-between text-xs text-[#6B6A64] px-1">
              <span className="font-semibold text-[#292A27]">Active Personnel</span>
              <span>Showing {users.length} of {totalUsers} personnel</span>
            </div>

            {isLoading ? (
              <div className="py-20 flex justify-center">
                <LoadingSpinner size="md" label="Loading directory personnel..." />
              </div>
            ) : error ? (
              <ErrorState
                title="Failed to load personnel"
                description={error}
                retryLabel="Try Again"
                onRetry={loadUsersData}
              />
            ) : users.length === 0 ? (
              <EmptyState
                title="No personnel found"
                description="No users matched your filter criteria."
                actionLabel="Clear Filters"
                onAction={() => {
                  setSearchQuery('');
                  setSelectedRole('ALL');
                  setSelectedDepartment('ALL');
                  setSelectedStatus('ALL');
                }}
              />
            ) : (
              <>
                <UserTable
                  users={users}
                  currentUserId={user?.id}
                  onEditUser={(u) => setEditUserTarget(u)}
                  onToggleStatus={(u) => setToggleUserTarget(u)}
                  onDeleteUser={(u) => setDeleteUserTarget(u)}
                />

                {/* Pagination controls */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between pt-2">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                      disabled={currentPage === 1}
                    >
                      Previous
                    </Button>

                    <span className="text-xs font-semibold text-[#6B6A64]">
                      Page {currentPage} of {totalPages}
                    </span>

                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                      disabled={currentPage === totalPages}
                    >
                      Next
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Right 1 Col: Department Overview & System Capacity */}
          <div>
            <DepartmentOverview
              departments={departments}
              capacity={capacity}
              isLoading={isLoading}
              onViewDetails={(id) => setSelectedDeptDetailsId(id)}
            />
          </div>
        </div>
      )}

      {/* 2. DEPARTMENTS TAB */}
      {activeTab === 'DEPARTMENTS' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-[#292A27]">SITA Organizational Departments</h3>
                <p className="text-xs text-[#8A8983]">Official directorates and assigned leadership clearance.</p>
              </div>
              <span className="text-xs font-semibold text-[#526A55] bg-[#526A55]/10 px-2.5 py-1 rounded-full">
                {departments.length} Directorates
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {departments.map((dept) => (
                <div
                  key={dept.id}
                  className="bg-[#ECEAE3] border border-[#D8D7D1] rounded-2xl p-5 flex flex-col justify-between space-y-4 shadow-2xs hover:border-[#526A55]/30 transition-colors"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#526A55] bg-[#526A55]/10 px-2.5 py-1 rounded-md">
                        {dept.code}
                      </span>
                      <span className="text-xs font-semibold text-[#292A27] bg-white/70 px-2.5 py-0.5 rounded-full border border-[#D8D7D1]/50">
                        {dept.member_count} Members
                      </span>
                    </div>
                    <h4 className="text-base font-bold text-[#292A27]">{dept.name}</h4>
                    <p className="text-xs text-[#6B6A64] line-clamp-2">{dept.description}</p>
                  </div>

                  <div className="pt-3 border-t border-[#D8D7D1]/60 flex items-center justify-between gap-2 text-xs">
                    <div className="text-[#6B6A64] truncate">
                      Manager: <strong className="text-[#292A27]">{dept.manager_name || 'Unassigned'}</strong>
                    </div>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setSelectedDeptDetailsId(dept.id)}
                      className="flex-shrink-0 cursor-pointer text-xs py-1 px-3 font-semibold text-[#526A55] border-[#526A55]/30 hover:bg-[#526A55]/10"
                    >
                      <Eye className="w-3.5 h-3.5 mr-1.5 text-[#526A55]" />
                      Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <DepartmentOverview
              departments={departments}
              capacity={capacity}
              isLoading={isLoading}
              onViewDetails={(id) => setSelectedDeptDetailsId(id)}
            />
          </div>
        </div>
      )}

      {/* 3. PERMISSIONS TAB */}
      {activeTab === 'PERMISSIONS' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <PermissionsPanel />
          </div>

          <div>
            <DepartmentOverview
              departments={departments}
              capacity={capacity}
              isLoading={isLoading}
              onViewDetails={(id) => setSelectedDeptDetailsId(id)}
            />
          </div>
        </div>
      )}

      {/* ── Add New User Modal ── */}
      <UserFormModal
        open={isAddUserOpen}
        onClose={() => setIsAddUserOpen(false)}
        onSubmit={handleCreateUser}
        departments={departments}
        isLoading={isCreating}
      />

      {/* ── Edit User Modal (All information editable for Admin) ── */}
      <EditUserModal
        open={Boolean(editUserTarget)}
        user={editUserTarget}
        onClose={() => setEditUserTarget(null)}
        onSubmit={handleUpdateUser}
        departments={departments}
        isLoading={isUpdating}
      />

      {/* ── Toggle Status Confirm Dialog ── */}
      <ConfirmDialog
        open={Boolean(toggleUserTarget)}
        title={toggleUserTarget?.status === 'ACTIVE' ? 'Deactivate Personnel Account?' : 'Activate Personnel Account?'}
        description={`Are you sure you want to ${
          toggleUserTarget?.status === 'ACTIVE' ? 'deactivate' : 'activate'
        } "${toggleUserTarget?.full_name}"?`}
        confirmLabel={toggleUserTarget?.status === 'ACTIVE' ? 'Deactivate' : 'Activate'}
        danger={toggleUserTarget?.status === 'ACTIVE'}
        isLoading={isTogglingStatus}
        onConfirm={handleConfirmToggleStatus}
        onCancel={() => setToggleUserTarget(null)}
      />

      {/* ── Delete User Confirm Dialog ── */}
      <ConfirmDialog
        open={Boolean(deleteUserTarget)}
        title="Delete Personnel Account?"
        description={`Are you sure you want to permanently delete the account for "${deleteUserTarget?.full_name}" (${deleteUserTarget?.role?.replace(/_/g, ' ')})? This will immediately revoke their access and unlink their profile across the system.`}
        confirmLabel="Delete Account Permanently"
        danger
        isLoading={isDeleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteUserTarget(null)}
      />

      {/* ── Department Details Modal ── */}
      <DepartmentDetailsModal
        open={Boolean(selectedDeptDetailsId)}
        departmentId={selectedDeptDetailsId}
        onClose={() => setSelectedDeptDetailsId(null)}
      />
    </div>
  );
};

export default Users;
