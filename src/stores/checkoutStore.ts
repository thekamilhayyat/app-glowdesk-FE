import { create } from 'zustand';
import { CheckoutSession, CheckoutItem, PaymentMethod, Appointment } from '@/types/calendar';
import { useCalendarStore } from './calendarStore';

interface CheckoutState {
  // Current checkout session
  currentSession: CheckoutSession | null;
  isOpen: boolean;
  currentStep: 'items' | 'payment' | 'confirmation';
  
  // Payment state
  selectedPaymentMethods: PaymentMethod[];
  tipAmount: number;
  tipPercentage: number | null;
  
  // UI state
  isProcessing: boolean;
  error: string | null;
  
  // Actions
  startCheckout: (appointment: Appointment) => void;
  closeCheckout: () => void;
  setCurrentStep: (step: 'items' | 'payment' | 'confirmation') => void;
  
  // Item management
  addItem: (item: Omit<CheckoutItem, 'id'>) => void;
  updateItem: (itemId: string, updates: Partial<CheckoutItem>) => void;
  removeItem: (itemId: string) => void;
  applyDiscount: (itemId: string | null, discount: { type: 'percentage' | 'fixed'; value: number }) => void;
  
  // Payment management
  setTip: (amount: number, percentage?: number) => void;
  addPaymentMethod: (method: Omit<PaymentMethod, 'id'>) => void;
  removePaymentMethod: (methodId: string) => void;
  
  // Calculations
  calculateSubtotal: () => number;
  calculateTotalDiscount: () => number;
  calculateTax: () => number;
  calculateTotal: () => number;
  getRemainingBalance: () => number;
  
  // Process checkout
  processPayment: () => Promise<boolean>;
  completeCheckout: () => void;
  
  // Reset
  reset: () => void;
}

export const useCheckoutStore = create<CheckoutState>((set, get) => ({
  // Initial state
  currentSession: null,
  isOpen: false,
  currentStep: 'items',
  selectedPaymentMethods: [],
  tipAmount: 0,
  tipPercentage: null,
  isProcessing: false,
  error: null,

  // Actions
  startCheckout: (appointment) => {
    // Get services from calendar store to populate items
    const calendarState = useCalendarStore.getState();
    const { services } = calendarState;
    
    // Convert appointment services to checkout items
    const items: CheckoutItem[] = appointment.serviceIds.map(serviceId => {
      const service = services.find(s => s.id === serviceId);
      if (!service) {
        console.warn(`Service ${serviceId} not found in store`);
        return {
          id: `item_${serviceId}_${Date.now()}`,
          type: 'service' as const,
          name: `Unknown Service (${serviceId})`,
          price: 0,
          quantity: 1,
          serviceId,
        };
      }
      
      return {
        id: `item_${serviceId}_${Date.now()}`,
        type: 'service' as const,
        name: service.name,
        price: service.price,
        quantity: 1,
        serviceId: service.id,
      };
    });

    const session: CheckoutSession = {
      id: `checkout_${appointment.id}_${Date.now()}`,
      appointmentId: appointment.id,
      clientId: appointment.clientId,
      items,
      subtotal: 0,
      totalDiscount: 0,
      tax: 0,
      tip: 0,
      total: 0,
      paymentMethods: [],
      status: 'draft',
      createdAt: new Date(),
    };

    set({ 
      currentSession: session, 
      isOpen: true, 
      currentStep: 'items',
      tipAmount: 0,
      tipPercentage: null,
      selectedPaymentMethods: [],
      error: null 
    });
  },

  closeCheckout: () => set({ 
    isOpen: false, 
    currentSession: null,
    currentStep: 'items',
    selectedPaymentMethods: [],
    tipAmount: 0,
    tipPercentage: null,
    error: null 
  }),

  setCurrentStep: (step) => set({ currentStep: step }),

  // Item management
  addItem: (itemData) => {
    const state = get();
    if (!state.currentSession) return;

    const newItem: CheckoutItem = {
      ...itemData,
      id: `item_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };

    const updatedItems = [...state.currentSession.items, newItem];
    
    set({
      currentSession: {
        ...state.currentSession,
        items: updatedItems,
      },
    });
  },

  updateItem: (itemId, updates) => {
    const state = get();
    if (!state.currentSession) return;

    const updatedItems = state.currentSession.items.map((item) =>
      item.id === itemId ? { ...item, ...updates } : item
    );

    set({
      currentSession: {
        ...state.currentSession,
        items: updatedItems,
      },
    });
  },

  removeItem: (itemId) => {
    const state = get();
    if (!state.currentSession) return;

    const updatedItems = state.currentSession.items.filter((item) => item.id !== itemId);

    set({
      currentSession: {
        ...state.currentSession,
        items: updatedItems,
      },
    });
  },

  applyDiscount: (itemId, discount) => {
    const state = get();
    if (!state.currentSession) return;

    if (itemId) {
      // Apply to specific item
      const updatedItems = state.currentSession.items.map((item) =>
        item.id === itemId ? { ...item, discount } : item
      );

      set({
        currentSession: {
          ...state.currentSession,
          items: updatedItems,
        },
      });
    } else {
      // Apply to all items (whole ticket discount)
      const updatedItems = state.currentSession.items.map((item) => ({
        ...item,
        discount,
      }));

      set({
        currentSession: {
          ...state.currentSession,
          items: updatedItems,
        },
      });
    }
  },

  // Payment management
  setTip: (amount, percentage) => set({ tipAmount: amount, tipPercentage: percentage }),

  addPaymentMethod: (methodData) => {
    const state = get();
    const newMethod: PaymentMethod = {
      ...methodData,
      id: `payment_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };

    set({
      selectedPaymentMethods: [...state.selectedPaymentMethods, newMethod],
    });
  },

  removePaymentMethod: (methodId) => {
    const state = get();
    set({
      selectedPaymentMethods: state.selectedPaymentMethods.filter((method) => method.id !== methodId),
    });
  },

  // Calculations
  calculateSubtotal: () => {
    const state = get();
    if (!state.currentSession) return 0;

    return state.currentSession.items.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
  },

  calculateTotalDiscount: () => {
    const state = get();
    if (!state.currentSession) return 0;

    return state.currentSession.items.reduce((total, item) => {
      if (!item.discount) return total;

      const itemTotal = item.price * item.quantity;
      const discountAmount = item.discount.type === 'percentage' 
        ? itemTotal * (item.discount.value / 100)
        : item.discount.value;

      return total + discountAmount;
    }, 0);
  },

  calculateTax: () => {
    const state = get();
    const subtotal = state.calculateSubtotal();
    const discount = state.calculateTotalDiscount();
    const taxableAmount = subtotal - discount;
    
    // Assuming 8.25% tax rate (configurable in real implementation)
    return taxableAmount * 0.0825;
  },

  calculateTotal: () => {
    const state = get();
    const subtotal = state.calculateSubtotal();
    const discount = state.calculateTotalDiscount();
    const tax = state.calculateTax();
    
    return subtotal - discount + tax + state.tipAmount;
  },

  getRemainingBalance: () => {
    const state = get();
    const total = state.calculateTotal();
    const paid = state.selectedPaymentMethods.reduce((sum, method) => sum + method.amount, 0);
    
    return Math.max(0, total - paid);
  },

  // Process checkout
  processPayment: async () => {
    set({ isProcessing: true, error: null });
    
    try {
      // Simulate payment processing
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      const state = get();
      const remainingBalance = state.getRemainingBalance();
      
      if (remainingBalance > 0.01) { // Allow for small rounding differences
        throw new Error(`Remaining balance of $${remainingBalance.toFixed(2)} must be paid`);
      }
      
      set({ isProcessing: false });
      return true;
    } catch (error) {
      set({ 
        isProcessing: false, 
        error: error instanceof Error ? error.message : 'Payment failed' 
      });
      return false;
    }
  },

  completeCheckout: () => {
    const state = get();
    if (!state.currentSession) return;

    // Validate payment is complete before finalizing
    const remainingBalance = state.getRemainingBalance();
    if (remainingBalance > 0.01) {
      set({ error: `Cannot complete checkout: Remaining balance of $${remainingBalance.toFixed(2)} must be paid` });
      return;
    }

    if (state.selectedPaymentMethods.length === 0) {
      set({ error: 'Cannot complete checkout: At least one payment method required' });
      return;
    }

    // Update session status to completed
    set({
      currentSession: {
        ...state.currentSession,
        status: 'completed',
        subtotal: state.calculateSubtotal(),
        totalDiscount: state.calculateTotalDiscount(),
        tax: state.calculateTax(),
        tip: state.tipAmount,
        total: state.calculateTotal(),
        paymentMethods: state.selectedPaymentMethods,
      },
      currentStep: 'confirmation',
      error: null,
    });

    // Mark appointment as completed in calendar store
    if (state.currentSession.appointmentId) {
      const calendarState = useCalendarStore.getState();
      calendarState.updateAppointment(state.currentSession.appointmentId, {
        status: 'completed',
      });
    }
  },

  reset: () => set({
    currentSession: null,
    isOpen: false,
    currentStep: 'items',
    selectedPaymentMethods: [],
    tipAmount: 0,
    tipPercentage: null,
    isProcessing: false,
    error: null,
  }),
}));