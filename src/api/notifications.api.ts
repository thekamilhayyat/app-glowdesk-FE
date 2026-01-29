/**
 * Notifications API endpoints
 * Real backend API implementation
 */

import { ApiResponse, getAuthToken, createApiError } from './client';

const API_BASE_URL = '/api/notifications';

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
 * Make authenticated HTTP request
 */
const makeRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const token = getAuthToken();
  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
};

/**
 * GET /api/notifications
 * Get all notifications for the current user
 */
export const getNotifications = async (): Promise<ApiResponse<NotificationsResponse>> => {
  try {
    const response = await makeRequest<NotificationsResponse>('');

    return { data: response };
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
    const response = await makeRequest<{ notification: Notification }>(`/${id}/read`, {
      method: 'PATCH',
    });

    return { data: response };
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
    const response = await makeRequest<{ count: number }>('/read-all', {
      method: 'PATCH',
    });

    return { data: response };
  } catch (error) {
    return createApiError(
      'FETCH_ERROR',
      error instanceof Error ? error.message : 'Failed to mark all notifications as read'
    );
  }
};
