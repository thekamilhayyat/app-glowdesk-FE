/**
 * Inventory API endpoints
 * Real backend API implementation
 */

import { ApiResponse, PaginatedResponse, PaginationParams, getAuthToken, createApiError } from './client';
import { InventoryItem, StockAdjustment, LowStockAlert, StockAdjustmentReason } from '@/types/inventory';

const API_BASE_URL = '/api/inventory';

/**
 * Map frontend StockAdjustmentReason to backend type
 */
const mapAdjustmentReasonToBackendType = (reason: StockAdjustmentReason): 'purchase' | 'sale' | 'adjustment' | 'waste' | 'return' => {
  const mapping: Record<StockAdjustmentReason, 'purchase' | 'sale' | 'adjustment' | 'waste' | 'return'> = {
    'received': 'purchase',
    'returned': 'return',
    'transfer_in': 'purchase',
    'initial_stock': 'adjustment',
    'sold': 'sale',
    'damaged': 'waste',
    'expired': 'waste',
    'lost': 'waste',
    'stolen': 'waste',
    'used_in_service': 'sale',
    'transfer_out': 'sale',
    'stocktake_adjustment': 'adjustment',
    'other': 'adjustment',
  };
  return mapping[reason] || 'adjustment';
};

/**
 * Map backend product response to InventoryItem
 */
const mapBackendProductToInventoryItem = (backendProduct: any): InventoryItem => {
  return {
    id: backendProduct.id,
    name: backendProduct.name,
    description: backendProduct.description,
    sku: backendProduct.sku,
    barcode: backendProduct.barcode,
    type: backendProduct.type?.name || backendProduct.type || 'Other',
    typeId: backendProduct.type?.id || backendProduct.typeId,
    manufacturer: backendProduct.manufacturer?.name || backendProduct.manufacturer || 'Unknown',
    manufacturerId: backendProduct.manufacturer?.id || backendProduct.manufacturerId,
    supplierId: backendProduct.supplierId,
    costPrice: backendProduct.cost || 0,
    retailPrice: backendProduct.price || null,
    currentStock: backendProduct.quantityInStock || 0,
    lowStockThreshold: backendProduct.lowStockThreshold || 10,
    reorderQuantity: backendProduct.reorderQuantity || 20,
    reorderPoint: backendProduct.reorderPoint || 5,
    maxStock: backendProduct.maxStock,
    unitOfMeasure: backendProduct.unitOfMeasure || 'unit',
    isRetail: backendProduct.isRetail ?? true,
    isBackBar: backendProduct.isBackBar ?? false,
    trackStock: backendProduct.trackStock ?? true,
    allowNegativeStock: backendProduct.allowNegativeStock ?? false,
    commissionRate: backendProduct.commissionRate,
    taxable: backendProduct.taxable ?? true,
    expirationDate: backendProduct.expirationDate,
    imageUrl: backendProduct.imageUrl,
    notes: backendProduct.notes,
    status: backendProduct.isActive === false ? 'inactive' : backendProduct.status || 'active',
    locationStock: backendProduct.locationStock,
    createdAt: backendProduct.createdAt,
    updatedAt: backendProduct.updatedAt,
  };
};

/**
 * Make authenticated HTTP request
 */
const makeRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const token = getAuthToken();
  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
};

export interface ProductFilters extends PaginationParams {
  search?: string;
  typeId?: string;
  manufacturerId?: string;
  isActive?: boolean;
  lowStock?: boolean;
}

export interface CreateProductRequest {
  sku?: string;
  barcode?: string;
  name: string;
  description?: string;
  manufacturerId?: string;
  typeId?: string;
  price: number;
  cost?: number;
  quantityInStock?: number;
  lowStockThreshold?: number;
  isActive?: boolean;
}

export interface UpdateProductRequest {
  name?: string;
  description?: string;
  price?: number;
  cost?: number;
  quantityInStock?: number;
  lowStockThreshold?: number;
  isActive?: boolean;
}

export interface StockAdjustmentRequest {
  quantity: number;
  type: 'purchase' | 'sale' | 'adjustment' | 'waste' | 'return';
  notes?: string;
  referenceId?: string;
}

/**
 * Helper to create stock adjustment request from frontend reason
 */
export const createStockAdjustmentRequest = (
  quantity: number,
  reason: StockAdjustmentReason,
  notes?: string,
  referenceId?: string
): StockAdjustmentRequest => {
  return {
    quantity,
    type: mapAdjustmentReasonToBackendType(reason),
    notes,
    referenceId,
  };
};

/**
 * GET /products
 * Get list of products
 */
export const getProducts = async (
  filters?: ProductFilters
): Promise<ApiResponse<PaginatedResponse<InventoryItem>>> => {
  try {
    const params = new URLSearchParams();
    if (filters?.search) params.append('search', filters.search);
    if (filters?.typeId) params.append('typeId', filters.typeId);
    if (filters?.manufacturerId) params.append('manufacturerId', filters.manufacturerId);
    if (filters?.isActive !== undefined) params.append('isActive', String(filters.isActive));
    if (filters?.lowStock) params.append('lowStock', 'true');
    if (filters?.page) params.append('page', String(filters.page));
    if (filters?.limit) params.append('limit', String(filters.limit));
    if (filters?.sortBy) params.append('sortBy', filters.sortBy);
    if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);

    const queryString = params.toString();
    const endpoint = `/products${queryString ? `?${queryString}` : ''}`;
    const response = await makeRequest<{ data: any[]; pagination: any }>(endpoint);

    return {
      data: {
        data: response.data.map(mapBackendProductToInventoryItem),
        pagination: response.pagination,
      },
    };
  } catch (error) {
    return createApiError(
      'FETCH_ERROR',
      error instanceof Error ? error.message : 'Failed to fetch products'
    );
  }
};

/**
 * GET /products/:id
 * Get single product by ID
 */
export const getProductById = async (
  id: string
): Promise<ApiResponse<{ product: InventoryItem }>> => {
  try {
    const response = await makeRequest<{ product: any }>(`/products/${id}`);
    return {
      data: {
        product: mapBackendProductToInventoryItem(response.product),
      },
    };
  } catch (error) {
    if (error instanceof Error && error.message.includes('404')) {
      return createApiError('PRODUCT_NOT_FOUND', 'Product not found');
    }
    return createApiError(
      'FETCH_ERROR',
      error instanceof Error ? error.message : 'Failed to fetch product'
    );
  }
};

/**
 * POST /products
 * Create new product
 */
export const createProduct = async (
  request: CreateProductRequest
): Promise<ApiResponse<{ product: InventoryItem }>> => {
  try {
    const response = await makeRequest<{ product: any }>('/products', {
      method: 'POST',
      body: JSON.stringify(request),
    });
    return {
      data: {
        product: mapBackendProductToInventoryItem(response.product),
      },
    };
  } catch (error) {
    if (error instanceof Error && error.message.includes('409')) {
      return createApiError('DUPLICATE_SKU', 'SKU already exists');
    }
    if (error instanceof Error && error.message.includes('400')) {
      return createApiError('VALIDATION_ERROR', error.message);
    }
    return createApiError(
      'CREATE_ERROR',
      error instanceof Error ? error.message : 'Failed to create product'
    );
  }
};

/**
 * PUT /products/:id
 * Update product
 */
export const updateProduct = async (
  id: string,
  request: UpdateProductRequest
): Promise<ApiResponse<{ product: InventoryItem }>> => {
  try {
    const response = await makeRequest<{ product: any }>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(request),
    });
    return {
      data: {
        product: mapBackendProductToInventoryItem(response.product),
      },
    };
  } catch (error) {
    if (error instanceof Error && error.message.includes('404')) {
      return createApiError('PRODUCT_NOT_FOUND', 'Product not found');
    }
    if (error instanceof Error && error.message.includes('400')) {
      return createApiError('VALIDATION_ERROR', error.message);
    }
    return createApiError(
      'UPDATE_ERROR',
      error instanceof Error ? error.message : 'Failed to update product'
    );
  }
};

/**
 * DELETE /products/:id
 * Delete product
 */
export const deleteProduct = async (id: string): Promise<ApiResponse<void>> => {
  try {
    await makeRequest(`/products/${id}`, {
      method: 'DELETE',
    });
    return { data: undefined };
  } catch (error) {
    if (error instanceof Error && error.message.includes('404')) {
      return createApiError('PRODUCT_NOT_FOUND', 'Product not found');
    }
    if (error instanceof Error && error.message.includes('400')) {
      return createApiError('CANNOT_DELETE', error.message);
    }
    return createApiError(
      'DELETE_ERROR',
      error instanceof Error ? error.message : 'Failed to delete product'
    );
  }
};

/**
 * POST /products/:id/adjust-stock
 * Adjust product stock quantity
 */
export const adjustStock = async (
  id: string,
  request: StockAdjustmentRequest
): Promise<ApiResponse<{ product: InventoryItem; transaction: StockAdjustment }>> => {
  try {
    const response = await makeRequest<{ product: any; transaction: any }>(`/products/${id}/adjust-stock`, {
      method: 'POST',
      body: JSON.stringify(request),
    });
    return {
      data: {
        product: mapBackendProductToInventoryItem(response.product),
        transaction: {
          id: response.transaction.id,
          itemId: response.transaction.itemId,
          itemName: response.transaction.itemName,
          previousQuantity: response.transaction.previousQuantity,
          adjustmentQuantity: response.transaction.adjustmentQuantity || response.transaction.quantity,
          newQuantity: response.transaction.newQuantity,
          reason: response.transaction.reason || response.transaction.type,
          notes: response.transaction.notes,
          referenceId: response.transaction.referenceId,
          referenceType: response.transaction.referenceType,
          adjustedBy: response.transaction.adjustedBy,
          adjustedByName: response.transaction.adjustedByName,
          createdAt: response.transaction.createdAt,
        },
      },
    };
  } catch (error) {
    if (error instanceof Error && error.message.includes('404')) {
      return createApiError('PRODUCT_NOT_FOUND', 'Product not found');
    }
    if (error instanceof Error && error.message.includes('400')) {
      if (error.message.includes('Insufficient') || error.message.includes('negative')) {
        return createApiError('INSUFFICIENT_STOCK', 'Insufficient stock');
      }
      return createApiError('INVALID_ADJUSTMENT', error.message);
    }
    return createApiError(
      'ADJUST_ERROR',
      error instanceof Error ? error.message : 'Failed to adjust stock'
    );
  }
};

/**
 * GET /products/low-stock
 * Get low stock alerts
 */
export const getLowStockAlerts = async (): Promise<ApiResponse<{ alerts: LowStockAlert[] }>> => {
  try {
    const response = await makeRequest<{ alerts: any[] }>('/products/low-stock');
    return {
      data: {
        alerts: response.alerts.map((alert: any) => ({
          id: alert.id,
          itemId: alert.itemId,
          itemName: alert.itemName,
          sku: alert.sku,
          currentStock: alert.currentStock,
          lowStockThreshold: alert.lowStockThreshold,
          reorderQuantity: alert.reorderQuantity,
          supplierId: alert.supplierId,
          supplierName: alert.supplierName,
          severity: alert.severity,
          createdAt: alert.createdAt,
          acknowledgedAt: alert.acknowledgedAt,
          acknowledgedBy: alert.acknowledgedBy,
        })),
      },
    };
  } catch (error) {
    return createApiError(
      'FETCH_ERROR',
      error instanceof Error ? error.message : 'Failed to fetch low stock alerts'
    );
  }
};

/**
 * GET /manufacturers
 * Get list of manufacturers
 */
export const getManufacturers = async (): Promise<ApiResponse<{ data: any[] }>> => {
  try {
    const response = await makeRequest<{ data: any[] }>('/manufacturers');
    return { data: response };
  } catch (error) {
    return createApiError(
      'FETCH_ERROR',
      error instanceof Error ? error.message : 'Failed to fetch manufacturers'
    );
  }
};

/**
 * GET /product-types
 * Get list of product types/categories
 */
export const getProductTypes = async (): Promise<ApiResponse<{ data: any[] }>> => {
  try {
    const response = await makeRequest<{ data: any[] }>('/product-types');
    return { data: response };
  } catch (error) {
    return createApiError(
      'FETCH_ERROR',
      error instanceof Error ? error.message : 'Failed to fetch product types'
    );
  }
};
