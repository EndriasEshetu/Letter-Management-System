import api from './api';
import { NotificationItem } from '@/types/notification';

export const notificationService = {
  /**
   * Get notifications for the authenticated user via backend API
   */
  async getNotifications(): Promise<NotificationItem[]> {
    const response = await api.get<NotificationItem[]>('/notifications');
    return response.data;
  },

  /**
   * Mark an individual notification as read via backend API
   */
  async markAsRead(id: string): Promise<{ message: string }> {
    const response = await api.patch<{ message: string }>(`/notifications/${id}/read`);
    return response.data;
  },

  /**
   * Mark all notifications as read via backend API
   */
  async markAllAsRead(): Promise<{ message: string }> {
    const response = await api.patch<{ message: string }>('/notifications/read-all');
    return response.data;
  },
};

export default notificationService;
