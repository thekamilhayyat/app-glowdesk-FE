/**
 * React Query hooks for Inventory API
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  adjustStock,
  getLowStockAlerts,
  getManufacturers,
  getProductTypes,
  createStockAdjustmentRequest,
  ProductFilters,
  CreateProductRequest,
  UpdateProductRequest,
  StockAdjustmentRequest,
} from '@/api/inventory.api';
import { StockAdjustmentReason } from '@/types/inventory';
import { extractData, hasError } from '@/api/client';
import { toast } from '@/components/ui/sonner';

export const useProducts = (filters?: ProductFilters) => {
  return useQuery({
    queryKey: ['products', filters],
    queryFn: async () => {
      const response = await getProducts(filters);
      if (hasError(response)) {
        throw new Error(response.error?.message || 'Failed to fetch products');
      }
      return extractData(response);
    },
    staleTime: 30000, // 30 seconds
  });
};

export const useProduct = (id: string | null) => {
  return useQuery({
    queryKey: ['product', id],
    queryFn: async () => {
      if (!id) return null;
      const response = await getProductById(id);
      if (hasError(response)) {
        throw new Error(response.error?.message || 'Failed to fetch product');
      }
      return extractData(response);
    },
    enabled: !!id,
  });
};

export const useCreateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: CreateProductRequest) => {
      const response = await createProduct(request);
      if (hasError(response)) {
        throw new Error(response.error?.message || 'Failed to create product');
      }
      return extractData(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['low-stock-alerts'] });
      toast.success('Product created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create product');
    },
  });
};

export const useUpdateProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, request }: { id: string; request: UpdateProductRequest }) => {
      const response = await updateProduct(id, request);
      if (hasError(response)) {
        throw new Error(response.error?.message || 'Failed to update product');
      }
      return extractData(response);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['low-stock-alerts'] });
      toast.success('Product updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update product');
    },
  });
};

export const useDeleteProduct = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await deleteProduct(id);
      if (hasError(response)) {
        throw new Error(response.error?.message || 'Failed to delete product');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['low-stock-alerts'] });
      toast.success('Product deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete product');
    },
  });
};

export const useAdjustStock = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ 
      id, 
      quantity, 
      reason, 
      notes, 
      referenceId 
    }: { 
      id: string; 
      quantity: number; 
      reason: StockAdjustmentReason; 
      notes?: string; 
      referenceId?: string;
    }) => {
      const request = createStockAdjustmentRequest(quantity, reason, notes, referenceId);
      const response = await adjustStock(id, request);
      if (hasError(response)) {
        throw new Error(response.error?.message || 'Failed to adjust stock');
      }
      return extractData(response);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['products'] });
      queryClient.invalidateQueries({ queryKey: ['product', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['low-stock-alerts'] });
      toast.success('Stock adjusted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to adjust stock');
    },
  });
};

export const useLowStockAlerts = () => {
  return useQuery({
    queryKey: ['low-stock-alerts'],
    queryFn: async () => {
      const response = await getLowStockAlerts();
      if (hasError(response)) {
        throw new Error(response.error?.message || 'Failed to fetch low stock alerts');
      }
      return extractData(response);
    },
    staleTime: 30000, // 30 seconds
    refetchInterval: 60000, // Refetch every minute
  });
};

export const useManufacturers = () => {
  return useQuery({
    queryKey: ['manufacturers'],
    queryFn: async () => {
      const response = await getManufacturers();
      if (hasError(response)) {
        throw new Error(response.error?.message || 'Failed to fetch manufacturers');
      }
      return extractData(response);
    },
    staleTime: 300000, // 5 minutes
  });
};

export const useProductTypes = () => {
  return useQuery({
    queryKey: ['product-types'],
    queryFn: async () => {
      const response = await getProductTypes();
      if (hasError(response)) {
        throw new Error(response.error?.message || 'Failed to fetch product types');
      }
      return extractData(response);
    },
    staleTime: 300000, // 5 minutes
  });
};
