/**
 * React Query hooks for Sales API
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getSales,
  getSaleById,
  createSale,
  refundSale,
  SaleFilters,
  CreateSaleRequest,
  RefundRequest,
} from '@/api/sales.api';
import { extractData, hasError } from '@/api/client';
import { toast } from '@/components/ui/sonner';

export const useSales = (filters?: SaleFilters) => {
  return useQuery({
    queryKey: ['sales', filters],
    queryFn: async () => {
      const response = await getSales(filters);
      if (hasError(response)) {
        throw new Error(response.error?.message || 'Failed to fetch sales');
      }
      return extractData(response);
    },
    staleTime: 30000, // 30 seconds
  });
};

export const useSale = (id: string | null) => {
  return useQuery({
    queryKey: ['sale', id],
    queryFn: async () => {
      if (!id) return null;
      const response = await getSaleById(id);
      if (hasError(response)) {
        throw new Error(response.error?.message || 'Failed to fetch sale');
      }
      return extractData(response);
    },
    enabled: !!id,
  });
};

export const useCreateSale = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: CreateSaleRequest) => {
      const response = await createSale(request);
      if (hasError(response)) {
        throw new Error(response.error?.message || 'Failed to create sale');
      }
      return extractData(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      toast.success('Sale completed successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to complete sale');
    },
  });
};

export const useRefundSale = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, request }: { id: string; request: RefundRequest }) => {
      const response = await refundSale(id, request);
      if (hasError(response)) {
        throw new Error(response.error?.message || 'Failed to process refund');
      }
      return extractData(response);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['sales'] });
      queryClient.invalidateQueries({ queryKey: ['sale', variables.id] });
      toast.success('Refund processed successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to process refund');
    },
  });
};
