/**
 * Notifications API endpoints
 * Real backend API implementation
 */

import { ApiResponse, createApiError } from './client';
import { apiFetch } from './http';

/**
 * Notification type
 */
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  read: boolean;
  createdAt: string;
  link?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Notifications Response
 */
export interface NotificationsResponse {
  notifications: Notification[];
  unreadCount: number;
}


/**
 * GET /api/notifications
 * Get all notifications for the current user
 */
export const getNotifications = async (): Promise<ApiResponse<NotificationsResponse>> => {
  try {
    const data = await apiFetch<NotificationsResponse>('/api/notifications');

    return { data };
  } catch (error) {
    return createApiError(
      'FETCH_ERROR',
      error instanceof Error ? error.message : 'Failed to fetch notifications'
    );
  }
};

/**
 * PATCH /api/notifications/:id/read
 * Mark a notification as read
 */
export const markNotificationAsRead = async (
  id: string
): Promise<ApiResponse<{ notification: Notification }>> => {
  try {
    const data = await apiFetch<{ notification: Notification }>(`/api/notifications/${id}/read`, {
      method: 'PATCH',
    });

    return { data };
  } catch (error) {
    return createApiError(
      'FETCH_ERROR',
      error instanceof Error ? error.message : 'Failed to mark notification as read'
    );
  }
};

/**
 * PATCH /api/notifications/read-all
 * Mark all notifications as read
 */
export const markAllNotificationsAsRead = async (): Promise<ApiResponse<{ count: number }>> => {
  try {
    const data = await apiFetch<{ count: number }>('/api/notifications/read-all', {
      method: 'PATCH',
    });

    return { data };
  } catch (error) {
    return createApiError(
      'FETCH_ERROR',
      error instanceof Error ? error.message : 'Failed to mark all notifications as read'
    );
  }
};
