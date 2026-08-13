import React from 'react';
import { ApprovalStats } from '@/types/report';
import Card from '@/components/common/Card';
import { CheckCircle2, XCircle, Clock, RotateCcw } from 'lucide-react';

interface ApprovalStatsChartProps {
  stats: ApprovalStats;
}

export const ApprovalStatsChart: React.FC<ApprovalStatsChartProps> = ({ stats }) => {
  const maxWeeklyApproved = Math.max(...stats.timeline.map((t) => Math.max(t.approved, 1)));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Workflow Outcomes Summary */}
      <Card variant="cream" className="flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-[#292A27]">Workflow Performance</h3>
            <span className="text-xs font-bold px-2.5 py-1 bg-[#526A55]/15 text-[#526A55] rounded-full">
              {stats.approvalRatePercent}% Approval Rate
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 my-4">
            <div className="bg-[#F9F8F6] p-4 rounded-2xl border border-[#D8D7D1]">
              <div className="flex items-center space-x-2 text-[#4A6B4E] mb-1">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Approved</span>
              </div>
              <p className="text-2xl font-bold text-[#292A27]">{stats.approvedCount.toLocaleString()}</p>
            </div>

            <div className="bg-[#F9F8F6] p-4 rounded-2xl border border-[#D8D7D1]">
              <div className="flex items-center space-x-2 text-[#C48D3F] mb-1">
                <Clock className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Pending</span>
              </div>
              <p className="text-2xl font-bold text-[#292A27]">{stats.pendingCount.toLocaleString()}</p>
            </div>

            <div className="bg-[#F9F8F6] p-4 rounded-2xl border border-[#D8D7D1]">
              <div className="flex items-center space-x-2 text-[#8B3232] mb-1">
                <XCircle className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Rejected</span>
              </div>
              <p className="text-2xl font-bold text-[#292A27]">{stats.rejectedCount.toLocaleString()}</p>
            </div>

            <div className="bg-[#F9F8F6] p-4 rounded-2xl border border-[#D8D7D1]">
              <div className="flex items-center space-x-2 text-[#6B6A64] mb-1">
                <RotateCcw className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Changes Requested</span>
              </div>
              <p className="text-2xl font-bold text-[#292A27]">{stats.changesRequestedCount.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="border-t border-[#D8D7D1]/60 pt-4 flex items-center justify-between text-xs text-[#6B6A64]">
          <span className="font-semibold">Average Turnaround Time</span>
          <span className="font-bold text-[#292A27] font-mono text-sm">
            {stats.avgDurationDays} days (~{Math.round(stats.avgDurationDays * 24)} hrs)
          </span>
        </div>
      </Card>

      {/* Approval Velocity Timeline */}
      <Card variant="cream" className="flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-[#292A27]">Approval Velocity & Outcomes</h3>
            <span className="text-xs font-medium text-[#6B6A64]">Weekly Trend</span>
          </div>

          <div className="mt-6 mb-2">
            <div className="h-44 flex items-end justify-between gap-3 pt-6 pb-2 border-b border-[#D8D7D1]">
              {stats.timeline.map((item, idx) => {
                const barHeight = Math.max(Math.round((item.approved / maxWeeklyApproved) * 100), 12);
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full group">
                    <div className="w-full flex flex-col items-center justify-end h-full">
                      <span className="text-[10px] font-bold text-[#526A55] opacity-0 group-hover:opacity-100 transition-opacity mb-1">
                        {item.avgDurationHours}h avg
                      </span>
                      <div
                        className="w-full bg-[#526A55] rounded-t-lg transition-all duration-300 group-hover:bg-[#435746] relative flex items-start justify-center pt-1"
                        style={{ height: `${barHeight}%` }}
                      >
                        <span className="text-[10px] font-bold text-[#F5F3ED]">{item.approved}</span>
                      </div>
                    </div>
                    <span className="text-[11px] font-semibold text-[#6B6A64] mt-2">{item.period}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <p className="text-xs text-[#6B6A64] font-medium mt-4">
          Higher velocity indicates faster sign-off turnaround by department managers.
        </p>
      </Card>
    </div>
  );
};

export default ApprovalStatsChart;
