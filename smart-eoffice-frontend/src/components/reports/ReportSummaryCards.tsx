import React from 'react';
import { FileText, Clock, CheckCircle, XCircle, Archive, Users, Building } from 'lucide-react';
import { AnalyticsOverview } from '@/types/report';
import StatCard from '@/components/dashboard/StatCard';

interface ReportSummaryCardsProps {
  overview: AnalyticsOverview;
}

export const ReportSummaryCards: React.FC<ReportSummaryCardsProps> = ({ overview }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {/* Total Documents */}
      <StatCard
        title="Total Documents"
        value={overview.totalDocuments.toLocaleString()}
        description="Uploaded across departments"
        trend={overview.totalDocumentsTrend}
        trendType="positive"
        icon={<FileText className="w-5 h-5 text-[#526A55]" />}
      />

      {/* Pending Approvals */}
      <StatCard
        title="Pending Approvals"
        value={overview.pendingApprovals.toLocaleString()}
        description="Awaiting workflow sign-off"
        trend={overview.pendingApprovalsTrend}
        trendType="neutral"
        highlight={overview.pendingApprovals > 0}
        icon={<Clock className="w-5 h-5 text-[#C48D3F]" />}
      />

      {/* Approved Documents */}
      <StatCard
        title="Approved Documents"
        value={overview.approvedDocuments.toLocaleString()}
        description="Official verified records"
        trend={overview.approvedTrend}
        trendType="positive"
        icon={<CheckCircle className="w-5 h-5 text-[#4A6B4E]" />}
      />

      {/* Rejected Documents */}
      <StatCard
        title="Rejected Documents"
        value={overview.rejectedDocuments.toLocaleString()}
        description="Returned for revision"
        trend={overview.rejectedTrend}
        trendType="negative"
        icon={<XCircle className="w-5 h-5 text-[#8B3232]" />}
      />

      {/* Archived Documents */}
      <StatCard
        title="Archived Documents"
        value={overview.archivedDocuments.toLocaleString()}
        description="Vault historical records"
        icon={<Archive className="w-5 h-5 text-[#6B6A64]" />}
      />

      {/* Active Users */}
      <StatCard
        title="Active System Users"
        value={overview.activeUsers.toLocaleString()}
        description="Registered active personnel"
        icon={<Users className="w-5 h-5 text-[#526A55]" />}
      />

      {/* Total Departments */}
      <StatCard
        title="Departments"
        value={overview.departmentsCount.toLocaleString()}
        description="Active organizational units"
        icon={<Building className="w-5 h-5 text-[#526A55]" />}
      />
    </div>
  );
};

export default ReportSummaryCards;
