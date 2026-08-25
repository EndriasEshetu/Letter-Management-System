import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import letterService from '@/services/letterService';
import { LetterItem, AttachmentItem } from '@/types/letter';
import { useToast } from '@/components/common/Toast';

import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Badge, { LetterStatus } from '@/components/common/Badge';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorState from '@/components/common/ErrorState';
import EmptyState from '@/components/common/EmptyState';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import Dropdown, { DropdownItem } from '@/components/common/Dropdown';
import { UploadAttachmentModal, LetterTimeline } from '@/components/letters';
import CommentSection from '@/components/comments/CommentSection';

/* ─── Confidentiality Badge ──────────────────────────────── */

const confidentialityStyles: Record<string, string> = {
  PUBLIC: 'bg-[#4A6B4E]/10 text-[#4A6B4E] border-[#4A6B4E]/20',
  INTERNAL: 'bg-[#526A55]/10 text-[#526A55] border-[#526A55]/20',
  CONFIDENTIAL: 'bg-[#C48D3F]/10 text-[#8A5D19] border-[#C48D3F]/20',
  RESTRICTED: 'bg-[#8B3232]/10 text-[#8B3232] border-[#8B3232]/20',
};

const ConfidentialityBadge: React.FC<{ level: string }> = ({ level }) => (
  <span
    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
      confidentialityStyles[level] || 'bg-[#D8D7D1]/60 text-[#6B6A64]'
    }`}
  >
    {level || 'Not specified'}
  </span>
);

/* ─── Priority Badge ─────────────────────────────────────── */

const priorityStyles: Record<string, string> = {
  URGENT: 'bg-[#8B3232]/12 text-[#8B3232] border-[#8B3232]/20',
  HIGH: 'bg-[#C48D3F]/12 text-[#8A5D19] border-[#C48D3F]/20',
  NORMAL: 'bg-[#526A55]/12 text-[#3E5140] border-[#526A55]/20',
  LOW: 'bg-[#D8D7D1]/60 text-[#6B6A64] border-[#D8D7D1]',
};

const PriorityBadge: React.FC<{ priority: string }> = ({ priority }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${priorityStyles[priority] || priorityStyles.NORMAL}`}>
    {priority}
  </span>
);

/* ─── Letter Type Chip ───────────────────────────────────── */

const LetterTypeChip: React.FC<{ type: string }> = ({ type }) => (
  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#292A27]/08 text-[#292A27] border border-[#292A27]/12">
    {type.charAt(0) + type.slice(1).toLowerCase()}
  </span>
);

/* ─── Meta Row Helper ────────────────────────────────────── */

const MetaField: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="space-y-1">
    <dt className="text-[11px] font-bold uppercase tracking-wider text-[#8A8983]">{label}</dt>
    <dd className="text-sm font-medium text-[#292A27]">{children}</dd>
  </div>
);

/* ─── Attachment Timeline Item ───────────────────────────── */

const AttachmentTimelineItem: React.FC<{ attachment: AttachmentItem; isLast: boolean }> = ({ attachment, isLast }) => (
  <div className="flex items-start space-x-4">
    <div className="flex flex-col items-center">
      <div className={`w-3 h-3 rounded-full flex-shrink-0 mt-1 ${attachment.isCurrent ? 'bg-[#526A55] ring-4 ring-[#526A55]/20' : 'bg-[#D8D7D1]'}`} />
      {!isLast && <div className="w-0.5 flex-1 min-h-[40px] bg-[#D8D7D1]/60 mt-1" />}
    </div>
    <div className={`pb-6 ${isLast ? 'pb-0' : ''}`}>
      <div className="flex items-center space-x-2">
        <span className="text-sm font-bold text-[#292A27]">{attachment.fileName || 'Attachment'}</span>
        {attachment.isCurrent && (
          <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-md bg-[#526A55]/15 text-[#526A55]">CURRENT</span>
        )}
      </div>
      <p className="text-xs text-[#6B6A64] mt-0.5">
        Uploaded by <span className="font-semibold text-[#292A27]">{attachment.uploadedBy}</span>
      </p>
      <p className="text-xs text-[#8A8983]">{attachment.date}</p>
      {attachment.fileSize && (
        <p className="text-[11px] text-[#8A8983] mt-0.5">
          {(attachment.fileSize / (1024 * 1024)).toFixed(1)} MB
        </p>
      )}
    </div>
  </div>
);

/* ─── Main Letter Details Component ─────────────────────── */

export const LetterDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();

  const [letter, setLetter] = useState<LetterItem | null>(null);
  const [attachments, setAttachments] = useState<AttachmentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isUploadAttachmentOpen, setIsUploadAttachmentOpen] = useState(false);
  const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchLetter = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const [letterData, attachmentData] = await Promise.all([
        letterService.getLetterById(id),
        letterService.getLetterAttachments(id),
      ]);
      setLetter(letterData);
      setAttachments(attachmentData);
    } catch (err: any) {
      setError(err.message || 'Failed to load letter details.');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchLetter();
  }, [fetchLetter]);

  /* ─── Actions ─────────────────────────────────────────── */

  const handleDownload = async () => {
    if (!letter) return;
    try {
      addToast({ type: 'info', title: 'Downloading...', message: `Preparing ${letter.file_name}` });
      await letterService.downloadAttachment(letter.id, letter.file_name);
      addToast({ type: 'success', title: 'Download Started', message: `${letter.file_name} has been downloaded.` });
    } catch (err: any) {
      addToast({ type: 'error', title: 'Download Failed', message: err.message || 'Unable to download attachment.' });
    }
  };

  const handleArchive = async () => {
    if (!letter) return;
    setIsArchiving(true);
    try {
      await letterService.archiveLetter(letter.id);
      addToast({ type: 'success', title: 'Letter Archived', message: `"${letter.subject}" has been moved to archives.` });
      setIsArchiveDialogOpen(false);
      fetchLetter();
    } catch (err: any) {
      addToast({ type: 'error', title: 'Archive Failed', message: err.message || 'Could not archive letter.' });
    } finally {
      setIsArchiving(false);
    }
  };

  const handleSubmitForApproval = async () => {
    if (!letter) return;
    setIsSubmitting(true);
    try {
      await letterService.submitForApproval(letter.id);
      addToast({ type: 'success', title: 'Submitted for Approval', message: `"${letter.subject}" has been submitted for review and approval.` });
      fetchLetter();
    } catch (err: any) {
      addToast({ type: 'error', title: 'Submission Failed', message: err.message || 'Could not submit letter for approval.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ─── Role-Based Action Visibility ──────────────────────── */

  const canUploadAttachment = letter?.status !== 'ARCHIVED';
  const canSubmitForApproval = letter?.status === 'DRAFT' || letter?.status === 'REGISTERED' || letter?.status === 'RETURNED';
  const canArchive = letter?.status !== 'ARCHIVED' && (user?.role === 'ADMIN' || user?.role === 'DEPARTMENT_MANAGER');

  const moreActions: DropdownItem[] = [];
  if (canUploadAttachment) {
    moreActions.push({
      label: 'Upload Attachment',
      onClick: () => setIsUploadAttachmentOpen(true),
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
        </svg>
      ),
    });
  }
  if (canSubmitForApproval) {
    moreActions.push({
      label: 'Submit for Approval',
      onClick: handleSubmitForApproval,
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    });
  }
  if (canArchive) {
    moreActions.push({
      label: 'Archive Letter',
      onClick: () => setIsArchiveDialogOpen(true),
      danger: true,
      dividerBefore: true,
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M5 8h14M5 8a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v1a2 2 0 01-2 2M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
        </svg>
      ),
    });
  }

  /* ─── Loading / Error / Not Found ───────────────────────── */

  if (isLoading) {
    return (
      <div className="py-20 flex justify-center items-center">
        <LoadingSpinner size="lg" label="Loading letter details..." />
      </div>
    );
  }

  if (error) {
    return <ErrorState title="Letter Unavailable" description={error} onRetry={fetchLetter} />;
  }

  if (!letter) {
    return (
      <EmptyState
        title="Letter Not Found"
        description="The requested letter could not be located in the repository."
        actionLabel="Back to Letter Repository"
        onAction={() => navigate('/letters')}
      />
    );
  }

  /* ─── Render ─────────────────────────────────────────────── */

  return (
    <div className="space-y-6">
      {/* Back Navigation */}
      <button
        type="button"
        onClick={() => navigate('/letters')}
        className="inline-flex items-center space-x-1.5 text-sm font-medium text-[#526A55] hover:text-[#3E5140] transition-colors group"
      >
        <svg className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        <span>Back to Letters</span>
      </button>

      {/* ─── Page Header ─────────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center space-x-3 flex-wrap gap-y-2">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-[#292A27]">
              {letter.subject}
            </h1>
            <Badge status={letter.status as LetterStatus} dot />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm text-[#6B6A64] font-mono font-medium">{letter.referenceNumber}</span>
            {letter.registrationNumber && (
              <>
                <span className="text-[#D8D7D1]">·</span>
                <span className="text-xs text-[#8A8983]">Reg: {letter.registrationNumber}</span>
              </>
            )}
            <LetterTypeChip type={letter.letterType} />
            {letter.priority && <PriorityBadge priority={letter.priority} />}
          </div>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex items-center space-x-2 flex-wrap gap-y-2">
          <Button variant="secondary" size="sm" onClick={handleDownload}>
            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download
          </Button>
          <Button variant="secondary" size="sm" onClick={() => navigate(`/letters/${letter.id}/preview`)}>
            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
            </svg>
            Preview
          </Button>

          {moreActions.length > 0 && (
            <Dropdown
              align="right"
              items={moreActions}
              trigger={
                <button
                  type="button"
                  className="px-3 py-2 text-sm font-medium rounded-xl border border-[#292A27]/10 bg-[#ECEAE3] text-[#292A27] hover:bg-[#D8D7D1]/60 transition-colors focus:outline-none"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                  </svg>
                </button>
              }
            />
          )}
        </div>
      </div>

      {/* ─── Main Grid Content ───────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2/3 */}
        <div className="lg:col-span-2 space-y-6">
          {/* Letter Lifecycle Timeline */}
          <Card>
            <LetterTimeline
              currentStatus={letter.status}
              letterType={letter.letterType}
              timestamps={{ created_at: letter.created_at, completed_at: letter.updated_at }}
            />
          </Card>

          {/* Letter Information Grid */}
          <Card>
            <h2 className="text-base font-semibold text-[#292A27] mb-5">Letter Information</h2>
            <dl className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-5">
              <MetaField label="Reference Number">
                <span className="font-mono text-xs bg-[#ECEAE3] px-2 py-0.5 rounded-lg">
                  {letter.referenceNumber}
                </span>
              </MetaField>
              {letter.registrationNumber && (
                <MetaField label="Registration Number">
                  <span className="font-mono text-xs bg-[#ECEAE3] px-2 py-0.5 rounded-lg">
                    {letter.registrationNumber}
                  </span>
                </MetaField>
              )}
              <MetaField label="Letter Type"><LetterTypeChip type={letter.letterType} /></MetaField>
              <MetaField label="Category">{letter.category}</MetaField>
              <MetaField label="Department">{letter.department_name}</MetaField>
              {letter.originatingDepartment && (
                <MetaField label="Originating Dept">{letter.originatingDepartment}</MetaField>
              )}
              <MetaField label="Confidentiality"><ConfidentialityBadge level={letter.confidentialityLevel} /></MetaField>
              {letter.priority && <MetaField label="Priority"><PriorityBadge priority={letter.priority} /></MetaField>}
              <MetaField label="Registered By">{letter.created_by}</MetaField>
              <MetaField label="Registered At">{letter.created_at}</MetaField>
              <MetaField label="Last Updated">{letter.updated_at}</MetaField>
              {letter.dueDate && <MetaField label="Due Date"><span className="text-[#8B3232] font-semibold">{letter.dueDate}</span></MetaField>}
            </dl>
          </Card>

          {/* Sender & Recipient */}
          {(letter.sender || letter.recipient) && (
            <Card>
              <h2 className="text-base font-semibold text-[#292A27] mb-5">Sender & Recipient</h2>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                {letter.sender && (
                  <div className="space-y-1">
                    <dt className="text-[11px] font-bold uppercase tracking-wider text-[#8A8983]">Sender</dt>
                    <dd className="text-sm font-medium text-[#292A27]">{letter.sender}</dd>
                    {letter.senderOrganization && (
                      <dd className="text-xs text-[#6B6A64]">{letter.senderOrganization}</dd>
                    )}
                  </div>
                )}
                {letter.recipient && (
                  <div className="space-y-1">
                    <dt className="text-[11px] font-bold uppercase tracking-wider text-[#8A8983]">Recipient</dt>
                    <dd className="text-sm font-medium text-[#292A27]">{letter.recipient}</dd>
                    {letter.recipientOrganization && (
                      <dd className="text-xs text-[#6B6A64]">{letter.recipientOrganization}</dd>
                    )}
                  </div>
                )}
                {letter.dateReceived && (
                  <MetaField label="Date Received">{letter.dateReceived}</MetaField>
                )}
                {letter.dateSent && (
                  <MetaField label="Date Sent">{letter.dateSent}</MetaField>
                )}
              </dl>
            </Card>
          )}

          {/* Description / Summary */}
          {letter.description && (
            <Card>
              <h2 className="text-base font-semibold text-[#292A27] mb-3">Summary</h2>
              <p className="text-sm text-[#6B6A64] leading-relaxed whitespace-pre-line">{letter.description}</p>
            </Card>
          )}

          {/* Notes & Discussion */}
          <Card>
            <CommentSection documentId={letter.id} />
          </Card>
        </div>

        {/* Right 1/3 */}
        <div className="space-y-6">
          {/* Attachments */}
          <Card>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-[#292A27]">Attachments</h2>
              <span className="text-xs font-semibold text-[#526A55] bg-[#526A55]/10 px-2 py-0.5 rounded-full">
                {attachments.length} file{attachments.length !== 1 ? 's' : ''}
              </span>
            </div>

            {attachments.length === 0 ? (
              <EmptyState title="No attachments" description="No files attached to this letter." />
            ) : (
              <div>
                {attachments.map((att, idx) => (
                  <AttachmentTimelineItem
                    key={att.id}
                    attachment={att}
                    isLast={idx === attachments.length - 1}
                  />
                ))}
              </div>
            )}

            {canUploadAttachment && (
              <div className="mt-4 pt-3 border-t border-[#D8D7D1]/50">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => setIsUploadAttachmentOpen(true)}
                >
                  <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Upload Attachment
                </Button>
              </div>
            )}
          </Card>

          {/* Letter Status Card */}
          <Card className="bg-[#ECEAE3]">
            <h3 className="text-sm font-semibold text-[#292A27] mb-3">Current Status</h3>
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#6B6A64]">Status</span>
                <Badge status={letter.status as LetterStatus} dot />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#6B6A64]">Confidentiality</span>
                <ConfidentialityBadge level={letter.confidentialityLevel} />
              </div>
              {letter.assignedEmployee && (
                <div className="flex items-center justify-between">
                  <span className="text-[#6B6A64]">Assigned To</span>
                  <span className="font-semibold text-[#292A27] truncate ml-2">{letter.assignedEmployee}</span>
                </div>
              )}
              {letter.responseRequired && (
                <div className="flex items-center justify-between">
                  <span className="text-[#6B6A64]">Response Required</span>
                  <span className="font-semibold text-[#8B3232]">Yes</span>
                </div>
              )}
              {letter.dueDate && (
                <div className="flex items-center justify-between">
                  <span className="text-[#6B6A64]">Due Date</span>
                  <span className="font-semibold text-[#8B3232]">{letter.dueDate}</span>
                </div>
              )}
            </div>

            {canSubmitForApproval && (
              <div className="mt-4 pt-3 border-t border-[#D8D7D1]/50">
                <Button
                  variant="primary"
                  size="sm"
                  className="w-full"
                  onClick={handleSubmitForApproval}
                  isLoading={isSubmitting}
                >
                  <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Submit for Approval
                </Button>
              </div>
            )}
          </Card>

          {/* Tags */}
          {letter.tags && letter.tags.length > 0 && (
            <Card>
              <h3 className="text-sm font-semibold text-[#292A27] mb-3">Tags</h3>
              <div className="flex flex-wrap gap-1.5">
                {letter.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-[#ECEAE3] text-[#526A55] border border-[#D8D7D1]/60"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>

      {/* ─── Modals ──────────────────────────────────────────── */}

      <UploadAttachmentModal
        open={isUploadAttachmentOpen}
        letterId={letter.id}
        letterSubject={letter.subject}
        onClose={() => setIsUploadAttachmentOpen(false)}
        onSuccess={fetchLetter}
      />

      <ConfirmDialog
        open={isArchiveDialogOpen}
        title="Archive Letter?"
        description={`Are you sure you want to archive "${letter.subject}"? The letter will remain accessible under Archives.`}
        confirmLabel="Move to Archive"
        danger
        isLoading={isArchiving}
        onConfirm={handleArchive}
        onCancel={() => setIsArchiveDialogOpen(false)}
      />
    </div>
  );
};

export default LetterDetails;
