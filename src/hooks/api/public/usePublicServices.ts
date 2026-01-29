/**
 * React Query hooks for Public Services API
 */

import { useQuery } from '@tanstack/react-query';
import { getSalonServices, getPublicService } from '@/api/public/services.public.api';
import { extractData, hasError } from '@/api/client';

export const usePublicServices = (salonId: string | null) => {
  return useQuery({
    queryKey: ['public-services', salonId],
    queryFn: async () => {
      if (!salonId) return null;
      const response = await getSalonServices(salonId);
      if (hasError(response)) {
        throw new Error(response.error?.message || 'Failed to fetch services');
      }
      return extractData(response);
    },
    enabled: !!salonId,
    staleTime: 300000, // 5 minutes
  });
};

export const usePublicService = (serviceId: string | null) => {
  return useQuery({
    queryKey: ['public-service', serviceId],
    queryFn: async () => {
      if (!serviceId) return null;
      const response = await getPublicService(serviceId);
      if (hasError(response)) {
        throw new Error(response.error?.message || 'Failed to fetch service');
      }
      return extractData(response);
    },
    enabled: !!serviceId,
    staleTime: 300000,
  });
};
