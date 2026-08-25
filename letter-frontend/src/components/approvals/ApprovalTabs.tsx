import React from 'react';
import { ApprovalFilterTab } from '@/types/approval';

interface ApprovalTabsProps {
  activeTab: ApprovalFilterTab;
  onTabChange: (tab: ApprovalFilterTab) => void;
  pendingCount?: number;
  highPriorityCount?: number;
  reviewedCount?: number;
}

export const ApprovalTabs: React.FC<ApprovalTabsProps> = ({
  activeTab,
  onTabChange,
  pendingCount,
  highPriorityCount,
  reviewedCount,
}) => {
  const tabs: { id: ApprovalFilterTab; label: string; count?: number }[] = [
    { id: 'ALL', label: 'All Requests', count: pendingCount },
    { id: 'HIGH_PRIORITY', label: 'High Priority', count: highPriorityCount },
    { id: 'REVIEWED', label: 'Archived / Reviewed', count: reviewedCount },
  ];

  return (
    <div className="flex items-center gap-2 border-b border-[#D8D7D1] pb-3 mb-6 overflow-x-auto">
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            type="button"
            onClick={() => onTabChange(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl transition-all duration-150 whitespace-nowrap focus:outline-none focus:ring-2 focus:ring-[#526A55] ${
              isActive
                ? 'bg-[#526A55] text-[#F5F3ED] shadow-xs'
                : 'bg-[#ECEAE3] text-[#292A27] hover:bg-[#D8D7D1]/60'
            }`}
          >
            <span>{tab.label}</span>
            {typeof tab.count === 'number' && (
              <span
                className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                  isActive
                    ? 'bg-[#F5F3ED]/20 text-[#F5F3ED]'
                    : 'bg-[#D8D7D1] text-[#292A27]'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
};

export default ApprovalTabs;
