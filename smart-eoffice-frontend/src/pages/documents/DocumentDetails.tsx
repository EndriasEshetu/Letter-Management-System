import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import documentService from '@/services/documentService';
import { DocumentItem, VersionItem } from '@/types/document';
import { useToast } from '@/components/common/Toast';

import Card from '@/components/common/Card';
import Button from '@/components/common/Button';
import Badge, { DocumentStatus } from '@/components/common/Badge';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorState from '@/components/common/ErrorState';
import EmptyState from '@/components/common/EmptyState';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import Dropdown, { DropdownItem } from '@/components/common/Dropdown';
import UploadVersionModal from '@/components/documents/UploadVersionModal';
import CommentSection from '@/components/comments/CommentSection';
import WorkflowTimeline from '@/components/workflows/WorkflowTimeline';

/* ─── Security Level Badge Helper ───────────────────────── */

const securityStyles: Record<string, string> = {
  PUBLIC: 'bg-[#4A6B4E]/10 text-[#4A6B4E] border-[#4A6B4E]/20',
  INTERNAL: 'bg-[#526A55]/10 text-[#526A55] border-[#526A55]/20',
  CONFIDENTIAL: 'bg-[#C48D3F]/10 text-[#8A5D19] border-[#C48D3F]/20',
  RESTRICTED: 'bg-[#8B3232]/10 text-[#8B3232] border-[#8B3232]/20',
};

const SecurityBadge: React.FC<{ level: string }> = ({ level }) => (
  <span
    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${
      securityStyles[level] || 'bg-[#D8D7D1]/60 text-[#6B6A64]'
    }`}
  >
    {level || 'Not specified'}
  </span>
);

/* ─── Meta Row Helper ───────────────────────────────────── */

const MetaField: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="space-y-1">
    <dt className="text-[11px] font-bold uppercase tracking-wider text-[#8A8983]">{label}</dt>
    <dd className="text-sm font-medium text-[#292A27]">{children}</dd>
  </div>
);

/* ─── Version Timeline Item ─────────────────────────────── */

const VersionTimelineItem: React.FC<{ version: VersionItem; isLast: boolean }> = ({ version, isLast }) => (
  <div className="flex items-start space-x-4">
    {/* Timeline Dot + Line */}
    <div className="flex flex-col items-center">
      <div
        className={`w-3 h-3 rounded-full flex-shrink-0 mt-1 ${
          version.isCurrent ? 'bg-[#526A55] ring-4 ring-[#526A55]/20' : 'bg-[#D8D7D1]'
        }`}
      />
      {!isLast && <div className="w-0.5 flex-1 min-h-[40px] bg-[#D8D7D1]/60 mt-1" />}
    </div>

    {/* Version Content */}
    <div className={`pb-6 ${isLast ? 'pb-0' : ''}`}>
      <div className="flex items-center space-x-2">
        <span className="text-sm font-bold text-[#292A27]">{version.versionNumber}</span>
        {version.isCurrent && (
          <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-md bg-[#526A55]/15 text-[#526A55]">
            CURRENT
          </span>
        )}
      </div>
      <p className="text-xs text-[#6B6A64] mt-0.5">
        Uploaded by <span className="font-semibold text-[#292A27]">{version.uploadedBy}</span>
      </p>
      <p className="text-xs text-[#8A8983]">{version.date}</p>
      {version.fileSize && (
        <p className="text-[11px] text-[#8A8983] mt-0.5">
          {version.fileName || 'File'} • {(version.fileSize / (1024 * 1024)).toFixed(1)} MB
        </p>
      )}
    </div>
  </div>
);

/* ─── Main Document Details Component ───────────────────── */

export const DocumentDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();

  const [doc, setDoc] = useState<DocumentItem | null>(null);
  const [versions, setVersions] = useState<VersionItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modal states
  const [isUploadVersionOpen, setIsUploadVersionOpen] = useState(false);
  const [isArchiveDialogOpen, setIsArchiveDialogOpen] = useState(false);
  const [isArchiving, setIsArchiving] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchDocument = useCallback(async () => {
    if (!id) return;
    setIsLoading(true);
    setError(null);
    try {
      const [docData, versionData] = await Promise.all([
        documentService.getDocumentById(id),
        documentService.getDocumentVersions(id),
      ]);
      setDoc(docData);
      setVersions(versionData);
    } catch (err: any) {
      setError(err.message || 'Failed to load document details.');
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDocument();
  }, [fetchDocument]);

  /* ─── Actions ─────────────────────────────────────────── */

  const handleDownload = async () => {
    if (!doc) return;
    try {
      addToast({ type: 'info', title: 'Downloading...', message: `Preparing ${doc.file_name}` });
      await documentService.downloadDocument(doc.id, doc.file_name);
      addToast({ type: 'success', title: 'Download Started', message: `${doc.file_name} has been downloaded.` });
    } catch (err: any) {
      addToast({ type: 'error', title: 'Download Failed', message: err.message || 'Unable to download file.' });
    }
  };

  const handleArchive = async () => {
    if (!doc) return;
    setIsArchiving(true);
    try {
      await documentService.archiveDocument(doc.id);
      addToast({ type: 'success', title: 'Document Archived', message: `"${doc.title}" has been moved to archives.` });
      setIsArchiveDialogOpen(false);
      fetchDocument();
    } catch (err: any) {
      addToast({ type: 'error', title: 'Archive Failed', message: err.message || 'Could not archive document.' });
    } finally {
      setIsArchiving(false);
    }
  };

  const handleSubmitForApproval = async () => {
    if (!doc) return;
    setIsSubmitting(true);
    try {
      await documentService.submitForApproval(doc.id);
      addToast({ type: 'success', title: 'Submitted for Approval', message: `"${doc.title}" has been submitted to management for review.` });
      fetchDocument();
    } catch (err: any) {
      addToast({ type: 'error', title: 'Submission Failed', message: err.message || 'Could not submit document for approval.' });
    } finally {
      setIsSubmitting(false);
    }
  };

  /* ─── Role-Based Action Visibility ────────────────────── */

  const canUploadVersion = doc?.status !== 'ARCHIVED';
  const canSubmitForApproval = doc?.status === 'DRAFT' || doc?.status === 'REJECTED';
  const canArchive = doc?.status !== 'ARCHIVED' && (user?.role === 'ADMIN' || user?.role === 'DEPARTMENT_MANAGER');

  const moreActions: DropdownItem[] = [];
  if (canUploadVersion) {
    moreActions.push({
      label: 'Upload New Version',
      onClick: () => setIsUploadVersionOpen(true),
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
      label: 'Archive Document',
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

  /* ─── Loading / Error / Not Found ─────────────────────── */

  if (isLoading) {
    return (
      <div className="py-20 flex justify-center items-center">
        <LoadingSpinner size="lg" label="Loading document details..." />
      </div>
    );
  }

  if (error) {
    return <ErrorState title="Document Unavailable" description={error} onRetry={fetchDocument} />;
  }

  if (!doc) {
    return (
      <EmptyState
        title="Document Not Found"
        description="The requested document could not be located in the repository."
        actionLabel="Back to Repository"
        onAction={() => navigate('/documents')}
      />
    );
  }

  /* ─── Render ──────────────────────────────────────────── */

  return (
    <div className="space-y-6">
      {/* Back Navigation */}
      <button
        type="button"
        onClick={() => navigate('/documents')}
        className="inline-flex items-center space-x-1.5 text-sm font-medium text-[#526A55] hover:text-[#3E5140] transition-colors group"
      >
        <svg className="w-4 h-4 transition-transform group-hover:-translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        <span>Back to Documents</span>
      </button>

      {/* ─── Page Header ───────────────────────────────────── */}
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div className="space-y-2">
          <div className="flex items-center space-x-3 flex-wrap gap-y-2">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-[#292A27]">
              {doc.title}
            </h1>
            <Badge status={doc.status as DocumentStatus} dot />
          </div>
          <p className="text-sm text-[#6B6A64] font-medium">{doc.documentNumber}</p>
        </div>

        {/* Primary Action Buttons */}
        <div className="flex items-center space-x-2 flex-wrap gap-y-2">
          <Button variant="secondary" size="sm" onClick={handleDownload}>
            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download
          </Button>
          <Button variant="secondary" size="sm" onClick={() => navigate(`/documents/${doc.id}/preview`)}>
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

      {/* ─── Main Grid Content ─────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2/3: Document Information */}
        <div className="lg:col-span-2 space-y-6">
          {/* Workflow Timeline Card */}
          <Card>
            <WorkflowTimeline
              currentStatus={doc.status}
              timestamps={{ created_at: doc.created_at, completed_at: doc.updated_at }}
            />
          </Card>

          {/* Description */}
          <Card>
            <h2 className="text-base font-semibold text-[#292A27] mb-3">Description</h2>
            {doc.description ? (
              <p className="text-sm text-[#6B6A64] leading-relaxed whitespace-pre-line">
                {doc.description}
              </p>
            ) : (
              <p className="text-sm text-[#8A8983] italic">No description provided.</p>
            )}
          </Card>

          {/* Document Information Grid */}
          <Card>
            <h2 className="text-base font-semibold text-[#292A27] mb-5">Document Information</h2>
            <dl className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-5">
              <MetaField label="Document Number">
                <span className="font-mono text-xs bg-[#ECEAE3] px-2 py-0.5 rounded-lg">
                  {doc.documentNumber}
                </span>
              </MetaField>
              <MetaField label="Category">{doc.category}</MetaField>
              <MetaField label="Department">{doc.department_name}</MetaField>
              <MetaField label="Security Level">
                <SecurityBadge level={doc.securityLevel} />
              </MetaField>
              <MetaField label="Created By">{doc.created_by}</MetaField>
              <MetaField label="Created Date">{doc.created_at}</MetaField>
              <MetaField label="Last Updated">{doc.updated_at}</MetaField>
              <MetaField label="File Type">
                <span className="uppercase text-xs">{doc.file_type.split('/').pop()}</span>
              </MetaField>
              <MetaField label="File Size">{(doc.file_size / (1024 * 1024)).toFixed(1)} MB</MetaField>
            </dl>

            {/* Tags */}
            {doc.tags && doc.tags.length > 0 && (
              <div className="mt-5 pt-4 border-t border-[#D8D7D1]/50">
                <dt className="text-[11px] font-bold uppercase tracking-wider text-[#8A8983] mb-2">Tags</dt>
                <div className="flex flex-wrap gap-1.5">
                  {doc.tags.map((tag) => (
                    <span
                      key={tag}
                      className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-[#ECEAE3] text-[#526A55] border border-[#D8D7D1]/60"
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Discussion & Comments */}
          <Card>
            <CommentSection documentId={doc.id} />
          </Card>
        </div>

        {/* Right 1/3: Version History + Quick Actions */}
        <div className="space-y-6">
          {/* Version History */}
          <Card>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-base font-semibold text-[#292A27]">Version History</h2>
              <span className="text-xs font-semibold text-[#526A55] bg-[#526A55]/10 px-2 py-0.5 rounded-full">
                {versions.length} version{versions.length !== 1 ? 's' : ''}
              </span>
            </div>

            {versions.length === 0 ? (
              <EmptyState
                title="No version history"
                description="No version history available for this document."
              />
            ) : (
              <div>
                {versions.map((v, idx) => (
                  <VersionTimelineItem
                    key={v.id}
                    version={v}
                    isLast={idx === versions.length - 1}
                  />
                ))}
              </div>
            )}

            {canUploadVersion && (
              <div className="mt-4 pt-3 border-t border-[#D8D7D1]/50">
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => setIsUploadVersionOpen(true)}
                >
                  <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Upload New Version
                </Button>
              </div>
            )}
          </Card>

          {/* Document Status Card */}
          <Card className="bg-[#ECEAE3]">
            <h3 className="text-sm font-semibold text-[#292A27] mb-3">Current Status</h3>
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#6B6A64]">Status</span>
                <Badge status={doc.status as DocumentStatus} dot />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#6B6A64]">Security</span>
                <SecurityBadge level={doc.securityLevel} />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#6B6A64]">Latest Version</span>
                <span className="font-semibold text-[#292A27]">
                  {versions.length > 0 ? versions[0].versionNumber : 'v1.0'}
                </span>
              </div>
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
        </div>
      </div>

      {/* ─── Modals ────────────────────────────────────────── */}

      <UploadVersionModal
        open={isUploadVersionOpen}
        documentId={doc.id}
        documentTitle={doc.title}
        onClose={() => setIsUploadVersionOpen(false)}
        onSuccess={fetchDocument}
      />

      <ConfirmDialog
        open={isArchiveDialogOpen}
        title="Archive Document?"
        description={`Are you sure you want to archive "${doc.title}"? The document will remain accessible under Archives.`}
        confirmLabel="Move to Archive"
        danger
        isLoading={isArchiving}
        onConfirm={handleArchive}
        onCancel={() => setIsArchiveDialogOpen(false)}
      />
    </div>
  );
};

export default DocumentDetails;
