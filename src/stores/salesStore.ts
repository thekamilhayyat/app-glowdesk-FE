import { create } from 'zustand';
import { Sale, SaleFilters } from '@/types/checkout';

interface SalesState {
  // Sales data
  sales: Sale[];
  
  // UI state
  selectedSale: Sale | null;
  isLoading: boolean;
  
  // Actions
  addSale: (sale: Sale) => void;
  getSaleById: (id: string) => Sale | undefined;
  getSalesHistory: (filters?: SaleFilters) => Sale[];
  setSelectedSale: (sale: Sale | null) => void;
  
  // Filters
  applySaleFilters: (sales: Sale[], filters: SaleFilters) => Sale[];
  
  // Statistics
  getTotalRevenue: (filters?: SaleFilters) => number;
  getSalesCount: (filters?: SaleFilters) => number;
  getAverageTicket: (filters?: SaleFilters) => number;
}

export const useSalesStore = create<SalesState>((set, get) => ({
  // Initial state
  sales: [],
  selectedSale: null,
  isLoading: false,
  
  // Actions
  addSale: (sale) => {
    set((state) => ({
      sales: [sale, ...state.sales], // Add to beginning for most recent first
    }));
  },
  
  getSaleById: (id) => {
    const state = get();
    return state.sales.find((sale) => sale.id === id);
  },
  
  getSalesHistory: (filters) => {
    const state = get();
    if (!filters) {
      return state.sales;
    }
    return state.applySaleFilters(state.sales, filters);
  },
  
  setSelectedSale: (sale) => set({ selectedSale: sale }),
  
  // Apply filters to sales
  applySaleFilters: (sales, filters) => {
    let filtered = [...sales];
    
    // Filter by date range
    if (filters.startDate) {
      filtered = filtered.filter(
        (sale) => new Date(sale.completedAt) >= filters.startDate!
      );
    }
    
    if (filters.endDate) {
      const endOfDay = new Date(filters.endDate);
      endOfDay.setHours(23, 59, 59, 999);
      filtered = filtered.filter(
        (sale) => new Date(sale.completedAt) <= endOfDay
      );
    }
    
    // Filter by client
    if (filters.clientId) {
      filtered = filtered.filter(
        (sale) => sale.clientId === filters.clientId
      );
    }
    
    // Filter by staff (check if any item has this staff)
    if (filters.staffId) {
      filtered = filtered.filter((sale) =>
        sale.items.some((item) => item.staffId === filters.staffId)
      );
    }
    
    // Filter by payment method
    if (filters.paymentMethod) {
      filtered = filtered.filter((sale) =>
        sale.paymentMethods.some(
          (method) => method.type === filters.paymentMethod
        )
      );
    }
    
    // Filter by search term (client name or transaction ID)
    if (filters.searchTerm) {
      const searchLower = filters.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (sale) =>
          sale.clientName.toLowerCase().includes(searchLower) ||
          sale.transactionId.toLowerCase().includes(searchLower)
      );
    }
    
    return filtered;
  },
  
  // Statistics
  getTotalRevenue: (filters) => {
    const state = get();
    const salesList = filters
      ? state.getSalesHistory(filters)
      : state.sales;
    
    return salesList.reduce((total, sale) => {
      return sale.status === 'completed' ? total + sale.total : total;
    }, 0);
  },
  
  getSalesCount: (filters) => {
    const state = get();
    const salesList = filters
      ? state.getSalesHistory(filters)
      : state.sales;
    
    return salesList.filter((sale) => sale.status === 'completed').length;
  },
  
  getAverageTicket: (filters) => {
    const state = get();
    const count = state.getSalesCount(filters);
    
    if (count === 0) return 0;
    
    const revenue = state.getTotalRevenue(filters);
    return revenue / count;
  },
}));

