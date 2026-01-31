/**
 * React Query hooks for Services API
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getServices,
  getServiceById,
  createService,
  updateService,
  deleteService,
  ServiceFilters,
  CreateServiceRequest,
  UpdateServiceRequest,
} from '@/api/services.api';
import { extractData, hasError } from '@/api/client';
import { toast } from '@/components/ui/sonner';

export const useServices = (filters?: ServiceFilters) => {
  return useQuery({
    queryKey: ['services', filters],
    queryFn: async () => {
      const response = await getServices(filters);
      if (hasError(response)) {
        throw new Error(response.error?.message || 'Failed to fetch services');
      }
      return extractData(response);
    },
    staleTime: 60000, // 1 minute
  });
};

export const useService = (id: string | null) => {
  return useQuery({
    queryKey: ['service', id],
    queryFn: async () => {
      if (!id) return null;
      const response = await getServiceById(id);
      if (hasError(response)) {
        throw new Error(response.error?.message || 'Failed to fetch service');
      }
      return extractData(response);
    },
    enabled: !!id,
  });
};

export const useCreateService = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: CreateServiceRequest) => {
      const response = await createService(request);
      if (hasError(response)) {
        throw new Error(response.error?.message || 'Failed to create service');
      }
      return extractData(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      toast.success('Service created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create service');
    },
  });
};

export const useUpdateService = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, request }: { id: string; request: UpdateServiceRequest }) => {
      const response = await updateService(id, request);
      if (hasError(response)) {
        throw new Error(response.error?.message || 'Failed to update service');
      }
      return extractData(response);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      queryClient.invalidateQueries({ queryKey: ['service', variables.id] });
      toast.success('Service updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update service');
    },
  });
};

export const useDeleteService = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await deleteService(id);
      if (hasError(response)) {
        throw new Error(response.error?.message || 'Failed to delete service');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['services'] });
      toast.success('Service deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete service');
    },
  });
};
