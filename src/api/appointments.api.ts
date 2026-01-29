/**
 * Appointments API endpoints
 * Mock implementation matching API_DOCUMENTATION.md
 */

import { apiRequest, ApiResponse, PaginatedResponse, PaginationParams } from './client';
import { Appointment, AppointmentStatus } from '@/types/appointment';
import { generateMockData } from '@/lib/mockCalendarData';

// In-memory storage for appointments (simulating database)
// Shared between dashboard and public widget
let mockAppointments: Appointment[] = [];

// Initialize with mock data
const initializeAppointments = () => {
  if (mockAppointments.length === 0) {
    const { appointments } = generateMockData();
    mockAppointments = appointments;
  }
};

initializeAppointments();

// Export function to add appointments (for public widget integration)
export const addAppointmentToDashboard = (appointment: Appointment) => {
  mockAppointments.push(appointment);
};

// Export function to get appointments array (for availability checking)
export const getAppointmentsArray = () => mockAppointments;

export interface AppointmentFilters extends PaginationParams {
  startDate?: string;
  endDate?: string;
  clientId?: string;
  staffId?: string;
  status?: AppointmentStatus;
  date?: string;
}

export interface CreateAppointmentRequest {
  clientId: string;
  staffId: string;
  serviceIds: string[];
  startTime: string;
  notes?: string;
  status?: AppointmentStatus;
}

export interface UpdateAppointmentRequest {
  startTime?: string;
  endTime?: string;
  staffId?: string;
  serviceIds?: string[];
  status?: AppointmentStatus;
  notes?: string;
  internalNotes?: string;
}

export interface CheckAvailabilityRequest {
  staffId: string;
  startTime: string;
  endTime: string;
  excludeAppointmentId?: string;
}

export interface AvailabilityResponse {
  available: boolean;
  conflicts?: Array<{
    id: string;
    startTime: string;
    endTime: string;
    clientName: string;
  }>;
}

/**
 * GET /appointments
 * Get list of appointments with filtering
 */
export const getAppointments = async (
  filters?: AppointmentFilters
): Promise<ApiResponse<PaginatedResponse<any>>> => {
  return apiRequest(async () => {
    let filtered = [...mockAppointments];

    // Filter by date range
    if (filters?.startDate) {
      const startDate = new Date(filters.startDate);
      filtered = filtered.filter((apt) => new Date(apt.startTime) >= startDate);
    }

    if (filters?.endDate) {
      const endDate = new Date(filters.endDate);
      endDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter((apt) => new Date(apt.startTime) <= endDate);
    }

    // Filter by specific date
    if (filters?.date) {
      const targetDate = new Date(filters.date);
      filtered = filtered.filter((apt) => {
        const aptDate = new Date(apt.startTime);
        return (
          aptDate.getFullYear() === targetDate.getFullYear() &&
          aptDate.getMonth() === targetDate.getMonth() &&
          aptDate.getDate() === targetDate.getDate()
        );
      });
    }

    // Filter by client
    if (filters?.clientId) {
      filtered = filtered.filter((apt) => apt.clientId === filters.clientId);
    }

    // Filter by staff
    if (filters?.staffId) {
      filtered = filtered.filter((apt) => apt.staffId === filters.staffId);
    }

    // Filter by status
    if (filters?.status) {
      filtered = filtered.filter((apt) => apt.status === filters.status);
    }

    // Sort by start time
    filtered.sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());

    // Apply pagination
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginated = filtered.slice(startIndex, endIndex);

    return {
      data: paginated,
      pagination: {
        page,
        limit,
        total: filtered.length,
        totalPages: Math.ceil(filtered.length / limit),
      },
    };
  });
};

/**
 * GET /appointments/:id
 * Get single appointment by ID
 */
export const getAppointmentById = async (
  id: string
): Promise<ApiResponse<{ appointment: Appointment }>> => {
  return apiRequest(async () => {
    const appointment = mockAppointments.find((apt) => apt.id === id);

    if (!appointment) {
      throw new Error('Appointment not found');
    }

    return { appointment };
  });
};

/**
 * POST /appointments
 * Create new appointment
 */
export const createAppointment = async (
  request: CreateAppointmentRequest
): Promise<ApiResponse<{ appointment: Appointment }>> => {
  return apiRequest(async () => {
    // Check for conflicts
    const startTime = new Date(request.startTime);
    const { services } = generateMockData();
    const selectedServices = request.serviceIds
      .map((id) => services.find((s) => s.id === id))
      .filter(Boolean);
    const totalDuration = selectedServices.reduce((sum, s) => sum + (s?.duration || 0), 0);
    const endTime = new Date(startTime.getTime() + totalDuration * 60000);

    // Check for conflicts
    const conflicts = mockAppointments.filter(
      (apt) =>
        apt.staffId === request.staffId &&
        apt.status !== 'canceled' &&
        apt.status !== 'no-show' &&
        apt.id !== request.startTime && // Exclude self if updating
        ((new Date(apt.startTime) <= startTime && new Date(apt.endTime) > startTime) ||
          (new Date(apt.startTime) < endTime && new Date(apt.endTime) >= endTime) ||
          (new Date(apt.startTime) >= startTime && new Date(apt.endTime) <= endTime))
    );

    if (conflicts.length > 0) {
      const error: any = new Error('This time slot conflicts with another appointment');
      error.code = 'APPOINTMENT_CONFLICT';
      error.details = {
        conflictingAppointment: {
          id: conflicts[0].id,
          startTime: conflicts[0].startTime,
          endTime: conflicts[0].endTime,
          clientName: 'Existing Client', // Would come from client lookup
        },
      };
      throw error;
    }

    const newAppointment: Appointment = {
      id: `apt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      clientId: request.clientId,
      staffId: request.staffId,
      serviceIds: request.serviceIds,
      startTime,
      endTime,
      status: request.status || 'pending',
      notes: request.notes,
      hasUnreadMessages: false,
      isRecurring: false,
      depositPaid: false,
      totalPrice: selectedServices.reduce((sum, s) => sum + (s?.price || 0), 0),
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    mockAppointments.push(newAppointment);
    return { appointment: newAppointment };
  });
};

/**
 * PUT /appointments/:id
 * Update existing appointment
 */
export const updateAppointment = async (
  id: string,
  request: UpdateAppointmentRequest
): Promise<ApiResponse<{ appointment: Appointment }>> => {
  return apiRequest(async () => {
    const index = mockAppointments.findIndex((apt) => apt.id === id);

    if (index === -1) {
      throw new Error('Appointment not found');
    }

    const existing = mockAppointments[index];
    const updated: Appointment = {
      ...existing,
      ...request,
      startTime: request.startTime ? new Date(request.startTime) : existing.startTime,
      endTime: request.endTime ? new Date(request.endTime) : existing.endTime,
      updatedAt: new Date(),
    };

    // Check for conflicts if time changed
    if (request.startTime || request.endTime) {
      const conflicts = mockAppointments.filter(
        (apt) =>
          apt.id !== id &&
          apt.staffId === (request.staffId || existing.staffId) &&
          apt.status !== 'canceled' &&
          apt.status !== 'no-show' &&
          ((new Date(apt.startTime) <= updated.startTime && new Date(apt.endTime) > updated.startTime) ||
            (new Date(apt.startTime) < updated.endTime && new Date(apt.endTime) >= updated.endTime) ||
            (new Date(apt.startTime) >= updated.startTime && new Date(apt.endTime) <= updated.endTime))
      );

      if (conflicts.length > 0) {
        const error: any = new Error('This time slot conflicts with another appointment');
        error.code = 'APPOINTMENT_CONFLICT';
        error.details = {
          conflictingAppointment: {
            id: conflicts[0].id,
            startTime: conflicts[0].startTime,
            endTime: conflicts[0].endTime,
            clientName: 'Existing Client',
          },
        };
        throw error;
      }
    }

    mockAppointments[index] = updated;
    return { appointment: updated };
  });
};

/**
 * DELETE /appointments/:id
 * Delete/cancel appointment
 */
export const deleteAppointment = async (
  id: string,
  cancellationReason?: string
): Promise<ApiResponse<void>> => {
  return apiRequest(async () => {
    const index = mockAppointments.findIndex((apt) => apt.id === id);

    if (index === -1) {
      throw new Error('Appointment not found');
    }

    // Soft delete - update status to canceled
    mockAppointments[index] = {
      ...mockAppointments[index],
      status: 'canceled',
      updatedAt: new Date(),
    };

    return undefined;
  });
};

/**
 * POST /appointments/:id/check-in
 * Check-in client for appointment
 */
export const checkInAppointment = async (
  id: string
): Promise<ApiResponse<{ appointment: Appointment }>> => {
  return apiRequest(async () => {
    const index = mockAppointments.findIndex((apt) => apt.id === id);

    if (index === -1) {
      throw new Error('Appointment not found');
    }

    const updated: Appointment = {
      ...mockAppointments[index],
      status: 'checked-in',
      updatedAt: new Date(),
    };

    mockAppointments[index] = updated;
    return { appointment: updated };
  });
};

/**
 * POST /appointments/:id/complete
 * Mark appointment as completed
 */
export const completeAppointment = async (
  id: string
): Promise<ApiResponse<{ appointment: Appointment }>> => {
  return apiRequest(async () => {
    const index = mockAppointments.findIndex((apt) => apt.id === id);

    if (index === -1) {
      throw new Error('Appointment not found');
    }

    const updated: Appointment = {
      ...mockAppointments[index],
      status: 'completed',
      updatedAt: new Date(),
    };

    mockAppointments[index] = updated;
    return { appointment: updated };
  });
};

/**
 * POST /appointments/check-availability
 * Check if a time slot is available
 */
export const checkAvailability = async (
  request: CheckAvailabilityRequest
): Promise<ApiResponse<AvailabilityResponse>> => {
  return apiRequest(async () => {
    const startTime = new Date(request.startTime);
    const endTime = new Date(request.endTime);

    const conflicts = mockAppointments.filter(
      (apt) =>
        apt.id !== request.excludeAppointmentId &&
        apt.staffId === request.staffId &&
        apt.status !== 'canceled' &&
        apt.status !== 'no-show' &&
        ((new Date(apt.startTime) <= startTime && new Date(apt.endTime) > startTime) ||
          (new Date(apt.startTime) < endTime && new Date(apt.endTime) >= endTime) ||
          (new Date(apt.startTime) >= startTime && new Date(apt.endTime) <= endTime))
    );

    return {
      available: conflicts.length === 0,
      conflicts: conflicts.map((apt) => ({
        id: apt.id,
        startTime: apt.startTime.toISOString(),
        endTime: apt.endTime.toISOString(),
        clientName: 'Existing Client', // Would come from client lookup
      })),
    };
  });
};
