/**
 * React Query hooks for Appointments API
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  getAppointments,
  getAppointmentById,
  createAppointment,
  updateAppointment,
  deleteAppointment,
  checkInAppointment,
  completeAppointment,
  checkAvailability,
  AppointmentFilters,
  CreateAppointmentRequest,
  UpdateAppointmentRequest,
  CheckAvailabilityRequest,
} from '@/api/appointments.api';
import { extractData, hasError } from '@/api/client';
import { toast } from '@/components/ui/sonner';

/**
 * Get list of appointments with filters
 */
export const useAppointments = (filters?: AppointmentFilters) => {
  return useQuery({
    queryKey: ['appointments', filters],
    queryFn: async () => {
      const response = await getAppointments(filters);
      if (hasError(response)) {
        throw new Error(response.error?.message || 'Failed to fetch appointments');
      }
      return extractData(response);
    },
    staleTime: 10000, // 10 seconds - appointments change frequently
  });
};

/**
 * Get single appointment by ID
 */
export const useAppointment = (id: string | null) => {
  return useQuery({
    queryKey: ['appointment', id],
    queryFn: async () => {
      if (!id) return null;
      const response = await getAppointmentById(id);
      if (hasError(response)) {
        throw new Error(response.error?.message || 'Failed to fetch appointment');
      }
      return extractData(response);
    },
    enabled: !!id,
    staleTime: 10000,
  });
};

/**
 * Create appointment mutation
 */
export const useCreateAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (request: CreateAppointmentRequest) => {
      const response = await createAppointment(request);
      if (hasError(response)) {
        const error = response.error;
        if (error?.code === 'APPOINTMENT_CONFLICT') {
          throw new Error(error.message || 'This time slot conflicts with another appointment');
        }
        throw new Error(error?.message || 'Failed to create appointment');
      }
      return extractData(response);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast.success('Appointment created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create appointment');
    },
  });
};

/**
 * Update appointment mutation
 */
export const useUpdateAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, request }: { id: string; request: UpdateAppointmentRequest }) => {
      const response = await updateAppointment(id, request);
      if (hasError(response)) {
        const error = response.error;
        if (error?.code === 'APPOINTMENT_CONFLICT') {
          throw new Error(error.message || 'This time slot conflicts with another appointment');
        }
        throw new Error(error?.message || 'Failed to update appointment');
      }
      return extractData(response);
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['appointment', variables.id] });
      toast.success('Appointment updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update appointment');
    },
  });
};

/**
 * Delete appointment mutation
 */
export const useDeleteAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason?: string }) => {
      const response = await deleteAppointment(id, reason);
      if (hasError(response)) {
        throw new Error(response.error?.message || 'Failed to delete appointment');
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      toast.success('Appointment canceled successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to cancel appointment');
    },
  });
};

/**
 * Check-in appointment mutation
 */
export const useCheckInAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await checkInAppointment(id);
      if (hasError(response)) {
        throw new Error(response.error?.message || 'Failed to check in appointment');
      }
      return extractData(response);
    },
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['appointment', id] });
      toast.success('Client checked in successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to check in');
    },
  });
};

/**
 * Complete appointment mutation
 */
export const useCompleteAppointment = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (id: string) => {
      const response = await completeAppointment(id);
      if (hasError(response)) {
        throw new Error(response.error?.message || 'Failed to complete appointment');
      }
      return extractData(response);
    },
    onSuccess: (data, id) => {
      queryClient.invalidateQueries({ queryKey: ['appointments'] });
      queryClient.invalidateQueries({ queryKey: ['appointment', id] });
      toast.success('Appointment completed successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to complete appointment');
    },
  });
};

/**
 * Check availability mutation
 */
export const useCheckAvailability = () => {
  return useMutation({
    mutationFn: async (request: CheckAvailabilityRequest) => {
      const response = await checkAvailability(request);
      if (hasError(response)) {
        throw new Error(response.error?.message || 'Failed to check availability');
      }
      return extractData(response);
    },
  });
};
