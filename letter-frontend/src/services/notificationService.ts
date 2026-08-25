import api from './api';
import { NotificationItem } from '@/types/notification';

/* ─── Mock Notification Data (Dev Offline Fallback) ─────── */

let mockNotifications: NotificationItem[] = [
  {
    id: 'notif-1',
    type: 'DOCUMENT_SUBMITTED',
    message: 'Endrias Eshetu submitted Q1 Financial Report for approval.',
    isRead: false,
    createdAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(), // 10 mins ago
    documentId: 'doc-1',
    documentTitle: 'Q1_Financial_Report_DRAFT.pdf',
  },
  {
    id: 'notif-2',
    type: 'CHANGES_REQUESTED',
    message: 'Tigist Haile requested revisions on Procurement Policy Draft.',
    isRead: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    documentId: 'doc-5',
    documentTitle: 'ICT_Infrastructure_Audit_Report.docx',
  },
  {
    id: 'notif-3',
    type: 'DOCUMENT_APPROVED',
    message: 'Your document Employee Handbook 2026 was approved.',
    isRead: false,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Yesterday
    documentId: 'doc-4',
    documentTitle: 'Employee_Handbook_2026.pdf',
  },
  {
    id: 'notif-4',
    type: 'COMMENT_ADDED',
    message: 'New comment added on Q1 Financial Report.',
    isRead: true,
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    documentId: 'doc-1',
    documentTitle: 'Q1_Financial_Report_DRAFT.pdf',
  },
];

export const notificationService = {
  /**
   * Get notifications for the authenticated user
   */
  async getNotifications(): Promise<NotificationItem[]> {
    try {
      const response = await api.get<NotificationItem[]>('/notifications');
      return response.data;
    } catch (error: any) {
      if (error.code === 'ERR_NETWORK' || !error.response) {
        await new Promise((r) => setTimeout(r, 200));
        return [...mockNotifications];
      }
      throw error;
    }
  },

  /**
   * Mark an individual notification as read
   */
  async markAsRead(id: string): Promise<{ message: string }> {
    try {
      const response = await api.post<{ message: string }>(`/notifications/${id}/read`);
      return response.data;
    } catch (error: any) {
      if (error.code === 'ERR_NETWORK' || !error.response) {
        const notif = mockNotifications.find((n) => n.id === id);
        if (notif) notif.isRead = true;
        return { message: 'Notification marked as read.' };
      }
      throw error;
    }
  },

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<{ message: string }> {
    try {
      const response = await api.post<{ message: string }>('/notifications/read-all');
      return response.data;
    } catch (error: any) {
      if (error.code === 'ERR_NETWORK' || !error.response) {
        mockNotifications.forEach((n) => {
          n.isRead = true;
        });
        return { message: 'All notifications marked as read.' };
      }
      throw error;
    }
  },
};

export default notificationService;
