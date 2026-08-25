import React from 'react';
import { DepartmentStats } from '@/types/report';
import Card from '@/components/common/Card';

interface DepartmentStatsChartProps {
  stats: DepartmentStats;
}

export const DepartmentStatsChart: React.FC<DepartmentStatsChartProps> = ({ stats }) => {
  const maxSubmitted = Math.max(...stats.departments.map((d) => Math.max(d.submitted, 1)));

  return (
    <Card variant="cream" className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-bold text-[#292A27]">Department Performance Breakdown</h3>
          <p className="text-xs text-[#6B6A64] mt-0.5">
            Comparative document processing volume by organizational unit
          </p>
        </div>
        <span className="text-xs font-semibold text-[#526A55] bg-[#526A55]/10 px-3 py-1 rounded-full">
          {stats.departments.length} Departments
        </span>
      </div>

      <div className="space-y-5">
        {stats.departments.map((dept) => {
          const approvedPercent = dept.submitted > 0 ? Math.round((dept.approved / dept.submitted) * 100) : 0;

          return (
            <div key={dept.id} className="bg-[#F9F8F6] p-4 rounded-2xl border border-[#D8D7D1]">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-bold px-2 py-0.5 bg-[#526A55]/15 text-[#526A55] rounded-md font-mono">
                    {dept.code}
                  </span>
                  <span className="text-sm font-bold text-[#292A27]">{dept.name}</span>
                </div>
                <div className="flex items-center space-x-4 text-xs font-medium text-[#6B6A64]">
                  <span>Submitted: <strong className="text-[#292A27] font-mono">{dept.submitted}</strong></span>
                  <span>Approved: <strong className="text-[#4A6B4E] font-mono">{dept.approved}</strong></span>
                  <span>Pending: <strong className="text-[#C48D3F] font-mono">{dept.pending}</strong></span>
                </div>
              </div>

              {/* Progress bar */}
              <div className="w-full bg-[#ECEAE3] h-3 rounded-full overflow-hidden flex">
                <div
                  className="bg-[#4A6B4E] h-full transition-all duration-500"
                  style={{ width: `${(dept.approved / maxSubmitted) * 100}%` }}
                  title={`Approved: ${dept.approved}`}
                />
                <div
                  className="bg-[#C48D3F] h-full transition-all duration-500"
                  style={{ width: `${(dept.pending / maxSubmitted) * 100}%` }}
                  title={`Pending: ${dept.pending}`}
                />
                <div
                  className="bg-[#8B3232] h-full transition-all duration-500"
                  style={{ width: `${(dept.rejected / maxSubmitted) * 100}%` }}
                  title={`Rejected: ${dept.rejected}`}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] font-semibold text-[#6B6A64] mt-2">
                <span>Approval Compliance Rate: {approvedPercent}%</span>
                <span>Members: {dept.totalMembers}</span>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};

export default DepartmentStatsChart;
