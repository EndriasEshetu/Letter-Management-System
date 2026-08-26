import React from 'react';
import { FileText, Clock, CheckCircle, XCircle, Archive } from 'lucide-react';
import { AnalyticsOverview } from '@/types/report';
import StatCard from '@/components/dashboard/StatCard';

interface ReportSummaryCardsProps {
  overview?: AnalyticsOverview | null;
}

export const ReportSummaryCards: React.FC<ReportSummaryCardsProps> = ({ overview }) => {
  const totalDocs = overview?.totalDocuments || 0;
  const pending = overview?.pendingApprovals || 0;
  const approved = overview?.approvedDocuments || 0;
  const rejected = overview?.rejectedDocuments || 0;
  const archived = overview?.archivedDocuments || 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {/* Total Documents */}
      <StatCard
        title="Total Documents"
        value={totalDocs.toLocaleString()}
        description="Uploaded across departments"
        trend={overview?.totalDocumentsTrend}
        trendType="positive"
        icon={<FileText className="w-5 h-5 text-[#526A55]" />}
      />

      {/* Pending Approvals */}
      <StatCard
        title="Pending Approvals"
        value={pending.toLocaleString()}
        description="Awaiting workflow sign-off"
        trend={overview?.pendingApprovalsTrend}
        trendType="neutral"
        highlight={pending > 0}
        icon={<Clock className="w-5 h-5 text-[#C48D3F]" />}
      />

      {/* Approved Documents */}
      <StatCard
        title="Approved Documents"
        value={approved.toLocaleString()}
        description="Official verified records"
        trend={overview?.approvedTrend}
        trendType="positive"
        icon={<CheckCircle className="w-5 h-5 text-[#4A6B4E]" />}
      />

      {/* Rejected Documents */}
      <StatCard
        title="Rejected Documents"
        value={rejected.toLocaleString()}
        description="Returned for revision"
        trend={overview?.rejectedTrend}
        trendType="negative"
        icon={<XCircle className="w-5 h-5 text-[#8B3232]" />}
      />

      {/* Archived Documents */}
      <StatCard
        title="Archived Documents"
        value={archived.toLocaleString()}
        description="Vault historical records"
        icon={<Archive className="w-5 h-5 text-[#6B6A64]" />}
      />
    </div>
  );
};

export default ReportSummaryCards;
