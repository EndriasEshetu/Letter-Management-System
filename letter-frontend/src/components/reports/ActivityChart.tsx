import React from 'react';
import { ActivityStats } from '@/types/report';
import Card from '@/components/common/Card';
import { Upload, CheckSquare, MessageSquare, Archive } from 'lucide-react';

interface ActivityChartProps {
  stats?: ActivityStats | null;
}

export const ActivityChart: React.FC<ActivityChartProps> = ({ stats }) => {
  const timeline = stats?.timeline || [];
  const byType = stats?.byType || [];

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'upload':
        return <Upload className="w-4 h-4 text-[#526A55]" />;
      case 'approval':
        return <CheckSquare className="w-4 h-4 text-[#4A6B4E]" />;
      case 'comment':
        return <MessageSquare className="w-4 h-4 text-[#C48D3F]" />;
      case 'archive':
      default:
        return <Archive className="w-4 h-4 text-[#6B6A64]" />;
    }
  };

  const maxActivity = timeline.length > 0
    ? Math.max(...timeline.map((t) => Math.max(t?.uploads || 0, t?.approvals || 0, t?.comments || 0, 1)))
    : 1;

  return (
    <Card variant="cream" className="mb-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-bold text-[#292A27]">System & Audit Activity Trends</h3>
          <p className="text-xs text-[#6B6A64] mt-0.5">
            Operational activity velocity across document lifecycle events
          </p>
        </div>
      </div>

      {/* Activity Summary Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        {byType.length === 0 ? (
          <p className="col-span-full text-xs text-[#8A8983] italic py-2 text-center">No event type metrics available.</p>
        ) : (
          byType.map((item) => (
            <div key={item.type} className="bg-[#F9F8F6] p-3.5 rounded-2xl border border-[#D8D7D1]">
              <div className="flex items-center space-x-2 mb-1">
                {getActivityIcon(item.type)}
                <span className="text-xs font-semibold text-[#6B6A64] truncate">{item.label}</span>
              </div>
              <p className="text-xl font-bold text-[#292A27] font-mono">{(item.count || 0).toLocaleString()}</p>
            </div>
          ))
        )}
      </div>

      {/* Activity Timeline */}
      <div className="mt-4">
        <div className="h-44 flex items-end justify-between gap-3 pt-6 pb-2 border-b border-[#D8D7D1]">
          {timeline.length === 0 ? (
            <div className="w-full flex items-center justify-center h-full text-xs text-[#8A8983] italic">
              No activity timeline points available.
            </div>
          ) : (
            timeline.map((item, idx) => {
              const uploadH = Math.max(Math.round(((item?.uploads || 0) / maxActivity) * 100), 10);
              const approvalH = Math.max(Math.round(((item?.approvals || 0) / maxActivity) * 100), 8);
              const commentH = Math.max(Math.round(((item?.comments || 0) / maxActivity) * 100), 14);

              return (
                <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full group">
                  <div className="w-full flex items-end justify-center gap-1 h-full px-0.5">
                    <div
                      className="w-1/3 bg-[#526A55] rounded-t-sm transition-all group-hover:opacity-80"
                      style={{ height: `${uploadH}%` }}
                      title={`Uploads: ${item?.uploads || 0}`}
                    />
                    <div
                      className="w-1/3 bg-[#4A6B4E] rounded-t-sm transition-all group-hover:opacity-80"
                      style={{ height: `${approvalH}%` }}
                      title={`Approvals: ${item?.approvals || 0}`}
                    />
                    <div
                      className="w-1/3 bg-[#C48D3F] rounded-t-sm transition-all group-hover:opacity-80"
                      style={{ height: `${commentH}%` }}
                      title={`Comments: ${item?.comments || 0}`}
                    />
                  </div>
                  <span className="text-[10px] font-medium text-[#6B6A64] mt-2 truncate w-full text-center">
                    {item?.period || ''}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>

      <div className="flex items-center justify-between text-xs text-[#6B6A64] mt-4">
        <div className="flex items-center space-x-4">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-[#526A55]" /> Uploads</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-[#4A6B4E]" /> Approvals</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-[#C48D3F]" /> Comments/Notes</span>
        </div>
        <span>Timeline velocity</span>
      </div>
    </Card>
  );
};

export default ActivityChart;
