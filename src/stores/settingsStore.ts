import { create } from 'zustand';
import {
  BusinessProfile,
  BusinessHours,
  CommissionSettings,
  TaxSettings,
  PaymentSettings,
  BookingSettings,
  NotificationSettings,
  AppearanceSettings,
  IntegrationSettings,
} from '@/types/settings';

interface SettingsState {
  businessProfile: BusinessProfile;
  businessHours: BusinessHours[];
  commissionSettings: CommissionSettings;
  taxSettings: TaxSettings;
  paymentSettings: PaymentSettings;
  bookingSettings: BookingSettings;
  notificationSettings: NotificationSettings;
  appearanceSettings: AppearanceSettings;
  integrationSettings: IntegrationSettings;

  isLoading: boolean;
  error: string | null;

  updateBusinessProfile: (updates: Partial<BusinessProfile>) => void;
  updateBusinessHours: (hours: BusinessHours[]) => void;
  updateCommissionSettings: (updates: Partial<CommissionSettings>) => void;
  updateTaxSettings: (updates: Partial<TaxSettings>) => void;
  updatePaymentSettings: (updates: Partial<PaymentSettings>) => void;
  updateBookingSettings: (updates: Partial<BookingSettings>) => void;
  updateNotificationSettings: (updates: Partial<NotificationSettings>) => void;
  updateAppearanceSettings: (updates: Partial<AppearanceSettings>) => void;
  updateIntegrationSettings: (updates: Partial<IntegrationSettings>) => void;

  getBusinessHoursForDay: (dayOfWeek: number) => BusinessHours | undefined;
  isBusinessOpen: (date: Date) => boolean;
  getNextOpenTime: (date: Date) => Date | null;
}

const defaultBusinessProfile: BusinessProfile = {
  id: 'business_1',
  name: 'GlowFlow Salon & Spa',
  legalName: 'GlowFlow Beauty LLC',
  description: 'Premier salon and spa services for all your beauty needs',
  email: 'info@glowflowapp.com',
  phone: '+1-555-0100',
  address: {
    street: '123 Beauty Lane',
    city: 'Los Angeles',
    state: 'CA',
    zipCode: '90001',
    country: 'USA',
  },
  timezone: 'America/Los_Angeles',
  currency: 'USD',
  locale: 'en-US',
  socialMedia: {
    instagram: '@glowflowsalon',
    facebook: 'glowflowsalon',
  },
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-01T00:00:00Z',
};

const defaultBusinessHours: BusinessHours[] = [
  { dayOfWeek: 0, isOpen: true, openTime: '10:00', closeTime: '16:00' },
  { dayOfWeek: 1, isOpen: true, openTime: '09:00', closeTime: '19:00' },
  { dayOfWeek: 2, isOpen: true, openTime: '09:00', closeTime: '19:00' },
  { dayOfWeek: 3, isOpen: true, openTime: '09:00', closeTime: '19:00' },
  { dayOfWeek: 4, isOpen: true, openTime: '09:00', closeTime: '21:00' },
  { dayOfWeek: 5, isOpen: true, openTime: '09:00', closeTime: '21:00' },
  { dayOfWeek: 6, isOpen: true, openTime: '09:00', closeTime: '18:00' },
];

const defaultCommissionSettings: CommissionSettings = {
  defaultServiceCommissionRate: 40,
  defaultProductCommissionRate: 10,
  commissionType: 'percentage',
  includeDiscountedAmount: false,
  calculateOnPreTax: true,
  tipCommission: false,
};

const defaultTaxSettings: TaxSettings = {
  enabled: true,
  defaultTaxRate: 8.25,
  taxName: 'Sales Tax',
  includeTaxInPrice: false,
  serviceTaxable: true,
  productTaxable: true,
};

const defaultPaymentSettings: PaymentSettings = {
  acceptedMethods: {
    cash: true,
    creditCard: true,
    debitCard: true,
    giftCard: true,
    storeCredit: true,
    check: false,
    other: true,
  },
  requirePaymentOnBooking: false,
  depositRequired: false,
  defaultDepositPercentage: 50,
  allowTips: true,
  suggestedTipPercentages: [15, 18, 20, 25],
  defaultTipPercentage: 20,
  autoChargeNoShow: false,
  noShowChargePercentage: 50,
  lateCancellationChargePercentage: 25,
  refundPolicy: 'Full refund for cancellations made 24 hours or more before the appointment.',
};

const defaultBookingSettings: BookingSettings = {
  allowOnlineBooking: true,
  requireClientAccount: false,
  allowGuestBooking: true,
  bookingWindowDays: 60,
  minAdvanceBookingHours: 2,
  maxAdvanceBookingDays: 60,
  slotDuration: 15,
  bufferTime: 0,
  allowDoubleBooking: false,
  showStaffSelection: true,
  allowStaffPreference: true,
  requirePhoneNumber: true,
  requireAddress: false,
  allowNotes: true,
  confirmationRequired: false,
  autoConfirmBookings: true,
  waitlistEnabled: true,
  maxWaitlistSize: 10,
  cancellationPolicy: {
    enabled: true,
    freeCancellationHours: 24,
    lateCancellationFeeType: 'percentage',
    lateCancellationFee: 50,
    allowReschedule: true,
    rescheduleDeadlineHours: 12,
    policyText: 'Cancellations must be made at least 24 hours in advance. Late cancellations may be subject to a 50% fee.',
  },
  noShowPolicy: {
    enabled: true,
    chargeType: 'percentage',
    chargeAmount: 100,
    trackNoShows: true,
    maxNoShows: 3,
    noShowAction: 'require_prepayment',
    policyText: 'Clients who miss appointments without notice may be charged the full service amount and required to prepay for future bookings.',
  },
};

const defaultNotificationSettings: NotificationSettings = {
  email: {
    enabled: true,
    bookingConfirmation: true,
    bookingReminder: true,
    bookingCancellation: true,
    bookingReschedule: true,
    paymentReceipt: true,
    reviewRequest: true,
    marketingEnabled: false,
  },
  sms: {
    enabled: true,
    bookingConfirmation: true,
    bookingReminder: true,
    bookingCancellation: true,
    bookingReschedule: true,
    marketingEnabled: false,
  },
  push: {
    enabled: true,
    newBooking: true,
    bookingReminder: true,
    staffScheduleChange: true,
  },
  reminderTiming: {
    firstReminder: 24,
    secondReminder: 2,
  },
  internalNotifications: {
    newBooking: true,
    cancellation: true,
    noShow: true,
    lowInventory: true,
    dailySummary: true,
  },
};

const defaultAppearanceSettings: AppearanceSettings = {
  primaryColor: '#8B5CF6',
  secondaryColor: '#EC4899',
  accentColor: '#10B981',
  logoPosition: 'left',
  showBusinessName: true,
  bookingPageTheme: 'auto',
};

const defaultIntegrationSettings: IntegrationSettings = {
  googleCalendar: {
    enabled: false,
    syncAppointments: false,
  },
  stripe: {
    enabled: false,
  },
  mailchimp: {
    enabled: false,
  },
  zapier: {
    enabled: false,
  },
};

export const useSettingsStore = create<SettingsState>((set, get) => ({
  businessProfile: defaultBusinessProfile,
  businessHours: defaultBusinessHours,
  commissionSettings: defaultCommissionSettings,
  taxSettings: defaultTaxSettings,
  paymentSettings: defaultPaymentSettings,
  bookingSettings: defaultBookingSettings,
  notificationSettings: defaultNotificationSettings,
  appearanceSettings: defaultAppearanceSettings,
  integrationSettings: defaultIntegrationSettings,
  isLoading: false,
  error: null,

  updateBusinessProfile: (updates) => {
    set((state) => ({
      businessProfile: {
        ...state.businessProfile,
        ...updates,
        updatedAt: new Date().toISOString(),
      },
    }));
  },

  updateBusinessHours: (hours) => {
    set({ businessHours: hours });
  },

  updateCommissionSettings: (updates) => {
    set((state) => ({
      commissionSettings: { ...state.commissionSettings, ...updates },
    }));
  },

  updateTaxSettings: (updates) => {
    set((state) => ({
      taxSettings: { ...state.taxSettings, ...updates },
    }));
  },

  updatePaymentSettings: (updates) => {
    set((state) => ({
      paymentSettings: { ...state.paymentSettings, ...updates },
    }));
  },

  updateBookingSettings: (updates) => {
    set((state) => ({
      bookingSettings: { ...state.bookingSettings, ...updates },
    }));
  },

  updateNotificationSettings: (updates) => {
    set((state) => ({
      notificationSettings: { ...state.notificationSettings, ...updates },
    }));
  },

  updateAppearanceSettings: (updates) => {
    set((state) => ({
      appearanceSettings: { ...state.appearanceSettings, ...updates },
    }));
  },

  updateIntegrationSettings: (updates) => {
    set((state) => ({
      integrationSettings: { ...state.integrationSettings, ...updates },
    }));
  },

  getBusinessHoursForDay: (dayOfWeek) => {
    return get().businessHours.find((h) => h.dayOfWeek === dayOfWeek);
  },

  isBusinessOpen: (date) => {
    const hours = get().getBusinessHoursForDay(date.getDay());
    if (!hours || !hours.isOpen) return false;

    const currentTime = `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    return currentTime >= hours.openTime && currentTime < hours.closeTime;
  },

  getNextOpenTime: (date) => {
    const maxDays = 7;
    let checkDate = new Date(date);

    for (let i = 0; i < maxDays; i++) {
      const hours = get().getBusinessHoursForDay(checkDate.getDay());
      if (hours && hours.isOpen) {
        const [openHour, openMinute] = hours.openTime.split(':').map(Number);
        const openTime = new Date(checkDate);
        openTime.setHours(openHour, openMinute, 0, 0);

        if (i === 0 && openTime > date) {
          return openTime;
        } else if (i > 0) {
          return openTime;
        }

        const [closeHour, closeMinute] = hours.closeTime.split(':').map(Number);
        if (date.getHours() < closeHour || (date.getHours() === closeHour && date.getMinutes() < closeMinute)) {
          return date;
        }
      }
      checkDate.setDate(checkDate.getDate() + 1);
      checkDate.setHours(0, 0, 0, 0);
    }

    return null;
  },
}));
