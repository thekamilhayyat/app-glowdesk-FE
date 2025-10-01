// Checkout and payment type definitions
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

export interface PaymentMethod {
  id: string;
  type: 'cash' | 'credit-card' | 'gift-card' | 'check' | 'online';
  amount: number;
  reference?: string; // card last 4, gift card number, etc.
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
