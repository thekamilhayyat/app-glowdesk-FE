export type PermissionLevel = 'owner' | 'high' | 'medium' | 'low' | 'basic';

export type PayType = 'hourly' | 'salary' | 'commission' | 'hybrid';

export type CommissionType = 'percentage' | 'fixed' | 'tiered';

export type BreakType = 'paid' | 'unpaid';

export type TimesheetStatus = 'pending' | 'approved' | 'rejected';

export type SchedulePatternType = 'weekly' | 'biweekly' | 'rotating' | 'custom';

export interface PermissionTemplate {
  id: string;
  name: string;
  level: PermissionLevel;
  permissions: StaffPermissions;
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StaffPermissions {
  calendar: {
    view: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
    viewAllStaff: boolean;
  };
  clients: {
    view: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
    viewContactInfo: boolean;
    viewHistory: boolean;
  };
  services: {
    view: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
    managePricing: boolean;
  };
  inventory: {
    view: boolean;
    manage: boolean;
    adjustStock: boolean;
    viewCosts: boolean;
  };
  sales: {
    view: boolean;
    viewAllSales: boolean;
    applyDiscounts: boolean;
    processRefunds: boolean;
    viewReports: boolean;
  };
  staff: {
    view: boolean;
    create: boolean;
    edit: boolean;
    delete: boolean;
    manageSchedules: boolean;
    viewPayroll: boolean;
  };
  settings: {
    view: boolean;
    edit: boolean;
    manageBilling: boolean;
  };
  reports: {
    viewOwn: boolean;
    viewAll: boolean;
    export: boolean;
  };
}

export interface CommissionTier {
  id: string;
  minAmount: number;
  maxAmount: number | null;
  rate: number;
}

export interface CommissionPlan {
  id: string;
  name: string;
  type: CommissionType;
  rate?: number;
  tiers?: CommissionTier[];
  appliesToServices: boolean;
  appliesToProducts: boolean;
  serviceIds?: string[];
  productCategoryIds?: string[];
  isDefault: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface StaffCommission {
  staffId: string;
  commissionPlanId?: string;
  serviceCommissionRate?: number;
  productCommissionRate?: number;
  customServiceRates?: { serviceId: string; rate: number }[];
  customProductRates?: { categoryId: string; rate: number }[];
  useDefaultPlan: boolean;
}

export interface TimeEntry {
  id: string;
  staffId: string;
  date: string;
  clockIn: string;
  clockOut?: string;
  breaks: BreakEntry[];
  totalHours: number;
  overtimeHours: number;
  status: 'active' | 'completed';
  notes?: string;
  locationId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface BreakEntry {
  id: string;
  type: BreakType;
  startTime: string;
  endTime?: string;
  duration?: number;
}

export interface Timesheet {
  id: string;
  staffId: string;
  staffName: string;
  periodStart: string;
  periodEnd: string;
  entries: TimeEntry[];
  totalRegularHours: number;
  totalOvertimeHours: number;
  totalBreakHours: number;
  status: TimesheetStatus;
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface PayrollSummary {
  id: string;
  staffId: string;
  staffName: string;
  periodStart: string;
  periodEnd: string;
  regularHours: number;
  overtimeHours: number;
  hourlyRate?: number;
  salary?: number;
  serviceRevenue: number;
  serviceCommission: number;
  productRevenue: number;
  productCommission: number;
  totalCommission: number;
  tips: number;
  bonuses: number;
  deductions: number;
  grossPay: number;
  taxes?: number;
  netPay?: number;
  status: 'draft' | 'pending' | 'approved' | 'paid';
  paidAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SchedulePattern {
  id: string;
  staffId: string;
  patternType: SchedulePatternType;
  rotationWeeks?: number;
  startDate: string;
  endDate?: string;
  patterns: WeekPattern[];
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface WeekPattern {
  weekNumber: number;
  days: DaySchedule[];
}

export interface DaySchedule {
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  isWorking: boolean;
  shifts: Shift[];
}

export interface Shift {
  id: string;
  startTime: string;
  endTime: string;
  locationId?: string;
  breaks?: ScheduledBreak[];
}

export interface ScheduledBreak {
  startTime: string;
  duration: number;
  type: BreakType;
}

export interface TimeOffRequest {
  id: string;
  staffId: string;
  staffName: string;
  type: 'vacation' | 'sick' | 'personal' | 'other';
  startDate: string;
  endDate: string;
  allDay: boolean;
  startTime?: string;
  endTime?: string;
  reason?: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedAt?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

export interface StaffPricing {
  staffId: string;
  serviceId: string;
  customPrice?: number;
  customDuration?: number;
  isEnabled: boolean;
}

export interface PerformanceMetrics {
  staffId: string;
  periodStart: string;
  periodEnd: string;
  totalRevenue: number;
  serviceRevenue: number;
  productRevenue: number;
  appointmentsCompleted: number;
  appointmentsCancelled: number;
  newClients: number;
  returningClients: number;
  averageTicket: number;
  rebookingRate: number;
  utilizationRate: number;
  clientSatisfaction?: number;
}

export interface StaffGoal {
  id: string;
  staffId: string;
  name: string;
  type: 'revenue' | 'appointments' | 'clients' | 'products' | 'rebooking' | 'custom';
  targetValue: number;
  currentValue: number;
  periodType: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  startDate: string;
  endDate: string;
  status: 'active' | 'achieved' | 'missed' | 'cancelled';
  createdAt: string;
  updatedAt: string;
}

export interface StaffMember {
  id: string;
  firstName: string;
  lastName: string;
  displayName: string;
  email: string;
  phone?: string;
  avatar?: string;
  roleId: string;
  roleName: string;
  permissionLevel: PermissionLevel;
  permissionTemplateId?: string;
  customPermissions?: StaffPermissions;
  payType: PayType;
  hourlyRate?: number;
  salary?: number;
  commissionPlanId?: string;
  serviceCommissionRate?: number;
  productCommissionRate?: number;
  pin?: string;
  hireDate?: string;
  birthDate?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  services: string[];
  assignedLocations: string[];
  color: string;
  bio?: string;
  isActive: boolean;
  isOnline: boolean;
  lastClockIn?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Role {
  id: string;
  name: string;
  description?: string;
  defaultPermissionLevel: PermissionLevel;
  color?: string;
  order: number;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Location {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phone?: string;
  email?: string;
  timezone: string;
  businessHours: {
    [key: string]: { open: string; close: string; isClosed: boolean };
  };
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const DEFAULT_PERMISSIONS: Record<PermissionLevel, StaffPermissions> = {
  owner: {
    calendar: { view: true, create: true, edit: true, delete: true, viewAllStaff: true },
    clients: { view: true, create: true, edit: true, delete: true, viewContactInfo: true, viewHistory: true },
    services: { view: true, create: true, edit: true, delete: true, managePricing: true },
    inventory: { view: true, manage: true, adjustStock: true, viewCosts: true },
    sales: { view: true, viewAllSales: true, applyDiscounts: true, processRefunds: true, viewReports: true },
    staff: { view: true, create: true, edit: true, delete: true, manageSchedules: true, viewPayroll: true },
    settings: { view: true, edit: true, manageBilling: true },
    reports: { viewOwn: true, viewAll: true, export: true },
  },
  high: {
    calendar: { view: true, create: true, edit: true, delete: true, viewAllStaff: true },
    clients: { view: true, create: true, edit: true, delete: false, viewContactInfo: true, viewHistory: true },
    services: { view: true, create: true, edit: true, delete: false, managePricing: true },
    inventory: { view: true, manage: true, adjustStock: true, viewCosts: true },
    sales: { view: true, viewAllSales: true, applyDiscounts: true, processRefunds: true, viewReports: true },
    staff: { view: true, create: false, edit: true, delete: false, manageSchedules: true, viewPayroll: false },
    settings: { view: true, edit: false, manageBilling: false },
    reports: { viewOwn: true, viewAll: true, export: true },
  },
  medium: {
    calendar: { view: true, create: true, edit: true, delete: false, viewAllStaff: true },
    clients: { view: true, create: true, edit: true, delete: false, viewContactInfo: true, viewHistory: true },
    services: { view: true, create: false, edit: false, delete: false, managePricing: false },
    inventory: { view: true, manage: false, adjustStock: false, viewCosts: false },
    sales: { view: true, viewAllSales: true, applyDiscounts: true, processRefunds: false, viewReports: false },
    staff: { view: true, create: false, edit: false, delete: false, manageSchedules: false, viewPayroll: false },
    settings: { view: false, edit: false, manageBilling: false },
    reports: { viewOwn: true, viewAll: false, export: false },
  },
  low: {
    calendar: { view: true, create: true, edit: true, delete: false, viewAllStaff: false },
    clients: { view: true, create: true, edit: true, delete: false, viewContactInfo: true, viewHistory: true },
    services: { view: true, create: false, edit: false, delete: false, managePricing: false },
    inventory: { view: true, manage: false, adjustStock: false, viewCosts: false },
    sales: { view: true, viewAllSales: false, applyDiscounts: false, processRefunds: false, viewReports: false },
    staff: { view: false, create: false, edit: false, delete: false, manageSchedules: false, viewPayroll: false },
    settings: { view: false, edit: false, manageBilling: false },
    reports: { viewOwn: true, viewAll: false, export: false },
  },
  basic: {
    calendar: { view: true, create: false, edit: false, delete: false, viewAllStaff: false },
    clients: { view: true, create: false, edit: false, delete: false, viewContactInfo: false, viewHistory: false },
    services: { view: true, create: false, edit: false, delete: false, managePricing: false },
    inventory: { view: false, manage: false, adjustStock: false, viewCosts: false },
    sales: { view: false, viewAllSales: false, applyDiscounts: false, processRefunds: false, viewReports: false },
    staff: { view: false, create: false, edit: false, delete: false, manageSchedules: false, viewPayroll: false },
    settings: { view: false, edit: false, manageBilling: false },
    reports: { viewOwn: false, viewAll: false, export: false },
  },
};
