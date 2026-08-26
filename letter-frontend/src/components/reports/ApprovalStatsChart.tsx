import React from 'react';
import { ApprovalStats } from '@/types/report';
import Card from '@/components/common/Card';
import { CheckCircle2, XCircle, Clock, RotateCcw } from 'lucide-react';

interface ApprovalStatsChartProps {
  stats?: ApprovalStats | null;
}

export const ApprovalStatsChart: React.FC<ApprovalStatsChartProps> = ({ stats }) => {
  const timeline = stats?.timeline || [];
  const maxWeeklyApproved = timeline.length > 0
    ? Math.max(...timeline.map((t) => Math.max(t?.approved || 0, 1)))
    : 1;

  const approvedCount = stats?.approvedCount || 0;
  const pendingCount = stats?.pendingCount || 0;
  const rejectedCount = stats?.rejectedCount || 0;
  const changesRequestedCount = stats?.changesRequestedCount || 0;
  const approvalRatePercent = stats?.approvalRatePercent || 0;
  const avgDurationDays = stats?.avgDurationDays || 0;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Workflow Outcomes Summary */}
      <Card variant="cream" className="flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-[#292A27]">Workflow Performance</h3>
            <span className="text-xs font-bold px-2.5 py-1 bg-[#526A55]/15 text-[#526A55] rounded-full">
              {approvalRatePercent}% Approval Rate
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 my-4">
            <div className="bg-[#F9F8F6] p-4 rounded-2xl border border-[#D8D7D1]">
              <div className="flex items-center space-x-2 text-[#4A6B4E] mb-1">
                <CheckCircle2 className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Approved</span>
              </div>
              <p className="text-2xl font-bold text-[#292A27]">{approvedCount.toLocaleString()}</p>
            </div>

            <div className="bg-[#F9F8F6] p-4 rounded-2xl border border-[#D8D7D1]">
              <div className="flex items-center space-x-2 text-[#C48D3F] mb-1">
                <Clock className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Pending</span>
              </div>
              <p className="text-2xl font-bold text-[#292A27]">{pendingCount.toLocaleString()}</p>
            </div>

            <div className="bg-[#F9F8F6] p-4 rounded-2xl border border-[#D8D7D1]">
              <div className="flex items-center space-x-2 text-[#8B3232] mb-1">
                <XCircle className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Rejected</span>
              </div>
              <p className="text-2xl font-bold text-[#292A27]">{rejectedCount.toLocaleString()}</p>
            </div>

            <div className="bg-[#F9F8F6] p-4 rounded-2xl border border-[#D8D7D1]">
              <div className="flex items-center space-x-2 text-[#6B6A64] mb-1">
                <RotateCcw className="w-4 h-4" />
                <span className="text-xs font-bold uppercase tracking-wider">Changes Requested</span>
              </div>
              <p className="text-2xl font-bold text-[#292A27]">{changesRequestedCount.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="border-t border-[#D8D7D1]/60 pt-4 flex items-center justify-between text-xs text-[#6B6A64]">
          <span>Average review resolution time:</span>
          <span className="font-bold text-[#292A27] font-mono">{avgDurationDays} days</span>
        </div>
      </Card>

      {/* Weekly Approval Volume Trend */}
      <Card variant="cream" className="flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-[#292A27]">Weekly Approval Trend</h3>
            <div className="flex items-center space-x-3 text-xs">
              <span className="flex items-center gap-1 text-[#4A6B4E] font-semibold">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#4A6B4E]" /> Approvals
              </span>
              <span className="flex items-center gap-1 text-[#8B3232] font-semibold">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#8B3232]" /> Rejections
              </span>
            </div>
          </div>

          <div className="mt-6 mb-2">
            <div className="h-48 flex items-end justify-between gap-3 pt-6 pb-2 border-b border-[#D8D7D1]">
              {timeline.length === 0 ? (
                <div className="w-full flex items-center justify-center h-full text-xs text-[#8A8983] italic">
                  No weekly approval data available.
                </div>
              ) : (
                timeline.map((item, idx) => {
                  const approvedH = Math.max(Math.round(((item?.approved || 0) / maxWeeklyApproved) * 100), 10);
                  const rejectedH = Math.max(Math.round(((item?.rejected || 0) / maxWeeklyApproved) * 100), 6);

                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1 group h-full justify-end">
                      <div className="w-full flex items-end justify-center gap-1 h-full px-1">
                        <div
                          className="w-1/2 bg-[#4A6B4E] rounded-t-sm transition-all duration-300 group-hover:bg-[#3d5740] relative"
                          style={{ height: `${approvedH}%` }}
                          title={`Approved: ${item?.approved || 0}`}
                        />
                        <div
                          className="w-1/2 bg-[#8B3232] rounded-t-sm transition-all duration-300 group-hover:bg-[#732929] relative"
                          style={{ height: `${rejectedH}%` }}
                          title={`Rejected: ${item?.rejected || 0}`}
                        />
                      </div>
                      <span className="text-[11px] font-medium text-[#6B6A64] mt-2">{item?.period || ''}</span>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>

        <p className="text-xs text-[#6B6A64] font-medium mt-4">
          Visualizes weekly sign-off velocity and rejection rates over time.
        </p>
      </Card>
    </div>
  );
};

export default ApprovalStatsChart;
