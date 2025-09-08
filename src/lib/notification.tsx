import { notification } from 'antd';
import { IconCheck, IconAlertCircle, IconInfoCircle, IconX } from '@tabler/icons-react';

export type NotificationType = 'success' | 'warning' | 'info' | 'error';

export interface NotificationOptions {
  title?: string;
  message: string;
  duration?: number;
  placement?: 'topLeft' | 'topRight' | 'bottomLeft' | 'bottomRight';
  className?: string;
}

class NotificationService {
  private getIcon(type: NotificationType) {
    switch (type) {
      case 'success':
        return <IconCheck className="h-5 w-5 text-green-600" />;
      case 'warning':
        return <IconAlertCircle className="h-5 w-5 text-yellow-600" />;
      case 'info':
        return <IconInfoCircle className="h-5 w-5 text-blue-600" />;
      case 'error':
        return <IconX className="h-5 w-5 text-red-600" />;
      default:
        return null;
    }
  }

  private getClassName(type: NotificationType) {
    const baseClass = 'custom-notification';
    switch (type) {
      case 'success':
        return `${baseClass} notification-success`;
      case 'warning':
        return `${baseClass} notification-warning`;
      case 'info':
        return `${baseClass} notification-info`;
      case 'error':
        return `${baseClass} notification-error`;
      default:
        return baseClass;
    }
  }

  success(options: NotificationOptions) {
    notification.success({
      message: options.title || 'Success',
      description: options.message,
      duration: options.duration || 4.5,
      placement: options.placement || 'topRight',
      className: `${this.getClassName('success')} ${options.className || ''}`,
      icon: this.getIcon('success'),
    });
  }

  warning(options: NotificationOptions) {
    notification.warning({
      message: options.title || 'Warning',
      description: options.message,
      duration: options.duration || 4.5,
      placement: options.placement || 'topRight',
      className: `${this.getClassName('warning')} ${options.className || ''}`,
      icon: this.getIcon('warning'),
    });
  }

  info(options: NotificationOptions) {
    notification.info({
      message: options.title || 'Info',
      description: options.message,
      duration: options.duration || 4.5,
      placement: options.placement || 'topRight',
      className: `${this.getClassName('info')} ${options.className || ''}`,
      icon: this.getIcon('info'),
    });
  }

  error(options: NotificationOptions) {
    notification.error({
      message: options.title || 'Error',
      description: options.message,
      duration: options.duration || 4.5,
      placement: options.placement || 'topRight',
      className: `${this.getClassName('error')} ${options.className || ''}`,
      icon: this.getIcon('error'),
    });
  }

  // Convenience methods for common actions
  created(resource: string) {
    this.success({
      title: 'Created Successfully',
      message: `${resource} has been created successfully.`,
    });
  }

  updated(resource: string) {
    this.success({
      title: 'Updated Successfully',
      message: `${resource} has been updated successfully.`,
    });
  }

  deleted(resource: string) {
    this.success({
      title: 'Deleted Successfully',
      message: `${resource} has been deleted successfully.`,
    });
  }

  saved(resource: string) {
    this.success({
      title: 'Saved Successfully',
      message: `${resource} has been saved successfully.`,
    });
  }

  // Error convenience methods
  creationFailed(resource: string) {
    this.error({
      title: 'Creation Failed',
      message: `Failed to create ${resource}. Please try again.`,
    });
  }

  updateFailed(resource: string) {
    this.error({
      title: 'Update Failed',
      message: `Failed to update ${resource}. Please try again.`,
    });
  }

  deletionFailed(resource: string) {
    this.error({
      title: 'Deletion Failed',
      message: `Failed to delete ${resource}. Please try again.`,
    });
  }

  // Warning convenience methods
  confirmDelete(resource: string) {
    this.warning({
      title: 'Confirm Deletion',
      message: `Are you sure you want to delete this ${resource}? This action cannot be undone.`,
      duration: 0, // No auto-close for confirmation
    });
  }

  // Info convenience methods
  loading(resource: string) {
    this.info({
      title: 'Loading',
      message: `Loading ${resource}...`,
      duration: 0,
    });
  }
}

// Create a singleton instance
export const notificationService = new NotificationService();

// Export convenience functions
export const notify = {
  success: (options: NotificationOptions) => notificationService.success(options),
  warning: (options: NotificationOptions) => notificationService.warning(options),
  info: (options: NotificationOptions) => notificationService.info(options),
  error: (options: NotificationOptions) => notificationService.error(options),
  created: (resource: string) => notificationService.created(resource),
  updated: (resource: string) => notificationService.updated(resource),
  deleted: (resource: string) => notificationService.deleted(resource),
  saved: (resource: string) => notificationService.saved(resource),
  creationFailed: (resource: string) => notificationService.creationFailed(resource),
  updateFailed: (resource: string) => notificationService.updateFailed(resource),
  deletionFailed: (resource: string) => notificationService.deletionFailed(resource),
  confirmDelete: (resource: string) => notificationService.confirmDelete(resource),
  loading: (resource: string) => notificationService.loading(resource),
};

export default notificationService; 