export type ServiceCategory = 'hair' | 'nails' | 'facial' | 'massage' | 'waxing' | 'makeup' | 'other';

export type PricingType = 'fixed' | 'from' | 'free' | 'custom';

export type BookingType = 'sequential' | 'parallel';

export type MembershipBillingInterval = 'weekly' | 'monthly' | 'quarterly' | 'yearly';

export type MembershipType = 'service_based' | 'credit_based' | 'hybrid';

export type ResourceType = 'room' | 'equipment' | 'bed' | 'station' | 'other';

export interface Service {
  id: string;
  name: string;
  categoryId: string;
  description?: string;
  duration: number;
  processingTime?: number;
  blockedTime?: number;
  price: number;
  pricingType: PricingType;
  maxPrice?: number;
  taxable: boolean;
  taxRate?: number;
  isActive: boolean;
  bookableOnline: boolean;
  requiresDeposit: boolean;
  depositAmount?: number;
  depositPercentage?: number;
  staffAssignments: {
    assignedStaffIds: string[];
    allowAnyStaff: boolean;
  };
  resourceRequirements?: string[];
  addOnIds?: string[];
  order: number;
  sku?: string;
  imageUrl?: string;
  aftercareInstructions?: string;
  color?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceCategory2 {
  id: string;
  name: string;
  description?: string;
  color?: string;
  order: number;
  parentId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ServiceAddOn {
  id: string;
  name: string;
  description?: string;
  price: number;
  duration: number;
  applicableServiceIds: string[];
  applicableToAll: boolean;
  isActive: boolean;
  bookableOnline: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface ServicePackage {
  id: string;
  name: string;
  description?: string;
  serviceIds: string[];
  bookingType: BookingType;
  pricingType: 'sum' | 'fixed' | 'percentage_discount';
  fixedPrice?: number;
  discountPercentage?: number;
  calculatedPrice?: number;
  totalDuration: number;
  validityDays?: number;
  maxRedemptions?: number;
  usageCount: number;
  isActive: boolean;
  bookableOnline: boolean;
  imageUrl?: string;
  color?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ClientPackagePurchase {
  id: string;
  clientId: string;
  packageId: string;
  packageName: string;
  purchaseDate: string;
  expirationDate?: string;
  totalRedemptions: number;
  usedRedemptions: number;
  remainingRedemptions: number;
  pricePaid: number;
  status: 'active' | 'expired' | 'fully_used' | 'cancelled';
  redemptions: PackageRedemption[];
  createdAt: string;
  updatedAt: string;
}

export interface PackageRedemption {
  id: string;
  serviceId: string;
  serviceName: string;
  appointmentId?: string;
  redeemedAt: string;
  redeemedBy: string;
}

export interface Membership {
  id: string;
  name: string;
  description?: string;
  type: MembershipType;
  billingInterval: MembershipBillingInterval;
  price: number;
  serviceCredits?: MembershipServiceCredit[];
  creditAmount?: number;
  creditRollover: boolean;
  maxRolloverCredits?: number;
  discountPercentage?: number;
  discountOnServices: boolean;
  discountOnProducts: boolean;
  applicableServiceIds?: string[];
  applicableToAllServices: boolean;
  benefits?: string[];
  termsAndConditions?: string;
  minimumCommitmentMonths?: number;
  cancellationNoticeDays?: number;
  isActive: boolean;
  bookableOnline: boolean;
  imageUrl?: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface MembershipServiceCredit {
  serviceId: string;
  serviceName: string;
  quantity: number;
  rollover: boolean;
}

export interface ClientMembership {
  id: string;
  clientId: string;
  membershipId: string;
  membershipName: string;
  startDate: string;
  nextBillingDate: string;
  endDate?: string;
  status: 'active' | 'paused' | 'cancelled' | 'expired' | 'failed_payment';
  currentCredits: number;
  rolledOverCredits: number;
  serviceCreditsRemaining?: { serviceId: string; remaining: number }[];
  paymentMethodId?: string;
  lastPaymentDate?: string;
  lastPaymentAmount?: number;
  failedPaymentAttempts?: number;
  pausedAt?: string;
  pauseReason?: string;
  cancelledAt?: string;
  cancellationReason?: string;
  transactions: MembershipTransaction[];
  createdAt: string;
  updatedAt: string;
}

export interface MembershipTransaction {
  id: string;
  type: 'charge' | 'credit_used' | 'credit_added' | 'credit_expired' | 'refund';
  amount: number;
  description: string;
  serviceId?: string;
  appointmentId?: string;
  createdAt: string;
}

export interface Resource {
  id: string;
  name: string;
  type: ResourceType;
  description?: string;
  locationId?: string;
  capacity: number;
  isActive: boolean;
  color?: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface ResourceBooking {
  id: string;
  resourceId: string;
  appointmentId: string;
  startTime: string;
  endTime: string;
  createdAt: string;
}

export interface ServiceCustomization {
  id: string;
  serviceId: string;
  name: string;
  description?: string;
  options: CustomizationOption[];
  required: boolean;
  allowMultiple: boolean;
  displayInBooking: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface CustomizationOption {
  id: string;
  name: string;
  priceAdjustment: number;
  durationAdjustment: number;
  isDefault: boolean;
  order: number;
}

export interface StaffServicePricing {
  id: string;
  staffId: string;
  serviceId: string;
  customPrice?: number;
  customDuration?: number;
  isEnabled: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface DynamicPricingRule {
  id: string;
  name: string;
  type: 'surge' | 'discount' | 'time_based' | 'demand_based';
  applicableServiceIds: string[];
  applicableToAll: boolean;
  adjustmentType: 'percentage' | 'fixed';
  adjustmentValue: number;
  conditions: PricingCondition[];
  priority: number;
  startDate?: string;
  endDate?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PricingCondition {
  type: 'day_of_week' | 'time_range' | 'date_range' | 'booking_window' | 'capacity';
  value: string | number | string[];
  operator: 'equals' | 'not_equals' | 'greater_than' | 'less_than' | 'between' | 'in';
}

export interface ServiceAnalytics {
  serviceId: string;
  periodStart: string;
  periodEnd: string;
  totalBookings: number;
  completedBookings: number;
  cancelledBookings: number;
  noShowBookings: number;
  totalRevenue: number;
  averageRating?: number;
  popularTimeSlots: { hour: number; count: number }[];
  topStaff: { staffId: string; count: number }[];
}

export interface ResolvedServicePrice {
  basePrice: number;
  staffPriceAdjustment: number;
  customizationAdjustment: number;
  dynamicPriceAdjustment: number;
  addOnsTotal: number;
  discountAmount: number;
  finalPrice: number;
  breakdown: {
    label: string;
    amount: number;
  }[];
}

export interface ResolvedServiceDuration {
  baseDuration: number;
  processingTime: number;
  blockedTime: number;
  staffDurationAdjustment: number;
  customizationAdjustment: number;
  addOnsDuration: number;
  totalDuration: number;
  activeServiceTime: number;
}

export interface ServiceProductConsumption {
  id: string;
  serviceId: string;
  productId: string;
  productName: string;
  productSku: string;
  quantityPerService: number;
  unitOfMeasure: string;
  isRequired: boolean;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProductConsumptionLog {
  id: string;
  serviceId: string;
  serviceName: string;
  appointmentId: string;
  staffId: string;
  staffName: string;
  clientId?: string;
  clientName?: string;
  consumptions: {
    productId: string;
    productName: string;
    quantityUsed: number;
    unitCost: number;
    totalCost: number;
  }[];
  totalCost: number;
  consumedAt: string;
  notes?: string;
}
