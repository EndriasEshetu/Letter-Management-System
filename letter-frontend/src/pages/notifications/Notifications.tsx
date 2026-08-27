import React, { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import notificationService from "@/services/notificationService";
import { NotificationItem } from "@/types/notification";
import Card from "@/components/common/Card";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import ErrorState from "@/components/common/ErrorState";
import EmptyState from "@/components/common/EmptyState";
import Pagination from "@/components/common/Pagination";
import Badge from "@/components/common/Badge";

type ReadFilter = "all" | "unread" | "read";

const formatTime = (value: string) => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  const minutes = Math.floor((Date.now() - date.getTime()) / 60000);
  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes} minutes ago`;
  if (minutes < 1440) return `${Math.floor(minutes / 60)} hours ago`;
  if (minutes < 2880) return "Yesterday";
  return date.toLocaleDateString(undefined, { month: "short", day: "numeric" });
};

const Notifications: React.FC = () => {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [filter, setFilter] = useState<ReadFilter>("all");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const [result, unread] = await Promise.all([
        notificationService.getNotifications({ page, limit: 20, read: filter }),
        notificationService.getUnreadCount(),
      ]);
      setNotifications(result.data);
      setTotalPages(result.totalPages);
      setUnreadCount(unread);
    } catch (err: any) {
      setError(err.message || "Notifications could not be loaded.");
    } finally {
      setIsLoading(false);
    }
  }, [filter, page]);

  useEffect(() => {
    load();
  }, [load]);

  const markRead = async (notification: NotificationItem) => {
    if (notification.isRead) return;
    setNotifications((items) =>
      items.map((item) =>
        item.id === notification.id ? { ...item, isRead: true } : item,
      ),
    );
    try {
      await notificationService.markAsRead(notification.id);
      setUnreadCount((count) => Math.max(0, count - 1));
    } catch {
      setNotifications((items) =>
        items.map((item) =>
          item.id === notification.id ? { ...item, isRead: false } : item,
        ),
      );
      setError("This notification could not be marked as read.");
    }
  };

  const openNotification = async (notification: NotificationItem) => {
    await markRead(notification);
    if (notification.taskId) navigate(`/tasks/${notification.taskId}`);
    else if (
      notification.entityType === "APPROVAL" ||
      notification.type === "DOCUMENT_SUBMITTED"
    )
      navigate("/approvals");
    else if (notification.entityType === "LETTER" && notification.entityId)
      navigate(`/letters/${notification.entityId}`);
    else if (notification.letterId || notification.documentId)
      navigate(`/letters/${notification.letterId || notification.documentId}`);
  };

  const markAll = async () => {
    try {
      await notificationService.markAllAsRead();
      setNotifications((items) =>
        items.map((item) => ({ ...item, isRead: true })),
      );
      setUnreadCount(0);
    } catch {
      setError("Notifications could not be updated.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[#292A27]">Notifications</h1>
          <p className="text-sm text-[#6B6A64] mt-1">
            Workflow updates and actions relevant to your account.
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={markAll}
            className="text-xs font-bold text-[#526A55] hover:underline"
          >
            Mark all as read
          </button>
        )}
      </div>
      <div className="flex gap-2 overflow-x-auto">
        {(["all", "unread", "read"] as ReadFilter[]).map((value) => (
          <button
            key={value}
            type="button"
            onClick={() => {
              setFilter(value);
              setPage(1);
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold capitalize ${filter === value ? "bg-[#526A55] text-[#F5F3ED]" : "bg-[#ECEAE3] text-[#6B6A64] border border-[#D8D7D1]"}`}
          >
            {value}
            {value === "unread" && unreadCount > 0 ? ` (${unreadCount})` : ""}
          </button>
        ))}
      </div>
      {isLoading ? (
        <div className="py-16 flex justify-center">
          <LoadingSpinner size="lg" label="Loading notifications..." />
        </div>
      ) : error ? (
        <ErrorState
          title="Notifications couldn't be loaded"
          description={error}
          retryLabel="Retry"
          onRetry={load}
        />
      ) : notifications.length === 0 ? (
        <EmptyState
          title="You're all caught up"
          description="No new notifications."
        />
      ) : (
        <>
          <div className="space-y-3">
            {notifications.map((notification) => (
              <Card
                key={notification.id}
                className={
                  notification.isRead
                    ? ""
                    : "border-l-4 border-l-[#526A55] bg-[#526A55]/05"
                }
              >
                <button
                  type="button"
                  onClick={() => openNotification(notification)}
                  className="w-full text-left focus:outline-none focus:ring-2 focus:ring-[#526A55] rounded-lg"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h2
                          className={`text-sm text-[#292A27] ${notification.isRead ? "font-semibold" : "font-bold"}`}
                        >
                          {notification.message}
                        </h2>
                        {!notification.isRead && (
                          <Badge variant="info">NEW</Badge>
                        )}
                      </div>
                      {notification.referenceNumber && (
                        <p className="font-mono text-xs text-[#526A55] mt-1">
                          {notification.referenceNumber}
                        </p>
                      )}
                      {(notification.letterTitle ||
                        notification.documentTitle) && (
                        <p className="text-xs text-[#6B6A64] mt-1">
                          {notification.letterTitle ||
                            notification.documentTitle}
                        </p>
                      )}
                    </div>
                    <time className="text-[11px] text-[#8A8983] whitespace-nowrap">
                      {formatTime(notification.createdAt)}
                    </time>
                  </div>
                </button>
              </Card>
            ))}
          </div>
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
          />
        </>
      )}
    </div>
  );
};

export default Notifications;
