import { create } from 'zustand';
import { CalendarView, Appointment, StaffMember, Service, Client } from '@/types/calendar';

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
  addAppointment: (appointment: Appointment) => void;
  updateAppointment: (id: string, updates: Partial<Appointment>) => void;
  deleteAppointment: (id: string) => void;
  moveAppointment: (id: string, newStartTime: Date, newStaffId?: string) => void;
  
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
  getAvailableTimeSlots: (date: Date, staffId: string, duration: number) => Date[];
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

  // Data actions
  addAppointment: (appointment) => 
    set((state) => ({ appointments: [...state.appointments, appointment] })),
  
  updateAppointment: (id, updates) =>
    set((state) => ({
      appointments: state.appointments.map((apt) =>
        apt.id === id ? { ...apt, ...updates, updatedAt: new Date() } : apt
      ),
    })),
  
  deleteAppointment: (id) =>
    set((state) => ({
      appointments: state.appointments.filter((apt) => apt.id !== id),
    })),
  
  moveAppointment: (id, newStartTime, newStaffId) => {
    const state = get();
    const appointment = state.appointments.find((apt) => apt.id === id);
    if (!appointment) return;
    
    const duration = appointment.endTime.getTime() - appointment.startTime.getTime();
    const newEndTime = new Date(newStartTime.getTime() + duration);
    
    state.updateAppointment(id, {
      startTime: newStartTime,
      endTime: newEndTime,
      staffId: newStaffId || appointment.staffId,
    });
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
    set({
      appointments: data.appointments,
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