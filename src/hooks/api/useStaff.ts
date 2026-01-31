/**
 * React Query hooks for Staff API
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getStaff,
  getStaffById,
  createStaff,
  updateStaff,
  deleteStaff,
  getStaffAvailability,
  StaffFilters,
  CreateStaffRequest,
  UpdateStaffRequest,
} from '@/api/staff.api';
import { extractData, hasError } from '@/api/client';
import { toast } from '@/components/ui/sonner';

export const useStaff = (filters?: StaffFilters) => {
  return useQuery({
    queryKey: ['staff', filters],
    queryFn: async () => {
      const response = await getStaff(filters);
      if (hasError(response)) {
        throw new Error(response.error?.message || 'Failed to fetch staff');
      }
      return extractData(response);
    },
    staleTime: 60000, // 1 minute
  });
};

export const useStaffMember = (id: string | null) => {
  return useQuery({
    queryKey: ['staff', id],
    queryFn: async () => {
      if (!id) return null;
      const response = await getStaffById(id);
      if (hasError(response)) {
        throw new Error(response.error?.message || 'Failed to fetch staff member');
      }
      return extractData(response);
    },
    enabled: !!id,
  });
};

export const useCreateStaff = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: CreateStaffRequest) => {
      const response = await createStaff(request);
      if (hasError(response)) {
        throw new Error(response.error?.message || 'Failed to create staff member');
      }
      return extractData(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      toast.success('Staff member created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create staff member');
    },
  });
};

export const useUpdateStaff = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, request }: { id: string; request: UpdateStaffRequest }) => {
      const response = await updateStaff(id, request);
      if (hasError(response)) {
        throw new Error(response.error?.message || 'Failed to update staff member');
      }
      return extractData(response);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      queryClient.invalidateQueries({ queryKey: ['staff', variables.id] });
      toast.success('Staff member updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update staff member');
    },
  });
};

export const useDeleteStaff = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await deleteStaff(id);
      if (hasError(response)) {
        throw new Error(response.error?.message || 'Failed to delete staff member');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['staff'] });
      toast.success('Staff member deleted successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete staff member');
    },
  });
};

export const useStaffAvailability = (
  id: string | null,
  startDate: string,
  endDate: string,
  duration?: number
) => {
  return useQuery({
    queryKey: ['staff-availability', id, startDate, endDate, duration],
    queryFn: async () => {
      if (!id) return null;
      const response = await getStaffAvailability(id, startDate, endDate, duration);
      if (hasError(response)) {
        throw new Error(response.error?.message || 'Failed to fetch availability');
      }
      return extractData(response);
    },
    enabled: !!id && !!startDate && !!endDate,
  });
};
