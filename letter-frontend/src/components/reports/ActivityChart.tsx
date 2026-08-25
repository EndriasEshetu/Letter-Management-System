import React from 'react';
import { ActivityStats } from '@/types/report';
import Card from '@/components/common/Card';
import { Upload, CheckSquare, MessageSquare, Archive } from 'lucide-react';

interface ActivityChartProps {
  stats: ActivityStats;
}

export const ActivityChart: React.FC<ActivityChartProps> = ({ stats }) => {
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

  const maxActivity = Math.max(...stats.timeline.map((t) => Math.max(t.uploads, t.approvals, t.comments, 1)));

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
        {stats.byType.map((item) => (
          <div key={item.type} className="bg-[#F9F8F6] p-3.5 rounded-2xl border border-[#D8D7D1]">
            <div className="flex items-center space-x-2 mb-1">
              {getActivityIcon(item.type)}
              <span className="text-xs font-semibold text-[#6B6A64] truncate">{item.label}</span>
            </div>
            <p className="text-xl font-bold text-[#292A27] font-mono">{item.count.toLocaleString()}</p>
          </div>
        ))}
      </div>

      {/* Activity Timeline */}
      <div className="mt-4">
        <div className="h-44 flex items-end justify-between gap-3 pt-6 pb-2 border-b border-[#D8D7D1]">
          {stats.timeline.map((item, idx) => {
            const uploadH = Math.max(Math.round((item.uploads / maxActivity) * 100), 10);
            const approvalH = Math.max(Math.round((item.approvals / maxActivity) * 100), 8);
            const commentH = Math.max(Math.round((item.comments / maxActivity) * 100), 14);

            return (
              <div key={idx} className="flex-1 flex flex-col items-center justify-end h-full group">
                <div className="w-full flex items-end justify-center gap-1 h-full px-1">
                  <div
                    className="w-1/3 bg-[#526A55] rounded-t-sm transition-all duration-300 group-hover:bg-[#435746]"
                    style={{ height: `${uploadH}%` }}
                    title={`Uploads: ${item.uploads}`}
                  />
                  <div
                    className="w-1/3 bg-[#4A6B4E] rounded-t-sm transition-all duration-300 group-hover:bg-[#3B563F]"
                    style={{ height: `${approvalH}%` }}
                    title={`Approvals: ${item.approvals}`}
                  />
                  <div
                    className="w-1/3 bg-[#C48D3F] rounded-t-sm transition-all duration-300 group-hover:bg-[#A37330]"
                    style={{ height: `${commentH}%` }}
                    title={`Comments: ${item.comments}`}
                  />
                </div>
                <span className="text-[11px] font-semibold text-[#6B6A64] mt-2">{item.period}</span>
              </div>
            );
          })}
        </div>
      </div>
    </Card>
  );
};

export default ActivityChart;
