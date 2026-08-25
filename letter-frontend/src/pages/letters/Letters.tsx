import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import letterService from '@/services/letterService';
import { LetterFilterParams, LetterItem, PaginatedLetterResponse } from '@/types/letter';
import Table from '@/components/common/Table';
import Badge, { LetterStatus } from '@/components/common/Badge';
import Button from '@/components/common/Button';
import SearchInput from '@/components/common/SearchInput';
import Select, { SelectOption } from '@/components/common/Select';
import Pagination from '@/components/common/Pagination';
import Dropdown, { DropdownItem } from '@/components/common/Dropdown';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorState from '@/components/common/ErrorState';
import EmptyState from '@/components/common/EmptyState';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import { useToast } from '@/components/common/Toast';
import RegisterLetterModal from '@/components/letters/RegisterLetterModal';

const LETTER_TYPE_OPTIONS: SelectOption[] = [
  { value: 'ALL', label: 'All Types' },
  { value: 'INCOMING', label: 'Incoming' },
  { value: 'OUTGOING', label: 'Outgoing' },
  { value: 'MEMORANDUM', label: 'Memorandum' },
  { value: 'REQUEST', label: 'Request' },
  { value: 'RESPONSE', label: 'Response' },
  { value: 'OFFICIAL', label: 'Official' },
  { value: 'INVITATION', label: 'Invitation' },
  { value: 'NOTIFICATION', label: 'Notification' },
  { value: 'ADMINISTRATIVE', label: 'Administrative' },
];

const DEPARTMENT_FILTER_OPTIONS: SelectOption[] = [
  { value: 'ALL', label: 'All Departments' },
  { value: 'Finance & Planning', label: 'Finance & Planning' },
  { value: 'Legal Services', label: 'Legal Services' },
  { value: 'Public Works', label: 'Public Works' },
  { value: 'Human Resources', label: 'Human Resources' },
  { value: 'ICT Governance', label: 'ICT Governance' },
  { value: 'City Clerk', label: 'City Clerk' },
];

const STATUS_PILLS: { label: string; value: string }[] = [
  { label: 'ALL', value: 'ALL' },
  { label: 'DRAFT', value: 'DRAFT' },
  { label: 'REGISTERED', value: 'REGISTERED' },
  { label: 'RECEIVED', value: 'RECEIVED' },
  { label: 'ASSIGNED', value: 'ASSIGNED' },
  { label: 'FORWARDED', value: 'FORWARDED' },
  { label: 'UNDER REVIEW', value: 'UNDER_REVIEW' },
  { label: 'PENDING APPROVAL', value: 'PENDING_APPROVAL' },
  { label: 'APPROVED', value: 'APPROVED' },
  { label: 'DISPATCHED', value: 'DISPATCHED' },
  { label: 'COMPLETED', value: 'COMPLETED' },
  { label: 'ARCHIVED', value: 'ARCHIVED' },
];

const getLetterTypeIcon = (letterType: string) => {
  switch (letterType) {
    case 'INCOMING':
      return (
        <div className="w-9 h-9 rounded-xl bg-[#526A55]/10 text-[#526A55] flex items-center justify-center flex-shrink-0 font-bold text-[9px] text-center leading-tight">
          IN
        </div>
      );
    case 'OUTGOING':
      return (
        <div className="w-9 h-9 rounded-xl bg-[#C48D3F]/10 text-[#8A5D19] flex items-center justify-center flex-shrink-0 font-bold text-[9px] text-center leading-tight">
          OUT
        </div>
      );
    case 'MEMORANDUM':
      return (
        <div className="w-9 h-9 rounded-xl bg-[#6B5A8E]/10 text-[#4A3A6B] flex items-center justify-center flex-shrink-0 font-bold text-[9px]">
          MEM
        </div>
      );
    case 'REQUEST':
      return (
        <div className="w-9 h-9 rounded-xl bg-[#8B3232]/10 text-[#8B3232] flex items-center justify-center flex-shrink-0 font-bold text-[9px]">
          REQ
        </div>
      );
    case 'INVITATION':
      return (
        <div className="w-9 h-9 rounded-xl bg-[#4A6B4E]/10 text-[#4A6B4E] flex items-center justify-center flex-shrink-0 font-bold text-[9px]">
          INV
        </div>
      );
    default:
      return (
        <div className="w-9 h-9 rounded-xl bg-[#292A27]/10 text-[#292A27] flex items-center justify-center flex-shrink-0 font-bold text-[9px]">
          LTR
        </div>
      );
  }
};

export const Letters: React.FC = () => {
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [response, setResponse] = useState<PaginatedLetterResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters State
  const [search, setSearch] = useState('');
  const [letterType, setLetterType] = useState('ALL');
  const [department, setDepartment] = useState('ALL');
  const [status, setStatus] = useState('ALL');
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Modals state
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [archiveTarget, setArchiveTarget] = useState<LetterItem | null>(null);
  const [isArchiving, setIsArchiving] = useState(false);

  const fetchLetters = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params: LetterFilterParams = {
        search: search.trim() || undefined,
        letterType: letterType !== 'ALL' ? letterType : undefined,
        department_id: department !== 'ALL' ? department : undefined,
        status: status !== 'ALL' ? status : undefined,
        page,
        limit: 10,
      };
      const res = await letterService.getLetters(params);
      setResponse(res);
    } catch (err: any) {
      setError(err.message || 'Failed to load letters from repository.');
    } finally {
      setIsLoading(false);
    }
  }, [search, letterType, department, status, page]);

  useEffect(() => {
    fetchLetters();
  }, [fetchLetters]);

  const handleDownload = async (letter: LetterItem) => {
    try {
      addToast({ type: 'info', title: 'Downloading...', message: `Preparing download for ${letter.file_name}` });
      await letterService.downloadAttachment(letter.id, letter.file_name);
      addToast({ type: 'success', title: 'Download Started', message: `${letter.file_name} has been downloaded.` });
    } catch (err: any) {
      addToast({ type: 'error', title: 'Download Failed', message: err.message || 'Unable to download attachment.' });
    }
  };

  const handleConfirmArchive = async () => {
    if (!archiveTarget) return;
    setIsArchiving(true);
    try {
      await letterService.archiveLetter(archiveTarget.id);
      addToast({ type: 'success', title: 'Letter Archived', message: `"${archiveTarget.subject}" has been moved to archives.` });
      setArchiveTarget(null);
      fetchLetters();
    } catch (err: any) {
      addToast({ type: 'error', title: 'Archive Failed', message: err.message || 'Could not archive letter.' });
    } finally {
      setIsArchiving(false);
    }
  };

  const getRowActions = (letter: LetterItem): DropdownItem[] => [
    {
      label: 'View Details',
      onClick: () => navigate(`/letters/${letter.id}`),
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
        </svg>
      ),
    },
    {
      label: 'Preview Attachment',
      onClick: () => navigate(`/letters/${letter.id}/preview`),
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      ),
    },
    {
      label: 'Download Attachment',
      onClick: () => handleDownload(letter),
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
        </svg>
      ),
    },
    {
      label: 'Archive Letter',
      onClick: () => setArchiveTarget(letter),
      danger: true,
      dividerBefore: true,
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M5 8h14M5 8a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v1a2 2 0 01-2 2M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
        </svg>
      ),
    },
  ];

  const totalLetters = response?.total || 0;
  const startCount = totalLetters === 0 ? 0 : (page - 1) * 10 + 1;
  const endCount = Math.min(page * 10, totalLetters);

  return (
    <div className="space-y-6">
      {/* Top Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-[#292A27]">
            Letter Repository
          </h1>
          <p className="text-xs md:text-sm text-[#6B6A64] mt-1">
            Search, filter, and manage all official incoming, outgoing, and internal letters.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Grid / Table View Switcher */}
          <div className="bg-[#ECEAE3] p-1 rounded-xl border border-[#D8D7D1] flex items-center space-x-1">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'table' ? 'bg-[#F5F3ED] text-[#292A27] shadow-xs' : 'text-[#6B6A64] hover:text-[#292A27]'
              }`}
              aria-label="Table view"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewMode === 'grid' ? 'bg-[#F5F3ED] text-[#292A27] shadow-xs' : 'text-[#6B6A64] hover:text-[#292A27]'
              }`}
              aria-label="Grid view"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
          </div>

          {/* Register Letter Button */}
          <Button variant="primary" onClick={() => setIsRegisterOpen(true)}>
            <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            Register Letter
          </Button>
        </div>
      </div>

      {/* Filter Toolbar Panel */}
      <div className="bg-[#ECEAE3] border border-[#D8D7D1] rounded-2xl p-4 space-y-4">
        {/* Search Bar + Select Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <SearchInput
            value={search}
            onChange={(val) => { setSearch(val); setPage(1); }}
            placeholder="Search by subject, reference no., sender..."
          />
          <Select
            options={LETTER_TYPE_OPTIONS}
            value={letterType}
            onChange={(val) => { setLetterType(val); setPage(1); }}
          />
          <Select
            options={DEPARTMENT_FILTER_OPTIONS}
            value={department}
            onChange={(val) => { setDepartment(val); setPage(1); }}
          />
          <div className="flex items-center space-x-2">
            <span className="text-xs font-medium text-[#6B6A64] whitespace-nowrap">Filter:</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => { setSearch(''); setLetterType('ALL'); setDepartment('ALL'); setStatus('ALL'); setPage(1); }}
            >
              Reset Filters
            </Button>
          </div>
        </div>

        {/* Status Pill Filters */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1">
          {STATUS_PILLS.map((pill) => (
            <button
              key={pill.value}
              type="button"
              onClick={() => { setStatus(pill.value); setPage(1); }}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                status === pill.value
                  ? 'bg-[#526A55] text-[#F5F3ED] shadow-xs'
                  : 'bg-[#F9F8F5] text-[#292A27] hover:bg-[#D8D7D1]/50'
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      {/* Result Count */}
      <div className="text-xs font-semibold text-[#6B6A64]">
        Showing {startCount}–{endCount} of {totalLetters} letters
      </div>

      {/* Main Content */}
      {isLoading ? (
        <div className="py-16 flex justify-center items-center">
          <LoadingSpinner size="lg" label="Loading Letter Repository..." />
        </div>
      ) : error ? (
        <ErrorState title="Unable to load repository" description={error} onRetry={fetchLetters} />
      ) : !response || response.data.length === 0 ? (
        <EmptyState
          title="No letters found"
          description="Try adjusting your search keywords or filter settings."
          actionLabel="Register First Letter"
          onAction={() => setIsRegisterOpen(true)}
        />
      ) : viewMode === 'table' ? (
        <Table>
          <Table.Header>
            <Table.Th>Subject / Reference</Table.Th>
            <Table.Th>Type & Department</Table.Th>
            <Table.Th>Sender / Recipient</Table.Th>
            <Table.Th>Date</Table.Th>
            <Table.Th>Status</Table.Th>
            <Table.Th className="text-right">Actions</Table.Th>
          </Table.Header>
          <Table.Body>
            {response.data.map((letter) => (
              <Table.Tr key={letter.id}>
                <Table.Td>
                  <div className="flex items-center space-x-3">
                    {getLetterTypeIcon(letter.letterType)}
                    <div className="min-w-0">
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold text-[#292A27] truncate max-w-xs md:max-w-sm block">
                          {letter.subject}
                        </span>
                        {letter.is_new && (
                          <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-md bg-[#526A55]/15 text-[#526A55] flex-shrink-0">
                            NEW
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#8A8983] mt-0.5 font-mono">
                        {letter.referenceNumber}
                      </p>
                    </div>
                  </div>
                </Table.Td>
                <Table.Td>
                  <span className="text-xs font-medium text-[#292A27] block capitalize">
                    {letter.letterType.charAt(0) + letter.letterType.slice(1).toLowerCase()}
                  </span>
                  <span className="text-[11px] text-[#6B6A64] block">{letter.department_name}</span>
                </Table.Td>
                <Table.Td>
                  {letter.sender && (
                    <span className="text-xs font-medium text-[#292A27] block truncate max-w-[160px]">
                      {letter.sender}
                    </span>
                  )}
                  {letter.senderOrganization && (
                    <span className="text-[11px] text-[#6B6A64] block truncate max-w-[160px]">
                      {letter.senderOrganization}
                    </span>
                  )}
                </Table.Td>
                <Table.Td>
                  <span className="text-xs text-[#6B6A64]">
                    {letter.dateReceived || letter.dateSent || letter.created_at}
                  </span>
                </Table.Td>
                <Table.Td>
                  <Badge status={letter.status as LetterStatus} dot />
                </Table.Td>
                <Table.Td className="text-right">
                  <Dropdown
                    align="right"
                    items={getRowActions(letter)}
                    trigger={
                      <button
                        type="button"
                        className="p-1.5 rounded-lg text-[#6B6A64] hover:text-[#292A27] hover:bg-[#ECEAE3] transition-colors focus:outline-none"
                        aria-label="Row actions"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                        </svg>
                      </button>
                    }
                  />
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Body>
        </Table>
      ) : (
        /* Grid View */
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {response.data.map((letter) => (
            <div
              key={letter.id}
              className="bg-[#ECEAE3] border border-[#292A27]/10 rounded-2xl p-4 flex flex-col justify-between space-y-4 hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3 min-w-0">
                  {getLetterTypeIcon(letter.letterType)}
                  <div className="min-w-0">
                    <h4 className="text-sm font-semibold text-[#292A27] line-clamp-2">{letter.subject}</h4>
                    <p className="text-xs text-[#8A8983] font-mono mt-0.5">{letter.referenceNumber}</p>
                  </div>
                </div>
                <Dropdown
                  align="right"
                  items={getRowActions(letter)}
                  trigger={
                    <button type="button" className="p-1 rounded-lg text-[#6B6A64] hover:bg-[#D8D7D1]/50 flex-shrink-0">
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                      </svg>
                    </button>
                  }
                />
              </div>

              <div className="space-y-1 text-xs text-[#6B6A64]">
                {letter.sender && <p><span className="font-medium text-[#292A27]">From:</span> {letter.sender}</p>}
                {letter.recipient && <p><span className="font-medium text-[#292A27]">To:</span> {letter.recipient}</p>}
                <p><span className="font-medium text-[#292A27]">Dept:</span> {letter.department_name}</p>
                <p><span className="font-medium text-[#292A27]">Date:</span> {letter.dateReceived || letter.dateSent || letter.created_at}</p>
              </div>

              <div className="pt-2 border-t border-[#D8D7D1]/50 flex items-center justify-between">
                <Badge status={letter.status as LetterStatus} dot />
                <Button variant="secondary" size="sm" onClick={() => navigate(`/letters/${letter.id}`)}>
                  View Details
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {response && response.totalPages > 1 && (
        <div className="pt-4 flex justify-center">
          <Pagination
            currentPage={page}
            totalPages={response.totalPages}
            onPageChange={(newPage) => setPage(newPage)}
          />
        </div>
      )}

      {/* Register Letter Modal */}
      <RegisterLetterModal
        open={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onSuccess={fetchLetters}
      />

      {/* Archive Confirmation Dialog */}
      <ConfirmDialog
        open={!!archiveTarget}
        title="Archive Letter?"
        description={`Are you sure you want to move "${archiveTarget?.subject}" to archives? It will remain accessible under Archives.`}
        confirmLabel="Move to Archive"
        danger
        isLoading={isArchiving}
        onConfirm={handleConfirmArchive}
        onCancel={() => setArchiveTarget(null)}
      />
    </div>
  );
};

export default Letters;
