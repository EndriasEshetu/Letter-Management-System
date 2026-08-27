import api from "./api";
import { PaginatedNotificationsResponse } from "@/types/notification";

export const notificationService = {
  /**
   * Get notifications for the authenticated user via backend API
   */
  async getNotifications(params?: {
    page?: number;
    limit?: number;
    read?: "all" | "read" | "unread";
  }): Promise<PaginatedNotificationsResponse> {
    const response = await api.get<PaginatedNotificationsResponse>(
      "/notifications",
      { params },
    );
    return response.data;
  },

  /**
   * Mark an individual notification as read via backend API
   */
  async markAsRead(id: string): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>(
      `/notifications/${id}/read`,
    );
    return response.data;
  },

  /**
   * Mark all notifications as read via backend API
   */
  async markAllAsRead(): Promise<{ message: string }> {
    const response = await api.post<{ message: string }>(
      "/notifications/read-all",
    );
    return response.data;
  },

  async getUnreadCount(): Promise<number> {
    const response = await api.get<{ count: number }>(
      "/notifications/unread-count",
    );
    return response.data.count;
  },
};

export default notificationService;
