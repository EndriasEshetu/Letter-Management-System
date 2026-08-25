import api from './api';
import { NotificationItem } from '@/types/notification';

/* ─── Mock Notification Data (Dev Offline Fallback) ─────── */

let mockNotifications: NotificationItem[] = [
  {
    id: 'notif-1',
    type: 'LETTER_ASSIGNED',
    message: 'Tigist Haile assigned letter IN/2026/00452 to you: Prepare Outgoing Response Report.',
    isRead: false,
    createdAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    letterId: 'ltr-1',
    letterTitle: 'Request for Digital Transformation Progress Report & Budget Alignment',
    referenceNumber: 'IN/2026/00452',
  },
  {
    id: 'notif-2',
    type: 'LETTER_AWAITING_ROUTING',
    message: 'New incoming letter registered by Registry: IN/2026/00501 awaiting Main Admin routing.',
    isRead: false,
    createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    letterId: 'ltr-5',
    letterTitle: 'Annual Compliance Audit Notification FY2026',
    referenceNumber: 'IN/2026/00501',
  },
  {
    id: 'notif-3',
    type: 'LETTER_APPROVED',
    message: 'Response letter OUT/2026/00891 was approved by Department Manager and registered by Admin.',
    isRead: false,
    createdAt: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(),
    letterId: 'ltr-2',
    letterTitle: 'Official Response – SITA Digital Transformation Progress',
    referenceNumber: 'OUT/2026/00891',
  },
  {
    id: 'notif-4',
    type: 'LETTER_DEADLINE_APPROACHING',
    message: 'Response deadline for IN/2026/00452 is approaching (Due: Sep 02, 2026).',
    isRead: true,
    createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    letterId: 'ltr-1',
    letterTitle: 'Request for Digital Transformation Progress Report',
    referenceNumber: 'IN/2026/00452',
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
