/**
 * Permission utilities for role-based access control
 */

import { useAuth } from '@/contexts/AuthContext';

export type Permission =
  | 'calendar.view'
  | 'calendar.create'
  | 'calendar.edit'
  | 'calendar.delete'
  | 'clients.view'
  | 'clients.create'
  | 'clients.edit'
  | 'clients.delete'
  | 'services.view'
  | 'services.create'
  | 'services.edit'
  | 'services.delete'
  | 'inventory.view'
  | 'inventory.manage'
  | 'sales.view'
  | 'sales.create'
  | 'sales.refund'
  | 'staff.view'
  | 'staff.create'
  | 'staff.edit'
  | 'staff.delete'
  | 'settings.view'
  | 'settings.edit';

/**
 * Permission map based on user roles
 */
const ROLE_PERMISSIONS: Record<string, Permission[]> = {
  admin: [
    'calendar.view',
    'calendar.create',
    'calendar.edit',
    'calendar.delete',
    'clients.view',
    'clients.create',
    'clients.edit',
    'clients.delete',
    'services.view',
    'services.create',
    'services.edit',
    'services.delete',
    'inventory.view',
    'inventory.manage',
    'sales.view',
    'sales.create',
    'sales.refund',
    'staff.view',
    'staff.create',
    'staff.edit',
    'staff.delete',
    'settings.view',
    'settings.edit',
  ],
  manager: [
    'calendar.view',
    'calendar.create',
    'calendar.edit',
    'calendar.delete',
    'clients.view',
    'clients.create',
    'clients.edit',
    'services.view',
    'services.create',
    'services.edit',
    'inventory.view',
    'inventory.manage',
    'sales.view',
    'sales.create',
    'sales.refund',
    'staff.view',
    'staff.edit',
    'settings.view',
  ],
  staff: [
    'calendar.view',
    'calendar.create',
    'calendar.edit',
    'clients.view',
    'clients.create',
    'clients.edit',
    'services.view',
    'inventory.view',
    'sales.view',
    'sales.create',
  ],
  receptionist: [
    'calendar.view',
    'calendar.create',
    'calendar.edit',
    'clients.view',
    'clients.create',
    'clients.edit',
    'services.view',
    'sales.view',
    'sales.create',
  ],
  user: [
    'calendar.view',
    'clients.view',
    'services.view',
    'sales.view',
  ],
};

/**
 * Hook to check if user has a specific permission
 */
export const usePermission = (permission: Permission): boolean => {
  const { user } = useAuth();

  if (!user) {
    return false;
  }

  const rolePermissions = ROLE_PERMISSIONS[user.role] || [];
  return rolePermissions.includes(permission);
};

/**
 * Hook to check if user has any of the specified permissions
 */
export const useAnyPermission = (permissions: Permission[]): boolean => {
  const { user } = useAuth();

  if (!user) {
    return false;
  }

  const rolePermissions = ROLE_PERMISSIONS[user.role] || [];
  return permissions.some((permission) => rolePermissions.includes(permission));
};

/**
 * Hook to check if user has all of the specified permissions
 */
export const useAllPermissions = (permissions: Permission[]): boolean => {
  const { user } = useAuth();

  if (!user) {
    return false;
  }

  const rolePermissions = ROLE_PERMISSIONS[user.role] || [];
  return permissions.every((permission) => rolePermissions.includes(permission));
};

/**
 * Component wrapper for permission-based rendering
 */
interface PermissionGateProps {
  permission: Permission | Permission[];
  requireAll?: boolean;
  fallback?: React.ReactNode;
  children: React.ReactNode;
}

export const PermissionGate: React.FC<PermissionGateProps> = ({
  permission,
  requireAll = false,
  fallback = null,
  children,
}) => {
  const { user } = useAuth();

  if (!user) {
    return <>{fallback}</>;
  }

  const rolePermissions = ROLE_PERMISSIONS[user.role] || [];
  const permissions = Array.isArray(permission) ? permission : [permission];

  const hasPermission = requireAll
    ? permissions.every((p) => rolePermissions.includes(p))
    : permissions.some((p) => rolePermissions.includes(p));

  return <>{hasPermission ? children : fallback}</>;
};
