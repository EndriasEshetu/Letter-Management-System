import React, { useEffect, useState, useCallback } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/components/common/Toast';
import commentService from '@/services/commentService';
import { CommentItem as CommentItemType } from '@/types/comment';
import CommentItem from './CommentItem';
import CommentComposer from './CommentComposer';
import LoadingSpinner from '@/components/common/LoadingSpinner';
import ErrorState from '@/components/common/ErrorState';

interface CommentSectionProps {
  documentId: string;
  compact?: boolean;
}

export const CommentSection: React.FC<CommentSectionProps> = ({
  documentId,
  compact = false,
}) => {
  const { user } = useAuth();
  const { addToast } = useToast();

  const [comments, setComments] = useState<CommentItemType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /* Fetch comments */
  const fetchComments = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await commentService.getComments(documentId);
      setComments(data);
    } catch (err: any) {
      console.error('[CommentSection] Error fetching comments:', err);
      setError('Unable to load discussion comments.');
    } finally {
      setIsLoading(false);
    }
  }, [documentId]);

  useEffect(() => {
    fetchComments();
  }, [fetchComments]);

  /* Post new comment */
  const handlePostComment = async (message: string) => {
    setIsSubmitting(true);
    try {
      const newComment = await commentService.createComment(
        { documentId, message },
        user ? { full_name: user.full_name, role: user.role, department_name: user.department_name } : undefined
      );
      setComments((prev) => [...prev, newComment]);
      addToast({
        type: 'success',
        title: 'Comment posted',
        message: 'Your comment has been added to the discussion.',
      });
    } catch (err: any) {
      addToast({
        type: 'error',
        title: 'Failed to post comment',
        message: 'Could not submit your comment. Please try again.',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* Discussion Header */}
      {!compact && (
        <div className="flex items-center justify-between">
          <h3 className="text-base font-semibold text-[#292A27] flex items-center gap-2">
            <span>Discussion</span>
            <span className="text-xs font-semibold text-[#526A55] bg-[#526A55]/10 px-2 py-0.5 rounded-full">
              {comments.length}
            </span>
          </h3>
        </div>
      )}

      {/* Comment Composer */}
      <CommentComposer onSubmit={handlePostComment} isLoading={isSubmitting} compact={compact} />

      {/* Divider */}
      <div className="border-t border-[#D8D7D1]/60 my-3" />

      {/* Comment List / States */}
      {isLoading ? (
        <div className="py-8 flex justify-center">
          <LoadingSpinner size="sm" label="Loading discussion..." />
        </div>
      ) : error ? (
        <ErrorState
          title="Unable to load discussion"
          description={error}
          retryLabel="Try Again"
          onRetry={fetchComments}
        />
      ) : comments.length === 0 ? (
        <div className="text-center py-8 bg-[#F9F8F5] border border-[#D8D7D1]/50 rounded-xl px-4">
          <div className="w-10 h-10 bg-[#ECEAE3] rounded-full flex items-center justify-center mx-auto mb-2 text-[#8A8983]">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
            </svg>
          </div>
          <p className="text-xs font-semibold text-[#292A27]">No comments yet</p>
          <p className="text-[11px] text-[#6B6A64] mt-0.5">Start the discussion by adding a comment above.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {comments.map((comment) => (
            <CommentItem key={comment.id} comment={comment} compact={compact} />
          ))}
        </div>
      )}
    </div>
  );
};

export default CommentSection;
