import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import letterService from "@/services/letterService";
import {
  LetterFilterParams,
  LetterItem,
  PaginatedLetterResponse,
  LetterDirection,
} from "@/types/letter";
import { formatDate } from "@/utils/dateUtils";
import Table from "@/components/common/Table";
import Badge, { LetterStatus } from "@/components/common/Badge";
import Button from "@/components/common/Button";
import SearchInput from "@/components/common/SearchInput";
import Select, { SelectOption } from "@/components/common/Select";
import Pagination from "@/components/common/Pagination";
import Dropdown, { DropdownItem } from "@/components/common/Dropdown";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ErrorState from "@/components/common/ErrorState";
import EmptyState from "@/components/common/EmptyState";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import { useToast } from "@/components/common/Toast";
import { RegisterLetterModal } from "@/components/letters";
import { useLetterPermissions } from "@/hooks/useLetterPermissions";
import { useAuth } from "@/hooks/useAuth";
import { DEPARTMENT_FILTER_OPTIONS as OFFICIAL_DEPT_FILTER_OPTIONS } from "@/constants/departments";

/* ─── Direction Tabs ─────────────────────────────────────────── */

const DIRECTION_TABS: {
  value: string;
  label: string;
  icon: string;
  color: string;
  activeColor: string;
}[] = [
  {
    value: "ALL",
    label: "All Letters",
    icon: "📋",
    color: "text-[#6B6A64]",
    activeColor: "bg-[#292A27] text-[#F5F3ED]",
  },
  {
    value: "INCOMING",
    label: "Incoming",
    icon: "📥",
    color: "text-[#526A55]",
    activeColor: "bg-[#526A55] text-[#F5F3ED]",
  },
  {
    value: "OUTGOING",
    label: "Outgoing",
    icon: "📤",
    color: "text-[#C48D3F]",
    activeColor: "bg-[#C48D3F] text-[#F5F3ED]",
  },
  {
    value: "INTERNAL",
    label: "Internal",
    icon: "🏢",
    color: "text-[#6B5A8E]",
    activeColor: "bg-[#6B5A8E] text-[#F5F3ED]",
  },
];

/* ─── Status Pill Sets — Direction-specific ──────────────────── */

const INCOMING_STATUS_PILLS = [
  { label: "ALL", value: "ALL" },
  { label: "RECEIVED", value: "RECEIVED" },
  { label: "REGISTERED", value: "REGISTERED" },
  { label: "AWAITING ROUTING", value: "AWAITING_ROUTING" },
  { label: "ROUTED", value: "ROUTED" },
  { label: "ASSIGNED", value: "ASSIGNED" },
  { label: "IN PROGRESS", value: "IN_PROGRESS" },
  { label: "RESPONSE REQUIRED", value: "RESPONSE_REQUIRED" },
  { label: "COMPLETED", value: "COMPLETED" },
  { label: "ARCHIVED", value: "ARCHIVED" },
];

const OUTGOING_STATUS_PILLS = [
  { label: "ALL", value: "ALL" },
  { label: "DRAFT", value: "DRAFT" },
  { label: "PENDING REVIEW", value: "PENDING_REVIEW" },
  { label: "CHANGES REQUESTED", value: "CHANGES_REQUESTED" },
  { label: "APPROVED", value: "APPROVED" },
  { label: "REGISTERED", value: "REGISTERED" },
  { label: "READY FOR DISPATCH", value: "READY_FOR_DISPATCH" },
  { label: "DISPATCHED", value: "DISPATCHED" },
  { label: "DELIVERED", value: "DELIVERED" },
  { label: "COMPLETED", value: "COMPLETED" },
  { label: "ARCHIVED", value: "ARCHIVED" },
];

const INTERNAL_STATUS_PILLS = [
  { label: "ALL", value: "ALL" },
  { label: "DRAFT", value: "DRAFT" },
  { label: "PENDING REVIEW", value: "PENDING_REVIEW" },
  { label: "CHANGES REQUESTED", value: "CHANGES_REQUESTED" },
  { label: "APPROVED", value: "APPROVED" },
  { label: "REGISTERED", value: "REGISTERED" },
  { label: "ROUTED", value: "ROUTED" },
  { label: "ASSIGNED", value: "ASSIGNED" },
  { label: "IN PROGRESS", value: "IN_PROGRESS" },
  { label: "COMPLETED", value: "COMPLETED" },
  { label: "ARCHIVED", value: "ARCHIVED" },
];

const ALL_STATUS_PILLS = [
  { label: "ALL", value: "ALL" },
  { label: "DRAFT", value: "DRAFT" },
  { label: "REGISTERED", value: "REGISTERED" },
  { label: "RECEIVED", value: "RECEIVED" },
  { label: "IN PROGRESS", value: "IN_PROGRESS" },
  { label: "PENDING REVIEW", value: "PENDING_REVIEW" },
  { label: "APPROVED", value: "APPROVED" },
  { label: "DISPATCHED", value: "DISPATCHED" },
  { label: "COMPLETED", value: "COMPLETED" },
  { label: "ARCHIVED", value: "ARCHIVED" },
];

/* Role-scoped status pills — employees don't see system-wide statuses */
const EMPLOYEE_STATUS_PILLS = [
  { label: "ALL", value: "ALL" },
  { label: "DRAFT", value: "DRAFT" },
  { label: "IN PROGRESS", value: "IN_PROGRESS" },
  { label: "PENDING REVIEW", value: "PENDING_REVIEW" },
  { label: "CHANGES REQUESTED", value: "CHANGES_REQUESTED" },
  { label: "COMPLETED", value: "COMPLETED" },
];

const REGISTRY_STATUS_PILLS = [
  { label: "ALL", value: "ALL" },
  { label: "RECEIVED", value: "RECEIVED" },
  { label: "REGISTERED", value: "REGISTERED" },
  { label: "AWAITING ROUTING", value: "AWAITING_ROUTING" },
  { label: "APPROVED", value: "APPROVED" },
  { label: "READY FOR DISPATCH", value: "READY_FOR_DISPATCH" },
  { label: "DISPATCHED", value: "DISPATCHED" },
];

/* ─── Filter Options ─────────────────────────────────────────── */

const DIRECTORATE_FILTER_OPTIONS: SelectOption[] = OFFICIAL_DEPT_FILTER_OPTIONS;

const LETTER_TYPE_OPTIONS: SelectOption[] = [
  { value: "ALL", label: "All Types" },
  { value: "MEMORANDUM", label: "Memorandum" },
  { value: "REQUEST", label: "Request" },
  { value: "RESPONSE", label: "Response" },
  { value: "OFFICIAL", label: "Official" },
  { value: "INVITATION", label: "Invitation" },
  { value: "NOTIFICATION", label: "Notification" },
  { value: "ADMINISTRATIVE", label: "Administrative" },
];

const PRIORITY_OPTIONS: SelectOption[] = [
  { value: "ALL", label: "All Priorities" },
  { value: "URGENT", label: "Urgent" },
  { value: "HIGH", label: "High" },
  { value: "NORMAL", label: "Normal" },
  { value: "LOW", label: "Low" },
];

/* ─── Direction Icon ─────────────────────────────────────────── */

const DirectionIcon: React.FC<{ direction?: LetterDirection | string }> = ({
  direction,
}) => {
  switch (direction) {
    case "INCOMING":
      return (
        <div className="w-9 h-9 rounded-xl bg-[#526A55]/10 text-[#526A55] flex items-center justify-center flex-shrink-0 font-bold text-[9px]">
          IN
        </div>
      );
    case "OUTGOING":
      return (
        <div className="w-9 h-9 rounded-xl bg-[#C48D3F]/10 text-[#8A5D19] flex items-center justify-center flex-shrink-0 font-bold text-[9px]">
          OUT
        </div>
      );
    case "INTERNAL":
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

const PriorityPill: React.FC<{ priority?: string }> = ({ priority }) => {
  if (!priority) return null;
  const styles: Record<string, string> = {
    URGENT: "bg-[#8B3232]/12 text-[#8B3232]",
    HIGH: "bg-[#C48D3F]/12 text-[#8A5D19]",
    NORMAL: "bg-[#526A55]/12 text-[#3E5140]",
    LOW: "bg-[#D8D7D1]/60 text-[#6B6A64]",
  };
  return (
    <span
      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${styles[priority] || styles.NORMAL}`}
    >
      {priority}
    </span>
  );
};

/* ─── Main Component ─────────────────────────────────────────── */

export const Letters: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const { addToast } = useToast();
  const { user } = useAuth();
  const perms = useLetterPermissions();

  const role = user?.role;

  const [response, setResponse] = useState<PaginatedLetterResponse | null>(
    null,
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const initialDirection = searchParams.get("direction") || "ALL";
  const [direction, setDirection] = useState(initialDirection);
  const [search, setSearch] = useState("");
  const [letterType, setLetterType] = useState("ALL");
  const [directorate, setDirectorate] = useState("ALL");
  const [priority, setPriority] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [page, setPage] = useState(1);
  const [viewMode, setViewMode] = useState<"table" | "grid">("table");

  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [registerDirection, setRegisterDirection] = useState<
    LetterDirection | undefined
  >(undefined);
  const [archiveTarget, setArchiveTarget] = useState<LetterItem | null>(null);
  const [isArchiving, setIsArchiving] = useState(false);

  const handleDirectionChange = (newDir: string) => {
    setDirection(newDir);
    setStatus("ALL");
    setPage(1);
    if (newDir !== "ALL") {
      setSearchParams({ direction: newDir });
    } else {
      setSearchParams({});
    }
  };

  /* ─── Role-specific status pills ─────────────────────────── */
  const getStatusPills = () => {
    if (role === "EMPLOYEE") return EMPLOYEE_STATUS_PILLS;
    if (role === "REGISTRY_OFFICER") return REGISTRY_STATUS_PILLS;
    switch (direction) {
      case "INCOMING":
        return INCOMING_STATUS_PILLS;
      case "OUTGOING":
        return OUTGOING_STATUS_PILLS;
      case "INTERNAL":
        return INTERNAL_STATUS_PILLS;
      default:
        return ALL_STATUS_PILLS;
    }
  };

  /* ─── Role-specific header descriptions ──────────────────── */
  const getSubtitle = () => {
    switch (role) {
      case "ADMIN":
        return "System-wide visibility. Search, filter, and manage all official incoming, outgoing, and internal correspondence.";
      case "REGISTRY_OFFICER":
        return "Registry intake, registration, routing, and dispatch operations for official correspondence.";
      case "DEPARTMENT_MANAGER":
        return `Correspondence for your Directorate${user?.department_name ? ` (${user.department_name})` : ""}. Review, assign, and approve letters.`;
      default:
        return "Letters assigned to you or submitted by you. Track status and manage your letter tasks.";
    }
  };

  /* ─── Data Fetch ──────────────────────────────────────────── */
  const fetchLetters = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const params: LetterFilterParams = {
        search: search.trim() || undefined,
        letterType: letterType !== "ALL" ? letterType : undefined,
        department_id: directorate !== "ALL" ? directorate : undefined,
        priority: priority !== "ALL" ? priority : undefined,
        status: status !== "ALL" ? status : undefined,
        direction:
          direction !== "ALL" ? (direction as LetterDirection) : undefined,
        page,
        limit: 10,
        // Employee scope
        my_letters: role === "EMPLOYEE" ? true : undefined,
      };
      const res = await letterService.getLetters(params);
      setResponse(res);
    } catch (err: any) {
      setError(err.message || "Failed to load letters from repository.");
    } finally {
      setIsLoading(false);
    }
  }, [
    search,
    letterType,
    directorate,
    priority,
    status,
    direction,
    page,
    role,
  ]);

  useEffect(() => {
    fetchLetters();
  }, [fetchLetters]);

  /* ─── Actions ─────────────────────────────────────────────── */
  const handleDownload = async (letter: LetterItem) => {
    try {
      addToast({
        type: "info",
        title: "Downloading...",
        message: `Preparing download for ${letter.file_name}`,
      });
      await letterService.downloadAttachment(letter.id, letter.file_name);
      addToast({
        type: "success",
        title: "Download Started",
        message: `${letter.file_name} has been downloaded.`,
      });
    } catch (err: any) {
      addToast({
        type: "error",
        title: "Download Failed",
        message: err.message || "Unable to download attachment.",
      });
    }
  };

  const handleConfirmArchive = async () => {
    if (!archiveTarget) return;
    setIsArchiving(true);
    try {
      await letterService.archiveLetter(archiveTarget.id);
      addToast({
        type: "success",
        title: "Letter Archived",
        message: `"${archiveTarget.subject}" has been moved to archives.`,
      });
      setArchiveTarget(null);
      fetchLetters();
    } catch (err: any) {
      addToast({
        type: "error",
        title: "Archive Failed",
        message: err.message || "Could not archive letter.",
      });
    } finally {
      setIsArchiving(false);
    }
  };

  const handleRegisterNew = (dir?: LetterDirection) => {
    setRegisterDirection(dir);
    setIsRegisterOpen(true);
  };

  /* ─── Role-specific row actions ──────────────────────────── */
  const getRowActions = (letter: LetterItem): DropdownItem[] => {
    const actions: DropdownItem[] = [
      {
        label: "View Details",
        onClick: () => navigate(`/letters/${letter.id}`),
        icon: (
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.75}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.75}
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            />
          </svg>
        ),
      },
    ];

    // Track — always visible
    if (perms.canViewTracking) {
      actions.push({
        label: "Track Letter",
        onClick: () => navigate(`/letters/track?ref=${letter.referenceNumber}`),
        icon: (
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.75}
              d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
            />
          </svg>
        ),
      });
    }

    // Download
    actions.push({
      label: "Download Attachment",
      onClick: () => handleDownload(letter),
      icon: (
        <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.75}
            d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
          />
        </svg>
      ),
    });

    // Registry: Register action on incoming unregistered letters
    if (
      role === "REGISTRY_OFFICER" &&
      letter.direction === "INCOMING" &&
      (letter.status === "RECEIVED" || !letter.registrationNumber)
    ) {
      actions.push({
        label: "Register Letter",
        dividerBefore: true,
        onClick: () => navigate(`/letters/${letter.id}`),
        icon: (
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.75}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        ),
      });
    }

    // Registry: Dispatch action on approved outgoing
    if (
      (role === "REGISTRY_OFFICER" || role === "ADMIN") &&
      letter.direction === "OUTGOING" &&
      (letter.status === "APPROVED" || letter.status === "READY_FOR_DISPATCH")
    ) {
      actions.push({
        label: "Record Dispatch",
        dividerBefore: true,
        onClick: () => navigate(`/letters/${letter.id}`),
        icon: (
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.75}
              d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
            />
          </svg>
        ),
      });
    }

    // Manager: Approve shortcut
    if (
      (role === "DEPARTMENT_MANAGER" || role === "ADMIN") &&
      (letter.status === "PENDING_REVIEW" ||
        letter.status === "PENDING_APPROVAL")
    ) {
      actions.push({
        label: "Review & Approve",
        dividerBefore: true,
        onClick: () => navigate(`/letters/${letter.id}`),
        icon: (
          <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.75}
              d="M5 13l4 4L19 7"
            />
          </svg>
        ),
      });
    }

    // Admin: Archive
    if (perms.canArchiveLetter || role === "ADMIN") {
      if (letter.status !== "ARCHIVED") {
        actions.push({
          label: "Archive Letter",
          onClick: () => setArchiveTarget(letter),
          danger: true,
          dividerBefore: true,
          icon: (
            <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.75}
                d="M5 8h14M5 8a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v1a2 2 0 01-2 2M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4"
              />
            </svg>
          ),
        });
      }
    }

    return actions;
  };

  /* ─── Render helpers ─────────────────────────────────────── */

  const totalLetters = response?.total || 0;
  const startCount = totalLetters === 0 ? 0 : (page - 1) * 10 + 1;
  const endCount = Math.min(page * 10, totalLetters);

  /* ─── Role-specific empty state messages ─────────────────── */
  const getEmptyTitle = () => {
    switch (role) {
      case "ADMIN":
        return "No letters found in system";
      case "REGISTRY_OFFICER":
        return "No letters in registry queue";
      case "DEPARTMENT_MANAGER":
        return "No letters in your Directorate";
      default:
        return "No letters assigned to you yet";
    }
  };
  const getEmptyDesc = () => {
    if (direction !== "ALL")
      return `No ${direction.toLowerCase()} letters match your current filters.`;
    switch (role) {
      case "ADMIN":
        return "The system has no letters matching these filters.";
      case "REGISTRY_OFFICER":
        return "No letters are awaiting registry processing.";
      case "DEPARTMENT_MANAGER":
        return "Your Directorate has no letters matching these filters.";
      default:
        return "You have no assigned or submitted letters matching these filters.";
    }
  };

  /* ─── Table cell renderers by column ID ───────────────────── */
  const renderCell = (colId: string, letter: LetterItem) => {
    switch (colId) {
      case "directionSubject":
      case "registrationSubject":
        return (
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
                {letter.registrationNumber || letter.referenceNumber}
              </p>
            </div>
          </div>
        );
      case "typeDirectorate":
      case "letterType":
        return (
          <>
            <span className="text-xs font-medium text-[#292A27] block capitalize">
              {letter.letterType.charAt(0) +
                letter.letterType.slice(1).toLowerCase()}
            </span>
            <span className="text-[11px] text-[#6B6A64] block truncate max-w-[160px]">
              {letter.direction === "INTERNAL"
                ? `${letter.fromDirectorate || letter.originatingDepartment || letter.department_name} → ${letter.toDirectorate || letter.targetDepartment || "—"}`
                : letter.department_name}
            </span>
          </>
        );
      case "fromTo":
      case "senderRecipient":
        return (
          <>
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
          </>
        );
      case "currentLocation":
        return (
          <div className="min-w-0">
            <span className="text-xs font-semibold text-[#292A27] block truncate">
              {letter.currentLocation ||
                letter.currentDepartment ||
                "Main Administration"}
            </span>
            {letter.assignedEmployee && (
              <span className="text-[11px] text-[#6B6A64] block truncate">
                {letter.assignedEmployee}
              </span>
            )}
          </div>
        );
      case "assignedTo":
        return (
          <span className="text-xs font-medium text-[#292A27] block truncate max-w-[140px]">
            {letter.assignedEmployee || letter.currentResponsibleUser || "—"}
          </span>
        );
      case "assignedOfficer":
        return (
          <span className="text-xs font-medium text-[#292A27] block truncate max-w-[140px]">
            {letter.assignedEmployee || letter.assignment?.officerName || "—"}
          </span>
        );
      case "date":
      case "receivedSentDate":
        return (
          <span className="text-xs text-[#6B6A64]">
            {formatDate(
              letter.dateReceived || letter.dateSent || letter.created_at,
            )}
          </span>
        );
      case "dueDate":
        return letter.dueDate ? (
          <span className="text-xs font-semibold text-[#8B3232]">
            {formatDate(letter.dueDate)}
          </span>
        ) : (
          <span className="text-xs text-[#8A8983]">—</span>
        );
      case "registrationNumber":
        return (
          <span className="text-xs font-mono text-[#292A27]">
            {letter.registrationNumber || "—"}
          </span>
        );
      case "priority":
        return <PriorityPill priority={letter.priority} />;
      case "status":
        return <Badge status={letter.status as LetterStatus} dot />;
      case "actions":
        return (
          <div className="flex justify-end">
            <Dropdown
              align="right"
              items={getRowActions(letter)}
              trigger={
                <button
                  type="button"
                  className="p-1.5 rounded-lg text-[#6B6A64] hover:text-[#292A27] hover:bg-[#ECEAE3] transition-colors focus:outline-none"
                  aria-label="Letter actions"
                >
                  <svg
                    className="w-5 h-5"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                  </svg>
                </button>
              }
            />
          </div>
        );
      default:
        return null;
    }
  };

  /* ─── JSX ─────────────────────────────────────────────────── */
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h1 className="text-2xl font-bold tracking-tight text-[#292A27]">
              Letter Repository
            </h1>
            {role && (
              <span className="text-[11px] font-bold uppercase px-2 py-0.5 rounded-md bg-[#292A27]/08 text-[#6B6A64] border border-[#D8D7D1]">
                {perms.roleLabel}
              </span>
            )}
          </div>
          <p className="text-xs md:text-sm text-[#6B6A64] mt-1">
            {getSubtitle()}
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* View Switcher */}
          <div className="bg-[#ECEAE3] p-1 rounded-xl border border-[#D8D7D1] flex items-center space-x-1">
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === "table" ? "bg-[#F5F3ED] text-[#292A27] shadow-xs" : "text-[#6B6A64] hover:text-[#292A27]"}`}
              aria-label="Table view"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 10h16M4 14h16M4 18h16"
                />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("grid")}
              className={`p-1.5 rounded-lg transition-colors ${viewMode === "grid" ? "bg-[#F5F3ED] text-[#292A27] shadow-xs" : "text-[#6B6A64] hover:text-[#292A27]"}`}
              aria-label="Grid view"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z"
                />
              </svg>
            </button>
          </div>

          {/* Role-specific New Letter dropdown */}
          {perms.newLetterActions.length > 0 && (
            <Dropdown
              align="right"
              items={perms.newLetterActions.map((a) => ({
                label: `${a.icon} ${a.label}`,
                onClick: () => handleRegisterNew(a.direction),
              }))}
              trigger={
                <Button variant="primary">
                  <svg
                    className="w-4 h-4 mr-1.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  New Letter
                </Button>
              }
            />
          )}
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
                ? tab.activeColor + " shadow-sm"
                : "bg-[#ECEAE3] " +
                  tab.color +
                  " hover:bg-[#D8D7D1]/60 border border-[#D8D7D1]"
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Filter Toolbar */}
      <div className="bg-[#ECEAE3] border border-[#D8D7D1] rounded-2xl p-4 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <SearchInput
            value={search}
            onChange={(val) => {
              setSearch(val);
              setPage(1);
            }}
            placeholder="Search letters by subject, reference, sender, or recipient..."
          />
          <Select
            options={LETTER_TYPE_OPTIONS}
            value={letterType}
            onChange={(val) => {
              setLetterType(val);
              setPage(1);
            }}
          />
          {/* Directorate filter — visible to Admin and Manager */}
          {(role === "ADMIN" || role === "DEPARTMENT_MANAGER") && (
            <Select
              options={DIRECTORATE_FILTER_OPTIONS}
              value={directorate}
              onChange={(val) => {
                setDirectorate(val);
                setPage(1);
              }}
            />
          )}
          {/* Priority filter — Admin and Manager */}
          {(role === "ADMIN" || role === "DEPARTMENT_MANAGER") && (
            <Select
              options={PRIORITY_OPTIONS}
              value={priority}
              onChange={(val) => {
                setPriority(val);
                setPage(1);
              }}
            />
          )}
          <div className="flex items-center space-x-2">
            <span className="text-xs font-medium text-[#6B6A64] whitespace-nowrap">
              Filter:
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearch("");
                setLetterType("ALL");
                setDirectorate("ALL");
                setPriority("ALL");
                setStatus("ALL");
                setPage(1);
              }}
            >
              Reset
            </Button>
          </div>
        </div>

        {/* Status Pills */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1">
          {getStatusPills().map((pill) => (
            <button
              key={pill.value}
              type="button"
              onClick={() => {
                setStatus(pill.value);
                setPage(1);
              }}
              className={`px-3 py-1 rounded-full text-xs font-bold transition-all whitespace-nowrap ${
                status === pill.value
                  ? "bg-[#526A55] text-[#F5F3ED] shadow-xs"
                  : "bg-[#F9F8F5] text-[#292A27] hover:bg-[#D8D7D1]/50"
              }`}
            >
              {pill.label}
            </button>
          ))}
        </div>
      </div>

      {/* Result Count */}
      <div className="flex items-center justify-between">
        <div className="text-xs font-semibold text-[#6B6A64]">
          Showing {startCount}–{endCount} of {totalLetters} letters
          {direction !== "ALL" && (
            <span className="ml-2 text-[#526A55]">
              ({direction.charAt(0) + direction.slice(1).toLowerCase()} only)
            </span>
          )}
        </div>
        <div className="text-xs text-[#8A8983]">
          Scope:{" "}
          <span className="font-semibold text-[#6B6A64]">
            {perms.roleScope}
          </span>
        </div>
      </div>

      {/* Main Content */}
      {isLoading ? (
        <div className="py-16 flex justify-center items-center">
          <LoadingSpinner size="lg" label="Loading Letter Repository..." />
        </div>
      ) : error ? (
        <ErrorState
          title="Unable to load repository"
          description={error}
          onRetry={fetchLetters}
        />
      ) : !response || response.data.length === 0 ? (
        <EmptyState
          title={getEmptyTitle()}
          description={getEmptyDesc()}
          actionLabel={
            perms.newLetterActions.length > 0
              ? perms.newLetterActions[0].label
              : undefined
          }
          onAction={
            perms.newLetterActions.length > 0
              ? () => handleRegisterNew(perms.newLetterActions[0].direction)
              : undefined
          }
        />
      ) : viewMode === "table" ? (
        /* ── Table View ── */
        <Table>
          <Table.Header>
            {perms.tableColumns.map((col) => (
              <Table.Th
                key={col.id}
                className={col.id === "actions" ? "text-right" : ""}
              >
                {col.header}
              </Table.Th>
            ))}
          </Table.Header>
          <Table.Body>
            {response.data.map((letter) => (
              <Table.Tr key={letter.id}>
                {perms.tableColumns.map((col) => (
                  <Table.Td key={col.id}>{renderCell(col.id, letter)}</Table.Td>
                ))}
              </Table.Tr>
            ))}
          </Table.Body>
        </Table>
      ) : (
        /* ── Grid View ── */
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
                    <h4 className="text-sm font-semibold text-[#292A27] line-clamp-2">
                      {letter.subject}
                    </h4>
                    <p className="text-xs text-[#8A8983] font-mono mt-0.5">
                      {letter.registrationNumber || letter.referenceNumber}
                    </p>
                  </div>
                </div>
                <Dropdown
                  align="right"
                  items={getRowActions(letter)}
                  trigger={
                    <button
                      type="button"
                      className="p-1 rounded-lg text-[#6B6A64] hover:bg-[#D8D7D1]/50 flex-shrink-0"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" />
                      </svg>
                    </button>
                  }
                />
              </div>

              <div className="space-y-1 text-xs text-[#6B6A64]">
                {/* Internal letter: show From/To Directorate */}
                {letter.direction === "INTERNAL" ? (
                  <>
                    <p>
                      <span className="font-medium text-[#292A27]">From:</span>{" "}
                      {letter.fromDirectorate ||
                        letter.originatingDepartment ||
                        letter.sender ||
                        "—"}
                    </p>
                    <p>
                      <span className="font-medium text-[#292A27]">To:</span>{" "}
                      {letter.toDirectorate ||
                        letter.targetDepartment ||
                        letter.recipient ||
                        "—"}
                    </p>
                  </>
                ) : (
                  <>
                    {letter.sender && (
                      <p>
                        <span className="font-medium text-[#292A27]">
                          From:
                        </span>{" "}
                        {letter.sender}
                      </p>
                    )}
                    {letter.recipient && (
                      <p>
                        <span className="font-medium text-[#292A27]">To:</span>{" "}
                        {letter.recipient}
                      </p>
                    )}
                  </>
                )}
                {/* Current Location — for Admin + Manager */}
                {(role === "ADMIN" || role === "DEPARTMENT_MANAGER") && (
                  <p>
                    <span className="font-medium text-[#292A27]">
                      Location:
                    </span>{" "}
                    {letter.currentLocation ||
                      letter.currentDepartment ||
                      "Main Administration"}
                  </p>
                )}
                {/* Priority */}
                {letter.priority && <PriorityPill priority={letter.priority} />}
                <p>
                  <span className="font-medium text-[#292A27]">Date:</span>{" "}
                  {formatDate(
                    letter.dateReceived || letter.dateSent || letter.created_at,
                  )}
                </p>
              </div>

              <div className="pt-2 border-t border-[#D8D7D1]/50 flex items-center justify-between">
                <Badge status={letter.status as LetterStatus} dot />
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => navigate(`/letters/${letter.id}`)}
                >
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
        onClose={() => {
          setIsRegisterOpen(false);
          setRegisterDirection(undefined);
        }}
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
