import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/common/Toast';
import userService, { UserFilterParams } from '@/services/userService';
import departmentService from '@/services/departmentService';
import { User, CreateUserPayload } from '@/types/user';
import { Department, SystemCapacityInfo } from '@/types/department';

import Button from '@/components/common/Button';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorState from '@/components/common/ErrorState';
import EmptyState from '@/components/common/EmptyState';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import UserFilters from '@/components/users/UserFilters';
import UserTable from '@/components/users/UserTable';
import UserFormModal from '@/components/users/UserFormModal';
import DepartmentOverview from '@/components/users/DepartmentOverview';
import PermissionsPanel from '@/components/users/PermissionsPanel';

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
  const [toggleUserTarget, setToggleUserTarget] = useState<User | null>(null);
  const [isTogglingStatus, setIsTogglingStatus] = useState(false);

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

      setUsers(userRes.data);
      setTotalUsers(userRes.total);
      setTotalPages(userRes.totalPages);
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

  /* ── Admin Access Check ── */
  const isAdmin = user?.role === 'ADMIN';

  if (!isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-20 px-6">
        <div className="w-16 h-16 bg-[#8B3232]/10 text-[#8B3232] rounded-2xl flex items-center justify-center mb-4">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-[#292A27]">Access Restricted</h2>
        <p className="text-sm text-[#6B6A64] max-w-sm mt-1">
          System Directory and User Management is restricted to Administrators only.
        </p>
      </div>
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
                  onToggleStatus={(u) => setToggleUserTarget(u)}
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
            />
          </div>
        </div>
      )}

      {/* 2. DEPARTMENTS TAB */}
      {activeTab === 'DEPARTMENTS' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-base font-semibold text-[#292A27]">SITA Organizational Departments</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {departments.map((dept) => (
                <div key={dept.id} className="bg-[#ECEAE3] border border-[#D8D7D1] rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#526A55] bg-[#526A55]/10 px-2.5 py-1 rounded-md">
                      {dept.code}
                    </span>
                    <span className="text-xs font-semibold text-[#292A27]">
                      {dept.member_count} Members
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-[#292A27]">{dept.name}</h4>
                  <p className="text-xs text-[#6B6A64] line-clamp-2">{dept.description}</p>
                  <div className="pt-2 border-t border-[#D8D7D1]/60 text-xs text-[#6B6A64]">
                    Manager: <strong className="text-[#292A27]">{dept.manager_name || 'Unassigned'}</strong>
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
    </div>
  );
};

export default Users;
