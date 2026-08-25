import React from 'react';
import { Department } from '@/types/department';
import Button from '@/components/common/Button';

interface DepartmentCardProps {
  department: Department;
  onEdit: (department: Department) => void;
  onAssignManager: (department: Department) => void;
}

const getInitials = (name?: string) => {
  if (!name) return 'U';
  const parts = name.trim().split(' ').filter(Boolean);
  if (parts.length === 0) return 'U';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase();
};

export const DepartmentCard: React.FC<DepartmentCardProps> = ({
  department,
  onEdit,
  onAssignManager,
}) => {
  return (
    <div className="bg-[#ECEAE3] border border-[#D8D7D1] rounded-[1.75rem] p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <span className="text-[10px] font-semibold uppercase tracking-[0.32em] text-[#526A55] bg-[#526A55]/10 px-2.5 py-1 rounded-full">
          {department.code}
        </span>
        <span className="text-xs font-semibold text-[#292A27]">
          {department.member_count} {department.member_count === 1 ? 'Employee' : 'Employees'}
        </span>
      </div>

      <div className="mt-4 space-y-3">
        <h2 className="text-lg font-bold text-[#292A27]">{department.name}</h2>
        <p className="text-sm text-[#6B6A64] min-h-[3rem]">
          {department.description?.trim() || 'No description provided.'}
        </p>
      </div>

      <div className="mt-5 flex items-center gap-3">
        <div className="w-11 h-11 rounded-2xl bg-[#526A55]/10 text-[#526A55] flex items-center justify-center font-semibold text-sm">
          {getInitials(department.manager_name)}
        </div>
        <div>
          <p className="text-[10px] uppercase tracking-[0.24em] text-[#8A8983]">Manager</p>
          <p className="text-sm font-semibold text-[#292A27]">
            {department.manager_name || 'Unassigned'}
          </p>
        </div>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Button variant="secondary" size="sm" onClick={() => onEdit(department)}>
          Edit
        </Button>
        <Button variant="outline" size="sm" onClick={() => onAssignManager(department)}>
          Assign Manager
        </Button>
      </div>
    </div>
  );
};

export default DepartmentCard;
