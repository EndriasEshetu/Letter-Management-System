import React from 'react';
import { Department, SystemCapacityInfo } from '@/types/department';

interface DepartmentOverviewProps {
  departments: Department[];
  capacity: SystemCapacityInfo | null;
  isLoading?: boolean;
}

export const DepartmentOverview: React.FC<DepartmentOverviewProps> = ({
  departments,
  capacity,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="bg-[#ECEAE3] border border-[#D8D7D1] rounded-2xl p-5 space-y-4 animate-pulse">
        <div className="h-4 bg-[#D8D7D1] rounded-md w-1/3" />
        <div className="space-y-3">
          <div className="h-16 bg-[#D8D7D1]/60 rounded-xl" />
          <div className="h-16 bg-[#D8D7D1]/60 rounded-xl" />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* ── Department Overview Card Container ── */}
      <div className="bg-[#ECEAE3] border border-[#D8D7D1] rounded-2xl p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-bold text-[#292A27] uppercase tracking-wider">
            Department Overview
          </h4>
          <span className="text-[11px] font-semibold text-[#526A55] bg-[#526A55]/10 px-2 py-0.5 rounded-full">
            {departments.length} Depts
          </span>
        </div>

        {/* Department cards list */}
        <div className="space-y-2.5">
          {departments.map((dept) => (
            <div
              key={dept.id}
              className="bg-[#F9F8F5] border border-[#D8D7D1]/70 rounded-xl p-3.5 flex items-center justify-between gap-3 hover:border-[#526A55]/30 transition-colors"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-8 h-8 bg-[#526A55]/10 text-[#526A55] rounded-lg flex items-center justify-center font-bold text-xs flex-shrink-0">
                  {dept.code.replace('DEP-', '')}
                </div>
                <div className="min-w-0">
                  <h5 className="text-xs font-bold text-[#292A27] truncate">{dept.name}</h5>
                  <p className="text-[11px] text-[#6B6A64] truncate">
                    Manager: <span className="font-semibold text-[#292A27]">{dept.manager_name || 'Unassigned'}</span>
                  </p>
                </div>
              </div>

              <div className="text-right flex-shrink-0">
                <span className="block text-xs font-bold text-[#526A55]">{dept.member_count}</span>
                <span className="block text-[10px] text-[#8A8983]">members</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── System Capacity Card ── */}
      {capacity && (
        <div className="bg-[#ECEAE3] border border-[#D8D7D1] rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-[#292A27] uppercase tracking-wider">
              System Capacity
            </h4>
            <span className="text-xs font-bold text-[#526A55]">
              {capacity.utilization_percent}% Used
            </span>
          </div>

          <div className="w-full h-2.5 bg-[#D8D7D1] rounded-full overflow-hidden">
            <div
              className="h-full bg-[#526A55] rounded-full transition-all duration-500"
              style={{ width: `${Math.min(capacity.utilization_percent, 100)}%` }}
            />
          </div>

          <div className="flex items-center justify-between text-[11px] text-[#6B6A64]">
            <span>Active Personnel: <strong className="text-[#292A27]">{capacity.used_licenses}</strong></span>
            <span>Total Licenses: <strong className="text-[#292A27]">{capacity.total_licenses}</strong></span>
          </div>
        </div>
      )}
    </div>
  );
};

export default DepartmentOverview;
