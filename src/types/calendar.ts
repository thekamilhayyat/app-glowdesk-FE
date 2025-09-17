// Calendar and appointment type definitions for salon management
export type AppointmentStatus = 
  | 'pending' 
  | 'confirmed' 
  | 'checked-in' 
  | 'in-progress' 
  | 'completed' 
  | 'canceled' 
  | 'no-show';

export type CalendarView = 'day' | 'week' | 'month';

export type ServiceCategory = 'hair' | 'nails' | 'facial' | 'massage' | 'waxing' | 'other';

export interface Service {
  id: string;
  name: string;
  category: ServiceCategory;
  duration: number; // in minutes
  price: number;
  description?: string;
}

export interface Client {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  isNew: boolean;
  isMember: boolean;
  preferredStaff?: string;
  genderPreference?: 'male' | 'female' | 'no-preference';
  notes?: string;
}

export interface StaffMember {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  services: string[]; // service IDs they can perform
  isActive: boolean;
  color: string; // for calendar display
}

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
  createdAt: Date;
  updatedAt: Date;
}

export interface CheckoutItem {
  id: string;
  type: 'service' | 'product';
  name: string;
  price: number;
  quantity: number;
  staffId?: string;
  discount?: {
    type: 'percentage' | 'fixed';
    value: number;
  };
}

export interface CheckoutSession {
  id: string;
  appointmentId: string;
  clientId: string;
  items: CheckoutItem[];
  subtotal: number;
  totalDiscount: number;
  tax: number;
  tip: number;
  total: number;
  paymentMethods: PaymentMethod[];
  status: 'draft' | 'processing' | 'completed' | 'failed';
  createdAt: Date;
}

export interface PaymentMethod {
  id: string;
  type: 'cash' | 'credit-card' | 'gift-card' | 'check' | 'online';
  amount: number;
  reference?: string; // card last 4, gift card number, etc.
}

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