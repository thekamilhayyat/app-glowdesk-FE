/**
 * React Query hooks for Public Bookings API
 */

import { useMutation, useQuery } from '@tanstack/react-query';
import {
  createPublicBooking,
  getBookingByNumber,
  PublicBookingRequest,
} from '@/api/public/bookings.public.api';
import { extractData, hasError } from '@/api/client';
import { toast } from '@/components/ui/sonner';

export const useCreatePublicBooking = () => {
  return useMutation({
    mutationFn: async (request: PublicBookingRequest) => {
      const response = await createPublicBooking(request);
      if (hasError(response)) {
        throw new Error(response.error?.message || 'Failed to create booking');
      }
      return extractData(response);
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create booking');
    },
  });
};

export const usePublicBooking = (bookingNumber: string | null) => {
  return useQuery({
    queryKey: ['public-booking', bookingNumber],
    queryFn: async () => {
      if (!bookingNumber) return null;
      const response = await getBookingByNumber(bookingNumber);
      if (hasError(response)) {
        throw new Error(response.error?.message || 'Failed to fetch booking');
      }
      return extractData(response);
    },
    enabled: !!bookingNumber,
    staleTime: 300000, // 5 minutes
  });
};
