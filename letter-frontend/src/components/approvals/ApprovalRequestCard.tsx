import React from 'react';
import { useNavigate } from 'react-router-dom';
import Avatar from '@/components/common/Avatar';
import Button from '@/components/common/Button';
import Badge from '@/components/common/Badge';
import { ApprovalRequest } from '@/types/approval';
import { LetterTimeline } from '@/components/letters';

interface ApprovalRequestCardProps {
  request: ApprovalRequest;
  onApprove: (request: ApprovalRequest) => void;
  onReject: (request: ApprovalRequest) => void;
  onRequestChanges: (request: ApprovalRequest) => void;
  isProcessing?: boolean;
}

const formatFileSize = (bytes?: number): string => {
  if (!bytes) return 'Unknown size';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const formatDate = (isoString: string): string => {
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return isoString;
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  } catch {
    return isoString;
  }
};

export const ApprovalRequestCard: React.FC<ApprovalRequestCardProps> = ({
  request,
  onApprove,
  onReject,
  onRequestChanges,
  isProcessing = false,
}) => {
  const navigate = useNavigate();
  const { letter, submitter_name, submitter_role, submitter_department, priority, submitted_at, page_count } = request;

  const isHighPriority = priority === 'HIGH';

  return (
    <div className="bg-[#ECEAE3] border border-[#D8D7D1] rounded-2xl p-5 sm:p-6 space-y-4 hover:border-[#526A55]/40 transition-all duration-200">
      {/* Top Row: Submitter info + Priority */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Avatar name={submitter_name} size="md" />
          <div className="min-w-0">
            <h4 className="text-sm font-semibold text-[#292A27] truncate">{submitter_name}</h4>
            <p className="text-xs text-[#6B6A64] truncate">
              {submitter_role || 'Officer'} · <span className="font-medium">{submitter_department || letter.department_name}</span>
            </p>
          </div>
        </div>

        {/* Priority & Status */}
        <div className="flex items-center gap-2 flex-shrink-0">
          {isHighPriority && (
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#8B3232]/12 text-[#8B3232] border border-[#8B3232]/20">
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              HIGH PRIORITY
            </span>
          )}
          {request.status !== 'PENDING' && (
            <Badge status={request.status === 'APPROVED' ? 'APPROVED' : request.status === 'REJECTED' ? 'REJECTED' : 'PENDING_APPROVAL'} />
          )}
        </div>
      </div>

      {/* Middle Row: Letter details box */}
      <div className="bg-[#F9F8F5] border border-[#D8D7D1]/70 rounded-xl p-4 space-y-2">
        <div className="flex items-start justify-between gap-3">
          <button
            type="button"
            onClick={() => navigate(`/letters/${letter.id}/preview`)}
            className="flex items-center gap-2.5 text-left group min-w-0 focus:outline-none focus:ring-2 focus:ring-[#526A55] rounded-lg"
          >
            <div className="p-2 bg-[#526A55]/10 text-[#526A55] rounded-lg flex-shrink-0 group-hover:bg-[#526A55] group-hover:text-[#F5F3ED] transition-colors">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>
            <div className="min-w-0">
              <h5 className="text-sm font-semibold text-[#292A27] group-hover:text-[#526A55] transition-colors truncate">
                {letter.subject}
              </h5>
              <p className="text-xs text-[#8A8983] font-mono">{letter.referenceNumber}</p>
            </div>
          </button>

          <Button
            variant="outline"
            size="sm"
            onClick={() => navigate(`/letters/${letter.id}/preview`)}
            className="flex-shrink-0 text-xs"
          >
            View Letter
          </Button>
        </div>

        {letter.description && (
          <p className="text-xs text-[#6B6A64] line-clamp-2 pl-1 pt-1">{letter.description}</p>
        )}

        {/* Metadata Footer */}
        <div className="flex items-center gap-4 text-[11px] text-[#8A8983] pt-1 pl-1 flex-wrap">
          <span>Type: {letter.letterType}</span>
          <span>· Size: {formatFileSize(letter.file_size)}</span>
          {typeof page_count === 'number' && <span>· Pages: {page_count}</span>}
          <span>· Submitted: {formatDate(submitted_at)}</span>
        </div>

        {/* Letter Progression Timeline */}
        <div className="pt-2 border-t border-[#D8D7D1]/50">
          <LetterTimeline
            currentStatus={request.status === 'PENDING' ? 'PENDING_APPROVAL' : request.status}
            direction={letter.direction || 'INCOMING'}
            rejectionReason={request.comment}
            timestamps={{ registered_at: formatDate(submitted_at), reviewed_at: request.reviewed_at ? formatDate(request.reviewed_at) : undefined }}
          />
        </div>
      </div>

      {/* Action Buttons (Only for PENDING requests) */}
      {request.status === 'PENDING' && (
        <div className="flex items-center justify-end gap-2 pt-1 flex-wrap sm:flex-nowrap">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onReject(request)}
            disabled={isProcessing}
            className="border-[#8B3232]/40 text-[#8B3232] hover:bg-[#8B3232]/10"
          >
            Reject
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={() => onRequestChanges(request)}
            disabled={isProcessing}
          >
            Request Changes
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => onApprove(request)}
            disabled={isProcessing}
          >
            Approve Letter
          </Button>
        </div>
      )}
    </div>
  );
};

export default ApprovalRequestCard;
