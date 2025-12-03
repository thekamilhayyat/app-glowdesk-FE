import { create } from 'zustand';
import {
  StaffMember,
  Role,
  Location,
  CommissionPlan,
  TimeEntry,
  Timesheet,
  PayrollSummary,
  SchedulePattern,
  TimeOffRequest,
  StaffPricing,
  PerformanceMetrics,
  StaffGoal,
  PermissionTemplate,
  DEFAULT_PERMISSIONS,
  BreakEntry,
} from '@/types/staff';

interface StaffFilters {
  roleId?: string;
  locationId?: string;
  isActive?: boolean;
  searchTerm?: string;
}

interface StaffState {
  staff: StaffMember[];
  roles: Role[];
  locations: Location[];
  commissionPlans: CommissionPlan[];
  timeEntries: TimeEntry[];
  timesheets: Timesheet[];
  payrollSummaries: PayrollSummary[];
  schedulePatterns: SchedulePattern[];
  timeOffRequests: TimeOffRequest[];
  staffPricing: StaffPricing[];
  performanceMetrics: PerformanceMetrics[];
  staffGoals: StaffGoal[];
  permissionTemplates: PermissionTemplate[];
  
  isLoading: boolean;
  error: string | null;
  selectedStaffId: string | null;

  addStaff: (staff: StaffMember) => void;
  updateStaff: (id: string, updates: Partial<StaffMember>) => void;
  deleteStaff: (id: string) => void;
  getStaffById: (id: string) => StaffMember | undefined;
  getFilteredStaff: (filters: StaffFilters) => StaffMember[];
  setSelectedStaff: (id: string | null) => void;

  addRole: (role: Role) => void;
  updateRole: (id: string, updates: Partial<Role>) => void;
  deleteRole: (id: string) => void;
  getRoleById: (id: string) => Role | undefined;

  addLocation: (location: Location) => void;
  updateLocation: (id: string, updates: Partial<Location>) => void;
  deleteLocation: (id: string) => void;
  getLocationById: (id: string) => Location | undefined;

  addCommissionPlan: (plan: CommissionPlan) => void;
  updateCommissionPlan: (id: string, updates: Partial<CommissionPlan>) => void;
  deleteCommissionPlan: (id: string) => void;
  getCommissionPlanById: (id: string) => CommissionPlan | undefined;
  calculateCommission: (staffId: string, revenue: number, type: 'service' | 'product') => number;

  clockIn: (staffId: string, locationId?: string) => TimeEntry;
  clockOut: (staffId: string, notes?: string) => TimeEntry | null;
  startBreak: (staffId: string, type: 'paid' | 'unpaid') => void;
  endBreak: (staffId: string) => void;
  getActiveTimeEntry: (staffId: string) => TimeEntry | undefined;
  getTimeEntriesForPeriod: (staffId: string, start: string, end: string) => TimeEntry[];

  generateTimesheet: (staffId: string, periodStart: string, periodEnd: string) => Timesheet;
  approveTimesheet: (id: string, approvedBy: string) => void;
  rejectTimesheet: (id: string, reason: string) => void;
  getTimesheetById: (id: string) => Timesheet | undefined;
  getTimesheetsForStaff: (staffId: string) => Timesheet[];

  generatePayrollSummary: (staffId: string, periodStart: string, periodEnd: string) => PayrollSummary;
  approvePayroll: (id: string) => void;
  markPayrollPaid: (id: string) => void;
  getPayrollSummaryById: (id: string) => PayrollSummary | undefined;

  addSchedulePattern: (pattern: SchedulePattern) => void;
  updateSchedulePattern: (id: string, updates: Partial<SchedulePattern>) => void;
  deleteSchedulePattern: (id: string) => void;
  getActiveSchedulePattern: (staffId: string) => SchedulePattern | undefined;

  requestTimeOff: (request: Omit<TimeOffRequest, 'id' | 'status' | 'createdAt' | 'updatedAt'>) => TimeOffRequest;
  approveTimeOff: (id: string, approvedBy: string) => void;
  rejectTimeOff: (id: string, reason: string) => void;
  getTimeOffRequestsForStaff: (staffId: string) => TimeOffRequest[];
  getPendingTimeOffRequests: () => TimeOffRequest[];

  setStaffPricing: (pricing: StaffPricing) => void;
  getStaffPricing: (staffId: string, serviceId: string) => StaffPricing | undefined;
  getStaffPricingForService: (serviceId: string) => StaffPricing[];

  updatePerformanceMetrics: (metrics: PerformanceMetrics) => void;
  getPerformanceMetrics: (staffId: string, periodStart: string, periodEnd: string) => PerformanceMetrics | undefined;

  addStaffGoal: (goal: Omit<StaffGoal, 'id' | 'createdAt' | 'updatedAt'>) => StaffGoal;
  updateStaffGoal: (id: string, updates: Partial<StaffGoal>) => void;
  getStaffGoals: (staffId: string) => StaffGoal[];
  updateGoalProgress: (goalId: string, currentValue: number) => void;

  addPermissionTemplate: (template: Omit<PermissionTemplate, 'id' | 'createdAt' | 'updatedAt'>) => PermissionTemplate;
  updatePermissionTemplate: (id: string, updates: Partial<PermissionTemplate>) => void;
  deletePermissionTemplate: (id: string) => void;
  getPermissionTemplateById: (id: string) => PermissionTemplate | undefined;
}

const generateId = () => `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const useStaffStore = create<StaffState>((set, get) => ({
  staff: [
    {
      id: 'staff_1',
      firstName: 'Emma',
      lastName: 'Johnson',
      displayName: 'Emma Johnson',
      email: 'emma@glowflowapp.com',
      phone: '+1-555-0101',
      roleId: 'role_1',
      roleName: 'Hair Stylist',
      permissionLevel: 'low',
      payType: 'hybrid',
      hourlyRate: 15,
      serviceCommissionRate: 45,
      productCommissionRate: 10,
      services: ['SRV001', 'SRV002'],
      assignedLocations: ['loc_1'],
      color: '#8B5CF6',
      isActive: true,
      isOnline: false,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    {
      id: 'staff_2',
      firstName: 'Michael',
      lastName: 'Chen',
      displayName: 'Michael Chen',
      email: 'michael@glowflowapp.com',
      phone: '+1-555-0102',
      roleId: 'role_2',
      roleName: 'Colorist',
      permissionLevel: 'low',
      payType: 'commission',
      serviceCommissionRate: 50,
      productCommissionRate: 15,
      services: ['SRV001', 'SRV002'],
      assignedLocations: ['loc_1'],
      color: '#EC4899',
      isActive: true,
      isOnline: false,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    {
      id: 'staff_3',
      firstName: 'Sarah',
      lastName: 'Williams',
      displayName: 'Sarah Williams',
      email: 'sarah@glowflowapp.com',
      phone: '+1-555-0103',
      roleId: 'role_4',
      roleName: 'Nail Technician',
      permissionLevel: 'low',
      payType: 'hourly',
      hourlyRate: 18,
      productCommissionRate: 5,
      services: ['SRV003'],
      assignedLocations: ['loc_1'],
      color: '#10B981',
      isActive: true,
      isOnline: false,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
  ],
  roles: [
    { id: 'role_1', name: 'Hair Stylist', defaultPermissionLevel: 'low', order: 1, isSystem: false, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
    { id: 'role_2', name: 'Colorist', defaultPermissionLevel: 'low', order: 2, isSystem: false, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
    { id: 'role_3', name: 'Receptionist', defaultPermissionLevel: 'medium', order: 3, isSystem: false, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
    { id: 'role_4', name: 'Nail Technician', defaultPermissionLevel: 'low', order: 4, isSystem: false, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
    { id: 'role_5', name: 'Esthetician', defaultPermissionLevel: 'low', order: 5, isSystem: false, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
    { id: 'role_6', name: 'Manager', defaultPermissionLevel: 'high', order: 6, isSystem: true, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  ],
  locations: [
    {
      id: 'loc_1',
      name: 'Main Salon',
      address: '123 Beauty Lane',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90001',
      country: 'USA',
      phone: '+1-555-0100',
      timezone: 'America/Los_Angeles',
      businessHours: {
        mon: { open: '09:00', close: '19:00', isClosed: false },
        tue: { open: '09:00', close: '19:00', isClosed: false },
        wed: { open: '09:00', close: '19:00', isClosed: false },
        thu: { open: '09:00', close: '21:00', isClosed: false },
        fri: { open: '09:00', close: '21:00', isClosed: false },
        sat: { open: '09:00', close: '18:00', isClosed: false },
        sun: { open: '10:00', close: '16:00', isClosed: false },
      },
      isDefault: true,
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
  ],
  commissionPlans: [
    {
      id: 'comm_1',
      name: 'Standard Commission',
      type: 'percentage',
      rate: 40,
      appliesToServices: true,
      appliesToProducts: true,
      isDefault: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    {
      id: 'comm_2',
      name: 'Senior Stylist Tiered',
      type: 'tiered',
      tiers: [
        { id: 't1', minAmount: 0, maxAmount: 5000, rate: 40 },
        { id: 't2', minAmount: 5000, maxAmount: 10000, rate: 45 },
        { id: 't3', minAmount: 10000, maxAmount: null, rate: 50 },
      ],
      appliesToServices: true,
      appliesToProducts: false,
      isDefault: false,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
  ],
  timeEntries: [],
  timesheets: [],
  payrollSummaries: [],
  schedulePatterns: [],
  timeOffRequests: [],
  staffPricing: [],
  performanceMetrics: [],
  staffGoals: [],
  permissionTemplates: [
    {
      id: 'perm_1',
      name: 'Owner',
      level: 'owner',
      permissions: DEFAULT_PERMISSIONS.owner,
      isDefault: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    {
      id: 'perm_2',
      name: 'Manager',
      level: 'high',
      permissions: DEFAULT_PERMISSIONS.high,
      isDefault: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    {
      id: 'perm_3',
      name: 'Receptionist',
      level: 'medium',
      permissions: DEFAULT_PERMISSIONS.medium,
      isDefault: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    {
      id: 'perm_4',
      name: 'Service Provider',
      level: 'low',
      permissions: DEFAULT_PERMISSIONS.low,
      isDefault: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
  ],
  isLoading: false,
  error: null,
  selectedStaffId: null,

  addStaff: (staff) => {
    set((state) => ({ staff: [...state.staff, staff] }));
  },

  updateStaff: (id, updates) => {
    set((state) => ({
      staff: state.staff.map((s) =>
        s.id === id ? { ...s, ...updates, updatedAt: new Date().toISOString() } : s
      ),
    }));
  },

  deleteStaff: (id) => {
    set((state) => ({ staff: state.staff.filter((s) => s.id !== id) }));
  },

  getStaffById: (id) => get().staff.find((s) => s.id === id),

  getFilteredStaff: (filters) => {
    let result = get().staff;
    
    if (filters.roleId) {
      result = result.filter((s) => s.roleId === filters.roleId);
    }
    if (filters.locationId) {
      result = result.filter((s) => s.assignedLocations.includes(filters.locationId!));
    }
    if (filters.isActive !== undefined) {
      result = result.filter((s) => s.isActive === filters.isActive);
    }
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      result = result.filter((s) =>
        s.displayName.toLowerCase().includes(term) ||
        s.email.toLowerCase().includes(term)
      );
    }
    
    return result;
  },

  setSelectedStaff: (id) => set({ selectedStaffId: id }),

  addRole: (role) => {
    set((state) => ({ roles: [...state.roles, role] }));
  },

  updateRole: (id, updates) => {
    set((state) => ({
      roles: state.roles.map((r) =>
        r.id === id ? { ...r, ...updates, updatedAt: new Date().toISOString() } : r
      ),
    }));
  },

  deleteRole: (id) => {
    set((state) => ({ roles: state.roles.filter((r) => r.id !== id) }));
  },

  getRoleById: (id) => get().roles.find((r) => r.id === id),

  addLocation: (location) => {
    set((state) => ({ locations: [...state.locations, location] }));
  },

  updateLocation: (id, updates) => {
    set((state) => ({
      locations: state.locations.map((l) =>
        l.id === id ? { ...l, ...updates, updatedAt: new Date().toISOString() } : l
      ),
    }));
  },

  deleteLocation: (id) => {
    set((state) => ({ locations: state.locations.filter((l) => l.id !== id) }));
  },

  getLocationById: (id) => get().locations.find((l) => l.id === id),

  addCommissionPlan: (plan) => {
    set((state) => ({ commissionPlans: [...state.commissionPlans, plan] }));
  },

  updateCommissionPlan: (id, updates) => {
    set((state) => ({
      commissionPlans: state.commissionPlans.map((p) =>
        p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
      ),
    }));
  },

  deleteCommissionPlan: (id) => {
    set((state) => ({ commissionPlans: state.commissionPlans.filter((p) => p.id !== id) }));
  },

  getCommissionPlanById: (id) => get().commissionPlans.find((p) => p.id === id),

  calculateCommission: (staffId, revenue, type) => {
    const staff = get().getStaffById(staffId);
    if (!staff) return 0;

    const rate = type === 'service' 
      ? staff.serviceCommissionRate 
      : staff.productCommissionRate;
    
    if (rate) {
      return revenue * (rate / 100);
    }

    if (staff.commissionPlanId) {
      const plan = get().getCommissionPlanById(staff.commissionPlanId);
      if (plan) {
        if (plan.type === 'percentage' && plan.rate) {
          return revenue * (plan.rate / 100);
        }
        if (plan.type === 'tiered' && plan.tiers) {
          let commission = 0;
          let remaining = revenue;
          for (const tier of plan.tiers.sort((a, b) => a.minAmount - b.minAmount)) {
            if (remaining <= 0) break;
            const tierMax = tier.maxAmount ?? Infinity;
            const tierRange = tierMax - tier.minAmount;
            const amountInTier = Math.min(remaining, tierRange);
            commission += amountInTier * (tier.rate / 100);
            remaining -= amountInTier;
          }
          return commission;
        }
      }
    }

    const defaultPlan = get().commissionPlans.find((p) => p.isDefault);
    if (defaultPlan && defaultPlan.rate) {
      return revenue * (defaultPlan.rate / 100);
    }

    return 0;
  },

  clockIn: (staffId, locationId) => {
    const now = new Date().toISOString();
    const entry: TimeEntry = {
      id: `time_${generateId()}`,
      staffId,
      date: now.split('T')[0],
      clockIn: now,
      breaks: [],
      totalHours: 0,
      overtimeHours: 0,
      status: 'active',
      locationId,
      createdAt: now,
      updatedAt: now,
    };
    
    set((state) => ({
      timeEntries: [...state.timeEntries, entry],
      staff: state.staff.map((s) =>
        s.id === staffId ? { ...s, isOnline: true, lastClockIn: now } : s
      ),
    }));
    
    return entry;
  },

  clockOut: (staffId, notes) => {
    const activeEntry = get().getActiveTimeEntry(staffId);
    if (!activeEntry) return null;

    const now = new Date();
    const clockIn = new Date(activeEntry.clockIn);
    const totalBreakMs = activeEntry.breaks.reduce((sum, b) => {
      if (b.endTime) {
        return sum + (new Date(b.endTime).getTime() - new Date(b.startTime).getTime());
      }
      return sum;
    }, 0);
    
    const totalMs = now.getTime() - clockIn.getTime() - totalBreakMs;
    const totalHours = totalMs / (1000 * 60 * 60);
    const overtimeHours = Math.max(0, totalHours - 8);

    const updatedEntry: TimeEntry = {
      ...activeEntry,
      clockOut: now.toISOString(),
      totalHours: Math.round(totalHours * 100) / 100,
      overtimeHours: Math.round(overtimeHours * 100) / 100,
      status: 'completed',
      notes,
      updatedAt: now.toISOString(),
    };

    set((state) => ({
      timeEntries: state.timeEntries.map((e) =>
        e.id === activeEntry.id ? updatedEntry : e
      ),
      staff: state.staff.map((s) =>
        s.id === staffId ? { ...s, isOnline: false } : s
      ),
    }));

    return updatedEntry;
  },

  startBreak: (staffId, type) => {
    const activeEntry = get().getActiveTimeEntry(staffId);
    if (!activeEntry) return;

    const breakEntry: BreakEntry = {
      id: `break_${generateId()}`,
      type,
      startTime: new Date().toISOString(),
    };

    set((state) => ({
      timeEntries: state.timeEntries.map((e) =>
        e.id === activeEntry.id
          ? { ...e, breaks: [...e.breaks, breakEntry], updatedAt: new Date().toISOString() }
          : e
      ),
    }));
  },

  endBreak: (staffId) => {
    const activeEntry = get().getActiveTimeEntry(staffId);
    if (!activeEntry) return;

    const now = new Date();
    const activeBreak = activeEntry.breaks.find((b) => !b.endTime);
    if (!activeBreak) return;

    const duration = (now.getTime() - new Date(activeBreak.startTime).getTime()) / (1000 * 60);

    set((state) => ({
      timeEntries: state.timeEntries.map((e) =>
        e.id === activeEntry.id
          ? {
              ...e,
              breaks: e.breaks.map((b) =>
                b.id === activeBreak.id
                  ? { ...b, endTime: now.toISOString(), duration: Math.round(duration) }
                  : b
              ),
              updatedAt: now.toISOString(),
            }
          : e
      ),
    }));
  },

  getActiveTimeEntry: (staffId) => {
    return get().timeEntries.find((e) => e.staffId === staffId && e.status === 'active');
  },

  getTimeEntriesForPeriod: (staffId, start, end) => {
    return get().timeEntries.filter(
      (e) => e.staffId === staffId && e.date >= start && e.date <= end
    );
  },

  generateTimesheet: (staffId, periodStart, periodEnd) => {
    const staff = get().getStaffById(staffId);
    const entries = get().getTimeEntriesForPeriod(staffId, periodStart, periodEnd);
    
    const regularHours = entries.reduce((sum, e) => sum + Math.min(e.totalHours, 8), 0);
    const overtimeHours = entries.reduce((sum, e) => sum + e.overtimeHours, 0);
    const breakHours = entries.reduce((sum, e) => {
      return sum + e.breaks.reduce((bs, b) => bs + (b.duration || 0) / 60, 0);
    }, 0);

    const timesheet: Timesheet = {
      id: `ts_${generateId()}`,
      staffId,
      staffName: staff?.displayName || 'Unknown',
      periodStart,
      periodEnd,
      entries,
      totalRegularHours: Math.round(regularHours * 100) / 100,
      totalOvertimeHours: Math.round(overtimeHours * 100) / 100,
      totalBreakHours: Math.round(breakHours * 100) / 100,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    set((state) => ({ timesheets: [...state.timesheets, timesheet] }));
    return timesheet;
  },

  approveTimesheet: (id, approvedBy) => {
    set((state) => ({
      timesheets: state.timesheets.map((t) =>
        t.id === id
          ? { ...t, status: 'approved', approvedBy, approvedAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
          : t
      ),
    }));
  },

  rejectTimesheet: (id, reason) => {
    set((state) => ({
      timesheets: state.timesheets.map((t) =>
        t.id === id
          ? { ...t, status: 'rejected', rejectionReason: reason, updatedAt: new Date().toISOString() }
          : t
      ),
    }));
  },

  getTimesheetById: (id) => get().timesheets.find((t) => t.id === id),

  getTimesheetsForStaff: (staffId) => get().timesheets.filter((t) => t.staffId === staffId),

  generatePayrollSummary: (staffId, periodStart, periodEnd) => {
    const staff = get().getStaffById(staffId);
    const timesheet = get().timesheets.find(
      (t) => t.staffId === staffId && t.periodStart === periodStart && t.periodEnd === periodEnd
    );

    const regularHours = timesheet?.totalRegularHours || 0;
    const overtimeHours = timesheet?.totalOvertimeHours || 0;
    const hourlyRate = staff?.hourlyRate || 0;

    const hourlyPay = regularHours * hourlyRate + overtimeHours * hourlyRate * 1.5;
    const serviceCommission = get().calculateCommission(staffId, 0, 'service');
    const productCommission = get().calculateCommission(staffId, 0, 'product');

    const summary: PayrollSummary = {
      id: `pay_${generateId()}`,
      staffId,
      staffName: staff?.displayName || 'Unknown',
      periodStart,
      periodEnd,
      regularHours,
      overtimeHours,
      hourlyRate,
      salary: staff?.salary,
      serviceRevenue: 0,
      serviceCommission,
      productRevenue: 0,
      productCommission,
      totalCommission: serviceCommission + productCommission,
      tips: 0,
      bonuses: 0,
      deductions: 0,
      grossPay: hourlyPay + serviceCommission + productCommission,
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    set((state) => ({ payrollSummaries: [...state.payrollSummaries, summary] }));
    return summary;
  },

  approvePayroll: (id) => {
    set((state) => ({
      payrollSummaries: state.payrollSummaries.map((p) =>
        p.id === id ? { ...p, status: 'approved', updatedAt: new Date().toISOString() } : p
      ),
    }));
  },

  markPayrollPaid: (id) => {
    set((state) => ({
      payrollSummaries: state.payrollSummaries.map((p) =>
        p.id === id ? { ...p, status: 'paid', paidAt: new Date().toISOString(), updatedAt: new Date().toISOString() } : p
      ),
    }));
  },

  getPayrollSummaryById: (id) => get().payrollSummaries.find((p) => p.id === id),

  addSchedulePattern: (pattern) => {
    set((state) => ({ schedulePatterns: [...state.schedulePatterns, pattern] }));
  },

  updateSchedulePattern: (id, updates) => {
    set((state) => ({
      schedulePatterns: state.schedulePatterns.map((p) =>
        p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
      ),
    }));
  },

  deleteSchedulePattern: (id) => {
    set((state) => ({ schedulePatterns: state.schedulePatterns.filter((p) => p.id !== id) }));
  },

  getActiveSchedulePattern: (staffId) => {
    return get().schedulePatterns.find((p) => p.staffId === staffId && p.isActive);
  },

  requestTimeOff: (request) => {
    const timeOff: TimeOffRequest = {
      ...request,
      id: `toff_${generateId()}`,
      status: 'pending',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    set((state) => ({ timeOffRequests: [...state.timeOffRequests, timeOff] }));
    return timeOff;
  },

  approveTimeOff: (id, approvedBy) => {
    set((state) => ({
      timeOffRequests: state.timeOffRequests.map((t) =>
        t.id === id
          ? { ...t, status: 'approved', approvedBy, approvedAt: new Date().toISOString(), updatedAt: new Date().toISOString() }
          : t
      ),
    }));
  },

  rejectTimeOff: (id, reason) => {
    set((state) => ({
      timeOffRequests: state.timeOffRequests.map((t) =>
        t.id === id
          ? { ...t, status: 'rejected', rejectionReason: reason, updatedAt: new Date().toISOString() }
          : t
      ),
    }));
  },

  getTimeOffRequestsForStaff: (staffId) => {
    return get().timeOffRequests.filter((t) => t.staffId === staffId);
  },

  getPendingTimeOffRequests: () => {
    return get().timeOffRequests.filter((t) => t.status === 'pending');
  },

  setStaffPricing: (pricing) => {
    set((state) => {
      const existing = state.staffPricing.findIndex(
        (p) => p.staffId === pricing.staffId && p.serviceId === pricing.serviceId
      );
      if (existing >= 0) {
        const updated = [...state.staffPricing];
        updated[existing] = pricing;
        return { staffPricing: updated };
      }
      return { staffPricing: [...state.staffPricing, pricing] };
    });
  },

  getStaffPricing: (staffId, serviceId) => {
    return get().staffPricing.find((p) => p.staffId === staffId && p.serviceId === serviceId);
  },

  getStaffPricingForService: (serviceId) => {
    return get().staffPricing.filter((p) => p.serviceId === serviceId);
  },

  updatePerformanceMetrics: (metrics) => {
    set((state) => {
      const existing = state.performanceMetrics.findIndex(
        (m) => m.staffId === metrics.staffId && m.periodStart === metrics.periodStart
      );
      if (existing >= 0) {
        const updated = [...state.performanceMetrics];
        updated[existing] = metrics;
        return { performanceMetrics: updated };
      }
      return { performanceMetrics: [...state.performanceMetrics, metrics] };
    });
  },

  getPerformanceMetrics: (staffId, periodStart, periodEnd) => {
    return get().performanceMetrics.find(
      (m) => m.staffId === staffId && m.periodStart === periodStart && m.periodEnd === periodEnd
    );
  },

  addStaffGoal: (goal) => {
    const newGoal: StaffGoal = {
      ...goal,
      id: `goal_${generateId()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    set((state) => ({ staffGoals: [...state.staffGoals, newGoal] }));
    return newGoal;
  },

  updateStaffGoal: (id, updates) => {
    set((state) => ({
      staffGoals: state.staffGoals.map((g) =>
        g.id === id ? { ...g, ...updates, updatedAt: new Date().toISOString() } : g
      ),
    }));
  },

  getStaffGoals: (staffId) => get().staffGoals.filter((g) => g.staffId === staffId),

  updateGoalProgress: (goalId, currentValue) => {
    set((state) => ({
      staffGoals: state.staffGoals.map((g) => {
        if (g.id !== goalId) return g;
        const status = currentValue >= g.targetValue ? 'achieved' : g.status;
        return { ...g, currentValue, status, updatedAt: new Date().toISOString() };
      }),
    }));
  },

  addPermissionTemplate: (template) => {
    const newTemplate: PermissionTemplate = {
      ...template,
      id: `perm_${generateId()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    set((state) => ({ permissionTemplates: [...state.permissionTemplates, newTemplate] }));
    return newTemplate;
  },

  updatePermissionTemplate: (id, updates) => {
    set((state) => ({
      permissionTemplates: state.permissionTemplates.map((t) =>
        t.id === id ? { ...t, ...updates, updatedAt: new Date().toISOString() } : t
      ),
    }));
  },

  deletePermissionTemplate: (id) => {
    set((state) => ({ permissionTemplates: state.permissionTemplates.filter((t) => t.id !== id) }));
  },

  getPermissionTemplateById: (id) => get().permissionTemplates.find((t) => t.id === id),
}));
