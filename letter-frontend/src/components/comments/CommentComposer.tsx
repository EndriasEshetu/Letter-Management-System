import React, { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import Avatar from '@/components/common/Avatar';
import Button from '@/components/common/Button';

interface CommentComposerProps {
  onSubmit: (message: string) => Promise<void>;
  isLoading?: boolean;
  compact?: boolean;
}

export const CommentComposer: React.FC<CommentComposerProps> = ({
  onSubmit,
  isLoading = false,
  compact = false,
}) => {
  const { user } = useAuth();
  const [message, setMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = message.trim();
    if (!trimmed || isLoading) return;

    await onSubmit(trimmed);
    setMessage('');
  };

  return (
    <form onSubmit={handleSubmit} className="flex items-start gap-3">
      {/* Current User Avatar */}
      <Avatar
        name={user?.full_name || 'User'}
        size={compact ? 'sm' : 'md'}
        className="flex-shrink-0 mt-1"
      />

      {/* Input area */}
      <div className="flex-1 min-w-0 space-y-2">
        <textarea
          rows={compact ? 2 : 3}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Write a comment or feedback..."
          disabled={isLoading}
          className={`w-full px-3.5 py-2.5 bg-[#F9F8F5] text-[#292A27] placeholder-[#8A8983] border border-[#D8D7D1] focus:border-[#526A55] focus:ring-2 focus:ring-[#526A55]/20 rounded-xl transition-all duration-200 focus:outline-none disabled:bg-[#ECEAE3] disabled:cursor-not-allowed resize-y ${
            compact ? 'text-xs' : 'text-sm'
          }`}
        />

        <div className="flex items-center justify-end gap-2">
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={isLoading}
            disabled={!message.trim() || isLoading}
          >
            <svg className="w-3.5 h-3.5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
            </svg>
            Send
          </Button>
        </div>
      </div>
    </form>
  );
};

export default CommentComposer;
