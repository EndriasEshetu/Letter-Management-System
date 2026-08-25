import React from 'react';
import { ApprovalMetrics as ApprovalMetricsType } from '@/types/approval';

interface ApprovalMetricsProps {
  metrics: ApprovalMetricsType | null;
  isLoading?: boolean;
}

export const ApprovalMetrics: React.FC<ApprovalMetricsProps> = ({ metrics, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="bg-[#ECEAE3] border border-[#D8D7D1] rounded-2xl p-5 space-y-4 animate-pulse">
        <div className="h-4 bg-[#D8D7D1] rounded-md w-1/3" />
        <div className="grid grid-cols-2 gap-3">
          <div className="h-16 bg-[#D8D7D1]/60 rounded-xl" />
          <div className="h-16 bg-[#D8D7D1]/60 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!metrics) return null;

  return (
    <div className="bg-[#ECEAE3] border border-[#D8D7D1] rounded-2xl p-5 space-y-4">
      <h4 className="text-xs font-bold text-[#292A27] uppercase tracking-wider">Approval Metrics</h4>

      <div className="grid grid-cols-2 gap-3">
        {/* Metric 1: Approval Rate */}
        <div className="bg-[#F9F8F5] border border-[#D8D7D1]/70 rounded-xl p-3.5 flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-[#6B6A64]">Approval Rate</span>
          <span className="text-xl font-bold text-[#526A55] mt-1">
            {metrics.approval_rate_percent !== null ? `${metrics.approval_rate_percent}%` : 'N/A'}
          </span>
        </div>

        {/* Metric 2: Average Turnaround Time */}
        <div className="bg-[#F9F8F5] border border-[#D8D7D1]/70 rounded-xl p-3.5 flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-[#6B6A64]">Avg Turnaround</span>
          <span className="text-xl font-bold text-[#292A27] mt-1">
            {metrics.avg_turnaround_hours !== null ? `${metrics.avg_turnaround_hours} hrs` : 'N/A'}
          </span>
        </div>
      </div>

      {/* Stats Summary Bar */}
      <div className="pt-2 border-t border-[#D8D7D1]/60 flex items-center justify-between text-xs text-[#6B6A64]">
        <span>Pending: <strong className="text-[#292A27]">{metrics.pending_count}</strong></span>
        <span>Approved: <strong className="text-[#526A55]">{metrics.approved_count}</strong></span>
        <span>Rejected: <strong className="text-[#8B3232]">{metrics.rejected_count}</strong></span>
      </div>
    </div>
  );
};

export default ApprovalMetrics;
