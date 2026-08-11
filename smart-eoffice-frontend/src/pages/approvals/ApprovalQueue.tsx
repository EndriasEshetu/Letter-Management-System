import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/common/Toast';
import approvalService from '@/services/approvalService';
import {
  ApprovalRequest,
  ApprovalMetrics as ApprovalMetricsType,
  ApprovalActivity as ApprovalActivityType,
  ApprovalFilterTab,
} from '@/types/approval';

import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorState from '@/components/common/ErrorState';
import EmptyState from '@/components/common/EmptyState';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import ApprovalTabs from '@/components/approvals/ApprovalTabs';
import ApprovalRequestCard from '@/components/approvals/ApprovalRequestCard';
import ApprovalMetrics from '@/components/approvals/ApprovalMetrics';
import ApprovalActivity from '@/components/approvals/ApprovalActivity';
import RejectDialog from '@/components/approvals/RejectDialog';
import RequestChangesDialog from '@/components/approvals/RequestChangesDialog';

export const ApprovalQueue: React.FC = () => {
  const { user } = useAuth();
  const { addToast } = useToast();

  /* ── State ── */
  const [activeTab, setActiveTab] = useState<ApprovalFilterTab>('ALL');
  const [requests, setRequests] = useState<ApprovalRequest[]>([]);
  const [metrics, setMetrics] = useState<ApprovalMetricsType | null>(null);
  const [activities, setActivities] = useState<ApprovalActivityType[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* Modal state */
  const [approveRequest, setApproveRequest] = useState<ApprovalRequest | null>(null);
  const [rejectRequest, setRejectRequest] = useState<ApprovalRequest | null>(null);
  const [requestChangesReq, setRequestChangesReq] = useState<ApprovalRequest | null>(null);
  const [isProcessingAction, setIsProcessingAction] = useState(false);

  /* ── Load Data ── */
  const loadData = useCallback(async (tab: ApprovalFilterTab = activeTab, silent = false) => {
    if (!silent) setIsLoading(true);
    setError(null);

    try {
      const [reqData, metricsData, actData] = await Promise.all([
        approvalService.getApprovalRequests(tab),
        approvalService.getApprovalMetrics(),
        approvalService.getApprovalActivity(),
      ]);

      setRequests(reqData);
      setMetrics(metricsData);
      setActivities(actData);
    } catch (err: any) {
      console.error('[ApprovalQueue] Failed to load data:', err);
      setError('Unable to load approval queue. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [activeTab]);

  useEffect(() => {
    loadData(activeTab);
  }, [activeTab, loadData]);

  const handleTabChange = (tab: ApprovalFilterTab) => {
    setActiveTab(tab);
  };

  /* ── Action Handlers ── */

  /* 1. Approve Document */
  const handleConfirmApprove = async () => {
    if (!approveRequest) return;
    setIsProcessingAction(true);
    try {
      await approvalService.approveDocument({ document_id: approveRequest.document.id });
      addToast({
        type: 'success',
        title: 'Document Approved',
        message: `Successfully approved "${approveRequest.document.file_name || approveRequest.document.title}".`,
      });
      setApproveRequest(null);
      await loadData(activeTab, true);
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Approval Failed',
        message: 'Could not complete document approval. Please try again.',
      });
    } finally {
      setIsProcessingAction(false);
    }
  };

  /* 2. Reject Document */
  const handleConfirmReject = async (reason: string) => {
    if (!rejectRequest) return;
    setIsProcessingAction(true);
    try {
      await approvalService.rejectDocument({
        document_id: rejectRequest.document.id,
        reason,
      });
      addToast({
        type: 'warning',
        title: 'Document Rejected',
        message: `Document "${rejectRequest.document.file_name || rejectRequest.document.title}" has been rejected.`,
      });
      setRejectRequest(null);
      await loadData(activeTab, true);
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Rejection Failed',
        message: 'Could not process document rejection. Please try again.',
      });
    } finally {
      setIsProcessingAction(false);
    }
  };

  /* 3. Request Changes */
  const handleConfirmRequestChanges = async (reason: string) => {
    if (!requestChangesReq) return;
    setIsProcessingAction(true);
    try {
      await approvalService.requestChanges({
        document_id: requestChangesReq.document.id,
        reason,
      });
      addToast({
        type: 'info',
        title: 'Changes Requested',
        message: `Revision request sent for "${requestChangesReq.document.file_name || requestChangesReq.document.title}".`,
      });
      setRequestChangesReq(null);
      await loadData(activeTab, true);
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Request Failed',
        message: 'Could not send change request. Please try again.',
      });
    } finally {
      setIsProcessingAction(false);
    }
  };

  /* Role authorization check */
  const isAuthorized = user?.role === 'ADMIN' || user?.role === 'DEPARTMENT_MANAGER';

  if (!isAuthorized) {
    return (
      <div className="flex flex-col items-center justify-center text-center py-20 px-6">
        <div className="w-16 h-16 bg-[#8B3232]/10 text-[#8B3232] rounded-2xl flex items-center justify-center mb-4">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-xl font-bold text-[#292A27]">Access Restricted</h2>
        <p className="text-sm text-[#6B6A64] max-w-sm mt-1">
          The Approval Queue is reserved for Department Managers and Administrators.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* ── Page Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#526A55] bg-[#526A55]/10 px-2.5 py-1 rounded-md">
            WORKFLOW
          </span>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#292A27] tracking-tight mt-2">
            Approval Queue
          </h1>
          <p className="text-sm text-[#6B6A64] mt-1">
            Review and authorize pending document submissions across your department.
          </p>
        </div>

        {/* Refresh button */}
        <button
          type="button"
          onClick={() => {
            setIsRefreshing(true);
            loadData(activeTab, true);
          }}
          disabled={isLoading || isRefreshing}
          className="self-start sm:self-auto inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold bg-[#ECEAE3] text-[#292A27] border border-[#D8D7D1] rounded-xl hover:bg-[#D8D7D1]/60 transition-colors focus:outline-none focus:ring-2 focus:ring-[#526A55] disabled:opacity-50"
        >
          <svg
            className={`w-4 h-4 text-[#526A55] ${isRefreshing ? 'animate-spin' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          <span>Refresh</span>
        </button>
      </div>

      {/* ── Filter Tabs ── */}
      <ApprovalTabs
        activeTab={activeTab}
        onTabChange={handleTabChange}
        pendingCount={metrics?.pending_count}
        highPriorityCount={requests.filter((r) => r.priority === 'HIGH' && r.status === 'PENDING').length}
        reviewedCount={(metrics?.approved_count || 0) + (metrics?.rejected_count || 0)}
      />

      {/* ── Main Layout: Left Queue list + Right Sidebar ── */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <LoadingSpinner size="md" label="Loading approval queue..." />
        </div>
      ) : error ? (
        <ErrorState
          title="Failed to load approvals"
          description={error}
          retryLabel="Try Again"
          onRetry={() => loadData(activeTab)}
        />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Approval Requests List (2 cols on lg) */}
          <div className="lg:col-span-2 space-y-4">
            {requests.length === 0 ? (
              <EmptyState
                title="No pending approvals"
                description={
                  activeTab === 'HIGH_PRIORITY'
                    ? 'There are no high-priority approval requests at this time.'
                    : activeTab === 'REVIEWED'
                    ? 'No reviewed approval requests found.'
                    : 'All document requests have been reviewed and processed.'
                }
              />
            ) : (
              requests.map((request) => (
                <ApprovalRequestCard
                  key={request.id}
                  request={request}
                  onApprove={(req) => setApproveRequest(req)}
                  onReject={(req) => setRejectRequest(req)}
                  onRequestChanges={(req) => setRequestChangesReq(req)}
                  isProcessing={isProcessingAction}
                />
              ))
            )}
          </div>

          {/* Right Column: Metrics & Activity Sidebar (1 col on lg) */}
          <div className="space-y-6">
            <ApprovalMetrics metrics={metrics} isLoading={isLoading} />
            <ApprovalActivity activities={activities} isLoading={isLoading} />
          </div>
        </div>
      )}

      {/* ── Modals / Dialogs ── */}

      {/* 1. Approve Confirm Dialog */}
      <ConfirmDialog
        open={Boolean(approveRequest)}
        title="Approve Document?"
        description={`Are you sure you want to approve "${approveRequest?.document.file_name || approveRequest?.document.title}"? This will change document status to Approved.`}
        confirmLabel="Approve Document"
        cancelLabel="Cancel"
        onConfirm={handleConfirmApprove}
        onCancel={() => setApproveRequest(null)}
        isLoading={isProcessingAction}
      />

      {/* 2. Reject Dialog */}
      <RejectDialog
        open={Boolean(rejectRequest)}
        request={rejectRequest}
        onClose={() => setRejectRequest(null)}
        onConfirm={handleConfirmReject}
        isLoading={isProcessingAction}
      />

      {/* 3. Request Changes Dialog */}
      <RequestChangesDialog
        open={Boolean(requestChangesReq)}
        request={requestChangesReq}
        onClose={() => setRequestChangesReq(null)}
        onConfirm={handleConfirmRequestChanges}
        isLoading={isProcessingAction}
      />
    </div>
  );
};

export default ApprovalQueue;
