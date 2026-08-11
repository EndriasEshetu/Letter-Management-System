import React, { useState } from 'react';
import Badge from '@/components/common/Badge';
import { DocumentItem, VersionItem } from '@/types/document';
import CommentSection from '@/components/comments/CommentSection';

/* ─── Security Level Badge ──────────────────────────────── */

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

/* ─── Metadata Field ────────────────────────────────────── */

const MetaField: React.FC<{ label: string; children: React.ReactNode }> = ({
  label,
  children,
}) => (
  <div className="space-y-0.5">
    <dt className="text-[10px] font-bold uppercase tracking-wider text-[#8A8983]">{label}</dt>
    <dd className="text-sm font-medium text-[#292A27]">{children}</dd>
  </div>
);

/* ─── Version Timeline Item ─────────────────────────────── */

const VersionRow: React.FC<{ version: VersionItem; isLast: boolean }> = ({
  version,
  isLast,
}) => (
  <div className="flex items-start space-x-3">
    {/* Dot + Line */}
    <div className="flex flex-col items-center flex-shrink-0">
      <div
        className={`w-2.5 h-2.5 rounded-full mt-1 ${
          version.isCurrent
            ? 'bg-[#526A55] ring-4 ring-[#526A55]/15'
            : 'bg-[#D8D7D1]'
        }`}
      />
      {!isLast && (
        <div className="w-px flex-1 min-h-[36px] bg-[#D8D7D1]/60 mt-1" />
      )}
    </div>

    {/* Content */}
    <div className={`pb-5 ${isLast ? 'pb-0' : ''} min-w-0`}>
      <div className="flex items-center space-x-2 flex-wrap gap-y-0.5">
        <span className="text-sm font-bold text-[#292A27]">{version.versionNumber}</span>
        {version.isCurrent && (
          <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-md bg-[#526A55]/15 text-[#526A55]">
            Current
          </span>
        )}
      </div>
      <p className="text-xs text-[#6B6A64] mt-0.5">
        by <span className="font-semibold text-[#292A27]">{version.uploadedBy}</span>
      </p>
      <p className="text-xs text-[#8A8983]">{version.date}</p>
      {version.fileSize && (
        <p className="text-[11px] text-[#8A8983] mt-0.5 truncate">
          {(version.fileSize / (1024 * 1024)).toFixed(1)} MB
        </p>
      )}
    </div>
  </div>
);

/* ─── Tab Definitions ───────────────────────────────────── */

type TabId = 'details' | 'versions' | 'discussion';

const TABS: { id: TabId; label: string; disabled?: boolean }[] = [
  { id: 'details', label: 'Details' },
  { id: 'versions', label: 'Versions' },
  { id: 'discussion', label: 'Discussion' },
];

/* ─── DocumentInfoPanel Props ───────────────────────────── */

interface DocumentInfoPanelProps {
  document: DocumentItem;
}

/* ─── DocumentInfoPanel ─────────────────────────────────── */

export const DocumentInfoPanel: React.FC<DocumentInfoPanelProps> = ({ document }) => {
  const [activeTab, setActiveTab] = useState<TabId>('details');

  const versions = document.versions ?? [];

  return (
    <aside
      className="w-full lg:w-80 xl:w-88 flex-shrink-0 bg-[#ECEAE3] border border-[#D8D7D1] rounded-2xl flex flex-col overflow-hidden"
      aria-label="Document information panel"
    >
      {/* ── Tab Bar ── */}
      <div
        className="flex border-b border-[#D8D7D1] px-2 pt-2"
        role="tablist"
        aria-label="Document information tabs"
      >
        {TABS.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            id={`tab-${tab.id}`}
            aria-selected={activeTab === tab.id}
            aria-controls={`tabpanel-${tab.id}`}
            disabled={tab.disabled}
            onClick={() => !tab.disabled && setActiveTab(tab.id)}
            className={`px-3 py-2 text-xs font-semibold rounded-t-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#526A55] ${
              tab.disabled
                ? 'text-[#B0AFA9] cursor-not-allowed'
                : activeTab === tab.id
                ? 'text-[#292A27] border-b-2 border-[#526A55] -mb-px'
                : 'text-[#6B6A64] hover:text-[#292A27]'
            }`}
          >
            {tab.label}
            {tab.disabled && (
              <span className="ml-1 text-[9px] font-normal text-[#B0AFA9]">(soon)</span>
            )}
          </button>
        ))}
      </div>

      {/* ── Tab Panels ── */}
      <div className="flex-1 overflow-y-auto p-5">

        {/* Details Tab */}
        {activeTab === 'details' && (
          <div
            id="tabpanel-details"
            role="tabpanel"
            aria-labelledby="tab-details"
            className="space-y-5"
          >
            {/* Status */}
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#8A8983]">Status</p>
              <Badge status={document.status} dot />
            </div>

            <div className="border-t border-[#D8D7D1]/60" />

            {/* Metadata grid */}
            <dl className="space-y-4">
              <MetaField label="Document Number">{document.documentNumber}</MetaField>
              <MetaField label="Category">{document.category}</MetaField>
              <MetaField label="Department">{document.department_name}</MetaField>
              <MetaField label="Created By">{document.created_by}</MetaField>
              <MetaField label="Created">
                <time dateTime={document.created_at}>{document.created_at}</time>
              </MetaField>
              <MetaField label="Last Updated">
                <time dateTime={document.updated_at}>{document.updated_at}</time>
              </MetaField>
              <MetaField label="Security Level">
                <SecurityBadge level={document.securityLevel} />
              </MetaField>
              <MetaField label="File Type">
                {document.file_type.split('/').pop()?.toUpperCase() || document.file_type}
              </MetaField>
              <MetaField label="File Size">
                {document.file_size
                  ? document.file_size < 1024 * 1024
                    ? `${(document.file_size / 1024).toFixed(1)} KB`
                    : `${(document.file_size / (1024 * 1024)).toFixed(1)} MB`
                  : 'Unknown'}
              </MetaField>
            </dl>

            {/* Tags */}
            {document.tags && document.tags.length > 0 && (
              <>
                <div className="border-t border-[#D8D7D1]/60" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#8A8983] mb-2">
                    Tags
                  </p>
                  <div className="flex flex-wrap gap-1.5">
                    {document.tags.map((tag) => (
                      <span
                        key={tag}
                        className="px-2.5 py-1 bg-[#DCE3C8] text-[#526A55] text-xs font-medium rounded-full"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Versions Tab */}
        {activeTab === 'versions' && (
          <div
            id="tabpanel-versions"
            role="tabpanel"
            aria-labelledby="tab-versions"
          >
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#8A8983] mb-4">
              Version History
            </p>
            {versions.length === 0 ? (
              <p className="text-sm text-[#6B6A64]">No version history available.</p>
            ) : (
              <div>
                {versions.map((version, index) => (
                  <VersionRow
                    key={version.id}
                    version={version}
                    isLast={index === versions.length - 1}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        {/* Discussion Tab (Phase 11) */}
        {activeTab === 'discussion' && (
          <div
            id="tabpanel-discussion"
            role="tabpanel"
            aria-labelledby="tab-discussion"
          >
            <CommentSection documentId={document.id} compact />
          </div>
        )}
      </div>
    </aside>
  );
};

export default DocumentInfoPanel;
