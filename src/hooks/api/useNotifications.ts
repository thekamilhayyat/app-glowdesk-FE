/**
 * React Query hooks for Notifications API
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  Notification,
} from '@/api/notifications.api';
import { extractData, hasError } from '@/api/client';
import { toast } from '@/components/ui/sonner';

/**
 * Hook for fetching notifications
 */
export const useNotifications = () => {
  return useQuery({
    queryKey: ['notifications'],
    queryFn: async () => {
      const response = await getNotifications();
      if (hasError(response)) {
        throw new Error(response.error?.message || 'Failed to fetch notifications');
      }
      return extractData(response);
    },
    staleTime: 30000, // 30 seconds - notifications change frequently
    refetchOnWindowFocus: true, // Refetch when window gains focus
  });
};

/**
 * Hook for marking a notification as read
 */
export const useMarkNotificationAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await markNotificationAsRead(id);
      if (hasError(response)) {
        throw new Error(response.error?.message || 'Failed to mark notification as read');
      }
      return extractData(response);
    },
    onSuccess: () => {
      // Invalidate notifications query to refetch with updated read status
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to mark notification as read');
    },
  });
};

/**
 * Hook for marking all notifications as read
 */
export const useMarkAllNotificationsAsRead = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      const response = await markAllNotificationsAsRead();
      if (hasError(response)) {
        throw new Error(response.error?.message || 'Failed to mark all notifications as read');
      }
      return extractData(response);
    },
    onSuccess: () => {
      // Invalidate notifications query to refetch with updated read status
      queryClient.invalidateQueries({ queryKey: ['notifications'] });
      toast.success('All notifications marked as read');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to mark all notifications as read');
    },
  });
};
