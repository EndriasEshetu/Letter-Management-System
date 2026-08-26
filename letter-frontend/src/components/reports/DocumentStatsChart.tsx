import React from 'react';
import { DocumentStats } from '@/types/report';
import Card from '@/components/common/Card';

interface DocumentStatsChartProps {
  stats?: DocumentStats | null;
}

export const DocumentStatsChart: React.FC<DocumentStatsChartProps> = ({ stats }) => {
  const byStatus = stats?.byStatus || [];
  const byCategory = stats?.byCategory || [];
  const timeline = stats?.timeline || [];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-[#4A6B4E] text-[#F5F3ED]';
      case 'PENDING_APPROVAL':
        return 'bg-[#C48D3F] text-white';
      case 'REJECTED':
        return 'bg-[#8B3232] text-[#F5F3ED]';
      case 'ARCHIVED':
      default:
        return 'bg-[#6B6A64] text-white';
    }
  };

  const getStatusBarBg = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'bg-[#4A6B4E]';
      case 'PENDING_APPROVAL':
        return 'bg-[#C48D3F]';
      case 'REJECTED':
        return 'bg-[#8B3232]';
      case 'ARCHIVED':
      default:
        return 'bg-[#6B6A64]';
    }
  };

  const maxUpload = timeline.length > 0
    ? Math.max(...timeline.map((t) => Math.max(t?.uploaded || 0, t?.approved || 0, 1)))
    : 1;

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
      {/* Document Status Breakdown */}
      <Card variant="cream" className="flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-[#292A27]">Documents by Status</h3>
            <span className="text-xs font-semibold text-[#6B6A64] uppercase tracking-wider">
              Status Distribution
            </span>
          </div>

          <div className="space-y-4 my-6">
            {byStatus.length === 0 ? (
              <p className="text-xs text-[#8A8983] italic py-4 text-center">No status breakdown data available.</p>
            ) : (
              byStatus.map((item) => (
                <div key={item.status} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-semibold text-[#292A27]">
                    <div className="flex items-center space-x-2">
                      <span className={`w-2.5 h-2.5 rounded-full ${getStatusColor(item.status)}`} />
                      <span>{item.label}</span>
                    </div>
                    <span className="font-mono text-[#526A55]">
                      {(item.count || 0).toLocaleString()} ({item.percentage || 0}%)
                    </span>
                  </div>
                  <div className="w-full bg-[#D8D7D1]/50 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${getStatusBarBg(item.status)}`}
                      style={{ width: `${Math.min(item.percentage || 0, 100)}%` }}
                    />
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Category breakdown snippet */}
        <div className="border-t border-[#D8D7D1]/60 pt-4 mt-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-[#6B6A64] mb-3">
            Top Categories
          </h4>
          <div className="flex flex-wrap gap-2">
            {byCategory.length === 0 ? (
              <span className="text-xs text-[#8A8983] italic">No category data</span>
            ) : (
              byCategory.map((cat) => (
                <span
                  key={cat.category}
                  className="inline-flex items-center gap-1.5 px-3 py-1 bg-[#F9F8F6] border border-[#D8D7D1] text-xs font-medium text-[#292A27] rounded-xl"
                >
                  <span>{cat.category}</span>
                  <span className="font-semibold text-[#526A55]">({cat.count || 0})</span>
                </span>
              ))
            )}
          </div>
        </div>
      </Card>

      {/* Document Activity Timeline Chart */}
      <Card variant="cream" className="flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-[#292A27]">Document Activity Trend</h3>
            <div className="flex items-center space-x-3 text-xs">
              <span className="flex items-center gap-1 text-[#526A55] font-semibold">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#526A55]" /> Uploaded
              </span>
              <span className="flex items-center gap-1 text-[#4A6B4E] font-semibold">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#4A6B4E]" /> Approved
              </span>
            </div>
          </div>

          <div className="mt-6 mb-2">
            <div className="h-48 flex items-end justify-between gap-2 pt-6 pb-2 border-b border-[#D8D7D1]">
              {timeline.length === 0 ? (
                <div className="w-full flex items-center justify-center h-full text-xs text-[#8A8983] italic">
                  No activity timeline data recorded for this period.
                </div>
              ) : (
                timeline.map((item, idx) => {
                  const uploadHeight = Math.max(Math.round(((item?.uploaded || 0) / maxUpload) * 100), 10);
                  const approvedHeight = Math.max(Math.round(((item?.approved || 0) / maxUpload) * 100), 8);

                  return (
                    <div key={idx} className="flex-1 flex flex-col items-center gap-1 group h-full justify-end">
                      <div className="w-full flex items-end justify-center gap-1 h-full px-1">
                        <div
                          className="w-1/2 bg-[#526A55] rounded-t-sm transition-all duration-300 group-hover:bg-[#435746] relative"
                          style={{ height: `${uploadHeight}%` }}
                          title={`Uploaded: ${item?.uploaded || 0}`}
                        />
                        <div
                          className="w-1/2 bg-[#4A6B4E]/70 rounded-t-sm transition-all duration-300 group-hover:bg-[#4A6B4E] relative"
                          style={{ height: `${approvedHeight}%` }}
                          title={`Approved: ${item?.approved || 0}`}
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
          Shows document volume uploaded vs approved across the selected time period.
        </p>
      </Card>
    </div>
  );
};

export default DocumentStatsChart;
