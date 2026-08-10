import React from 'react';
import { ActivityItem } from '@/services/dashboardService';
import Card from '@/components/common/Card';
import Avatar from '@/components/common/Avatar';
import EmptyState from '@/components/common/EmptyState';

interface RecentActivityListProps {
  activities: ActivityItem[];
  title?: string;
  className?: string;
}

export const RecentActivityList: React.FC<RecentActivityListProps> = ({
  activities,
  title = 'Recent Activity',
  className = '',
}) => {
  if (!activities || activities.length === 0) {
    return (
      <Card className={className}>
        <h3 className="text-base font-semibold text-[#292A27] mb-3">{title}</h3>
        <EmptyState title="No recent activity" description="Activity records will appear here as team members process documents." />
      </Card>
    );
  }

  return (
    <Card className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between pb-3 border-b border-[#D8D7D1]/60">
        <h3 className="text-base font-semibold text-[#292A27]">{title}</h3>
        <span className="text-xs font-semibold text-[#526A55] bg-[#526A55]/10 px-2 py-0.5 rounded-full">
          Live Log
        </span>
      </div>

      <div className="space-y-3.5">
        {activities.map((item) => (
          <div
            key={item.id}
            className="flex items-start space-x-3 text-xs p-2.5 rounded-xl hover:bg-[#F9F8F5] transition-colors"
          >
            <Avatar name={item.user} size="sm" className="mt-0.5" />
            <div className="flex-1 min-w-0">
              <p className="text-[#252622] leading-snug">
                <span className="font-semibold text-[#292A27]">{item.user}</span>{' '}
                <span className="text-[#6B6A64]">{item.action}</span>{' '}
                <span className="font-medium text-[#526A55]">{item.target}</span>
              </p>
              <p className="text-[11px] text-[#8A8983] mt-1">{item.timestamp}</p>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export default RecentActivityList;
