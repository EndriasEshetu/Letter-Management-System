import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import letterService from '@/services/letterService';
import { LetterItem } from '@/types/letter';
import Card from '@/components/common/Card';
import Badge, { LetterStatus } from '@/components/common/Badge';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import EmptyState from '@/components/common/EmptyState';
import ErrorState from '@/components/common/ErrorState';

/* ─── Task Priority Indicator ─────────────────────────────── */
const priorityDot: Record<string, string> = {
  URGENT: 'bg-[#8B3232]',
  HIGH: 'bg-[#C48D3F]',
  NORMAL: 'bg-[#526A55]',
  LOW: 'bg-[#D8D7D1]',
};

/* ─── Status filter tabs ──────────────────────────────────── */
const TASK_TABS = [
  { value: 'ALL', label: 'All Tasks' },
  { value: 'PENDING', label: 'Pending Action' },
  { value: 'IN_PROGRESS', label: 'In Progress' },
  { value: 'OVERDUE', label: 'Overdue' },
  { value: 'COMPLETED', label: 'Completed' },
];

export const MyTasks: React.FC = () => {
  const navigate = useNavigate();
  const [letters, setLetters] = useState<LetterItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('ALL');

  const fetchTasks = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await letterService.getMyTasks();
      setLetters(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load your tasks.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  // Filter based on active tab (mock filtering by assignment status)
  const filteredLetters = letters.filter((l) => {
    if (activeTab === 'ALL') return true;
    if (activeTab === 'PENDING') return l.status === 'RECEIVED' || l.status === 'REGISTERED' || l.status === 'PENDING_REVIEW';
    if (activeTab === 'IN_PROGRESS') return l.status === 'IN_PROGRESS';
    if (activeTab === 'OVERDUE') return l.dueDate && new Date(l.dueDate) < new Date();
    if (activeTab === 'COMPLETED') return l.status === 'COMPLETED' || l.status === 'ARCHIVED';
    return true;
  });

  // Stats
  const totalTasks = letters.length;
  const overdueTasks = letters.filter((l) => l.dueDate && new Date(l.dueDate) < new Date()).length;
  const pendingTasks = letters.filter((l) => ['RECEIVED', 'REGISTERED', 'PENDING_REVIEW'].includes(l.status)).length;
  const inProgressTasks = letters.filter((l) => l.status === 'IN_PROGRESS').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[#292A27]">My Tasks</h1>
        <p className="text-xs md:text-sm text-[#6B6A64] mt-1">
          Letters assigned to you that require action or are currently in progress.
        </p>
      </div>

      {/* Task Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Assigned', value: totalTasks, color: 'bg-[#292A27]', textColor: 'text-[#292A27]' },
          { label: 'Pending Action', value: pendingTasks, color: 'bg-[#C48D3F]', textColor: 'text-[#C48D3F]' },
          { label: 'In Progress', value: inProgressTasks, color: 'bg-[#526A55]', textColor: 'text-[#526A55]' },
          { label: 'Overdue', value: overdueTasks, color: 'bg-[#8B3232]', textColor: 'text-[#8B3232]' },
        ].map((stat) => (
          <Card key={stat.label} className="bg-[#ECEAE3]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[11px] font-bold uppercase tracking-wider text-[#8A8983]">{stat.label}</p>
                <p className={`text-2xl font-bold mt-1 ${stat.textColor}`}>{stat.value}</p>
              </div>
              <div className={`w-3 h-3 rounded-full ${stat.color}`} />
            </div>
          </Card>
        ))}
      </div>

      {/* Status Tabs */}
      <div className="flex items-center space-x-2 overflow-x-auto pb-1">
        {TASK_TABS.map((tab) => (
          <button
            key={tab.value}
            type="button"
            onClick={() => setActiveTab(tab.value)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
              activeTab === tab.value
                ? 'bg-[#526A55] text-[#F5F3ED] shadow-sm'
                : 'bg-[#ECEAE3] text-[#6B6A64] hover:bg-[#D8D7D1]/60 border border-[#D8D7D1]'
            }`}
          >
            {tab.label}
            {tab.value === 'OVERDUE' && overdueTasks > 0 && (
              <span className="ml-1.5 text-[9px] font-bold bg-[#8B3232] text-white px-1.5 py-0.5 rounded-full">
                {overdueTasks}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Task List */}
      {isLoading ? (
        <div className="py-16 flex justify-center">
          <LoadingSpinner size="lg" label="Loading your tasks..." />
        </div>
      ) : error ? (
        <ErrorState title="Unable to load tasks" description={error} onRetry={fetchTasks} />
      ) : filteredLetters.length === 0 ? (
        <EmptyState
          title="No tasks found"
          description={activeTab !== 'ALL' ? 'No tasks match the selected filter.' : 'You have no assigned tasks.'}
          actionLabel="View All Letters"
          onAction={() => navigate('/letters')}
        />
      ) : (
        <div className="space-y-3">
          {filteredLetters.map((letter) => {
            const isOverdue = letter.dueDate && new Date(letter.dueDate) < new Date();
            const daysLeft = letter.dueDate
              ? Math.ceil((new Date(letter.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
              : null;

            return (
              <div
                key={letter.id}
                onClick={() => navigate(`/letters/${letter.id}`)}
                className={`p-4 rounded-2xl border bg-[#F5F3ED] hover:shadow-md transition-all cursor-pointer group ${
                  isOverdue ? 'border-[#8B3232]/30 bg-[#8B3232]/03' : 'border-[#D8D7D1]'
                }`}
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start space-x-3 min-w-0">
                    {/* Priority dot */}
                    <div className={`w-2.5 h-2.5 rounded-full mt-1.5 flex-shrink-0 ${priorityDot[letter.priority || 'NORMAL']}`} />
                    <div className="min-w-0">
                      <div className="flex items-center space-x-2 flex-wrap gap-y-1">
                        <h3 className="text-sm font-bold text-[#292A27] group-hover:text-[#526A55] transition-colors truncate">
                          {letter.subject}
                        </h3>
                        <Badge status={letter.status as LetterStatus} dot />
                      </div>
                      <div className="flex items-center space-x-2 mt-1 text-xs text-[#6B6A64]">
                        <span className="font-mono font-medium">{letter.referenceNumber}</span>
                        <span>·</span>
                        <span>{letter.department_name}</span>
                        {letter.sender && (
                          <>
                            <span>·</span>
                            <span>From: {letter.sender}</span>
                          </>
                        )}
                      </div>
                      {letter.assignments && letter.assignments[0]?.instructions && (
                        <p className="text-xs text-[#6B6A64] mt-1.5 italic line-clamp-1">
                          "{letter.assignments[0].instructions}"
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="text-right flex-shrink-0">
                    {letter.dueDate && (
                      <p className={`text-xs font-bold ${isOverdue ? 'text-[#8B3232]' : 'text-[#6B6A64]'}`}>
                        {isOverdue ? (
                          <span className="flex items-center space-x-1">
                            <svg className="w-3.5 h-3.5 animate-bounce" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>{Math.abs(daysLeft!)}d OVERDUE</span>
                          </span>
                        ) : (
                          `${daysLeft}d left`
                        )}
                      </p>
                    )}
                    <p className="text-[11px] text-[#8A8983] mt-0.5">
                      Due: {letter.dueDate || 'No deadline'}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MyTasks;
