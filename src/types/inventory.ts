export interface InventoryCategory {
  id: string;
  name: string;
  description?: string;
  parentId?: string;
  order: number;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryType {
  type_id: string;
  name: string;
  order: number;
}

export interface Manufacturer {
  manufacturer_id: string;
  name: string;
  order: number;
}

export interface Supplier {
  id: string;
  name: string;
  contactName?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  website?: string;
  notes?: string;
  paymentTerms?: string;
  leadTimeDays?: number;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string;
}

export interface InventoryItem {
  id: string;
  name: string;
  description?: string;
  sku: string;
  barcode?: string;
  categoryId?: string;
  typeId?: string;
  type: string;
  manufacturerId?: string;
  manufacturer: string;
  supplierId?: string;
  costPrice: number;
  retailPrice: number | null;
  currentStock: number;
  lowStockThreshold: number;
  reorderQuantity: number;
  reorderPoint: number;
  maxStock?: number;
  unitOfMeasure: string;
  isRetail: boolean;
  isBackBar: boolean;
  trackStock: boolean;
  allowNegativeStock: boolean;
  commissionRate?: number;
  taxable: boolean;
  expirationDate?: string;
  imageUrl?: string;
  notes?: string;
  status: 'active' | 'inactive' | 'discontinued';
  createdAt: string;
  updatedAt: string;
}

export type StockAdjustmentReason = 
  | 'received'
  | 'sold'
  | 'damaged'
  | 'expired'
  | 'lost'
  | 'stolen'
  | 'returned'
  | 'used_in_service'
  | 'transfer_in'
  | 'transfer_out'
  | 'stocktake_adjustment'
  | 'initial_stock'
  | 'other';

export interface StockAdjustment {
  id: string;
  itemId: string;
  itemName: string;
  previousQuantity: number;
  adjustmentQuantity: number;
  newQuantity: number;
  reason: StockAdjustmentReason;
  notes?: string;
  referenceId?: string;
  referenceType?: 'purchase_order' | 'sale' | 'stocktake' | 'transfer';
  adjustedBy: string;
  adjustedByName: string;
  createdAt: string;
}

export interface StockMovement {
  id: string;
  itemId: string;
  itemName: string;
  movementType: 'in' | 'out';
  quantity: number;
  previousStock: number;
  newStock: number;
  reason: StockAdjustmentReason;
  referenceId?: string;
  referenceType?: string;
  notes?: string;
  performedBy: string;
  performedByName: string;
  createdAt: string;
}

export type PurchaseOrderStatus = 
  | 'draft'
  | 'pending'
  | 'ordered'
  | 'partially_received'
  | 'received'
  | 'cancelled';

export interface PurchaseOrderItem {
  id: string;
  itemId: string;
  itemName: string;
  sku: string;
  quantityOrdered: number;
  quantityReceived: number;
  unitCost: number;
  totalCost: number;
  notes?: string;
}

export interface PurchaseOrder {
  id: string;
  orderNumber: string;
  supplierId: string;
  supplierName: string;
  items: PurchaseOrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  status: PurchaseOrderStatus;
  orderDate: string;
  expectedDeliveryDate?: string;
  receivedDate?: string;
  notes?: string;
  createdBy: string;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
}

export interface ReceivingRecord {
  id: string;
  purchaseOrderId: string;
  purchaseOrderNumber: string;
  supplierId: string;
  supplierName: string;
  items: {
    itemId: string;
    itemName: string;
    quantityExpected: number;
    quantityReceived: number;
    notes?: string;
  }[];
  receivedBy: string;
  receivedByName: string;
  receivedAt: string;
  notes?: string;
}

export type StocktakeStatus = 'in_progress' | 'completed' | 'cancelled';

export interface StocktakeItem {
  id: string;
  itemId: string;
  itemName: string;
  sku: string;
  expectedQuantity: number;
  countedQuantity: number | null;
  discrepancy: number;
  discrepancyValue: number;
  notes?: string;
  countedAt?: string;
  countedBy?: string;
}

export interface Stocktake {
  id: string;
  name: string;
  description?: string;
  items: StocktakeItem[];
  status: StocktakeStatus;
  totalItems: number;
  countedItems: number;
  totalDiscrepancy: number;
  totalDiscrepancyValue: number;
  startedAt: string;
  completedAt?: string;
  startedBy: string;
  startedByName: string;
  completedBy?: string;
  completedByName?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryReport {
  totalItems: number;
  totalValue: number;
  totalRetailValue: number;
  lowStockItems: number;
  outOfStockItems: number;
  overstockItems: number;
  averageTurnover: number;
  topSellingProducts: {
    itemId: string;
    itemName: string;
    quantitySold: number;
    revenue: number;
  }[];
  slowMovingProducts: {
    itemId: string;
    itemName: string;
    daysSinceLastSale: number;
    currentStock: number;
  }[];
}

export interface LowStockAlert {
  id: string;
  itemId: string;
  itemName: string;
  sku: string;
  currentStock: number;
  lowStockThreshold: number;
  reorderQuantity: number;
  supplierId?: string;
  supplierName?: string;
  severity: 'warning' | 'critical';
  createdAt: string;
  acknowledgedAt?: string;
  acknowledgedBy?: string;
}

export interface InventoryFilters {
  search?: string;
  categoryId?: string;
  typeId?: string;
  supplierId?: string;
  status?: 'active' | 'inactive' | 'discontinued';
  stockStatus?: 'in_stock' | 'low_stock' | 'out_of_stock';
  isRetail?: boolean;
  isBackBar?: boolean;
}

export interface InventoryStats {
  totalProducts: number;
  totalValue: number;
  totalRetailValue: number;
  lowStockCount: number;
  outOfStockCount: number;
  activeProducts: number;
  inactiveProducts: number;
}
