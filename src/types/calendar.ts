// Calendar view and utility type definitions
import { Appointment } from './appointment';

export type CalendarView = 'day' | 'week' | 'month';

export interface CalendarTimeSlot {
  time: string;
  staffId: string;
  isAvailable: boolean;
  appointmentId?: string;
}

export interface DragDropData {
  appointmentId: string;
  originalStaffId: string;
  originalStartTime: Date;
  newStaffId?: string;
  newStartTime?: Date;
}

export interface CalendarConflictResult {
  ok: boolean;
  conflicts?: Appointment[];
  message?: string;
}
