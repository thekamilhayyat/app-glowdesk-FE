export interface BusinessProfile {
  id: string;
  name: string;
  legalName?: string;
  logo?: string;
  description?: string;
  website?: string;
  email: string;
  phone: string;
  address: {
    street: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  timezone: string;
  currency: string;
  locale: string;
  socialMedia?: {
    facebook?: string;
    instagram?: string;
    twitter?: string;
    tiktok?: string;
    youtube?: string;
    linkedin?: string;
  };
  createdAt: string;
  updatedAt: string;
}

export interface BusinessHours {
  dayOfWeek: 0 | 1 | 2 | 3 | 4 | 5 | 6;
  isOpen: boolean;
  openTime: string;
  closeTime: string;
  breaks?: { start: string; end: string }[];
}

export interface CommissionSettings {
  defaultServiceCommissionRate: number;
  defaultProductCommissionRate: number;
  commissionType: 'percentage' | 'fixed' | 'tiered';
  tiers?: {
    minAmount: number;
    maxAmount: number | null;
    rate: number;
  }[];
  includeDiscountedAmount: boolean;
  calculateOnPreTax: boolean;
  tipCommission: boolean;
  tipCommissionRate?: number;
}

export interface TaxSettings {
  enabled: boolean;
  defaultTaxRate: number;
  taxName: string;
  taxNumber?: string;
  includeTaxInPrice: boolean;
  serviceTaxable: boolean;
  productTaxable: boolean;
  customRates?: {
    id: string;
    name: string;
    rate: number;
    appliesTo: 'services' | 'products' | 'both';
    categoryIds?: string[];
  }[];
}

export interface PaymentSettings {
  acceptedMethods: {
    cash: boolean;
    creditCard: boolean;
    debitCard: boolean;
    giftCard: boolean;
    storeCredit: boolean;
    check: boolean;
    other: boolean;
  };
  requirePaymentOnBooking: boolean;
  depositRequired: boolean;
  defaultDepositPercentage: number;
  defaultDepositAmount?: number;
  allowTips: boolean;
  suggestedTipPercentages: number[];
  defaultTipPercentage?: number;
  autoChargeNoShow: boolean;
  noShowChargePercentage: number;
  lateCancellationChargePercentage: number;
  refundPolicy: string;
}

export interface BookingSettings {
  allowOnlineBooking: boolean;
  requireClientAccount: boolean;
  allowGuestBooking: boolean;
  bookingWindowDays: number;
  minAdvanceBookingHours: number;
  maxAdvanceBookingDays: number;
  slotDuration: number;
  bufferTime: number;
  allowDoubleBooking: boolean;
  showStaffSelection: boolean;
  allowStaffPreference: boolean;
  requirePhoneNumber: boolean;
  requireAddress: boolean;
  allowNotes: boolean;
  confirmationRequired: boolean;
  autoConfirmBookings: boolean;
  waitlistEnabled: boolean;
  maxWaitlistSize?: number;
  cancellationPolicy: CancellationPolicy;
  noShowPolicy: NoShowPolicy;
}

export interface CancellationPolicy {
  enabled: boolean;
  freeCancellationHours: number;
  lateCancellationFeeType: 'percentage' | 'fixed';
  lateCancellationFee: number;
  allowReschedule: boolean;
  rescheduleDeadlineHours: number;
  policyText: string;
}

export interface NoShowPolicy {
  enabled: boolean;
  chargeType: 'percentage' | 'fixed';
  chargeAmount: number;
  trackNoShows: boolean;
  maxNoShows: number;
  noShowAction: 'warn' | 'block' | 'require_prepayment';
  policyText: string;
}

export interface NotificationSettings {
  email: {
    enabled: boolean;
    bookingConfirmation: boolean;
    bookingReminder: boolean;
    bookingCancellation: boolean;
    bookingReschedule: boolean;
    paymentReceipt: boolean;
    reviewRequest: boolean;
    marketingEnabled: boolean;
  };
  sms: {
    enabled: boolean;
    bookingConfirmation: boolean;
    bookingReminder: boolean;
    bookingCancellation: boolean;
    bookingReschedule: boolean;
    marketingEnabled: boolean;
  };
  push: {
    enabled: boolean;
    newBooking: boolean;
    bookingReminder: boolean;
    staffScheduleChange: boolean;
  };
  reminderTiming: {
    firstReminder: number;
    secondReminder?: number;
  };
  internalNotifications: {
    newBooking: boolean;
    cancellation: boolean;
    noShow: boolean;
    lowInventory: boolean;
    dailySummary: boolean;
  };
}

export interface AppearanceSettings {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  logoPosition: 'left' | 'center';
  showBusinessName: boolean;
  customCss?: string;
  bookingPageTheme: 'light' | 'dark' | 'auto';
}

export interface IntegrationSettings {
  googleCalendar: {
    enabled: boolean;
    syncAppointments: boolean;
    calendarId?: string;
  };
  stripe: {
    enabled: boolean;
    accountId?: string;
  };
  mailchimp: {
    enabled: boolean;
    apiKey?: string;
    listId?: string;
  };
  zapier: {
    enabled: boolean;
    webhookUrl?: string;
  };
}

export interface SettingsState {
  businessProfile: BusinessProfile;
  businessHours: BusinessHours[];
  commissionSettings: CommissionSettings;
  taxSettings: TaxSettings;
  paymentSettings: PaymentSettings;
  bookingSettings: BookingSettings;
  notificationSettings: NotificationSettings;
  appearanceSettings: AppearanceSettings;
  integrationSettings: IntegrationSettings;
}
