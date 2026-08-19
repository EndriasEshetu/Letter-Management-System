import React from 'react';

import { NotificationItem as NotificationItemType, NotificationType } from '@/types/notification';

interface NotificationItemProps {
  notification: NotificationItemType;
  onItemClick: (notification: NotificationItemType) => void;
}

const typeIcons: Record<NotificationType, { icon: React.ReactNode; color: string }> = {
  DOCUMENT_SUBMITTED: {
    color: 'bg-[#526A55]/12 text-[#526A55]',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 4v16m8-8H4" />
      </svg>
    ),
  },
  DOCUMENT_APPROVED: {
    color: 'bg-[#4A6B4E]/12 text-[#36513A]',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  DOCUMENT_REJECTED: {
    color: 'bg-[#8B3232]/12 text-[#8B3232]',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  CHANGES_REQUESTED: {
    color: 'bg-[#C48D3F]/12 text-[#8A5D19]',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    ),
  },
  COMMENT_ADDED: {
    color: 'bg-[#526A55]/12 text-[#3E5140]',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
      </svg>
    ),
  },
  DOCUMENT_ARCHIVED: {
    color: 'bg-[#D8D7D1]/60 text-[#6B6A64]',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M5 8h14M5 8a2 2 0 01-2-2V5a2 2 0 012-2h14a2 2 0 012 2v1a2 2 0 01-2 2M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
      </svg>
    ),
  },
};

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

export const NotificationItemComponent: React.FC<NotificationItemProps> = ({
  notification,
  onItemClick,
}) => {
  const { message, isRead, createdAt, documentTitle, type } = notification;
  const style = typeIcons[type] || typeIcons.DOCUMENT_SUBMITTED;

  return (
    <button
      type="button"
      onClick={() => onItemClick(notification)}
      className={`w-full text-left p-3.5 flex items-start gap-3 rounded-xl transition-all duration-150 focus:outline-none focus:ring-2 focus:ring-[#526A55] ${
        !isRead
          ? 'bg-[#AEBDA5]/15 hover:bg-[#AEBDA5]/25 text-[#292A27]'
          : 'hover:bg-[#D8D7D1]/30 text-[#6B6A64]'
      }`}
    >
      {/* Type Icon */}
      <div className={`p-2 rounded-xl flex-shrink-0 mt-0.5 ${style.color}`}>
        {style.icon}
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0 space-y-1">
        <p className={`text-xs leading-snug ${!isRead ? 'font-semibold text-[#292A27]' : 'font-normal text-[#6B6A64]'}`}>
          {message}
        </p>

        {documentTitle && (
          <p className="text-[11px] font-medium text-[#526A55] truncate">
            {documentTitle}
          </p>
        )}

        <p className="text-[10px] text-[#8A8983]">{formatTimeAgo(createdAt)}</p>
      </div>

      {/* Unread Dot Indicator */}
      {!isRead && (
        <span className="w-2 h-2 rounded-full bg-[#8B3232] flex-shrink-0 mt-1.5" aria-hidden="true" />
      )}
    </button>
  );
};

export default NotificationItemComponent;
