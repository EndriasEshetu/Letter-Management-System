import React, { useState } from 'react';
import Badge, { LetterStatus } from '@/components/common/Badge';
import { LetterItem, AttachmentItem } from '@/types/letter';
import CommentSection from '@/components/comments/CommentSection';

const confidentialityStyles: Record<string, string> = {
  PUBLIC: 'bg-[#4A6B4E]/10 text-[#4A6B4E] border-[#4A6B4E]/20',
  INTERNAL: 'bg-[#526A55]/10 text-[#526A55] border-[#526A55]/20',
  CONFIDENTIAL: 'bg-[#C48D3F]/10 text-[#8A5D19] border-[#C48D3F]/20',
  RESTRICTED: 'bg-[#8B3232]/10 text-[#8B3232] border-[#8B3232]/20',
};

const ConfidentialityBadge: React.FC<{ level: string }> = ({ level }) => (
  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${confidentialityStyles[level] || 'bg-[#D8D7D1]/60 text-[#6B6A64]'}`}>
    {level || 'Not specified'}
  </span>
);

const MetaField: React.FC<{ label: string; children: React.ReactNode }> = ({ label, children }) => (
  <div className="space-y-0.5">
    <dt className="text-[10px] font-bold uppercase tracking-wider text-[#8A8983]">{label}</dt>
    <dd className="text-sm font-medium text-[#292A27]">{children}</dd>
  </div>
);

type TabId = 'details' | 'attachments' | 'discussion';

const TABS: { id: TabId; label: string }[] = [
  { id: 'details', label: 'Details' },
  { id: 'attachments', label: 'Attachments' },
  { id: 'discussion', label: 'Discussion' },
];

interface LetterInfoPanelProps {
  letter: LetterItem;
}

export const LetterInfoPanel: React.FC<LetterInfoPanelProps> = ({ letter }) => {
  const [activeTab, setActiveTab] = useState<TabId>('details');
  const attachments = letter.attachments ?? [];

  return (
    <aside
      className="w-full lg:w-80 xl:w-88 flex-shrink-0 bg-[#ECEAE3] border border-[#D8D7D1] rounded-2xl flex flex-col overflow-hidden"
      aria-label="Letter information panel"
    >
      {/* Tab Bar */}
      <div className="flex border-b border-[#D8D7D1] px-2 pt-2" role="tablist">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            role="tab"
            id={`tab-${tab.id}`}
            aria-selected={activeTab === tab.id}
            aria-controls={`tabpanel-${tab.id}`}
            onClick={() => setActiveTab(tab.id)}
            className={`px-3 py-2 text-xs font-semibold rounded-t-lg transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-[#526A55] ${
              activeTab === tab.id
                ? 'text-[#292A27] border-b-2 border-[#526A55] -mb-px'
                : 'text-[#6B6A64] hover:text-[#292A27]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Panels */}
      <div className="flex-1 overflow-y-auto p-5">
        {/* Details Tab */}
        {activeTab === 'details' && (
          <div id="tabpanel-details" role="tabpanel" aria-labelledby="tab-details" className="space-y-5">
            {/* Current Status */}
            <div className="space-y-1">
              <p className="text-[10px] font-bold uppercase tracking-wider text-[#8A8983]">Status</p>
              <Badge status={letter.status as LetterStatus} dot />
            </div>

            <div className="border-t border-[#D8D7D1]/60" />

            <dl className="space-y-4">
              <MetaField label="Reference Number">
                <span className="font-mono text-xs bg-[#F5F3ED] px-2 py-0.5 rounded-lg border border-[#D8D7D1]/60 block">
                  {letter.referenceNumber}
                </span>
              </MetaField>
              {letter.registrationNumber && (
                <MetaField label="Registration Number">
                  <span className="font-mono text-xs bg-[#F5F3ED] px-2 py-0.5 rounded-lg border border-[#D8D7D1]/60 block">
                    {letter.registrationNumber}
                  </span>
                </MetaField>
              )}
              <MetaField label="Letter Type">
                {letter.letterType.charAt(0) + letter.letterType.slice(1).toLowerCase()}
              </MetaField>
              <MetaField label="Category">{letter.category}</MetaField>
              <MetaField label="Department">{letter.department_name}</MetaField>
              {letter.sender && <MetaField label="Sender">{letter.sender}</MetaField>}
              {letter.senderOrganization && (
                <MetaField label="Sender Organization">{letter.senderOrganization}</MetaField>
              )}
              {letter.recipient && <MetaField label="Recipient">{letter.recipient}</MetaField>}
              {letter.dateReceived && <MetaField label="Date Received">{letter.dateReceived}</MetaField>}
              {letter.dateSent && <MetaField label="Date Sent">{letter.dateSent}</MetaField>}
              <MetaField label="Registered By">{letter.created_by}</MetaField>
              <MetaField label="Registered At">{letter.created_at}</MetaField>
              <MetaField label="Confidentiality">
                <ConfidentialityBadge level={letter.confidentialityLevel} />
              </MetaField>
              <MetaField label="File Type">
                {letter.file_type.split('/').pop()?.toUpperCase() || letter.file_type}
              </MetaField>
              <MetaField label="File Size">
                {letter.file_size < 1024 * 1024
                  ? `${(letter.file_size / 1024).toFixed(1)} KB`
                  : `${(letter.file_size / (1024 * 1024)).toFixed(1)} MB`}
              </MetaField>
            </dl>

            {/* Tags */}
            {letter.tags && letter.tags.length > 0 && (
              <>
                <div className="border-t border-[#D8D7D1]/60" />
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-[#8A8983] mb-2">Tags</p>
                  <div className="flex flex-wrap gap-1.5">
                    {letter.tags.map((tag) => (
                      <span key={tag} className="px-2.5 py-1 bg-[#DCE3C8] text-[#526A55] text-xs font-medium rounded-full">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </>
            )}
          </div>
        )}

        {/* Attachments Tab */}
        {activeTab === 'attachments' && (
          <div id="tabpanel-attachments" role="tabpanel" aria-labelledby="tab-attachments">
            <p className="text-[10px] font-bold uppercase tracking-wider text-[#8A8983] mb-4">
              Attachment History
            </p>
            {attachments.length === 0 ? (
              <p className="text-sm text-[#6B6A64]">No attachments available.</p>
            ) : (
              <div>
                {attachments.map((att: AttachmentItem, idx) => (
                  <div key={att.id} className="flex items-start space-x-3">
                    <div className="flex flex-col items-center flex-shrink-0">
                      <div className={`w-2.5 h-2.5 rounded-full mt-1 ${att.isCurrent ? 'bg-[#526A55] ring-4 ring-[#526A55]/15' : 'bg-[#D8D7D1]'}`} />
                      {idx < attachments.length - 1 && <div className="w-px flex-1 min-h-[36px] bg-[#D8D7D1]/60 mt-1" />}
                    </div>
                    <div className={`${idx < attachments.length - 1 ? 'pb-5' : ''} min-w-0`}>
                      <div className="flex items-center space-x-2 flex-wrap gap-y-0.5">
                        <span className="text-sm font-bold text-[#292A27] truncate max-w-[180px]">{att.fileName || att.versionNumber}</span>
                        {att.isCurrent && (
                          <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-md bg-[#526A55]/15 text-[#526A55]">Current</span>
                        )}
                      </div>
                      <p className="text-xs text-[#6B6A64] mt-0.5">
                        by <span className="font-semibold text-[#292A27]">{att.uploadedBy}</span>
                      </p>
                      <p className="text-xs text-[#8A8983]">{att.date}</p>
                      {att.fileSize && (
                        <p className="text-[11px] text-[#8A8983] mt-0.5 truncate">
                          {(att.fileSize / (1024 * 1024)).toFixed(1)} MB
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Discussion Tab */}
        {activeTab === 'discussion' && (
          <div id="tabpanel-discussion" role="tabpanel" aria-labelledby="tab-discussion">
            <CommentSection documentId={letter.id} compact />
          </div>
        )}
      </div>
    </aside>
  );
};

export default LetterInfoPanel;
