/**
 * Sales (POS) API endpoints
 * Mock implementation matching API_DOCUMENTATION.md
 */

import { apiRequest, ApiResponse, PaginatedResponse, PaginationParams } from './client';
import { Sale } from '@/types/checkout';

// In-memory storage for sales (simulating database)
let mockSales: Sale[] = [];

export interface SaleFilters extends PaginationParams {
  startDate?: string;
  endDate?: string;
  clientId?: string;
  staffId?: string;
  paymentMethod?: string;
  status?: string;
  searchTerm?: string;
}

export interface SaleItem {
  type: 'service' | 'product';
  serviceId?: string;
  productId?: string;
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
  type: 'cash' | 'credit-card' | 'debit-card' | 'gift-card' | 'check' | 'online' | 'other';
  amount: number;
  reference?: string;
  cardBrand?: string;
  giftCardNumber?: string;
}

export interface CreateSaleRequest {
  clientId?: string;
  appointmentId?: string;
  items: SaleItem[];
  tip?: number;
  paymentMethods: PaymentMethod[];
  notes?: string;
}

export interface RefundRequest {
  amount: number;
  reason: string;
  refundItems?: Array<{
    saleItemId: string;
    quantity: number;
  }>;
}

/**
 * Generate transaction ID
 */
const generateTransactionId = (): string => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substr(2, 6).toUpperCase();
  return `TXN-${timestamp}-${random}`;
};

/**
 * GET /sales
 * Get list of sales/transactions
 */
export const getSales = async (
  filters?: SaleFilters
): Promise<ApiResponse<PaginatedResponse<Sale> & { summary: any }>> => {
  return apiRequest(async () => {
    let filtered = [...mockSales];

    // Apply filters
    if (filters?.startDate) {
      const startDate = new Date(filters.startDate);
      filtered = filtered.filter((sale) => new Date(sale.completedAt) >= startDate);
    }

    if (filters?.endDate) {
      const endDate = new Date(filters.endDate);
      endDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter((sale) => new Date(sale.completedAt) <= endDate);
    }

    if (filters?.clientId) {
      filtered = filtered.filter((sale) => sale.clientId === filters.clientId);
    }

    if (filters?.staffId) {
      filtered = filtered.filter((sale) =>
        sale.items.some((item) => item.staffId === filters.staffId)
      );
    }

    if (filters?.paymentMethod) {
      filtered = filtered.filter((sale) =>
        sale.paymentMethods.some((method) => method.type === filters.paymentMethod)
      );
    }

    if (filters?.status) {
      filtered = filtered.filter((sale) => sale.status === filters.status);
    }

    if (filters?.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (sale) =>
          sale.clientName.toLowerCase().includes(searchLower) ||
          sale.transactionId.toLowerCase().includes(searchLower)
      );
    }

    // Sort by completed date (most recent first)
    filtered.sort(
      (a, b) => new Date(b.completedAt).getTime() - new Date(a.completedAt).getTime()
    );

    // Apply pagination
    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginated = filtered.slice(startIndex, endIndex);

    // Calculate summary
    const completedSales = filtered.filter((s) => s.status === 'completed');
    const totalRevenue = completedSales.reduce((sum, sale) => sum + sale.total, 0);
    const totalTransactions = completedSales.length;
    const averageTicket = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;

    return {
      data: paginated,
      pagination: {
        page,
        limit,
        total: filtered.length,
        totalPages: Math.ceil(filtered.length / limit),
      },
      summary: {
        totalRevenue,
        totalTransactions,
        averageTicket,
      },
    };
  });
};

/**
 * GET /sales/:id
 * Get single sale/transaction by ID
 */
export const getSaleById = async (id: string): Promise<ApiResponse<{ sale: Sale }>> => {
  return apiRequest(async () => {
    const sale = mockSales.find((s) => s.id === id);

    if (!sale) {
      throw new Error('Sale not found');
    }

    return { sale };
  });
};

/**
 * POST /sales
 * Create new sale/transaction
 */
export const createSale = async (
  request: CreateSaleRequest
): Promise<ApiResponse<{ sale: Sale }>> => {
  return apiRequest(async () => {
    // Calculate totals
    const subtotal = request.items.reduce(
      (sum, item) => {
        const itemTotal = item.price * item.quantity;
        const discount =
          item.discount?.type === 'percentage'
            ? (itemTotal * item.discount.value) / 100
            : item.discount?.type === 'fixed'
              ? item.discount.value
              : 0;
        return sum + itemTotal - discount;
      },
      0
    );

    const tax = subtotal * 0.0825; // 8.25% tax (would come from settings)
    const tip = request.tip || 0;
    const total = subtotal + tax + tip;

    // Verify payment methods total matches
    const paymentTotal = request.paymentMethods.reduce((sum, method) => sum + method.amount, 0);
    if (Math.abs(paymentTotal - total) > 0.01) {
      throw new Error('Payment methods total does not match sale total');
    }

    const newSale: Sale = {
      id: `sale-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      transactionId: generateTransactionId(),
      appointmentId: request.appointmentId,
      clientId: request.clientId,
      clientName: request.clientId ? 'Client Name' : 'Walk-in Customer', // Would lookup client
      items: request.items.map((item) => ({
        id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        type: item.type,
        name: item.name,
        quantity: item.quantity,
        price: item.price,
        staffId: item.staffId,
        serviceId: item.serviceId,
        productId: item.productId,
      })),
      subtotal,
      totalDiscount: request.items.reduce((sum, item) => {
        const itemTotal = item.price * item.quantity;
        const discount =
          item.discount?.type === 'percentage'
            ? (itemTotal * item.discount.value) / 100
            : item.discount?.type === 'fixed'
              ? item.discount.value
              : 0;
        return sum + discount;
      }, 0),
      tax,
      tip,
      total,
      paymentMethods: request.paymentMethods,
      status: 'completed',
      completedAt: new Date().toISOString(),
      completedBy: 'current-user-id', // Would come from auth context
      notes: request.notes,
    };

    mockSales.push(newSale);
    return { sale: newSale };
  });
};

/**
 * POST /sales/:id/refund
 * Process full or partial refund
 */
export const refundSale = async (
  id: string,
  request: RefundRequest
): Promise<ApiResponse<{ sale: Sale }>> => {
  return apiRequest(async () => {
    const index = mockSales.findIndex((s) => s.id === id);

    if (index === -1) {
      throw new Error('Sale not found');
    }

    const existing = mockSales[index];

    if (existing.status === 'refunded') {
      throw new Error('Sale has already been refunded');
    }

    const refundAmount = request.amount;
    if (refundAmount > existing.total) {
      throw new Error('Refund amount cannot exceed sale total');
    }

    const updated: Sale = {
      ...existing,
      status: refundAmount >= existing.total ? 'refunded' : 'partially-refunded',
      refundAmount,
      refundReason: request.reason,
      refundedAt: new Date().toISOString(),
    };

    mockSales[index] = updated;
    return { sale: updated };
  });
};
