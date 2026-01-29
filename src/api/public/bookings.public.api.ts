/**
 * Public Bookings API endpoints
 * Mock implementation for public booking widget
 * 
 * IMPORTANT: When a public booking is created, it automatically:
 * 1. Creates/finds the client in the dashboard system
 * 2. Creates an appointment in the dashboard system
 * 3. Links them together so bookings appear in the dashboard
 */

import { apiRequest, ApiResponse } from '../client';
// Import dashboard APIs to integrate bookings with dashboard
// In real backend, these would be internal service calls
import { Appointment, AppointmentStatus } from '@/types/appointment';
import { Client } from '@/types/client';
import { addAppointmentToDashboard, getAppointmentsArray } from '../appointments.api';
import { addClientToDashboard, findClientByContact } from '../clients.api';
import { getPublicService } from './services.public.api';

export interface PublicBookingRequest {
  salonId: string;
  serviceId: string;
  startTime: string; // ISO string
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  notes?: string;
}

export interface PublicBooking {
  id: string;
  bookingNumber: string;
  salonId: string;
  serviceId: string;
  serviceName: string;
  startTime: string;
  endTime: string;
  customerName: string;
  customerEmail?: string;
  customerPhone?: string;
  status: 'pending' | 'confirmed' | 'canceled';
  createdAt: string;
}

// In-memory storage for public bookings (simulating database)
let mockBookings: PublicBooking[] = [];

/**
 * Generate booking number
 */
const generateBookingNumber = (): string => {
  const timestamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).substr(2, 4).toUpperCase();
  return `BK-${timestamp}-${random}`;
};

/**
 * POST /public/bookings
 * Create a public booking
 */
export const createPublicBooking = async (
  request: PublicBookingRequest
): Promise<ApiResponse<{ booking: PublicBooking }>> => {
  return apiRequest(async () => {
    // Validate required fields
    if (!request.customerEmail && !request.customerPhone) {
      throw new Error('Either email or phone number is required');
    }

    // Validate time slot is in the future
    const startTime = new Date(request.startTime);
    const now = new Date();
    if (startTime <= now) {
      throw new Error('Cannot book appointments in the past');
    }

    // Check for conflicts against existing appointments in dashboard
    const existingAppointments = getAppointmentsArray();
    const conflictingAppointment = existingAppointments.find(
      (apt) =>
        apt.status !== 'canceled' &&
        apt.status !== 'no-show' &&
        new Date(apt.startTime).getTime() === startTime.getTime()
    );

    if (conflictingAppointment) {
      throw new Error('This time slot is no longer available');
    }

    // Also check against other public bookings
    const conflictingBooking = mockBookings.find(
      (b) =>
        b.salonId === request.salonId &&
        b.status !== 'canceled' &&
        new Date(b.startTime).getTime() === startTime.getTime()
    );

    if (conflictingBooking) {
      throw new Error('This time slot is no longer available');
    }

    // Get service details for duration and price
    const serviceResponse = await getPublicService(request.serviceId);
    const service = serviceResponse.data?.service;
    const serviceDuration = service?.duration || 60;
    const servicePrice = service?.price || 0;
    const serviceName = service?.name || 'Selected Service';

    // Calculate end time from service duration
    const endTime = new Date(startTime);
    endTime.setMinutes(endTime.getMinutes() + serviceDuration);

    const booking: PublicBooking = {
      id: `booking-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      bookingNumber: generateBookingNumber(),
      salonId: request.salonId,
      serviceId: request.serviceId,
      serviceName,
      startTime: startTime.toISOString(),
      endTime: endTime.toISOString(),
      customerName: request.customerName,
      customerEmail: request.customerEmail,
      customerPhone: request.customerPhone,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    // INTEGRATION: Create client and appointment in dashboard system
    // This ensures bookings from the widget appear in the Glowdesk dashboard
    // In production, this would be a backend transaction ensuring both are created together
    
    try {
      // Step 1: Find or create client in dashboard system
      let clientId: string;
      const existingClient = findClientByContact(request.customerEmail, request.customerPhone);

      if (existingClient) {
        clientId = existingClient.id;
      } else {
        // Create new client
        const nameParts = request.customerName.split(' ');
        const firstName = nameParts[0] || '';
        const lastName = nameParts.slice(1).join(' ') || '';
        const newClientId = `client-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        
        const newClient: Client = {
          id: newClientId,
          name: request.customerName,
          firstName,
          lastName,
          email: request.customerEmail || '',
          phone: request.customerPhone || '',
          tags: ['Online Booking'],
          notes: `Created via public booking widget. Booking #${booking.bookingNumber}`,
          createdAt: new Date().toISOString().split('T')[0],
        };

        addClientToDashboard(newClient);
        clientId = newClientId;
      }

      // Step 2: Create appointment in dashboard system
      // Use default staff (in real app, would assign based on availability/service)
      const defaultStaffId = 'staff-1'; // Would come from salon/service configuration

      const dashboardAppointment: Appointment = {
        id: `apt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        clientId,
        staffId: defaultStaffId,
        serviceIds: [request.serviceId],
        startTime,
        endTime,
        status: 'pending' as AppointmentStatus,
        notes: `Public booking: ${booking.bookingNumber}. ${request.notes || ''}`,
        hasUnreadMessages: false,
        isRecurring: false,
        depositPaid: false,
        totalPrice: servicePrice,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      // Add to dashboard appointments - NOW IT APPEARS IN THE DASHBOARD!
      addAppointmentToDashboard(dashboardAppointment);

    } catch (error) {
      // Log error but don't fail the booking creation
      // In production, this would rollback the transaction
      console.error('Error integrating booking with dashboard:', error);
    }

    // Store booking (in real app, would persist to database)
    mockBookings.push(booking);

    return { booking };
  });
};

/**
 * GET /public/bookings/:bookingNumber
 * Get booking by booking number (for confirmation page)
 */
export const getBookingByNumber = async (
  bookingNumber: string
): Promise<ApiResponse<{ booking: PublicBooking }>> => {
  return apiRequest(async () => {
    const booking = mockBookings.find((b) => b.bookingNumber === bookingNumber);

    if (!booking) {
      throw new Error('Booking not found');
    }

    return { booking };
  });
};
