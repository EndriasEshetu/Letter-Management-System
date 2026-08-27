import React from "react";
import { useNavigate } from "react-router-dom";
import { NotificationItem as NotificationItemType } from "@/types/notification";
import NotificationItemComponent from "./NotificationItem";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ErrorState from "@/components/common/ErrorState";

interface NotificationDropdownProps {
  notifications: NotificationItemType[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
  onMarkAsRead: (id: string) => void;
  onMarkAllAsRead: () => void;
  onClose: () => void;
  onRetry: () => void;
}

export const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  notifications,
  unreadCount,
  isLoading,
  error,
  onMarkAsRead,
  onMarkAllAsRead,
  onClose,
  onRetry,
}) => {
  const navigate = useNavigate();

  const handleItemClick = (notification: NotificationItemType) => {
    if (!notification.isRead) {
      onMarkAsRead(notification.id);
    }
    onClose();
    if (notification.taskId) {
      navigate(`/tasks/${notification.taskId}`);
    } else if (
      notification.entityType === "APPROVAL" ||
      notification.type === "DOCUMENT_SUBMITTED"
    ) {
      navigate("/approvals");
    } else if (notification.entityType === "LETTER" && notification.entityId) {
      navigate(`/letters/${notification.entityId}`);
    } else if (notification.letterId || notification.documentId) {
      navigate(`/letters/${notification.letterId || notification.documentId}`);
    }
  };

  return (
    <div
      className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#ECEAE3] border border-[#D8D7D1] rounded-2xl shadow-xl z-50 overflow-hidden flex flex-col max-h-[480px]"
      role="menu"
      aria-orientation="vertical"
      aria-labelledby="notification-menu-button"
    >
      {/* ── Header ── */}
      <div className="p-4 border-b border-[#D8D7D1] flex items-center justify-between bg-[#F5F3ED]/80">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-bold text-[#292A27]">Notifications</h3>
          {unreadCount > 0 && (
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#8B3232] text-[#F5F3ED]">
              {unreadCount} new
            </span>
          )}
        </div>

        {unreadCount > 0 && (
          <button
            type="button"
            onClick={onMarkAllAsRead}
            className="text-xs font-semibold text-[#526A55] hover:text-[#3E5140] transition-colors focus:outline-none"
          >
            Mark all as read
          </button>
        )}
      </div>

      {/* ── Notification List ── */}
      <div className="flex-1 overflow-y-auto p-2 space-y-1">
        {isLoading ? (
          <div className="py-10 flex justify-center items-center">
            <LoadingSpinner size="sm" label="Loading notifications..." />
          </div>
        ) : error ? (
          <div className="p-4 text-center">
            <ErrorState
              title="Unable to load notifications"
              description={error}
              retryLabel="Try Again"
              onRetry={onRetry}
            />
          </div>
        ) : notifications.length === 0 ? (
          <div className="text-center py-12 px-4 space-y-2">
            <div className="w-10 h-10 bg-[#ECEAE3] rounded-full flex items-center justify-center mx-auto text-[#8A8983]">
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                />
              </svg>
            </div>
            <p className="text-xs font-semibold text-[#292A27]">
              No notifications
            </p>
            <p className="text-[11px] text-[#6B6A64]">You're all caught up!</p>
          </div>
        ) : (
          notifications.map((n) => (
            <NotificationItemComponent
              key={n.id}
              notification={n}
              onItemClick={handleItemClick}
            />
          ))
        )}
      </div>
      <button
        type="button"
        onClick={() => {
          onClose();
          navigate("/notifications");
        }}
        className="border-t border-[#D8D7D1] px-4 py-3 text-xs font-bold text-[#526A55] hover:bg-[#F5F3ED] focus:outline-none focus:ring-2 focus:ring-inset focus:ring-[#526A55]"
      >
        View all notifications
      </button>
    </div>
  );
};

export default NotificationDropdown;
