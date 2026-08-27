import { useState, useEffect, useCallback } from "react";
import notificationService from "@/services/notificationService";
import { NotificationItem } from "@/types/notification";

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const fetchNotifications = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    setError(null);
    try {
      const response = await notificationService.getNotifications({
        limit: 20,
      });
      setNotifications(response.data);
    } catch (err: any) {
      console.error("[useNotifications] Failed to load notifications:", err);
      setError("Unable to load notifications.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refreshUnreadCount = useCallback(async () => {
    try {
      setUnreadCount(await notificationService.getUnreadCount());
    } catch (err) {
      console.error("[useNotifications] Failed to load unread count:", err);
    }
  }, []);

  useEffect(() => {
    fetchNotifications();
    refreshUnreadCount();

    // Polling every 30 seconds for background updates
    const interval = setInterval(() => {
      fetchNotifications(true);
      refreshUnreadCount();
    }, 30000);

    return () => clearInterval(interval);
  }, [fetchNotifications, refreshUnreadCount]);

  const markAsRead = async (id: string) => {
    const previous = notifications;
    // Optimistic update
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, isRead: true } : n)),
    );
    try {
      await notificationService.markAsRead(id);
      setUnreadCount((count) =>
        Math.max(
          0,
          count - (previous.some((n) => n.id === id && !n.isRead) ? 1 : 0),
        ),
      );
    } catch (err) {
      console.error("[useNotifications] Failed to mark as read:", err);
      setNotifications(previous);
      await refreshUnreadCount();
    }
  };

  const markAllAsRead = async () => {
    const previous = notifications;
    // Optimistic update
    setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
    try {
      await notificationService.markAllAsRead();
      setUnreadCount(0);
    } catch (err) {
      console.error("[useNotifications] Failed to mark all as read:", err);
      setNotifications(previous);
      await refreshUnreadCount();
    }
  };

  return {
    notifications,
    unreadCount,
    isLoading,
    error,
    refetch: fetchNotifications,
    markAsRead,
    markAllAsRead,
  };
};

export default useNotifications;
