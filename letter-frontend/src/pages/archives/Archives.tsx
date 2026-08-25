import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import letterService from '@/services/letterService';
import { LetterFilterParams, LetterItem, PaginatedLetterResponse } from '@/types/letter';
import Table from '@/components/common/Table';
import Badge from '@/components/common/Badge';
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

const CATEGORY_FILTER_OPTIONS: SelectOption[] = [
  { value: 'ALL', label: 'All Categories' },
  { value: 'Finance / Budget', label: 'Finance / Budget' },
  { value: 'Finance / Reports', label: 'Finance / Reports' },
  { value: 'Legal / Audit', label: 'Legal / Audit' },
  { value: 'HR / Administration', label: 'HR / Administration' },
  { value: 'ICT / Partnerships', label: 'ICT / Partnerships' },
];

import { DEPARTMENT_FILTER_OPTIONS as OFFICIAL_DEPT_FILTER_OPTIONS } from '@/constants/departments';

const DEPARTMENT_FILTER_OPTIONS: SelectOption[] = OFFICIAL_DEPT_FILTER_OPTIONS;

const getDocIcon = (filename: string, filetype?: string) => {
  const lower = (filename || filetype || '').toLowerCase();
  if (lower.includes('pdf')) {
    return (
      <div className="w-9 h-9 rounded-xl bg-[#8B3232]/10 text-[#8B3232] flex items-center justify-center flex-shrink-0 font-bold text-xs">
        PDF
      </div>
    );
  }
  if (lower.includes('png') || lower.includes('jpg') || lower.includes('jpeg') || lower.includes('img')) {
    return (
      <div className="w-9 h-9 rounded-xl bg-[#4A6B4E]/10 text-[#4A6B4E] flex items-center justify-center flex-shrink-0 font-bold text-xs">
        IMG
      </div>
    );
  }
  return (
    <div className="w-9 h-9 rounded-xl bg-[#526A55]/10 text-[#526A55] flex items-center justify-center flex-shrink-0 font-bold text-xs">
      LTR
    </div>
  );
};

export const Archives: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addToast } = useToast();

  const [response, setResponse] = useState<PaginatedLetterResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters State
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('ALL');
  const [department, setDepartment] = useState('ALL');
  const [page, setPage] = useState(1);

  // Restore Modal State
  const [restoreTarget, setRestoreTarget] = useState<LetterItem | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);

  const fetchArchives = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params: LetterFilterParams = {
        search: search.trim() || undefined,
        category: category !== 'ALL' ? category : undefined,
        department_id: department !== 'ALL' ? department : undefined,
        page,
        limit: 10,
      };
      const res = await letterService.getArchivedLetters(params);
      setResponse(res);
    } catch (err: any) {
      setError(err.message || 'Failed to load archived letters.');
    } finally {
      setIsLoading(false);
    }
  }, [search, category, department, page]);

  useEffect(() => {
    fetchArchives();
  }, [fetchArchives]);

  const handleDownload = async (doc: LetterItem) => {
    try {
      addToast({
        type: 'info',
        title: 'Downloading...',
        message: `Preparing download for ${doc.file_name}`,
      });
      await letterService.downloadAttachment(doc.id, doc.file_name);
      addToast({
        type: 'success',
        title: 'Download Started',
        message: `${doc.file_name} has been downloaded.`,
      });
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Download Failed',
        message: err.message || 'Unable to download archived letter.',
      });
    }
  };

  const handleConfirmRestore = async () => {
    if (!restoreTarget) return;
    setIsRestoring(true);
    try {
      await letterService.restoreLetter(restoreTarget.id);
      addToast({
        type: 'success',
        title: 'Letter Restored',
        message: `"${restoreTarget.subject}" has been restored to active letter repository.`,
      });
      setRestoreTarget(null);
      fetchArchives();
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Restore Failed',
        message: err.message || 'Could not restore letter from archive.',
      });
    } finally {
      setIsRestoring(false);
    }
  };

  const getRowActions = (doc: LetterItem): DropdownItem[] => {
    const actions: DropdownItem[] = [
      {
        label: 'View Details',
        onClick: () => navigate(`/letters/${doc.id}`),
        icon: (
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
        ),
      },
      {
        label: 'Preview Attachment',
        onClick: () => navigate(`/letters/${doc.id}/preview`),
        icon: (
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
        ),
      },
      {
        label: 'Download File',
        onClick: () => handleDownload(doc),
        icon: (
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
          </svg>
        ),
      },
    ];

    // Restore Action: ADMIN ONLY
    if (user?.role === 'ADMIN') {
      actions.push({
        label: 'Restore Letter',
        onClick: () => setRestoreTarget(doc),
        dividerBefore: true,
        icon: (
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
        ),
      });
    }

    return actions;
  };

  const totalDocuments = response?.total || 0;
  const startCount = totalDocuments === 0 ? 0 : (page - 1) * 10 + 1;
  const endCount = Math.min(page * 10, totalDocuments);

  return (
    <div className="space-y-6">
      {/* Top Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-[#D8D7D1]/60">
        <div>
          <div className="flex items-center space-x-3">
            <h1 className="text-xl md:text-2xl font-bold tracking-tight text-[#292A27]">
              Letter Archive
            </h1>
            <span className="text-[10px] font-bold tracking-wider uppercase px-2.5 py-0.5 rounded-full bg-[#6B6A64]/10 text-[#6B6A64] border border-[#6B6A64]/20">
              Archived Vault
            </span>
          </div>
          <p className="text-xs md:text-sm text-[#6B6A64] mt-1 font-normal">
            Browse and manage official archived letters and historical correspondence records across SITA units.
          </p>
        </div>

        <div className="text-xs text-[#8A8983] font-medium self-start md:self-auto bg-[#ECEAE3] px-3 py-1.5 rounded-xl border border-[#D8D7D1]/60">
          Showing Archived Records Only
        </div>
      </div>

      {/* Filter Toolbar Panel */}
      <div className="bg-[#ECEAE3] border border-[#D8D7D1] rounded-2xl p-4 space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <SearchInput
            value={search}
            onChange={(val) => {
              setSearch(val);
              setPage(1);
            }}
            placeholder="Search archived letters..."
          />
          <Select
            options={CATEGORY_FILTER_OPTIONS}
            value={category}
            onChange={(val) => {
              setCategory(val);
              setPage(1);
            }}
          />
          <Select
            options={DEPARTMENT_FILTER_OPTIONS}
            value={department}
            onChange={(val) => {
              setDepartment(val);
              setPage(1);
            }}
          />
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearch('');
                setCategory('ALL');
                setDepartment('ALL');
                setPage(1);
              }}
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </div>

      {/* Result Count Indicator */}
      <div className="text-xs font-semibold text-[#6B6A64]">
        Showing {startCount}–{endCount} of {totalDocuments} archived letters
      </div>

      {/* Main Content: Table / Loading / Error / Empty */}
      {isLoading ? (
        <div className="py-16 flex justify-center items-center">
          <LoadingSpinner size="lg" label="Loading Archived Vault..." />
        </div>
      ) : error ? (
        <ErrorState title="Unable to load archives" description={error} onRetry={fetchArchives} />
      ) : !response || response.data.length === 0 ? (
        <EmptyState
          title="No archived letters found"
          description={
            search || category !== 'ALL' || department !== 'ALL'
              ? 'No archived letters match your selected filters. Try clearing filters.'
              : 'There are currently no archived letter records stored in the system vault.'
          }
          actionLabel={search || category !== 'ALL' || department !== 'ALL' ? 'Clear Filters' : undefined}
          onAction={() => {
            setSearch('');
            setCategory('ALL');
            setDepartment('ALL');
            setPage(1);
          }}
        />
      ) : (
        <Table>
          <Table.Header>
            <Table.Th>Letter Subject</Table.Th>
            <Table.Th>Category</Table.Th>
            <Table.Th>Department</Table.Th>
            <Table.Th>Archived Status</Table.Th>
            <Table.Th className="text-right">Actions</Table.Th>
          </Table.Header>
          <Table.Body>
            {response.data.map((doc) => (
              <Table.Tr key={doc.id}>
                <Table.Td>
                  <div className="flex items-center space-x-3">
                    {getDocIcon(doc.file_name, doc.file_type)}
                    <div className="min-w-0">
                      <span className="font-semibold text-[#292A27] truncate max-w-xs md:max-w-md block">
                        {doc.subject}
                      </span>
                      <p className="text-xs text-[#8A8983] mt-0.5">
                        Ref: {doc.referenceNumber} • {(doc.file_size / (1024 * 1024)).toFixed(1)} MB
                      </p>
                    </div>
                  </div>
                </Table.Td>
                <Table.Td>
                  <span className="text-xs font-medium text-[#292A27] block">{doc.category}</span>
                </Table.Td>
                <Table.Td>
                  <span className="text-xs text-[#6B6A64] font-medium">{doc.department_name}</span>
                </Table.Td>
                <Table.Td>
                  <Badge status="ARCHIVED" dot />
                </Table.Td>
                <Table.Td className="text-right">
                  <Dropdown
                    align="right"
                    items={getRowActions(doc)}
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
      )}

      {/* Pagination Container */}
      {response && response.totalPages > 1 && (
        <div className="pt-4 flex justify-center">
          <Pagination
            currentPage={page}
            totalPages={response.totalPages}
            onPageChange={(newPage) => setPage(newPage)}
          />
        </div>
      )}

      {/* Restore Confirmation Dialog (ADMIN ONLY) */}
      <ConfirmDialog
        open={!!restoreTarget}
        title="Restore Letter?"
        description={`Are you sure you want to restore "${restoreTarget?.subject}"? It will be moved from the archive back to active letter repository.`}
        confirmLabel="Restore Letter"
        isLoading={isRestoring}
        onConfirm={handleConfirmRestore}
        onCancel={() => setRestoreTarget(null)}
      />
    </div>
  );
};

export default Archives;
