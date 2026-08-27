import React from 'react';
import { NotificationItem as NotificationItemType, NotificationType } from '@/types/notification';

interface NotificationItemProps {
  notification: NotificationItemType;
  onItemClick: (notification: NotificationItemType) => void;
}

const typeIcons: Partial<Record<NotificationType, { icon: React.ReactNode; color: string }>> = {
  LETTER_REGISTERED: {
    color: 'bg-[#526A55]/12 text-[#526A55]',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 4v16m8-8H4" />
      </svg>
    ),
  },
  LETTER_AWAITING_ROUTING: {
    color: 'bg-[#C48D3F]/12 text-[#8A5D19]',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M13 7l5 5m0 0l-5 5m5-5H6" />
      </svg>
    ),
  },
  LETTER_ROUTED: {
    color: 'bg-[#526A55]/12 text-[#526A55]',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M13 7l5 5m0 0l-5 5m5-5H6" />
      </svg>
    ),
  },
  LETTER_ASSIGNED: {
    color: 'bg-[#526A55]/12 text-[#526A55]',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
  },
  LETTER_RESPONSE_REQUIRED: {
    color: 'bg-[#C48D3F]/12 text-[#8A5D19]',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M3 10h10a8 8 0 018 8v2M3 10l6 6m-6-6l6-6" />
      </svg>
    ),
  },
  LETTER_DEADLINE_APPROACHING: {
    color: 'bg-[#C48D3F]/12 text-[#8A5D19]',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  LETTER_OVERDUE: {
    color: 'bg-[#8B3232]/12 text-[#8B3232]',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  LETTER_APPROVED: {
    color: 'bg-[#4A6B4E]/12 text-[#36513A]',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  LETTER_CHANGES_REQUESTED: {
    color: 'bg-[#C48D3F]/12 text-[#8A5D19]',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
      </svg>
    ),
  },
  LETTER_DISPATCHED: {
    color: 'bg-[#6B5A8E]/12 text-[#4A3A6B]',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
      </svg>
    ),
  },
  LETTER_DELIVERED: {
    color: 'bg-[#4A6B4E]/12 text-[#36513A]',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M5 13l4 4L19 7" />
      </svg>
    ),
  },
  LETTER_COMPLETED: {
    color: 'bg-[#4A6B4E]/12 text-[#36513A]',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M5 13l4 4L19 7" />
      </svg>
    ),
  },
  INTERNAL_LETTER_RECEIVED: {
    color: 'bg-[#6B5A8E]/12 text-[#4A3A6B]',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  },
  INTERNAL_TASK_DUE: {
    color: 'bg-[#C48D3F]/12 text-[#8A5D19]',
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
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
  LETTER_ARCHIVED: {
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

export const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onItemClick }) => {
  const meta = typeIcons[notification.type] ?? typeIcons.LETTER_REGISTERED ?? {
    color: 'bg-[#D8D7D1]/60 text-[#6B6A64]',
    icon: null,
  };

  return (
    <div
      onClick={() => onItemClick(notification)}
      className={`p-3 rounded-xl flex items-start space-x-3 transition-colors cursor-pointer ${
        notification.isRead ? 'hover:bg-[#ECEAE3]' : 'bg-[#526A55]/08 hover:bg-[#526A55]/12 font-medium'
      }`}
    >
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${meta.color}`}>
        {meta.icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs text-[#292A27] leading-snug">{notification.message}</p>
        {(notification.letterTitle || notification.documentTitle) && (
          <p className="text-[11px] text-[#6B6A64] truncate mt-0.5 font-medium">
            {notification.letterTitle || notification.documentTitle}
          </p>
        )}
        <span className="text-[10px] text-[#8A8983] block mt-1">
          {formatTimeAgo(notification.createdAt)}
        </span>
      </div>
      {!notification.isRead && (
        <span className="w-2 h-2 rounded-full bg-[#526A55] flex-shrink-0 mt-1" />
      )}
    </div>
  );
};

export default NotificationItem;
