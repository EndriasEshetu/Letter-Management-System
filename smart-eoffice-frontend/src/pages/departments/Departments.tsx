import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/common/Toast';
import departmentService from '@/services/departmentService';
import userService, { UserFilterParams } from '@/services/userService';
import { Department, CreateDepartmentPayload, UpdateDepartmentPayload } from '@/types/department';
import { User } from '@/types/user';
import Button from '@/components/common/Button';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorState from '@/components/common/ErrorState';
import EmptyState from '@/components/common/EmptyState';
import DepartmentCard from '@/components/departments/DepartmentCard';
import DepartmentFormModal from '@/components/departments/DepartmentFormModal';
import AssignManagerModal from '@/components/departments/AssignManagerModal';

export const Departments: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isDepartmentModalOpen, setIsDepartmentModalOpen] = useState(false);
  const [departmentModalValue, setDepartmentModalValue] = useState<Department | null>(null);
  const [isDepartmentModalLoading, setIsDepartmentModalLoading] = useState(false);

  const [isAssignManagerOpen, setIsAssignManagerOpen] = useState(false);
  const [activeDepartment, setActiveDepartment] = useState<Department | null>(null);
  const [managerOptions, setManagerOptions] = useState<User[]>([]);
  const [selectedManagerId, setSelectedManagerId] = useState<string>('');
  const [isAssignLoading, setIsAssignLoading] = useState(false);

  const loadDepartments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await departmentService.getDepartments();
      setDepartments(data);
    } catch (err: any) {
      console.error('[Departments] Failed to load departments:', err);
      setError('Unable to load department data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadManagers = useCallback(async () => {
    try {
      const params: UserFilterParams = {
        role: 'DEPARTMENT_MANAGER',
        status: 'ACTIVE',
        limit: 100,
      };
      const response = await userService.getUsers(params);
      setManagerOptions(response.data);
    } catch (err: any) {
      console.error('[Departments] Failed to load managers:', err);
      setManagerOptions([]);
    }
  }, []);

  useEffect(() => {
    loadDepartments();
  }, [loadDepartments]);

  useEffect(() => {
    if (isAssignManagerOpen) {
      loadManagers();
    }
  }, [isAssignManagerOpen, loadManagers]);

  const handleOpenCreate = () => {
    setDepartmentModalValue(null);
    setIsDepartmentModalOpen(true);
  };

  const handleOpenEdit = (department: Department) => {
    setDepartmentModalValue(department);
    setIsDepartmentModalOpen(true);
  };

  const handleCreateOrUpdateDepartment = async (payload: CreateDepartmentPayload) => {
    setIsDepartmentModalLoading(true);
    try {
      if (departmentModalValue) {
        const updatePayload: UpdateDepartmentPayload = {
          name: payload.name,
          code: payload.code,
          description: payload.description,
        };
        await departmentService.updateDepartment(departmentModalValue.id, updatePayload);
        addToast({ type: 'success', title: 'Department Updated', message: `${payload.name} has been updated.` });
      } else {
        await departmentService.createDepartment(payload);
        addToast({ type: 'success', title: 'Department Created', message: `${payload.name} has been added.` });
      }
      setIsDepartmentModalOpen(false);
      setDepartmentModalValue(null);
      await loadDepartments();
    } catch (err: any) {
      console.error('[Departments] Create/update failed:', err);
      addToast({ type: 'error', title: 'Save Failed', message: 'Unable to save department. Please try again.' });
    } finally {
      setIsDepartmentModalLoading(false);
    }
  };

  const handleOpenAssignManager = (department: Department) => {
    setActiveDepartment(department);
    setSelectedManagerId(department.manager_id ? String(department.manager_id) : '');
    setIsAssignManagerOpen(true);
  };

  const handleAssignManager = async () => {
    if (!activeDepartment || !selectedManagerId) return;
    setIsAssignLoading(true);
    try {
      const selectedManager = managerOptions.find((m) => String(m.id) === selectedManagerId);
      await departmentService.assignManager(activeDepartment.id, selectedManagerId, selectedManager?.full_name || 'Unassigned');
      addToast({ type: 'success', title: 'Manager Assigned', message: `${selectedManager?.full_name || 'Manager'} has been assigned.` });
      setIsAssignManagerOpen(false);
      setActiveDepartment(null);
      setSelectedManagerId('');
      await loadDepartments();
    } catch (err: any) {
      console.error('[Departments] Assign manager failed:', err);
      addToast({ type: 'error', title: 'Assignment Failed', message: 'Unable to assign manager. Please try again.' });
    } finally {
      setIsAssignLoading(false);
    }
  };

  if (user?.role !== 'ADMIN') {
    return (
      <div className="flex flex-col items-center justify-center text-center py-20 px-6">
        <div className="w-16 h-16 bg-[#8B3232]/10 text-[#8B3232] rounded-2xl flex items-center justify-center mb-4">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-[#292A27]">Access Restricted</h2>
        <p className="text-sm text-[#6B6A64] max-w-sm mt-1">
          Department Management is available to Administrators only.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#526A55] bg-[#526A55]/10 px-2.5 py-1 rounded-md">
            DEPARTMENT MANAGEMENT
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#292A27] tracking-tight mt-2">
            Department Management
          </h1>
          <p className="text-sm text-[#6B6A64] mt-1">
            Manage organizational departments and their assigned leaders.
          </p>
        </div>

        <Button variant="primary" size="md" onClick={handleOpenCreate}>
          <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          ADD DEPARTMENT
        </Button>
      </div>

      {isLoading ? (
        <div className="py-20 flex justify-center">
          <LoadingSpinner size="lg" label="Loading departments..." />
        </div>
      ) : error ? (
        <ErrorState title="Unable to load departments" description={error} onRetry={loadDepartments} />
      ) : departments.length === 0 ? (
        <EmptyState
          title="No departments yet"
          description="Create your first department to organize users and managers."
          actionLabel="Add Department"
          onAction={handleOpenCreate}
        />
      ) : (
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
          {departments.map((department) => (
            <DepartmentCard
              key={department.id}
              department={department}
              onEdit={handleOpenEdit}
              onAssignManager={handleOpenAssignManager}
            />
          ))}
        </div>
      )}

      <DepartmentFormModal
        open={isDepartmentModalOpen}
        onClose={() => {
          setIsDepartmentModalOpen(false);
          setDepartmentModalValue(null);
        }}
        onSubmit={handleCreateOrUpdateDepartment}
        initialValue={departmentModalValue}
        isLoading={isDepartmentModalLoading}
      />

      <AssignManagerModal
        open={isAssignManagerOpen}
        onClose={() => {
          setIsAssignManagerOpen(false);
          setActiveDepartment(null);
          setSelectedManagerId('');
        }}
        department={activeDepartment}
        managers={managerOptions}
        selectedManagerId={selectedManagerId}
        onChangeManagerId={setSelectedManagerId}
        onSubmit={handleAssignManager}
        isLoading={isAssignLoading}
      />
    </div>
  );
};

export default Departments;
