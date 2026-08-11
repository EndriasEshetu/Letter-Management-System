import React from 'react';
import Select from '@/components/common/Select';
import SearchInput from '@/components/common/SearchInput';
import { Department } from '@/types/department';

interface UserFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedRole: string;
  onRoleChange: (role: string) => void;
  selectedDepartment: string;
  onDepartmentChange: (deptId: string) => void;
  selectedStatus: string;
  onStatusChange: (status: string) => void;
  departments: Department[];
}

export const UserFilters: React.FC<UserFiltersProps> = ({
  searchQuery,
  onSearchChange,
  selectedRole,
  onRoleChange,
  selectedDepartment,
  onDepartmentChange,
  selectedStatus,
  onStatusChange,
  departments,
}) => {
  const roleOptions = [
    { value: 'ALL', label: 'All Roles' },
    { value: 'ADMIN', label: 'Administrator' },
    { value: 'DEPARTMENT_MANAGER', label: 'Department Manager' },
    { value: 'EMPLOYEE', label: 'Employee' },
  ];

  const departmentOptions = [
    { value: 'ALL', label: 'All Departments' },
    ...departments.map((d) => ({
      value: String(d.id),
      label: d.name,
    })),
  ];

  const statusOptions = [
    { value: 'ALL', label: 'All Statuses' },
    { value: 'ACTIVE', label: 'Active' },
    { value: 'INACTIVE', label: 'Inactive' },
  ];

  return (
    <div className="bg-[#ECEAE3] border border-[#D8D7D1] rounded-2xl p-4 space-y-3 sm:space-y-0 sm:flex sm:items-center sm:gap-3 flex-wrap">
      {/* Search Input */}
      <div className="flex-1 min-w-[200px]">
        <SearchInput
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          onClear={() => onSearchChange('')}
          placeholder="Search personnel by name, email, or job title..."
        />
      </div>

      {/* Role Filter */}
      <div className="w-full sm:w-44">
        <Select
          options={roleOptions}
          value={selectedRole}
          onChange={(e) => onRoleChange(e.target.value)}
        />
      </div>

      {/* Department Filter */}
      <div className="w-full sm:w-48">
        <Select
          options={departmentOptions}
          value={selectedDepartment}
          onChange={(e) => onDepartmentChange(e.target.value)}
        />
      </div>

      {/* Status Filter */}
      <div className="w-full sm:w-36">
        <Select
          options={statusOptions}
          value={selectedStatus}
          onChange={(e) => onStatusChange(e.target.value)}
        />
      </div>
    </div>
  );
};

export default UserFilters;
