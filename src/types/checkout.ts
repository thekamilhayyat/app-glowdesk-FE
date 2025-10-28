// Checkout and payment type definitions
export interface CheckoutItem {
  id: string;
  type: 'service' | 'product';
  name: string;
  price: number;
  quantity: number;
  staffId?: string;
  serviceId?: string;
  productId?: string;
  discount?: {
    type: 'percentage' | 'fixed';
    value: number;
  };
}

export interface PaymentMethod {
  id: string;
  type: 'cash' | 'credit-card' | 'gift-card' | 'check' | 'online';
  amount: number;
  reference?: string; // card last 4, gift card number, etc.
}

export interface CheckoutSession {
  id: string;
  appointmentId?: string; // Made optional for standalone sales
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

// Sale represents a completed transaction
export interface Sale {
  id: string;
  transactionId: string;
  appointmentId?: string;
  clientId: string;
  clientName: string;
  items: CheckoutItem[];
  subtotal: number;
  totalDiscount: number;
  tax: number;
  tip: number;
  total: number;
  paymentMethods: PaymentMethod[];
  status: 'completed' | 'refunded';
  completedBy?: string; // User ID who completed the sale
  completedByName?: string; // User name for display
  completedAt: Date;
  createdAt: Date;
  notes?: string;
}

// Filters for sales history
export interface SaleFilters {
  startDate?: Date;
  endDate?: Date;
  clientId?: string;
  staffId?: string;
  paymentMethod?: PaymentMethod['type'];
  searchTerm?: string; // Search by client name or transaction ID
}
