// Appointment type definitions
export type AppointmentStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'checked-in' 
  | 'in-progress' 
  | 'completed' 
  | 'canceled' 
  | 'no-show';

export interface Appointment {
  id: string;
  clientId: string;
  staffId: string;
  serviceIds: string[];
  startTime: Date;
  endTime: Date;
  status: AppointmentStatus;
  notes?: string;
  hasUnreadMessages: boolean;
  isRecurring: boolean;
  depositPaid: boolean;
  totalPrice: number;
  // Payment status from backend (trust backend response)
  // Backend returns uppercase: 'PENDING', 'PROCESSING', 'SUCCEEDED', 'FAILED', 'CANCELED'
  paymentStatus?: 'PENDING' | 'PROCESSING' | 'SUCCEEDED' | 'FAILED' | 'CANCELED';
  createdAt: Date;
  updatedAt: Date;
}
