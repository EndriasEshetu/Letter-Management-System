import React from 'react';
import Avatar from '@/components/common/Avatar';
import { CommentItem as CommentItemType } from '@/types/comment';

interface CommentItemProps {
  comment: CommentItemType;
  compact?: boolean;
}

const formatTimeAgo = (isoString: string): string => {
  try {
    const date = new Date(isoString);
    if (isNaN(date.getTime())) return isoString;
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays === 1) return 'Yesterday';
    return `${diffDays}d ago`;
  } catch {
    return isoString;
  }
};

export const CommentItem: React.FC<CommentItemProps> = ({ comment, compact = false }) => {
  const { author, message, createdAt } = comment;

  return (
    <div
      className={`flex items-start gap-3 bg-[#F9F8F5] border border-[#D8D7D1]/70 rounded-xl ${
        compact ? 'p-3' : 'p-4'
      } transition-colors`}
    >
      {/* Author Avatar */}
      <Avatar
        src={author.avatar}
        name={author.name}
        size={compact ? 'sm' : 'md'}
        className="flex-shrink-0 mt-0.5"
      />

      {/* Comment Body */}
      <div className="flex-1 min-w-0 space-y-1">
        <div className="flex items-center justify-between gap-2 flex-wrap">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xs font-bold text-[#292A27] truncate">{author.name}</span>
            {author.role && (
              <span className="text-[10px] font-semibold text-[#526A55] bg-[#526A55]/10 px-1.5 py-0.5 rounded-md truncate max-w-[140px]">
                {author.role}
              </span>
            )}
          </div>
          <span className="text-[11px] text-[#8A8983] flex-shrink-0">
            {formatTimeAgo(createdAt)}
          </span>
        </div>

        {/* Message Text (Safely rendered as plain text) */}
        <p className={`text-[#292A27] leading-relaxed whitespace-pre-wrap ${compact ? 'text-xs' : 'text-sm'}`}>
          {message}
        </p>
      </div>
    </div>
  );
};

export default CommentItem;
