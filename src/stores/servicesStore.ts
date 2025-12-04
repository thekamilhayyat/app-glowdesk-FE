import { create } from 'zustand';
import {
  Service,
  ServiceCategory2,
  ServiceAddOn,
  ServicePackage,
  ClientPackagePurchase,
  Membership,
  ClientMembership,
  Resource,
  ResourceBooking,
  ServiceCustomization,
  StaffServicePricing,
  DynamicPricingRule,
  ResolvedServicePrice,
  ResolvedServiceDuration,
  ServiceProductConsumption,
  ProductConsumptionLog,
} from '@/types/service';

interface ServicesFilters {
  categoryId?: string;
  isActive?: boolean;
  bookableOnline?: boolean;
  searchTerm?: string;
}

interface ServicesState {
  services: Service[];
  categories: ServiceCategory2[];
  addOns: ServiceAddOn[];
  packages: ServicePackage[];
  clientPackages: ClientPackagePurchase[];
  memberships: Membership[];
  clientMemberships: ClientMembership[];
  resources: Resource[];
  resourceBookings: ResourceBooking[];
  customizations: ServiceCustomization[];
  staffPricing: StaffServicePricing[];
  pricingRules: DynamicPricingRule[];
  productConsumptions: ServiceProductConsumption[];
  consumptionLogs: ProductConsumptionLog[];

  isLoading: boolean;
  error: string | null;

  addService: (service: Service) => void;
  updateService: (id: string, updates: Partial<Service>) => void;
  deleteService: (id: string) => void;
  getServiceById: (id: string) => Service | undefined;
  getFilteredServices: (filters: ServicesFilters) => Service[];
  getServicesByCategory: (categoryId: string) => Service[];

  addCategory: (category: ServiceCategory2) => void;
  updateCategory: (id: string, updates: Partial<ServiceCategory2>) => void;
  deleteCategory: (id: string) => void;
  getCategoryById: (id: string) => ServiceCategory2 | undefined;

  addAddOn: (addOn: ServiceAddOn) => void;
  updateAddOn: (id: string, updates: Partial<ServiceAddOn>) => void;
  deleteAddOn: (id: string) => void;
  getAddOnById: (id: string) => ServiceAddOn | undefined;
  getAddOnsForService: (serviceId: string) => ServiceAddOn[];

  addPackage: (pkg: ServicePackage) => void;
  updatePackage: (id: string, updates: Partial<ServicePackage>) => void;
  deletePackage: (id: string) => void;
  getPackageById: (id: string) => ServicePackage | undefined;
  calculatePackagePrice: (packageId: string) => number;

  purchasePackage: (clientId: string, packageId: string, pricePaid: number) => ClientPackagePurchase;
  redeemPackage: (purchaseId: string, serviceId: string, appointmentId?: string, redeemedBy?: string) => boolean;
  getClientPackages: (clientId: string) => ClientPackagePurchase[];

  addMembership: (membership: Membership) => void;
  updateMembership: (id: string, updates: Partial<Membership>) => void;
  deleteMembership: (id: string) => void;
  getMembershipById: (id: string) => Membership | undefined;

  enrollClientMembership: (clientId: string, membershipId: string, paymentMethodId?: string) => ClientMembership;
  pauseClientMembership: (id: string, reason?: string) => void;
  resumeClientMembership: (id: string) => void;
  cancelClientMembership: (id: string, reason?: string) => void;
  useMembershipCredit: (id: string, amount: number, serviceId?: string, appointmentId?: string) => boolean;
  getClientMemberships: (clientId: string) => ClientMembership[];
  getActiveMembership: (clientId: string) => ClientMembership | undefined;

  addResource: (resource: Resource) => void;
  updateResource: (id: string, updates: Partial<Resource>) => void;
  deleteResource: (id: string) => void;
  getResourceById: (id: string) => Resource | undefined;
  getResourcesByType: (type: string) => Resource[];
  checkResourceAvailability: (resourceId: string, startTime: string, endTime: string, excludeBookingId?: string) => boolean;
  bookResource: (resourceId: string, appointmentId: string, startTime: string, endTime: string) => ResourceBooking | null;
  releaseResourceBooking: (bookingId: string) => void;

  addCustomization: (customization: ServiceCustomization) => void;
  updateCustomization: (id: string, updates: Partial<ServiceCustomization>) => void;
  deleteCustomization: (id: string) => void;
  getCustomizationsForService: (serviceId: string) => ServiceCustomization[];

  setStaffServicePricing: (pricing: StaffServicePricing) => void;
  getStaffServicePricing: (staffId: string, serviceId: string) => StaffServicePricing | undefined;
  getAllStaffPricingForService: (serviceId: string) => StaffServicePricing[];

  addPricingRule: (rule: DynamicPricingRule) => void;
  updatePricingRule: (id: string, updates: Partial<DynamicPricingRule>) => void;
  deletePricingRule: (id: string) => void;
  getApplicablePricingRules: (serviceId: string, date?: Date) => DynamicPricingRule[];

  resolveServicePrice: (
    serviceId: string,
    staffId?: string,
    selectedAddOnIds?: string[],
    selectedCustomizations?: { customizationId: string; optionId: string }[],
    date?: Date
  ) => ResolvedServicePrice;

  resolveServiceDuration: (
    serviceId: string,
    staffId?: string,
    selectedAddOnIds?: string[],
    selectedCustomizations?: { customizationId: string; optionId: string }[]
  ) => ResolvedServiceDuration;

  addProductConsumption: (consumption: ServiceProductConsumption) => void;
  updateProductConsumption: (id: string, updates: Partial<ServiceProductConsumption>) => void;
  deleteProductConsumption: (id: string) => void;
  getProductConsumptionsForService: (serviceId: string) => ServiceProductConsumption[];
  
  logProductConsumption: (log: ProductConsumptionLog) => void;
  getConsumptionLogsForService: (serviceId: string) => ProductConsumptionLog[];
  getConsumptionLogsForStaff: (staffId: string) => ProductConsumptionLog[];
  getConsumptionLogsForAppointment: (appointmentId: string) => ProductConsumptionLog[];
}

const generateId = () => `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const useServicesStore = create<ServicesState>((set, get) => ({
  services: [
    {
      id: 'SRV001',
      name: 'Haircut',
      categoryId: 'cat_hair',
      description: 'Standard haircut and finish.',
      duration: 45,
      processingTime: 0,
      price: 50,
      pricingType: 'fixed',
      taxable: true,
      isActive: true,
      bookableOnline: true,
      requiresDeposit: false,
      staffAssignments: { assignedStaffIds: ['staff_1', 'staff_2'], allowAnyStaff: false },
      order: 1,
      sku: 'HAIR-HC-001',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    {
      id: 'SRV002',
      name: 'Color',
      categoryId: 'cat_hair',
      description: 'Single-process color with processing time.',
      duration: 60,
      processingTime: 30,
      price: 120,
      pricingType: 'from',
      maxPrice: 200,
      taxable: true,
      isActive: true,
      bookableOnline: true,
      requiresDeposit: true,
      depositPercentage: 50,
      staffAssignments: { assignedStaffIds: ['staff_1', 'staff_2'], allowAnyStaff: false },
      order: 2,
      sku: 'HAIR-CLR-001',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    {
      id: 'SRV003',
      name: 'Manicure',
      categoryId: 'cat_nails',
      description: 'Basic manicure.',
      duration: 30,
      price: 30,
      pricingType: 'fixed',
      taxable: true,
      isActive: true,
      bookableOnline: true,
      requiresDeposit: false,
      staffAssignments: { assignedStaffIds: ['staff_3'], allowAnyStaff: false },
      order: 3,
      sku: 'NAIL-MAN-001',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    {
      id: 'SRV004',
      name: 'Pedicure',
      categoryId: 'cat_nails',
      description: 'Relaxing pedicure treatment.',
      duration: 45,
      price: 45,
      pricingType: 'fixed',
      taxable: true,
      isActive: true,
      bookableOnline: true,
      requiresDeposit: false,
      staffAssignments: { assignedStaffIds: ['staff_3'], allowAnyStaff: false },
      order: 4,
      sku: 'NAIL-PED-001',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
  ],
  categories: [
    { id: 'cat_hair', name: 'Hair', color: '#8B5CF6', order: 1, isActive: true, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
    { id: 'cat_nails', name: 'Nails', color: '#EC4899', order: 2, isActive: true, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
    { id: 'cat_facial', name: 'Facial', color: '#10B981', order: 3, isActive: true, createdAt: '2024-01-01T00:00:00Z', updatedAt: '2024-01-01T00:00:00Z' },
  ],
  addOns: [
    {
      id: 'addon_1',
      name: 'Deep Conditioning Treatment',
      description: 'Intensive hair treatment for damaged hair',
      price: 25,
      duration: 15,
      applicableServiceIds: ['SRV001', 'SRV002'],
      applicableToAll: false,
      isActive: true,
      bookableOnline: true,
      order: 1,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    {
      id: 'addon_2',
      name: 'Scalp Massage',
      description: 'Relaxing scalp massage',
      price: 15,
      duration: 10,
      applicableServiceIds: ['SRV001'],
      applicableToAll: false,
      isActive: true,
      bookableOnline: true,
      order: 2,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    {
      id: 'addon_3',
      name: 'Nail Art',
      description: 'Custom nail art design',
      price: 20,
      duration: 20,
      applicableServiceIds: ['SRV003', 'SRV004'],
      applicableToAll: false,
      isActive: true,
      bookableOnline: true,
      order: 3,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
  ],
  packages: [
    {
      id: 'pkg_1',
      name: 'Mani-Pedi Combo',
      description: 'Manicure and Pedicure package deal',
      serviceIds: ['SRV003', 'SRV004'],
      bookingType: 'sequential',
      pricingType: 'percentage_discount',
      discountPercentage: 15,
      totalDuration: 75,
      isActive: true,
      bookableOnline: true,
      usageCount: 0,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    {
      id: 'pkg_2',
      name: 'Color & Cut Package',
      description: 'Full color service with haircut',
      serviceIds: ['SRV001', 'SRV002'],
      bookingType: 'sequential',
      pricingType: 'fixed',
      fixedPrice: 150,
      totalDuration: 135,
      isActive: true,
      bookableOnline: true,
      usageCount: 0,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
  ],
  clientPackages: [],
  memberships: [
    {
      id: 'mem_1',
      name: 'VIP Monthly',
      description: 'Monthly membership with unlimited blowouts and 20% off all services',
      type: 'hybrid',
      billingInterval: 'monthly',
      price: 99,
      creditAmount: 50,
      creditRollover: true,
      maxRolloverCredits: 100,
      discountPercentage: 20,
      discountOnServices: true,
      discountOnProducts: true,
      applicableToAllServices: true,
      benefits: ['Unlimited blowouts', '20% off all services', '20% off products', 'Priority booking'],
      minimumCommitmentMonths: 3,
      cancellationNoticeDays: 30,
      isActive: true,
      bookableOnline: true,
      order: 1,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    {
      id: 'mem_2',
      name: 'Nail Club',
      description: '4 manicures per month',
      type: 'service_based',
      billingInterval: 'monthly',
      price: 80,
      serviceCredits: [{ serviceId: 'SRV003', serviceName: 'Manicure', quantity: 4, rollover: false }],
      creditRollover: false,
      discountPercentage: 10,
      discountOnServices: true,
      discountOnProducts: false,
      applicableServiceIds: ['SRV003', 'SRV004'],
      applicableToAllServices: false,
      benefits: ['4 manicures per month', '10% off nail services'],
      isActive: true,
      bookableOnline: true,
      order: 2,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
  ],
  clientMemberships: [],
  resources: [
    {
      id: 'res_1',
      name: 'Color Processing Station 1',
      type: 'station',
      description: 'Hair color processing area',
      capacity: 1,
      isActive: true,
      color: '#8B5CF6',
      order: 1,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    {
      id: 'res_2',
      name: 'Color Processing Station 2',
      type: 'station',
      description: 'Hair color processing area',
      capacity: 1,
      isActive: true,
      color: '#EC4899',
      order: 2,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    {
      id: 'res_3',
      name: 'Pedicure Chair 1',
      type: 'equipment',
      description: 'Spa pedicure chair with massage',
      capacity: 1,
      isActive: true,
      color: '#10B981',
      order: 3,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
  ],
  resourceBookings: [],
  customizations: [
    {
      id: 'cust_1',
      serviceId: 'SRV002',
      name: 'Hair Length',
      description: 'Select your hair length for accurate pricing',
      options: [
        { id: 'opt_1', name: 'Short', priceAdjustment: 0, durationAdjustment: 0, isDefault: true, order: 1 },
        { id: 'opt_2', name: 'Medium', priceAdjustment: 20, durationAdjustment: 15, isDefault: false, order: 2 },
        { id: 'opt_3', name: 'Long', priceAdjustment: 40, durationAdjustment: 30, isDefault: false, order: 3 },
        { id: 'opt_4', name: 'Extra Long', priceAdjustment: 60, durationAdjustment: 45, isDefault: false, order: 4 },
      ],
      required: true,
      allowMultiple: false,
      displayInBooking: true,
      order: 1,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
  ],
  staffPricing: [
    {
      id: 'sp_1',
      staffId: 'staff_2',
      serviceId: 'SRV001',
      customPrice: 65,
      isEnabled: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    {
      id: 'sp_2',
      staffId: 'staff_2',
      serviceId: 'SRV002',
      customPrice: 150,
      isEnabled: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
  ],
  pricingRules: [
    {
      id: 'rule_1',
      name: 'Weekend Surge',
      type: 'surge',
      applicableServiceIds: [],
      applicableToAll: true,
      adjustmentType: 'percentage',
      adjustmentValue: 10,
      conditions: [{ type: 'day_of_week', value: ['0', '6'], operator: 'in' }],
      priority: 1,
      isActive: true,
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
  ],
  productConsumptions: [
    {
      id: 'pc_1',
      serviceId: 'SRV002',
      productId: 'INV001',
      productName: 'Professional Hair Color',
      productSku: 'PHC-001',
      quantityPerService: 1,
      unitOfMeasure: 'tube',
      isRequired: true,
      notes: 'Standard single-process color application',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
    {
      id: 'pc_2',
      serviceId: 'SRV002',
      productId: 'INV002',
      productName: 'Developer 20 Vol',
      productSku: 'DEV-20',
      quantityPerService: 0.5,
      unitOfMeasure: 'bottle',
      isRequired: true,
      notes: 'Mixed with color for application',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
    },
  ],
  consumptionLogs: [],
  isLoading: false,
  error: null,

  addService: (service) => {
    set((state) => ({ services: [...state.services, service] }));
  },

  updateService: (id, updates) => {
    set((state) => ({
      services: state.services.map((s) =>
        s.id === id ? { ...s, ...updates, updatedAt: new Date().toISOString() } : s
      ),
    }));
  },

  deleteService: (id) => {
    set((state) => ({ services: state.services.filter((s) => s.id !== id) }));
  },

  getServiceById: (id) => get().services.find((s) => s.id === id),

  getFilteredServices: (filters) => {
    let result = get().services;
    
    if (filters.categoryId) {
      result = result.filter((s) => s.categoryId === filters.categoryId);
    }
    if (filters.isActive !== undefined) {
      result = result.filter((s) => s.isActive === filters.isActive);
    }
    if (filters.bookableOnline !== undefined) {
      result = result.filter((s) => s.bookableOnline === filters.bookableOnline);
    }
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      result = result.filter((s) =>
        s.name.toLowerCase().includes(term) ||
        s.description?.toLowerCase().includes(term)
      );
    }
    
    return result.sort((a, b) => a.order - b.order);
  },

  getServicesByCategory: (categoryId) => {
    return get().services.filter((s) => s.categoryId === categoryId).sort((a, b) => a.order - b.order);
  },

  addCategory: (category) => {
    set((state) => ({ categories: [...state.categories, category] }));
  },

  updateCategory: (id, updates) => {
    set((state) => ({
      categories: state.categories.map((c) =>
        c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c
      ),
    }));
  },

  deleteCategory: (id) => {
    set((state) => ({ categories: state.categories.filter((c) => c.id !== id) }));
  },

  getCategoryById: (id) => get().categories.find((c) => c.id === id),

  addAddOn: (addOn) => {
    set((state) => ({ addOns: [...state.addOns, addOn] }));
  },

  updateAddOn: (id, updates) => {
    set((state) => ({
      addOns: state.addOns.map((a) =>
        a.id === id ? { ...a, ...updates, updatedAt: new Date().toISOString() } : a
      ),
    }));
  },

  deleteAddOn: (id) => {
    set((state) => ({ addOns: state.addOns.filter((a) => a.id !== id) }));
  },

  getAddOnById: (id) => get().addOns.find((a) => a.id === id),

  getAddOnsForService: (serviceId) => {
    return get().addOns.filter(
      (a) => a.isActive && (a.applicableToAll || a.applicableServiceIds.includes(serviceId))
    );
  },

  addPackage: (pkg) => {
    set((state) => ({ packages: [...state.packages, pkg] }));
  },

  updatePackage: (id, updates) => {
    set((state) => ({
      packages: state.packages.map((p) =>
        p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p
      ),
    }));
  },

  deletePackage: (id) => {
    set((state) => ({ packages: state.packages.filter((p) => p.id !== id) }));
  },

  getPackageById: (id) => get().packages.find((p) => p.id === id),

  calculatePackagePrice: (packageId) => {
    const pkg = get().getPackageById(packageId);
    if (!pkg) return 0;

    const serviceTotal = pkg.serviceIds.reduce((sum, sid) => {
      const service = get().getServiceById(sid);
      return sum + (service?.price || 0);
    }, 0);

    if (pkg.pricingType === 'sum') return serviceTotal;
    if (pkg.pricingType === 'fixed' && pkg.fixedPrice) return pkg.fixedPrice;
    if (pkg.pricingType === 'percentage_discount' && pkg.discountPercentage) {
      return serviceTotal * (1 - pkg.discountPercentage / 100);
    }

    return serviceTotal;
  },

  purchasePackage: (clientId, packageId, pricePaid) => {
    const pkg = get().getPackageById(packageId);
    if (!pkg) throw new Error('Package not found');

    const purchase: ClientPackagePurchase = {
      id: `cpkg_${generateId()}`,
      clientId,
      packageId,
      packageName: pkg.name,
      purchaseDate: new Date().toISOString(),
      expirationDate: pkg.validityDays
        ? new Date(Date.now() + pkg.validityDays * 24 * 60 * 60 * 1000).toISOString()
        : undefined,
      totalRedemptions: pkg.serviceIds.length,
      usedRedemptions: 0,
      remainingRedemptions: pkg.serviceIds.length,
      pricePaid,
      status: 'active',
      redemptions: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    set((state) => ({
      clientPackages: [...state.clientPackages, purchase],
      packages: state.packages.map((p) =>
        p.id === packageId ? { ...p, usageCount: p.usageCount + 1 } : p
      ),
    }));

    return purchase;
  },

  redeemPackage: (purchaseId, serviceId, appointmentId, redeemedBy = 'system') => {
    const purchase = get().clientPackages.find((p) => p.id === purchaseId);
    if (!purchase || purchase.remainingRedemptions <= 0) return false;

    const service = get().getServiceById(serviceId);
    if (!service) return false;

    const redemption = {
      id: `red_${generateId()}`,
      serviceId,
      serviceName: service.name,
      appointmentId,
      redeemedAt: new Date().toISOString(),
      redeemedBy,
    };

    set((state) => ({
      clientPackages: state.clientPackages.map((p) => {
        if (p.id !== purchaseId) return p;
        const usedRedemptions = p.usedRedemptions + 1;
        const remainingRedemptions = p.remainingRedemptions - 1;
        const status = remainingRedemptions <= 0 ? 'fully_used' : p.status;
        return {
          ...p,
          usedRedemptions,
          remainingRedemptions,
          status,
          redemptions: [...p.redemptions, redemption],
          updatedAt: new Date().toISOString(),
        };
      }),
    }));

    return true;
  },

  getClientPackages: (clientId) => {
    return get().clientPackages.filter((p) => p.clientId === clientId);
  },

  addMembership: (membership) => {
    set((state) => ({ memberships: [...state.memberships, membership] }));
  },

  updateMembership: (id, updates) => {
    set((state) => ({
      memberships: state.memberships.map((m) =>
        m.id === id ? { ...m, ...updates, updatedAt: new Date().toISOString() } : m
      ),
    }));
  },

  deleteMembership: (id) => {
    set((state) => ({ memberships: state.memberships.filter((m) => m.id !== id) }));
  },

  getMembershipById: (id) => get().memberships.find((m) => m.id === id),

  enrollClientMembership: (clientId, membershipId, paymentMethodId) => {
    const membership = get().getMembershipById(membershipId);
    if (!membership) throw new Error('Membership not found');

    const now = new Date();
    const nextBilling = new Date(now);
    
    switch (membership.billingInterval) {
      case 'weekly':
        nextBilling.setDate(nextBilling.getDate() + 7);
        break;
      case 'monthly':
        nextBilling.setMonth(nextBilling.getMonth() + 1);
        break;
      case 'quarterly':
        nextBilling.setMonth(nextBilling.getMonth() + 3);
        break;
      case 'yearly':
        nextBilling.setFullYear(nextBilling.getFullYear() + 1);
        break;
    }

    const clientMembership: ClientMembership = {
      id: `cmem_${generateId()}`,
      clientId,
      membershipId,
      membershipName: membership.name,
      startDate: now.toISOString(),
      nextBillingDate: nextBilling.toISOString(),
      status: 'active',
      currentCredits: membership.creditAmount || 0,
      rolledOverCredits: 0,
      serviceCreditsRemaining: membership.serviceCredits?.map((sc) => ({
        serviceId: sc.serviceId,
        remaining: sc.quantity,
      })),
      paymentMethodId,
      lastPaymentDate: now.toISOString(),
      lastPaymentAmount: membership.price,
      transactions: [
        {
          id: `mtx_${generateId()}`,
          type: 'charge',
          amount: membership.price,
          description: 'Initial membership enrollment',
          createdAt: now.toISOString(),
        },
      ],
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    };

    set((state) => ({ clientMemberships: [...state.clientMemberships, clientMembership] }));
    return clientMembership;
  },

  pauseClientMembership: (id, reason) => {
    set((state) => ({
      clientMemberships: state.clientMemberships.map((m) =>
        m.id === id
          ? { ...m, status: 'paused', pausedAt: new Date().toISOString(), pauseReason: reason, updatedAt: new Date().toISOString() }
          : m
      ),
    }));
  },

  resumeClientMembership: (id) => {
    set((state) => ({
      clientMemberships: state.clientMemberships.map((m) =>
        m.id === id
          ? { ...m, status: 'active', pausedAt: undefined, pauseReason: undefined, updatedAt: new Date().toISOString() }
          : m
      ),
    }));
  },

  cancelClientMembership: (id, reason) => {
    set((state) => ({
      clientMemberships: state.clientMemberships.map((m) =>
        m.id === id
          ? { ...m, status: 'cancelled', cancelledAt: new Date().toISOString(), cancellationReason: reason, updatedAt: new Date().toISOString() }
          : m
      ),
    }));
  },

  useMembershipCredit: (id, amount, serviceId, appointmentId) => {
    const membership = get().clientMemberships.find((m) => m.id === id);
    if (!membership || membership.currentCredits < amount) return false;

    const transaction = {
      id: `mtx_${generateId()}`,
      type: 'credit_used' as const,
      amount,
      description: `Credit used${serviceId ? ' for service' : ''}`,
      serviceId,
      appointmentId,
      createdAt: new Date().toISOString(),
    };

    set((state) => ({
      clientMemberships: state.clientMemberships.map((m) =>
        m.id === id
          ? {
              ...m,
              currentCredits: m.currentCredits - amount,
              transactions: [...m.transactions, transaction],
              updatedAt: new Date().toISOString(),
            }
          : m
      ),
    }));

    return true;
  },

  getClientMemberships: (clientId) => {
    return get().clientMemberships.filter((m) => m.clientId === clientId);
  },

  getActiveMembership: (clientId) => {
    return get().clientMemberships.find((m) => m.clientId === clientId && m.status === 'active');
  },

  addResource: (resource) => {
    set((state) => ({ resources: [...state.resources, resource] }));
  },

  updateResource: (id, updates) => {
    set((state) => ({
      resources: state.resources.map((r) =>
        r.id === id ? { ...r, ...updates, updatedAt: new Date().toISOString() } : r
      ),
    }));
  },

  deleteResource: (id) => {
    set((state) => ({ resources: state.resources.filter((r) => r.id !== id) }));
  },

  getResourceById: (id) => get().resources.find((r) => r.id === id),

  getResourcesByType: (type) => {
    return get().resources.filter((r) => r.type === type && r.isActive);
  },

  checkResourceAvailability: (resourceId, startTime, endTime, excludeBookingId) => {
    const bookings = get().resourceBookings.filter(
      (b) => b.resourceId === resourceId && b.id !== excludeBookingId
    );

    const start = new Date(startTime).getTime();
    const end = new Date(endTime).getTime();

    return !bookings.some((b) => {
      const bStart = new Date(b.startTime).getTime();
      const bEnd = new Date(b.endTime).getTime();
      return start < bEnd && end > bStart;
    });
  },

  bookResource: (resourceId, appointmentId, startTime, endTime) => {
    if (!get().checkResourceAvailability(resourceId, startTime, endTime)) {
      return null;
    }

    const booking: ResourceBooking = {
      id: `rb_${generateId()}`,
      resourceId,
      appointmentId,
      startTime,
      endTime,
      createdAt: new Date().toISOString(),
    };

    set((state) => ({ resourceBookings: [...state.resourceBookings, booking] }));
    return booking;
  },

  releaseResourceBooking: (bookingId) => {
    set((state) => ({ resourceBookings: state.resourceBookings.filter((b) => b.id !== bookingId) }));
  },

  addCustomization: (customization) => {
    set((state) => ({ customizations: [...state.customizations, customization] }));
  },

  updateCustomization: (id, updates) => {
    set((state) => ({
      customizations: state.customizations.map((c) =>
        c.id === id ? { ...c, ...updates, updatedAt: new Date().toISOString() } : c
      ),
    }));
  },

  deleteCustomization: (id) => {
    set((state) => ({ customizations: state.customizations.filter((c) => c.id !== id) }));
  },

  getCustomizationsForService: (serviceId) => {
    return get().customizations.filter((c) => c.serviceId === serviceId);
  },

  setStaffServicePricing: (pricing) => {
    set((state) => {
      const existing = state.staffPricing.findIndex(
        (p) => p.staffId === pricing.staffId && p.serviceId === pricing.serviceId
      );
      if (existing >= 0) {
        const updated = [...state.staffPricing];
        updated[existing] = { ...pricing, updatedAt: new Date().toISOString() };
        return { staffPricing: updated };
      }
      return { staffPricing: [...state.staffPricing, { ...pricing, id: `sp_${generateId()}`, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }] };
    });
  },

  getStaffServicePricing: (staffId, serviceId) => {
    return get().staffPricing.find((p) => p.staffId === staffId && p.serviceId === serviceId && p.isEnabled);
  },

  getAllStaffPricingForService: (serviceId) => {
    return get().staffPricing.filter((p) => p.serviceId === serviceId);
  },

  addPricingRule: (rule) => {
    set((state) => ({ pricingRules: [...state.pricingRules, rule] }));
  },

  updatePricingRule: (id, updates) => {
    set((state) => ({
      pricingRules: state.pricingRules.map((r) =>
        r.id === id ? { ...r, ...updates, updatedAt: new Date().toISOString() } : r
      ),
    }));
  },

  deletePricingRule: (id) => {
    set((state) => ({ pricingRules: state.pricingRules.filter((r) => r.id !== id) }));
  },

  getApplicablePricingRules: (serviceId, date = new Date()) => {
    return get().pricingRules.filter((rule) => {
      if (!rule.isActive) return false;
      if (!rule.applicableToAll && !rule.applicableServiceIds.includes(serviceId)) return false;
      
      if (rule.startDate && new Date(rule.startDate) > date) return false;
      if (rule.endDate && new Date(rule.endDate) < date) return false;

      return rule.conditions.every((condition) => {
        if (condition.type === 'day_of_week') {
          const dayOfWeek = date.getDay().toString();
          if (condition.operator === 'in' && Array.isArray(condition.value)) {
            return condition.value.includes(dayOfWeek);
          }
        }
        return true;
      });
    }).sort((a, b) => b.priority - a.priority);
  },

  resolveServicePrice: (serviceId, staffId, selectedAddOnIds = [], selectedCustomizations = [], date = new Date()) => {
    const service = get().getServiceById(serviceId);
    if (!service) {
      return {
        basePrice: 0,
        staffPriceAdjustment: 0,
        customizationAdjustment: 0,
        dynamicPriceAdjustment: 0,
        addOnsTotal: 0,
        discountAmount: 0,
        finalPrice: 0,
        breakdown: [],
      };
    }

    const breakdown: { label: string; amount: number }[] = [];
    let basePrice = service.price;
    breakdown.push({ label: service.name, amount: basePrice });

    let staffPriceAdjustment = 0;
    if (staffId) {
      const staffPricing = get().getStaffServicePricing(staffId, serviceId);
      if (staffPricing?.customPrice) {
        staffPriceAdjustment = staffPricing.customPrice - basePrice;
        if (staffPriceAdjustment !== 0) {
          breakdown.push({ label: 'Staff pricing adjustment', amount: staffPriceAdjustment });
        }
      }
    }

    let customizationAdjustment = 0;
    selectedCustomizations.forEach(({ customizationId, optionId }) => {
      const customization = get().customizations.find((c) => c.id === customizationId);
      const option = customization?.options.find((o) => o.id === optionId);
      if (option && option.priceAdjustment !== 0) {
        customizationAdjustment += option.priceAdjustment;
        breakdown.push({ label: `${customization?.name}: ${option.name}`, amount: option.priceAdjustment });
      }
    });

    let addOnsTotal = 0;
    selectedAddOnIds.forEach((addOnId) => {
      const addOn = get().getAddOnById(addOnId);
      if (addOn) {
        addOnsTotal += addOn.price;
        breakdown.push({ label: addOn.name, amount: addOn.price });
      }
    });

    let dynamicPriceAdjustment = 0;
    const applicableRules = get().getApplicablePricingRules(serviceId, date);
    applicableRules.forEach((rule) => {
      const subtotal = basePrice + staffPriceAdjustment + customizationAdjustment;
      let adjustment = 0;
      if (rule.adjustmentType === 'percentage') {
        adjustment = subtotal * (rule.adjustmentValue / 100);
      } else {
        adjustment = rule.adjustmentValue;
      }
      if (rule.type === 'discount') adjustment = -adjustment;
      dynamicPriceAdjustment += adjustment;
      breakdown.push({ label: rule.name, amount: adjustment });
    });

    const finalPrice = basePrice + staffPriceAdjustment + customizationAdjustment + addOnsTotal + dynamicPriceAdjustment;

    return {
      basePrice,
      staffPriceAdjustment,
      customizationAdjustment,
      dynamicPriceAdjustment,
      addOnsTotal,
      discountAmount: dynamicPriceAdjustment < 0 ? Math.abs(dynamicPriceAdjustment) : 0,
      finalPrice: Math.max(0, finalPrice),
      breakdown,
    };
  },

  resolveServiceDuration: (serviceId, staffId, selectedAddOnIds = [], selectedCustomizations = []) => {
    const service = get().getServiceById(serviceId);
    if (!service) {
      return {
        baseDuration: 0,
        processingTime: 0,
        blockedTime: 0,
        staffDurationAdjustment: 0,
        customizationAdjustment: 0,
        addOnsDuration: 0,
        totalDuration: 0,
        activeServiceTime: 0,
      };
    }

    let baseDuration = service.duration;
    const processingTime = service.processingTime || 0;
    const blockedTime = service.blockedTime || 0;

    let staffDurationAdjustment = 0;
    if (staffId) {
      const staffPricing = get().getStaffServicePricing(staffId, serviceId);
      if (staffPricing?.customDuration) {
        staffDurationAdjustment = staffPricing.customDuration - baseDuration;
      }
    }

    let customizationAdjustment = 0;
    selectedCustomizations.forEach(({ customizationId, optionId }) => {
      const customization = get().customizations.find((c) => c.id === customizationId);
      const option = customization?.options.find((o) => o.id === optionId);
      if (option) {
        customizationAdjustment += option.durationAdjustment;
      }
    });

    let addOnsDuration = 0;
    selectedAddOnIds.forEach((addOnId) => {
      const addOn = get().getAddOnById(addOnId);
      if (addOn) {
        addOnsDuration += addOn.duration;
      }
    });

    const activeServiceTime = baseDuration + staffDurationAdjustment + customizationAdjustment + addOnsDuration;
    const totalDuration = activeServiceTime + processingTime + blockedTime;

    return {
      baseDuration,
      processingTime,
      blockedTime,
      staffDurationAdjustment,
      customizationAdjustment,
      addOnsDuration,
      totalDuration,
      activeServiceTime,
    };
  },

  addProductConsumption: (consumption) => {
    set((state) => ({ productConsumptions: [...state.productConsumptions, consumption] }));
  },

  updateProductConsumption: (id, updates) => {
    set((state) => ({
      productConsumptions: state.productConsumptions.map((pc) =>
        pc.id === id ? { ...pc, ...updates, updatedAt: new Date().toISOString() } : pc
      ),
    }));
  },

  deleteProductConsumption: (id) => {
    set((state) => ({ productConsumptions: state.productConsumptions.filter((pc) => pc.id !== id) }));
  },

  getProductConsumptionsForService: (serviceId) => {
    return get().productConsumptions.filter((pc) => pc.serviceId === serviceId);
  },

  logProductConsumption: (log) => {
    set((state) => ({ consumptionLogs: [...state.consumptionLogs, log] }));
  },

  getConsumptionLogsForService: (serviceId) => {
    return get().consumptionLogs.filter((log) => log.serviceId === serviceId);
  },

  getConsumptionLogsForStaff: (staffId) => {
    return get().consumptionLogs.filter((log) => log.staffId === staffId);
  },

  getConsumptionLogsForAppointment: (appointmentId) => {
    return get().consumptionLogs.filter((log) => log.appointmentId === appointmentId);
  },
}));
