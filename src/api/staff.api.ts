/**
 * Staff API endpoints
 * Mock implementation matching API_DOCUMENTATION.md
 */

import { apiRequest, ApiResponse, PaginationParams } from './client';
import staffData from '@/data/staff.json';
import { StaffMember } from '@/types/staff';

export interface StaffFilters extends PaginationParams {
  isActive?: boolean;
  role?: string;
  serviceId?: string;
}

export interface CreateStaffRequest {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  role: string;
  color?: string;
  commissionRate?: number;
  serviceIds?: string[];
  workingHours?: Record<string, { open: string; close: string }>;
}

export interface UpdateStaffRequest {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  role?: string;
  color?: string;
  commissionRate?: number;
  serviceIds?: string[];
  workingHours?: Record<string, { open: string; close: string }>;
  isActive?: boolean;
}

export interface AvailabilitySlot {
  startTime: string;
  endTime: string;
  available: boolean;
}

export interface AvailabilityResponse {
  availability: Array<{
    date: string;
    slots: AvailabilitySlot[];
  }>;
}

/**
 * GET /staff
 * Get list of all staff members
 */
export const getStaff = async (
  filters?: StaffFilters
): Promise<ApiResponse<{ data: StaffMember[] }>> => {
  return apiRequest(async () => {
    let filtered = staffData.data.map((s) => ({
      id: s.employee_id,
      firstName: s.display_name.split(' ')[0],
      lastName: s.display_name.split(' ').slice(1).join(' '),
      displayName: s.display_name,
      email: s.contact.email,
      phone: s.contact.phone,
      roleId: s.role.role_id,
      roleName: s.role.role_name,
      permissionLevel: 'medium' as const,
      payType: 'commission' as const,
      services: s.service_list.map((svc) => svc.service_id),
      color: '#3B82F6',
      isActive: true,
      isOnline: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }));

    // Apply filters
    if (filters?.isActive !== undefined) {
      filtered = filtered.filter((s) => s.isActive === filters.isActive);
    }

    if (filters?.role) {
      filtered = filtered.filter((s) => s.roleName.toLowerCase().includes(filters.role!.toLowerCase()));
    }

    if (filters?.serviceId) {
      filtered = filtered.filter((s) => s.services.includes(filters.serviceId!));
    }

    return { data: filtered };
  });
};

/**
 * GET /staff/:id
 * Get single staff member by ID
 */
export const getStaffById = async (
  id: string
): Promise<ApiResponse<{ staff: StaffMember }>> => {
  return apiRequest(async () => {
    const staffMember = staffData.data.find((s) => s.employee_id === id);

    if (!staffMember) {
      throw new Error('Staff member not found');
    }

    const staff: StaffMember = {
      id: staffMember.employee_id,
      firstName: staffMember.display_name.split(' ')[0],
      lastName: staffMember.display_name.split(' ').slice(1).join(' '),
      displayName: staffMember.display_name,
      email: staffMember.contact.email,
      phone: staffMember.contact.phone,
      roleId: staffMember.role.role_id,
      roleName: staffMember.role.role_name,
      permissionLevel: 'medium',
      payType: 'commission',
      services: staffMember.service_list.map((svc) => svc.service_id),
      color: '#3B82F6',
      isActive: true,
      isOnline: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return { staff };
  });
};

/**
 * POST /staff
 * Create new staff member
 */
export const createStaff = async (
  request: CreateStaffRequest
): Promise<ApiResponse<{ staff: StaffMember }>> => {
  return apiRequest(async () => {
    const newId = `EMP${String(staffData.data.length + 1).padStart(3, '0')}`;

    const newStaff: StaffMember = {
      id: newId,
      firstName: request.firstName,
      lastName: request.lastName,
      displayName: `${request.firstName} ${request.lastName}`,
      email: request.email,
      phone: request.phone,
      roleId: '1',
      roleName: request.role,
      permissionLevel: 'medium',
      payType: 'commission',
      commissionRate: request.commissionRate,
      services: request.serviceIds || [],
      color: request.color || '#3B82F6',
      isActive: true,
      isOnline: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Add to mock data
    staffData.data.push({
      employee_id: newId,
      display_name: newStaff.displayName,
      role: {
        role_id: '1',
        role_name: request.role,
      },
      contact: {
        email: request.email,
        phone: request.phone || '',
      },
      work_hours: request.workingHours || {},
      time_off: [],
      service_list: [],
    });

    return { staff: newStaff };
  });
};

/**
 * PUT /staff/:id
 * Update staff member
 */
export const updateStaff = async (
  id: string,
  request: UpdateStaffRequest
): Promise<ApiResponse<{ staff: StaffMember }>> => {
  return apiRequest(async () => {
    const index = staffData.data.findIndex((s) => s.employee_id === id);

    if (index === -1) {
      throw new Error('Staff member not found');
    }

    const existing = staffData.data[index];
    const updatedStaff: StaffMember = {
      id: existing.employee_id,
      firstName: request.firstName || existing.display_name.split(' ')[0],
      lastName: request.lastName || existing.display_name.split(' ').slice(1).join(' '),
      displayName: request.firstName && request.lastName
        ? `${request.firstName} ${request.lastName}`
        : existing.display_name,
      email: request.email || existing.contact.email,
      phone: request.phone || existing.contact.phone,
      roleId: existing.role.role_id,
      roleName: request.role || existing.role.role_name,
      permissionLevel: 'medium',
      payType: 'commission',
      services: request.serviceIds || existing.service_list.map((s) => s.service_id),
      color: request.color || '#3B82F6',
      isActive: request.isActive !== undefined ? request.isActive : true,
      isOnline: false,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Update mock data
    staffData.data[index] = {
      ...existing,
      display_name: updatedStaff.displayName,
      contact: {
        email: updatedStaff.email,
        phone: updatedStaff.phone || '',
      },
      role: {
        role_id: existing.role.role_id,
        role_name: updatedStaff.roleName,
      },
    };

    return { staff: updatedStaff };
  });
};

/**
 * DELETE /staff/:id
 * Delete staff member (soft delete recommended)
 */
export const deleteStaff = async (id: string): Promise<ApiResponse<void>> => {
  return apiRequest(async () => {
    const index = staffData.data.findIndex((s) => s.employee_id === id);

    if (index === -1) {
      throw new Error('Staff member not found');
    }

    // Soft delete - mark as inactive
    // In real app, would update isActive flag
    staffData.data.splice(index, 1);
    return undefined;
  });
};

/**
 * GET /staff/:id/availability
 * Get staff member's availability for a date range
 */
export const getStaffAvailability = async (
  id: string,
  startDate: string,
  endDate: string,
  duration?: number
): Promise<ApiResponse<AvailabilityResponse>> => {
  return apiRequest(async () => {
    const staffMember = staffData.data.find((s) => s.employee_id === id);

    if (!staffMember) {
      throw new Error('Staff member not found');
    }

    // Generate availability slots
    const start = new Date(startDate);
    const end = new Date(endDate);
    const slots: AvailabilitySlot[] = [];
    const slotDuration = duration || 30; // Default 30 minutes

    // Generate slots for each day
    for (let date = new Date(start); date <= end; date.setDate(date.getDate() + 1)) {
      const dayName = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'][date.getDay()];
      const workHours = staffMember.work_hours[dayName];

      if (workHours && workHours.start && workHours.end) {
        const [startHour, startMinute] = workHours.start.split(':').map(Number);
        const [endHour, endMinute] = workHours.end.split(':').map(Number);

        const dayStart = new Date(date);
        dayStart.setHours(startHour, startMinute, 0, 0);

        const dayEnd = new Date(date);
        dayEnd.setHours(endHour, endMinute, 0, 0);

        for (
          let slotStart = new Date(dayStart);
          slotStart.getTime() + slotDuration * 60000 <= dayEnd.getTime();
          slotStart.setMinutes(slotStart.getMinutes() + slotDuration)
        ) {
          const slotEnd = new Date(slotStart.getTime() + slotDuration * 60000);
          slots.push({
            startTime: slotStart.toISOString(),
            endTime: slotEnd.toISOString(),
            available: true, // Would check against appointments in real app
          });
        }
      }
    }

    // Group by date
    const availabilityByDate: Record<string, AvailabilitySlot[]> = {};
    slots.forEach((slot) => {
      const dateKey = new Date(slot.startTime).toISOString().split('T')[0];
      if (!availabilityByDate[dateKey]) {
        availabilityByDate[dateKey] = [];
      }
      availabilityByDate[dateKey].push(slot);
    });

    return {
      availability: Object.entries(availabilityByDate).map(([date, dateSlots]) => ({
        date,
        slots: dateSlots,
      })),
    };
  });
};
