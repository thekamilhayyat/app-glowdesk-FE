/**
 * React Query hooks for Clients API
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getClients,
  getClientById,
  createClient,
  updateClient,
  deleteClient,
  getClientAppointments,
  getClientPurchases,
  ClientFilters,
  CreateClientRequest,
  UpdateClientRequest,
} from '@/api/clients.api';
import { extractData, hasError } from '@/api/client';
import { toast } from '@/components/ui/sonner';

/**
 * Get list of clients with filters
 */
export const useClients = (filters?: ClientFilters) => {
  return useQuery({
    queryKey: ['clients', filters],
    queryFn: async () => {
      const response = await getClients(filters);
      if (hasError(response)) {
        throw new Error(response.error?.message || 'Failed to fetch clients');
      }
      return extractData(response);
    },
    staleTime: 30000, // 30 seconds
  });
};

/**
 * Get single client by ID
 */
export const useClient = (id: string | null) => {
  return useQuery({
    queryKey: ['client', id],
    queryFn: async () => {
      if (!id) return null;
      const response = await getClientById(id);
      if (hasError(response)) {
        throw new Error(response.error?.message || 'Failed to fetch client');
      }
      return extractData(response);
    },
    enabled: !!id,
    staleTime: 30000,
  });
};

/**
 * Create new client mutation
 */
export const useCreateClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: CreateClientRequest) => {
      const response = await createClient(request);
      if (hasError(response)) {
        throw new Error(response.error?.message || 'Failed to create client');
      }
      return extractData(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success('Client created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create client');
    },
  });
};

/**
 * Update client mutation
 */
export const useUpdateClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, request }: { id: string; request: UpdateClientRequest }) => {
      const response = await updateClient(id, request);
      if (hasError(response)) {
        throw new Error(response.error?.message || 'Failed to update client');
      }
      return extractData(response);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      queryClient.invalidateQueries({ queryKey: ['client', variables.id] });
      toast.success('Client updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update client');
    },
  });
};

/**
 * Delete client mutation
 */
export const useDeleteClient = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await deleteClient(id);
      if (hasError(response)) {
        throw new Error(response.error?.message || 'Failed to delete client');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['clients'] });
      toast.success('Client deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete client');
    },
  });
};

/**
 * Get client appointments
 */
export const useClientAppointments = (clientId: string | null, filters?: any) => {
  return useQuery({
    queryKey: ['client-appointments', clientId, filters],
    queryFn: async () => {
      if (!clientId) return null;
      const response = await getClientAppointments(clientId, filters);
      if (hasError(response)) {
        throw new Error(response.error?.message || 'Failed to fetch appointments');
      }
      return extractData(response);
    },
    enabled: !!clientId,
  });
};

/**
 * Get client purchases
 */
export const useClientPurchases = (clientId: string | null, filters?: any) => {
  return useQuery({
    queryKey: ['client-purchases', clientId, filters],
    queryFn: async () => {
      if (!clientId) return null;
      const response = await getClientPurchases(clientId, filters);
      if (hasError(response)) {
        throw new Error(response.error?.message || 'Failed to fetch purchases');
      }
      return extractData(response);
    },
    enabled: !!clientId,
  });
};
