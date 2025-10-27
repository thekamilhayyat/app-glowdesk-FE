import { create } from 'zustand';
import { CalendarView, CalendarConflictResult } from '@/types/calendar';
import { Appointment, AppointmentStatus } from '@/types/appointment';
import { StaffMember } from '@/types/staff';
import { Service } from '@/types/service';
import { Client } from '@/types/client';

interface CalendarState {
  // View state
  currentView: CalendarView;
  currentDate: Date;
  selectedStaffIds: string[];
  
  // Data
  appointments: Appointment[];
  staff: StaffMember[];
  services: Service[];
  clients: Client[];
  
  // UI state
  isLoading: boolean;
  selectedAppointment: Appointment | null;
  draggedAppointment: Appointment | null;
  
  // Actions
  setCurrentView: (view: CalendarView) => void;
  setCurrentDate: (date: Date) => void;
  setSelectedStaffIds: (staffIds: string[]) => void;
  setSelectedAppointment: (appointment: Appointment | null) => void;
  setDraggedAppointment: (appointment: Appointment | null) => void;
  
  // Data actions
  addAppointment: (appointment: Appointment) => CalendarConflictResult;
  updateAppointment: (id: string, updates: Partial<Appointment>) => CalendarConflictResult;
  deleteAppointment: (id: string) => void;
  moveAppointment: (id: string, newStartTime: Date, newStaffId?: string) => CalendarConflictResult;
  addClient: (client: Client) => void;
  
  // Navigation
  navigatePrevious: () => void;
  navigateNext: () => void;
  goToToday: () => void;

  // Data initialization
  initializeData: (data: { appointments: Appointment[]; staff: StaffMember[]; services: Service[]; clients: Client[] }) => void;
  
  // Helpers
  getAppointmentsForDay: (date: Date, staffId?: string) => Appointment[];
  getAppointmentsForWeek: (startDate: Date, staffId?: string) => Appointment[];
  getAppointmentsForMonth: (date: Date) => Appointment[];
  getAppointmentsByClient: (clientId: string) => Appointment[];
  getAvailableTimeSlots: (date: Date, staffId: string, duration: number) => Date[];
  
  // Overlap validation
  overlaps: (aStart: Date, aEnd: Date, bStart: Date, bEnd: Date) => boolean;
  findConflicts: (staffId: string, start: Date, end: Date, excludeId?: string) => Appointment[];
  canSchedule: (staffId: string, start: Date, end: Date, excludeId?: string) => boolean;
  isTimeRangeAvailable: (date: Date, staffId: string, start: Date, end: Date, excludeId?: string) => boolean;
}

export const useCalendarStore = create<CalendarState>((set, get) => ({
  // Initial state
  currentView: 'day',
  currentDate: new Date(),
  selectedStaffIds: [],
  appointments: [],
  staff: [],
  services: [],
  clients: [],
  isLoading: false,
  selectedAppointment: null,
  draggedAppointment: null,

  // View actions
  setCurrentView: (view) => set({ currentView: view }),
  setCurrentDate: (date) => set({ currentDate: date }),
  setSelectedStaffIds: (staffIds) => set({ selectedStaffIds: staffIds }),
  setSelectedAppointment: (appointment) => set({ selectedAppointment: appointment }),
  setDraggedAppointment: (appointment) => set({ draggedAppointment: appointment }),

  // Overlap validation helpers
  overlaps: (aStart, aEnd, bStart, bEnd) => {
    return aStart.getTime() < bEnd.getTime() && aEnd.getTime() > bStart.getTime();
  },

  findConflicts: (staffId, start, end, excludeId) => {
    const state = get();
    return state.appointments.filter((apt) => {
      if (excludeId && apt.id === excludeId) return false;
      if (apt.staffId !== staffId) return false;
      return state.overlaps(start, end, apt.startTime, apt.endTime);
    });
  },

  canSchedule: (staffId, start, end, excludeId) => {
    const state = get();
    return state.findConflicts(staffId, start, end, excludeId).length === 0;
  },

  isTimeRangeAvailable: (date, staffId, start, end, excludeId) => {
    const state = get();
    return state.canSchedule(staffId, start, end, excludeId);
  },

  // Data actions
  addAppointment: (appointment) => {
    const state = get();
    
    // Check if appointment with this ID already exists
    if (state.appointments.some(apt => apt.id === appointment.id)) {
      return {
        ok: false,
        message: 'Appointment with this ID already exists'
      };
    }
    
    if (!state.canSchedule(appointment.staffId, appointment.startTime, appointment.endTime)) {
      const conflicts = state.findConflicts(appointment.staffId, appointment.startTime, appointment.endTime);
      const clientName = conflicts.length > 0 ? state.clients.find(c => c.id === conflicts[0].clientId)?.firstName || 'Unknown' : 'Unknown';
      return {
        ok: false,
        conflicts,
        message: `Conflict with ${clientName}'s appointment`
      };
    }
    set((state) => ({ appointments: [...state.appointments, appointment] }));
    return { ok: true };
  },
  
  updateAppointment: (id, updates) => {
    const state = get();
    const currentApt = state.appointments.find(apt => apt.id === id);
    if (!currentApt) return { ok: false, message: 'Appointment not found' };
    
    // Calculate new times if time-related updates are provided
    const newStartTime = updates.startTime || currentApt.startTime;
    const newEndTime = updates.endTime || currentApt.endTime;
    const newStaffId = updates.staffId || currentApt.staffId;
    
    if (!state.canSchedule(newStaffId, newStartTime, newEndTime, id)) {
      const conflicts = state.findConflicts(newStaffId, newStartTime, newEndTime, id);
      const clientName = conflicts.length > 0 ? state.clients.find(c => c.id === conflicts[0].clientId)?.firstName || 'Unknown' : 'Unknown';
      return {
        ok: false,
        conflicts,
        message: `Conflict with ${clientName}'s appointment`
      };
    }
    
    set((state) => ({
      appointments: state.appointments.map((apt) =>
        apt.id === id ? { ...apt, ...updates, updatedAt: new Date() } : apt
      ),
    }));
    return { ok: true };
  },
  
  deleteAppointment: (id) =>
    set((state) => ({
      appointments: state.appointments.filter((apt) => apt.id !== id),
    })),

  addClient: (client) =>
    set((state) => ({
      clients: [...state.clients, client],
    })),
  
  moveAppointment: (id, newStartTime, newStaffId) => {
    const state = get();
    const appointment = state.appointments.find((apt) => apt.id === id);
    if (!appointment) {
      return { ok: false, message: 'Appointment not found' };
    }
    
    const duration = appointment.endTime.getTime() - appointment.startTime.getTime();
    const newEndTime = new Date(newStartTime.getTime() + duration);
    const targetStaffId = newStaffId || appointment.staffId;
    
    if (!state.canSchedule(targetStaffId, newStartTime, newEndTime, id)) {
      const conflicts = state.findConflicts(targetStaffId, newStartTime, newEndTime, id);
      const clientName = conflicts.length > 0 ? state.clients.find(c => c.id === conflicts[0].clientId)?.firstName || 'Unknown' : 'Unknown';
      return {
        ok: false,
        conflicts,
        message: `Cannot move: Conflict with ${clientName}'s appointment`
      };
    }
    
    const result = state.updateAppointment(id, {
      startTime: newStartTime,
      endTime: newEndTime,
      staffId: targetStaffId,
    });
    return result;
  },

  // Navigation
  navigatePrevious: () => {
    const { currentView, currentDate } = get();
    const newDate = new Date(currentDate);
    
    switch (currentView) {
      case 'day':
        newDate.setDate(newDate.getDate() - 1);
        break;
      case 'week':
        newDate.setDate(newDate.getDate() - 7);
        break;
      case 'month':
        newDate.setMonth(newDate.getMonth() - 1);
        break;
    }
    
    set({ currentDate: newDate });
  },

  navigateNext: () => {
    const { currentView, currentDate } = get();
    const newDate = new Date(currentDate);
    
    switch (currentView) {
      case 'day':
        newDate.setDate(newDate.getDate() + 1);
        break;
      case 'week':
        newDate.setDate(newDate.getDate() + 7);
        break;
      case 'month':
        newDate.setMonth(newDate.getMonth() + 1);
        break;
    }
    
    set({ currentDate: newDate });
  },

  goToToday: () => set({ currentDate: new Date() }),

  // Data initialization
  initializeData: (data) => {
    // Deduplicate appointments by ID to prevent duplicate entries
    const uniqueAppointments = Array.from(
      new Map(data.appointments.map(apt => [apt.id, apt])).values()
    );
    
    set({
      appointments: uniqueAppointments,
      staff: data.staff,
      services: data.services,
      clients: data.clients,
    });
  },

  // Helper functions
  getAppointmentsForDay: (date, staffId) => {
    const { appointments } = get();
    return appointments.filter((apt) => {
      const aptDate = new Date(apt.startTime);
      const isSameDay = aptDate.toDateString() === date.toDateString();
      const matchesStaff = !staffId || apt.staffId === staffId;
      return isSameDay && matchesStaff;
    });
  },

  getAppointmentsForWeek: (startDate, staffId) => {
    const { appointments } = get();
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + 7);
    
    return appointments.filter((apt) => {
      const aptDate = new Date(apt.startTime);
      const isInWeek = aptDate >= startDate && aptDate < endDate;
      const matchesStaff = !staffId || apt.staffId === staffId;
      return isInWeek && matchesStaff;
    });
  },

  getAppointmentsForMonth: (date) => {
    const { appointments } = get();
    const startOfMonth = new Date(date.getFullYear(), date.getMonth(), 1);
    const endOfMonth = new Date(date.getFullYear(), date.getMonth() + 1, 0);
    
    return appointments.filter((apt) => {
      const aptDate = new Date(apt.startTime);
      return aptDate >= startOfMonth && aptDate <= endOfMonth;
    });
  },

  getAppointmentsByClient: (clientId) => {
    const { appointments } = get();
    return appointments
      .filter((apt) => apt.clientId === clientId)
      .sort((a, b) => b.startTime.getTime() - a.startTime.getTime()); // Most recent first
  },

  getAvailableTimeSlots: (date, staffId, duration) => {
    const { appointments } = get();
    const dayAppointments = appointments.filter((apt) => {
      const aptDate = new Date(apt.startTime);
      return aptDate.toDateString() === date.toDateString() && apt.staffId === staffId;
    });

    const slots: Date[] = [];
    const startHour = 9; // 9 AM
    const endHour = 18; // 6 PM
    const slotInterval = 15; // 15 minutes

    for (let hour = startHour; hour < endHour; hour++) {
      for (let minute = 0; minute < 60; minute += slotInterval) {
        const slotStart = new Date(date);
        slotStart.setHours(hour, minute, 0, 0);
        const slotEnd = new Date(slotStart.getTime() + duration * 60000);

        // Check if this slot conflicts with existing appointments
        const hasConflict = dayAppointments.some((apt) => {
          return (slotStart < apt.endTime && slotEnd > apt.startTime);
        });

        if (!hasConflict && slotEnd.getHours() <= endHour) {
          slots.push(slotStart);
        }
      }
    }

    return slots;
  },
}));