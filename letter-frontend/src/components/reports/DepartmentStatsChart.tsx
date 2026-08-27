import React from 'react';
import { DepartmentStats } from '@/types/report';
import Card from '@/components/common/Card';

interface DepartmentStatsChartProps {
  stats?: DepartmentStats | null;
}

export const DepartmentStatsChart: React.FC<DepartmentStatsChartProps> = ({ stats }) => {
  const departments = stats?.departments || [];
  const maxSubmitted = departments.length > 0
    ? Math.max(...departments.map((d) => Math.max(d?.submitted || 0, 1)))
    : 1;

  return (
    <Card variant="cream" className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-bold text-[#292A27]">Directorate Performance Breakdown</h3>
          <p className="text-xs text-[#6B6A64] mt-0.5">
            Comparative document processing volume by Directorate
          </p>
        </div>
        <span className="text-xs font-semibold text-[#526A55] bg-[#526A55]/10 px-3 py-1 rounded-full">
          {departments.length} Directorates
        </span>
      </div>

      <div className="space-y-5">
        {departments.length === 0 ? (
          <p className="text-xs text-[#8A8983] italic py-4 text-center">No directorate performance records found.</p>
        ) : (
          departments.map((dept) => {
            const submitted = dept?.submitted || 0;
            const approved = dept?.approved || 0;
            const pending = dept?.pending || 0;
            const rejected = dept?.rejected || 0;
            const approvedPercent = submitted > 0 ? Math.round((approved / submitted) * 100) : 0;

            return (
              <div key={dept?.id || dept?.name} className="bg-[#F9F8F6] p-4 rounded-2xl border border-[#D8D7D1]">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-xs font-bold px-2 py-0.5 bg-[#526A55]/15 text-[#526A55] rounded-md font-mono">
                      {dept?.code || 'DIR'}
                    </span>
                    <span className="text-sm font-bold text-[#292A27]">{dept?.name}</span>
                  </div>
                  <div className="flex items-center space-x-4 text-xs font-medium text-[#6B6A64]">
                    <span>Submitted: <strong className="text-[#292A27] font-mono">{submitted}</strong></span>
                    <span>Approved: <strong className="text-[#4A6B4E] font-mono">{approved}</strong></span>
                    <span>Pending: <strong className="text-[#C48D3F] font-mono">{pending}</strong></span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="w-full bg-[#ECEAE3] h-3 rounded-full overflow-hidden flex">
                  <div
                    className="bg-[#4A6B4E] h-full transition-all duration-500"
                    style={{ width: `${(approved / maxSubmitted) * 100}%` }}
                    title={`Approved: ${approved}`}
                  />
                  <div
                    className="bg-[#C48D3F] h-full transition-all duration-500"
                    style={{ width: `${(pending / maxSubmitted) * 100}%` }}
                    title={`Pending: ${pending}`}
                  />
                  <div
                    className="bg-[#8B3232] h-full transition-all duration-500"
                    style={{ width: `${(rejected / maxSubmitted) * 100}%` }}
                    title={`Rejected: ${rejected}`}
                  />
                </div>

                <div className="flex justify-between items-center text-[11px] text-[#6B6A64] mt-1.5">
                  <span className="font-semibold text-[#526A55]">{approvedPercent}% Approval Rate</span>
                  <span>{dept?.totalMembers || 0} Staff Assigned</span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </Card>
  );
};

export default DepartmentStatsChart;
