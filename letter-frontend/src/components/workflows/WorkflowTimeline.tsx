import React from 'react';
import LetterTimeline from '@/components/letters/LetterTimeline';

export interface WorkflowStepTimestamps {
  created_at?: string;
  submitted_at?: string;
  reviewed_at?: string;
  completed_at?: string;
}

export interface WorkflowTimelineProps {
  currentStatus: string;
  rejectionReason?: string;
  timestamps?: WorkflowStepTimestamps;
  className?: string;
}

export const WorkflowTimeline: React.FC<WorkflowTimelineProps> = (props) => {
  return <LetterTimeline {...props} />;
};

export default WorkflowTimeline;
