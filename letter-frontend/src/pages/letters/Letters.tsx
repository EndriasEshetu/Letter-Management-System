import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import letterService from '@/services/letterService';
import { LetterFilterParams, LetterItem, PaginatedLetterResponse, LetterDirection } from '@/types/letter';
import { formatDate } from '@/utils/dateUtils';
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
import { RegisterLetterModal } from '@/components/letters';

/* ─── Constants ───────────────────────────────────────────── */

const DIRECTION_TABS: { value: string; label: string; icon: string; color: string; activeColor: string }[] = [
  { value: 'ALL', label: 'All Letters', icon: '📋', color: 'text-[#6B6A64]', activeColor: 'bg-[#292A27] text-[#F5F3ED]' },
  { value: 'INCOMING', label: 'Incoming', icon: '📥', color: 'text-[#526A55]', activeColor: 'bg-[#526A55] text-[#F5F3ED]' },
  { value: 'OUTGOING', label: 'Outgoing', icon: '📤', color: 'text-[#C48D3F]', activeColor: 'bg-[#C48D3F] text-[#F5F3ED]' },
  { value: 'INTERNAL', label: 'Internal', icon: '🏢', color: 'text-[#6B5A8E]', activeColor: 'bg-[#6B5A8E] text-[#F5F3ED]' },
];

const INCOMING_STATUS_PILLS = [
  { label: 'ALL', value: 'ALL' },
  { label: 'REGISTERED', value: 'REGISTERED' },
  { label: 'RECEIVED', value: 'RECEIVED' },
  { label: 'IN PROGRESS', value: 'IN_PROGRESS' },
  { label: 'PENDING REVIEW', value: 'PENDING_REVIEW' },
  { label: 'APPROVED', value: 'APPROVED' },
  { label: 'DISPATCHED', value: 'DISPATCHED' },
  { label: 'COMPLETED', value: 'COMPLETED' },
  { label: 'ARCHIVED', value: 'ARCHIVED' },
];

const OUTGOING_STATUS_PILLS = [
  { label: 'ALL', value: 'ALL' },
  { label: 'DRAFT', value: 'DRAFT' },
  { label: 'PENDING REVIEW', value: 'PENDING_REVIEW' },
  { label: 'PENDING APPROVAL', value: 'PENDING_APPROVAL' },
  { label: 'APPROVED', value: 'APPROVED' },
  { label: 'REGISTERED', value: 'REGISTERED' },
  { label: 'DISPATCHED', value: 'DISPATCHED' },
  { label: 'COMPLETED', value: 'COMPLETED' },
  { label: 'ARCHIVED', value: 'ARCHIVED' },
];

const INTERNAL_STATUS_PILLS = [
  { label: 'ALL', value: 'ALL' },
  { label: 'DRAFT', value: 'DRAFT' },
  { label: 'PENDING APPROVAL', value: 'PENDING_APPROVAL' },
  { label: 'REGISTERED', value: 'REGISTERED' },
  { label: 'IN PROGRESS', value: 'IN_PROGRESS' },
  { label: 'COMPLETED', value: 'COMPLETED' },
  { label: 'ARCHIVED', value: 'ARCHIVED' },
];

const ALL_STATUS_PILLS = [
  { label: 'ALL', value: 'ALL' },
  { label: 'DRAFT', value: 'DRAFT' },
  { label: 'REGISTERED', value: 'REGISTERED' },
  { label: 'RECEIVED', value: 'RECEIVED' },
  { label: 'IN PROGRESS', value: 'IN_PROGRESS' },
  { label: 'PENDING REVIEW', value: 'PENDING_REVIEW' },
  { label: 'APPROVED', value: 'APPROVED' },
  { label: 'DISPATCHED', value: 'DISPATCHED' },
  { label: 'COMPLETED', value: 'COMPLETED' },
  { label: 'ARCHIVED', value: 'ARCHIVED' },
];

import { DEPARTMENT_FILTER_OPTIONS as OFFICIAL_DEPT_FILTER_OPTIONS } from '@/constants/departments';

const DEPARTMENT_FILTER_OPTIONS: SelectOption[] = OFFICIAL_DEPT_FILTER_OPTIONS;

const LETTER_TYPE_OPTIONS: SelectOption[] = [
  { value: 'ALL', label: 'All Types' },
  { value: 'MEMORANDUM', label: 'Memorandum' },
  { value: 'REQUEST', label: 'Request' },
  { value: 'RESPONSE', label: 'Response' },
  { value: 'OFFICIAL', label: 'Official' },
  { value: 'INVITATION', label: 'Invitation' },
  { value: 'NOTIFICATION', label: 'Notification' },
  { value: 'ADMINISTRATIVE', label: 'Administrative' },
];

/* ─── Direction Icon Component ────────────────────────────── */

const DirectionIcon: React.FC<{ direction?: LetterDirection | string }> = ({ direction }) => {
  switch (direction) {
    case 'INCOMING':
      return (
        <div className="w-9 h-9 rounded-xl bg-[#526A55]/10 text-[#526A55] flex items-center justify-center flex-shrink-0 font-bold text-[9px]">
          IN
        </div>
      );
    case 'OUTGOING':
      return (
        <div className="w-9 h-9 rounded-xl bg-[#C48D3F]/10 text-[#8A5D19] flex items-center justify-center flex-shrink-0 font-bold text-[9px]">
          OUT
        </div>
      );
    case 'INTERNAL':
      return (
        <div className="w-9 h-9 rounded-xl bg-[#6B5A8E]/10 text-[#4A3A6B] flex items-center justify-center flex-shrink-0 font-bold text-[9px]">
          INT
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

/* ─── Main Component ──────────────────────────────────────── */

export const Letters: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToast } = useToast();

  const [response, setResponse] = useState<PaginatedLetterResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Direction from URL search params
  const initialDirection = searchParams.get('direction') || 'ALL';
  const [direction, setDirection] = useState(initialDirection);
  const [search, setSearch] = useState('');
  const [letterType, setLetterType] = useState('ALL');
  const [department, setDepartment] = useState('ALL');
  const [status, setStatus] = useState('ALL');
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<'table' | 'grid'>('table');

  // Modals state
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [registerDirection, setRegisterDirection] = useState<LetterDirection | undefined>(undefined);
  const [archiveTarget, setArchiveTarget] = useState<LetterItem | null>(null);
  const [isArchiving, setIsArchiving] = useState(false);

  // Sync direction changes to URL
  const handleDirectionChange = (newDir: string) => {
    setDirection(newDir);
    setStatus('ALL');
    setPage(1);
    if (newDir !== 'ALL') {
      setSearchParams({ direction: newDir });
    } else {
      setSearchParams({});
    }
  };

  // Get direction-appropriate status pills
  const getStatusPills = () => {
    switch (direction) {
      case 'INCOMING': return INCOMING_STATUS_PILLS;
      case 'OUTGOING': return OUTGOING_STATUS_PILLS;
      case 'INTERNAL': return INTERNAL_STATUS_PILLS;
      default: return ALL_STATUS_PILLS;
    }
  };

  const fetchLetters = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params: LetterFilterParams = {
        search: search.trim() || undefined,
        letterType: letterType !== 'ALL' ? letterType : undefined,
        department_id: department !== 'ALL' ? department : undefined,
        status: status !== 'ALL' ? status : undefined,
        direction: direction !== 'ALL' ? (direction as LetterDirection) : undefined,
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
  }, [search, letterType, department, status, direction, page]);

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

  const handleRegisterNew = (dir?: LetterDirection) => {
    setRegisterDirection(dir);
    setIsRegisterOpen(true);
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
      label: 'Track Letter',
      onClick: () => navigate(`/letters/track?ref=${letter.referenceNumber}`),
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
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
            Search, filter, and manage all official incoming, outgoing, and internal correspondence.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* View Switcher */}
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

          {/* Register Letter Dropdown */}
          <Dropdown
            align="right"
            items={[
              { label: '📥 Register Incoming Letter', onClick: () => handleRegisterNew('INCOMING') },
              { label: '📤 Create Outgoing Letter', onClick: () => handleRegisterNew('OUTGOING') },
              { label: '🏢 Create Internal Memo', onClick: () => handleRegisterNew('INTERNAL') },
            ]}
            trigger={
              <Button variant="primary">
                <svg className="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                New Letter
              </Button>
            }
          />
        </div>
      </div>

      {/* Direction Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1">
        {DIRECTION_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => handleDirectionChange(tab.value)}
            className={`px-4 py-2 rounded-xl text-sm font-bold transition-all whitespace-nowrap flex items-center space-x-2 ${
              direction === tab.value
                ? tab.activeColor + ' shadow-sm'
                : 'bg-[#ECEAE3] ' + tab.color + ' hover:bg-[#D8D7D1]/60 border border-[#D8D7D1]'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
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

        {/* Status Pill Filters — Direction-aware */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1">
          {getStatusPills().map((pill) => (
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
        {direction !== 'ALL' && (
          <span className="ml-2 text-[#526A55]">
            ({direction.charAt(0) + direction.slice(1).toLowerCase()} only)
          </span>
        )}
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
          description={
            direction !== 'ALL'
              ? `No ${direction.toLowerCase()} letters match your current filters.`
              : 'Try adjusting your search keywords or filter settings.'
          }
          actionLabel={direction !== 'ALL' ? `Register ${direction.charAt(0) + direction.slice(1).toLowerCase()} Letter` : 'Register First Letter'}
          onAction={() => handleRegisterNew(direction !== 'ALL' ? direction as LetterDirection : undefined)}
        />
      ) : viewMode === 'table' ? (
        <Table>
          <Table.Header>
            <Table.Th>Direction & Subject</Table.Th>
            <Table.Th>Type & Department</Table.Th>
            <Table.Th>From / To</Table.Th>
            <Table.Th>Date</Table.Th>
            <Table.Th>Status</Table.Th>
            <Table.Th className="text-right">Actions</Table.Th>
          </Table.Header>
          <Table.Body>
            {response.data.map((letter) => (
              <Table.Tr key={letter.id}>
                <Table.Td>
                  <div className="flex items-center space-x-3">
                    <DirectionIcon direction={letter.direction} />
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
                  {letter.recipient && !letter.sender && (
                    <span className="text-xs font-medium text-[#292A27] block truncate max-w-[160px]">
                      To: {letter.recipient}
                    </span>
                  )}
                </Table.Td>
                <Table.Td>
                  <span className="text-xs text-[#6B6A64]">
                    {formatDate(letter.dateReceived || letter.dateSent || letter.created_at)}
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
                  <DirectionIcon direction={letter.direction} />
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
                <p><span className="font-medium text-[#292A27]">Date:</span> {formatDate(letter.dateReceived || letter.dateSent || letter.created_at)}</p>
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
        onClose={() => { setIsRegisterOpen(false); setRegisterDirection(undefined); }}
        onSuccess={fetchLetters}
        initialDirection={registerDirection}
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
