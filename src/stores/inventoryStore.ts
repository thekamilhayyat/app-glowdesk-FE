import { create } from 'zustand';
import {
  InventoryItem,
  InventoryType,
  Manufacturer,
  Supplier,
  StockAdjustment,
  StockMovement,
  PurchaseOrder,
  PurchaseOrderItem,
  PurchaseOrderStatus,
  Stocktake,
  StocktakeItem,
  LowStockAlert,
  InventoryStats,
  InventoryFilters,
  StockAdjustmentReason,
  ReceivingRecord,
  StockTransfer,
  LocationStock,
} from '@/types/inventory';

/**
 * Inventory Store
 * 
 * NOTE: Inventory items (products) are now managed via React Query hooks and backend API.
 * This store only manages:
 * - Types, Manufacturers, Suppliers (reference data)
 * - Purchase Orders, Stocktakes, Stock Transfers (workflow data)
 * 
 * Use hooks from @/hooks/api/useInventory for product CRUD operations.
 */
interface InventoryState {
  // Reference data (still managed in store for now - may migrate to API later)
  types: InventoryType[];
  manufacturers: Manufacturer[];
  suppliers: Supplier[];
  
  // Workflow data (still managed in store - not part of products API)
  purchaseOrders: PurchaseOrder[];
  receivingRecords: ReceivingRecord[];
  stocktakes: Stocktake[];
  stockTransfers: StockTransfer[];
  
  isLoading: boolean;
  error: string | null;

  initializeData: (data: {
    types?: InventoryType[];
    manufacturers?: Manufacturer[];
    suppliers?: Supplier[];
  }) => void;

  // Type management
  addType: (type: InventoryType) => void;
  updateType: (id: string, updates: Partial<InventoryType>) => void;
  deleteType: (id: string) => void;
  reorderTypes: (types: InventoryType[]) => void;

  // Manufacturer management
  addManufacturer: (manufacturer: Manufacturer) => void;
  updateManufacturer: (id: string, updates: Partial<Manufacturer>) => void;
  deleteManufacturer: (id: string) => void;
  reorderManufacturers: (manufacturers: Manufacturer[]) => void;

  // Supplier management
  addSupplier: (supplier: Supplier) => void;
  updateSupplier: (id: string, updates: Partial<Supplier>) => void;
  deleteSupplier: (id: string) => void;
  getSupplierById: (id: string) => Supplier | undefined;

  // Purchase Order management
  createPurchaseOrder: (order: Omit<PurchaseOrder, 'id' | 'orderNumber' | 'createdAt' | 'updatedAt'>) => PurchaseOrder;
  updatePurchaseOrder: (id: string, updates: Partial<PurchaseOrder>) => void;
  deletePurchaseOrder: (id: string) => void;
  getPurchaseOrderById: (id: string) => PurchaseOrder | undefined;
  receivePurchaseOrder: (
    orderId: string,
    receivedItems: { itemId: string; quantityReceived: number; notes?: string }[],
    userId: string,
    userName: string,
    notes?: string
  ) => ReceivingRecord | null;

  // Stocktake management
  createStocktake: (name: string, description?: string, userId?: string, userName?: string) => Stocktake;
  updateStocktakeItem: (stocktakeId: string, itemId: string, countedQuantity: number, notes?: string, userId?: string) => void;
  completeStocktake: (stocktakeId: string, userId?: string, userName?: string, applyAdjustments?: boolean) => void;
  cancelStocktake: (stocktakeId: string) => void;
  getStocktakeById: (id: string) => Stocktake | undefined;

  // Stock Transfer management
  createStockTransfer: (
    itemId: string,
    fromLocationId: string,
    fromLocationName: string,
    toLocationId: string,
    toLocationName: string,
    quantity: number,
    userId: string,
    userName: string,
    notes?: string
  ) => StockTransfer | null;
  completeStockTransfer: (transferId: string, userId: string, userName: string) => boolean;
  cancelStockTransfer: (transferId: string) => boolean;
  getStockTransfers: (filters?: { itemId?: string; locationId?: string; status?: StockTransfer['status'] }) => StockTransfer[];
  getStockByLocation: (itemId: string) => LocationStock[];
  updateLocationStock: (itemId: string, locationId: string, locationName: string, quantity: number) => void;
  ensureLocationStock: (itemId: string, locationId: string, locationName: string, seedFromCurrent?: boolean) => number;
}

const generateId = () => `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
const generateOrderNumber = () => `PO-${new Date().getFullYear()}-${String(Date.now()).slice(-6)}`;

export const useInventoryStore = create<InventoryState>((set, get) => ({
  types: [
    { type_id: 'type_1', name: 'Equipment', order: 1 },
    { type_id: 'type_2', name: 'Supplies', order: 2 },
    { type_id: 'type_3', name: 'Tools', order: 3 },
    { type_id: 'type_4', name: 'Retail Products', order: 4 },
    { type_id: 'type_5', name: 'Back Bar', order: 5 }
  ],
  manufacturers: [
    { manufacturer_id: 'man_1', name: 'Dyson', order: 1 },
    { manufacturer_id: 'man_2', name: 'Philips', order: 2 },
    { manufacturer_id: 'man_3', name: 'Wahl', order: 3 },
    { manufacturer_id: 'man_4', name: 'Redken', order: 4 },
    { manufacturer_id: 'man_5', name: 'Olaplex', order: 5 }
  ],
  suppliers: [
    {
      id: 'sup_1',
      name: 'Beauty Supply Co',
      contactName: 'John Smith',
      email: 'orders@beautysupply.com',
      phone: '+1-555-0100',
      address: '123 Beauty Lane',
      city: 'Los Angeles',
      state: 'CA',
      zipCode: '90001',
      country: 'USA',
      paymentTerms: 'Net 30',
      leadTimeDays: 5,
      status: 'active',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    },
    {
      id: 'sup_2',
      name: 'Pro Salon Distributors',
      contactName: 'Sarah Johnson',
      email: 'sales@prosalon.com',
      phone: '+1-555-0200',
      address: '456 Salon Street',
      city: 'New York',
      state: 'NY',
      zipCode: '10001',
      country: 'USA',
      paymentTerms: 'Net 15',
      leadTimeDays: 3,
      status: 'active',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z'
    }
  ],
  purchaseOrders: [],
  receivingRecords: [],
  stocktakes: [],
  stockTransfers: [],
  isLoading: false,
  error: null,

  initializeData: (data) => {
    set({
      items: data.items || get().items,
      types: data.types || get().types,
      manufacturers: data.manufacturers || get().manufacturers,
      suppliers: data.suppliers || get().suppliers,
    });
  },

  addItem: (item) => {
    set((state) => ({
      items: [...state.items, item],
    }));
    get().generateLowStockAlerts();
  },

  updateItem: (id, updates) => {
    set((state) => ({
      items: state.items.map((item) =>
        item.id === id ? { ...item, ...updates, updatedAt: new Date().toISOString() } : item
      ),
    }));
    get().generateLowStockAlerts();
  },

  deleteItem: (id) => {
    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
      lowStockAlerts: state.lowStockAlerts.filter((alert) => alert.itemId !== id),
    }));
  },

  getItemById: (id) => get().items.find((item) => item.id === id),

  getItemBySku: (sku) => get().items.find((item) => item.sku.toLowerCase() === sku.toLowerCase()),

  getItemByBarcode: (barcode) => get().items.find((item) => item.barcode === barcode),

  getFilteredItems: (filters) => {
    let items = get().items;

    if (filters.search) {
      const search = filters.search.toLowerCase();
      items = items.filter(
        (item) =>
          item.name.toLowerCase().includes(search) ||
          item.sku.toLowerCase().includes(search) ||
          item.barcode?.toLowerCase().includes(search) ||
          item.manufacturer.toLowerCase().includes(search)
      );
    }

    if (filters.typeId) {
      items = items.filter((item) => item.typeId === filters.typeId);
    }

    if (filters.supplierId) {
      items = items.filter((item) => item.supplierId === filters.supplierId);
    }

    if (filters.status) {
      items = items.filter((item) => item.status === filters.status);
    }

    if (filters.stockStatus) {
      items = items.filter((item) => {
        if (filters.stockStatus === 'out_of_stock') return item.currentStock <= 0;
        if (filters.stockStatus === 'low_stock') return item.currentStock > 0 && item.currentStock <= item.lowStockThreshold;
        if (filters.stockStatus === 'in_stock') return item.currentStock > item.lowStockThreshold;
        return true;
      });
    }

    if (filters.isRetail !== undefined) {
      items = items.filter((item) => item.isRetail === filters.isRetail);
    }

    if (filters.isBackBar !== undefined) {
      items = items.filter((item) => item.isBackBar === filters.isBackBar);
    }

    if (filters.locationId) {
      items = items.filter((item) => {
        const hasLocationStock = item.locationStock && item.locationStock.length > 0;
        if (hasLocationStock) {
          return item.locationStock.some(ls => ls.locationId === filters.locationId && ls.quantity > 0);
        }
        return item.currentStock > 0;
      });
    }

    return items;
  },

  addType: (type) => set((state) => ({ types: [...state.types, type] })),

  updateType: (id, updates) =>
    set((state) => ({
      types: state.types.map((type) => (type.type_id === id ? { ...type, ...updates } : type)),
    })),

  deleteType: (id) => set((state) => ({ types: state.types.filter((type) => type.type_id !== id) })),

  reorderTypes: (types) => set({ types }),

  addManufacturer: (manufacturer) => set((state) => ({ manufacturers: [...state.manufacturers, manufacturer] })),

  updateManufacturer: (id, updates) =>
    set((state) => ({
      manufacturers: state.manufacturers.map((m) => (m.manufacturer_id === id ? { ...m, ...updates } : m)),
    })),

  deleteManufacturer: (id) =>
    set((state) => ({ manufacturers: state.manufacturers.filter((m) => m.manufacturer_id !== id) })),

  reorderManufacturers: (manufacturers) => set({ manufacturers }),

  addSupplier: (supplier) => set((state) => ({ suppliers: [...state.suppliers, supplier] })),

  updateSupplier: (id, updates) =>
    set((state) => ({
      suppliers: state.suppliers.map((s) =>
        s.id === id ? { ...s, ...updates, updatedAt: new Date().toISOString() } : s
      ),
    })),

  deleteSupplier: (id) => set((state) => ({ suppliers: state.suppliers.filter((s) => s.id !== id) })),

  getSupplierById: (id) => get().suppliers.find((s) => s.id === id),

  // NOTE: adjustStock, getStockMovements, getStockAdjustments removed
  // Use useAdjustStock hook from @/hooks/api/useInventory instead

  createPurchaseOrder: (orderData) => {
    const order: PurchaseOrder = {
      ...orderData,
      id: `po_${generateId()}`,
      orderNumber: generateOrderNumber(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    set((state) => ({
      purchaseOrders: [order, ...state.purchaseOrders],
    }));

    return order;
  },

  updatePurchaseOrder: (id, updates) => {
    set((state) => ({
      purchaseOrders: state.purchaseOrders.map((po) =>
        po.id === id ? { ...po, ...updates, updatedAt: new Date().toISOString() } : po
      ),
    }));
  },

  deletePurchaseOrder: (id) => {
    set((state) => ({
      purchaseOrders: state.purchaseOrders.filter((po) => po.id !== id),
    }));
  },

  getPurchaseOrderById: (id) => get().purchaseOrders.find((po) => po.id === id),

  receivePurchaseOrder: (orderId, receivedItems, userId, userName, notes) => {
    const order = get().getPurchaseOrderById(orderId);
    if (!order) return null;

    const record: ReceivingRecord = {
      id: `rec_${generateId()}`,
      purchaseOrderId: orderId,
      purchaseOrderNumber: order.orderNumber,
      supplierId: order.supplierId,
      supplierName: order.supplierName,
      items: receivedItems.map((ri) => {
        const poItem = order.items.find((i) => i.itemId === ri.itemId);
        return {
          itemId: ri.itemId,
          itemName: poItem?.itemName || '',
          quantityExpected: poItem?.quantityOrdered || 0,
          quantityReceived: ri.quantityReceived,
          notes: ri.notes,
        };
      }),
      receivedBy: userId,
      receivedByName: userName,
      receivedAt: new Date().toISOString(),
      notes,
    };

    receivedItems.forEach((ri) => {
      if (ri.quantityReceived > 0) {
        get().adjustStock(
          ri.itemId,
          ri.quantityReceived,
          'received',
          `Received from PO ${order.orderNumber}`,
          userId,
          userName,
          orderId,
          'purchase_order'
        );
      }
    });

    const updatedItems = order.items.map((item) => {
      const received = receivedItems.find((ri) => ri.itemId === item.itemId);
      return {
        ...item,
        quantityReceived: item.quantityReceived + (received?.quantityReceived || 0),
      };
    });

    const allReceived = updatedItems.every((item) => item.quantityReceived >= item.quantityOrdered);
    const someReceived = updatedItems.some((item) => item.quantityReceived > 0);

    const newStatus: PurchaseOrderStatus = allReceived
      ? 'received'
      : someReceived
      ? 'partially_received'
      : order.status;

    set((state) => ({
      purchaseOrders: state.purchaseOrders.map((po) =>
        po.id === orderId
          ? {
              ...po,
              items: updatedItems,
              status: newStatus,
              receivedDate: allReceived ? new Date().toISOString() : po.receivedDate,
              updatedAt: new Date().toISOString(),
            }
          : po
      ),
      receivingRecords: [record, ...state.receivingRecords],
    }));

    return record;
  },

  createStocktake: (name, description, userId = 'system', userName = 'System') => {
    const items = get().items.filter((item) => item.trackStock && item.status === 'active');

    const stocktakeItems: StocktakeItem[] = items.map((item) => ({
      id: `sti_${generateId()}`,
      itemId: item.id,
      itemName: item.name,
      sku: item.sku,
      expectedQuantity: item.currentStock,
      countedQuantity: null,
      discrepancy: 0,
      discrepancyValue: 0,
    }));

    const stocktake: Stocktake = {
      id: `st_${generateId()}`,
      name,
      description,
      items: stocktakeItems,
      status: 'in_progress',
      totalItems: stocktakeItems.length,
      countedItems: 0,
      totalDiscrepancy: 0,
      totalDiscrepancyValue: 0,
      startedAt: new Date().toISOString(),
      startedBy: userId,
      startedByName: userName,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    set((state) => ({
      stocktakes: [stocktake, ...state.stocktakes],
    }));

    return stocktake;
  },

  updateStocktakeItem: (stocktakeId, itemId, countedQuantity, notes, userId) => {
    set((state) => {
      const stocktake = state.stocktakes.find((st) => st.id === stocktakeId);
      if (!stocktake) return state;

      const item = get().getItemById(itemId);
      const costPrice = item?.costPrice || 0;

      const updatedItems = stocktake.items.map((sti) => {
        if (sti.itemId === itemId) {
          const discrepancy = countedQuantity - sti.expectedQuantity;
          return {
            ...sti,
            countedQuantity,
            discrepancy,
            discrepancyValue: discrepancy * costPrice,
            notes,
            countedAt: new Date().toISOString(),
            countedBy: userId,
          };
        }
        return sti;
      });

      const countedItems = updatedItems.filter((i) => i.countedQuantity !== null).length;
      const totalDiscrepancy = updatedItems.reduce((sum, i) => sum + Math.abs(i.discrepancy), 0);
      const totalDiscrepancyValue = updatedItems.reduce((sum, i) => sum + Math.abs(i.discrepancyValue), 0);

      return {
        stocktakes: state.stocktakes.map((st) =>
          st.id === stocktakeId
            ? {
                ...st,
                items: updatedItems,
                countedItems,
                totalDiscrepancy,
                totalDiscrepancyValue,
                updatedAt: new Date().toISOString(),
              }
            : st
        ),
      };
    });
  },

  completeStocktake: (stocktakeId, userId = 'system', userName = 'System', applyAdjustments = true) => {
    const stocktake = get().getStocktakeById(stocktakeId);
    if (!stocktake) return;

    if (applyAdjustments) {
      stocktake.items.forEach((sti) => {
        if (sti.countedQuantity !== null && sti.discrepancy !== 0) {
          get().adjustStock(
            sti.itemId,
            sti.discrepancy,
            'stocktake_adjustment',
            `Stocktake adjustment: ${stocktake.name}`,
            userId,
            userName,
            stocktakeId,
            'stocktake'
          );
        }
      });
    }

    set((state) => ({
      stocktakes: state.stocktakes.map((st) =>
        st.id === stocktakeId
          ? {
              ...st,
              status: 'completed',
              completedAt: new Date().toISOString(),
              completedBy: userId,
              completedByName: userName,
              updatedAt: new Date().toISOString(),
            }
          : st
      ),
    }));
  },

  cancelStocktake: (stocktakeId) => {
    set((state) => ({
      stocktakes: state.stocktakes.map((st) =>
        st.id === stocktakeId
          ? { ...st, status: 'cancelled', updatedAt: new Date().toISOString() }
          : st
      ),
    }));
  },

  getStocktakeById: (id) => get().stocktakes.find((st) => st.id === id),

  // NOTE: Item-related helper methods removed
  // Use React Query hooks from @/hooks/api/useInventory instead:
  // - useProducts() for item data
  // - useLowStockAlerts() for alerts
  // - Compute stats from query data in components

  createStockTransfer: (itemId, fromLocationId, fromLocationName, toLocationId, toLocationName, quantity, userId, userName, notes) => {
    const item = get().getItemById(itemId);
    if (!item) return null;
    
    const sourceQty = get().ensureLocationStock(itemId, fromLocationId, fromLocationName, true);
    get().ensureLocationStock(itemId, toLocationId, toLocationName, false);
    
    if (!item.allowNegativeStock && sourceQty < quantity) {
      return null;
    }
    
    const transfer: StockTransfer = {
      id: generateId(),
      itemId,
      itemName: item.name,
      sku: item.sku,
      fromLocationId,
      fromLocationName,
      toLocationId,
      toLocationName,
      quantity,
      status: 'pending',
      notes,
      requestedBy: userId,
      requestedByName: userName,
      requestedAt: new Date().toISOString(),
    };
    
    set((state) => ({
      stockTransfers: [transfer, ...state.stockTransfers],
    }));
    
    return transfer;
  },

  completeStockTransfer: (transferId, userId, userName) => {
    const transfer = get().stockTransfers.find(t => t.id === transferId);
    if (!transfer || transfer.status !== 'pending') return false;
    
    const item = get().getItemById(transfer.itemId);
    if (!item) return false;
    
    get().ensureLocationStock(transfer.itemId, transfer.fromLocationId, transfer.fromLocationName, true);
    get().ensureLocationStock(transfer.itemId, transfer.toLocationId, transfer.toLocationName, false);
    
    const sourceStock = get().getStockByLocation(transfer.itemId).find(
      ls => ls.locationId === transfer.fromLocationId
    );
    const sourceQty = sourceStock?.quantity || 0;
    
    if (!item.allowNegativeStock && sourceQty < transfer.quantity) {
      return false;
    }
    
    get().updateLocationStock(
      transfer.itemId,
      transfer.fromLocationId,
      transfer.fromLocationName,
      sourceQty - transfer.quantity
    );
    
    const destStock = get().getStockByLocation(transfer.itemId).find(
      ls => ls.locationId === transfer.toLocationId
    );
    const destQty = destStock?.quantity || 0;
    
    get().updateLocationStock(
      transfer.itemId,
      transfer.toLocationId,
      transfer.toLocationName,
      destQty + transfer.quantity
    );
    
    get().adjustStock(
      transfer.itemId,
      0,
      'transfer_out',
      `Stock transfer: ${transfer.quantity} units from ${transfer.fromLocationName} to ${transfer.toLocationName}`,
      userId,
      userName,
      transferId,
      'transfer'
    );
    
    set((state) => ({
      stockTransfers: state.stockTransfers.map(t => 
        t.id === transferId
          ? {
              ...t,
              status: 'completed' as const,
              completedBy: userId,
              completedByName: userName,
              completedAt: new Date().toISOString(),
            }
          : t
      ),
    }));
    
    return true;
  },

  cancelStockTransfer: (transferId) => {
    const transfer = get().stockTransfers.find(t => t.id === transferId);
    if (!transfer || transfer.status !== 'pending') return false;
    
    set((state) => ({
      stockTransfers: state.stockTransfers.map(t =>
        t.id === transferId
          ? { ...t, status: 'cancelled' as const }
          : t
      ),
    }));
    
    return true;
  },

  getStockTransfers: (filters) => {
    let transfers = [...get().stockTransfers];
    
    if (filters?.itemId) {
      transfers = transfers.filter(t => t.itemId === filters.itemId);
    }
    if (filters?.locationId) {
      transfers = transfers.filter(t => 
        t.fromLocationId === filters.locationId || t.toLocationId === filters.locationId
      );
    }
    if (filters?.status) {
      transfers = transfers.filter(t => t.status === filters.status);
    }
    
    return transfers.sort((a, b) => 
      new Date(b.requestedAt).getTime() - new Date(a.requestedAt).getTime()
    );
  },

  getStockByLocation: (itemId) => {
    const item = get().getItemById(itemId);
    if (!item) return [];
    return item.locationStock || [];
  },

  updateLocationStock: (itemId, locationId, locationName, quantity) => {
    set((state) => ({
      items: state.items.map(item => {
        if (item.id !== itemId) return item;
        
        const locationStock = item.locationStock || [];
        const existingIndex = locationStock.findIndex(ls => ls.locationId === locationId);
        
        let updatedLocationStock: typeof locationStock;
        
        if (existingIndex >= 0) {
          updatedLocationStock = [...locationStock];
          updatedLocationStock[existingIndex] = {
            ...updatedLocationStock[existingIndex],
            quantity,
            lastUpdated: new Date().toISOString(),
          };
        } else {
          updatedLocationStock = [
            ...locationStock,
            {
              locationId,
              locationName,
              quantity,
              lowStockThreshold: item.lowStockThreshold,
              lastUpdated: new Date().toISOString(),
            },
          ];
        }
        
        const newCurrentStock = updatedLocationStock.reduce((sum, ls) => sum + ls.quantity, 0);
        
        return { 
          ...item, 
          locationStock: updatedLocationStock,
          currentStock: newCurrentStock,
          updatedAt: new Date().toISOString(),
        };
      }),
    }));
    get().generateLowStockAlerts();
  },

  ensureLocationStock: (itemId, locationId, locationName, seedFromCurrent = false) => {
    const item = get().getItemById(itemId);
    if (!item) return 0;
    
    const locationStock = item.locationStock || [];
    const existing = locationStock.find(ls => ls.locationId === locationId);
    
    if (existing) {
      return existing.quantity;
    }
    
    const seedQty = seedFromCurrent && locationStock.length === 0 ? item.currentStock : 0;
    get().updateLocationStock(itemId, locationId, locationName, seedQty);
    
    return seedQty;
  },
}));
