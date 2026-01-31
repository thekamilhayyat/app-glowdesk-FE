/**
 * React Query hooks for Public Availability API
 */

import { useQuery } from '@tanstack/react-query';
import {
  getAvailability,
  getAvailabilityCalendar,
  AvailabilityRequest,
} from '@/api/public/availability.public.api';
import { extractData, hasError } from '@/api/client';

export const usePublicAvailability = (request: AvailabilityRequest | null) => {
  return useQuery({
    queryKey: ['public-availability', request],
    queryFn: async () => {
      if (!request) return null;
      const response = await getAvailability(request);
      if (hasError(response)) {
        throw new Error(response.error?.message || 'Failed to fetch availability');
      }
      return extractData(response);
    },
    enabled: !!request && !!request.salonId && !!request.serviceId && !!request.date,
    staleTime: 30000, // 30 seconds - availability changes frequently
  });
};

export const usePublicAvailabilityCalendar = (
  salonId: string | null,
  serviceId: string | null,
  startDate: string | null,
  days: number = 30
) => {
  return useQuery({
    queryKey: ['public-availability-calendar', salonId, serviceId, startDate, days],
    queryFn: async () => {
      if (!salonId || !serviceId || !startDate) return null;
      const response = await getAvailabilityCalendar(salonId, serviceId, startDate, days);
      if (hasError(response)) {
        throw new Error(response.error?.message || 'Failed to fetch availability calendar');
      }
      return extractData(response);
    },
    enabled: !!salonId && !!serviceId && !!startDate,
    staleTime: 60000, // 1 minute
  });
};
