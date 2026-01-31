/**
 * Public Availability API endpoints
 * Mock implementation for public booking widget
 */

import { apiRequest, ApiResponse } from '../client';
import { addDays, format, isAfter, isBefore, setHours, setMinutes, addMinutes } from 'date-fns';
// Import dashboard appointments to check real availability
import { getAppointmentsArray } from '../appointments.api';

export interface TimeSlot {
  startTime: string; // ISO string
  endTime: string; // ISO string
  available: boolean;
  staffId?: string;
  staffName?: string;
}

export interface AvailabilityRequest {
  salonId: string;
  serviceId: string;
  date: string; // YYYY-MM-DD
}

export interface AvailabilityResponse {
  date: string;
  slots: TimeSlot[];
}

/**
 * Generate available time slots for a service on a given date
 */
const generateTimeSlots = (
  date: Date,
  serviceDuration: number,
  businessHours: { open: string; close: string; isClosed: boolean }
): TimeSlot[] => {
  if (businessHours.isClosed) {
    return [];
  }

  const slots: TimeSlot[] = [];
  const [openHour, openMinute] = businessHours.open.split(':').map(Number);
  const [closeHour, closeMinute] = businessHours.close.split(':').map(Number);

  const dayStart = setMinutes(setHours(date, openHour), openMinute);
  const dayEnd = setMinutes(setHours(date, closeHour), closeMinute);

  // Generate slots every 15 minutes
  let currentTime = new Date(dayStart);
  while (currentTime.getTime() + serviceDuration * 60000 <= dayEnd.getTime()) {
    const slotEnd = addMinutes(currentTime, serviceDuration);

    // Mock availability (80% chance of being available)
    const available = Math.random() > 0.2;

    slots.push({
      startTime: currentTime.toISOString(),
      endTime: slotEnd.toISOString(),
      available,
      staffId: 'staff-1',
      staffName: 'Available Stylist',
    });

    // Move to next 15-minute slot
    currentTime = addMinutes(currentTime, 15);
  }

  return slots;
};

/**
 * GET /public/availability
 * Get available time slots for a service on a specific date
 */
export const getAvailability = async (
  request: AvailabilityRequest
): Promise<ApiResponse<AvailabilityResponse>> => {
  return apiRequest(async () => {
    const targetDate = new Date(request.date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Don't allow booking in the past
    if (isBefore(targetDate, today)) {
      throw new Error('Cannot book appointments in the past');
    }

    // Mock: Get service duration (would come from service lookup)
    const serviceDuration = 60; // Default 60 minutes

    // Mock business hours (would come from salon lookup)
    const businessHours = {
      open: '09:00',
      close: '18:00',
      isClosed: false,
    };

    // Check if salon is closed on this day
    const dayOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][
      targetDate.getDay()
    ];

    // Mock: Check if closed (would come from salon business hours)
    if (dayOfWeek === 'sunday' && Math.random() > 0.5) {
      return {
        date: request.date,
        slots: [],
      };
    }

    // INTEGRATION: Check against existing appointments in dashboard
    // This ensures availability reflects real bookings
    const existingAppointments = getAppointmentsArray();
    const targetDateStr = format(targetDate, 'yyyy-MM-dd');
    
    const bookedSlots = new Set<string>();
    existingAppointments.forEach((apt) => {
      const aptStart = new Date(apt.startTime);
      const aptDateStr = format(aptStart, 'yyyy-MM-dd');
      
      // Check if appointment is on the target date and is active
      if (
        aptDateStr === targetDateStr &&
        apt.status !== 'canceled' &&
        apt.status !== 'no-show'
      ) {
        bookedSlots.add(format(aptStart, 'HH:mm'));
      }
    });

    const slots = generateTimeSlots(targetDate, serviceDuration, businessHours);
    
    // Mark slots as unavailable if they conflict with existing appointments
    slots.forEach((slot) => {
      const slotTime = format(new Date(slot.startTime), 'HH:mm');
      if (bookedSlots.has(slotTime)) {
        slot.available = false;
      }
    });

    return {
      date: request.date,
      slots,
    };
  });
};

/**
 * GET /public/availability/calendar
 * Get availability calendar for a service (multiple dates)
 */
export const getAvailabilityCalendar = async (
  salonId: string,
  serviceId: string,
  startDate: string,
  days: number = 30
): Promise<ApiResponse<{ dates: AvailabilityResponse[] }>> => {
  return apiRequest(async () => {
    const start = new Date(startDate);
    const dates: AvailabilityResponse[] = [];

    for (let i = 0; i < days; i++) {
      const date = addDays(start, i);
      const dateStr = format(date, 'yyyy-MM-dd');

      try {
        const response = await getAvailability({
          salonId,
          serviceId,
          date: dateStr,
        });

        if (!response.error && response.data) {
          dates.push(response.data);
        }
      } catch (error) {
        // Skip dates with errors
        dates.push({
          date: dateStr,
          slots: [],
        });
      }
    }

    return { dates };
  });
};
