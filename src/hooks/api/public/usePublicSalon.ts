/**
 * React Query hooks for Public Salon API
 */

import { useQuery } from '@tanstack/react-query';
import { getSalonBySlug } from '@/api/public/salons.public.api';
import { extractData, hasError } from '@/api/client';

export const usePublicSalon = (slug: string | null) => {
  return useQuery({
    queryKey: ['public-salon', slug],
    queryFn: async () => {
      if (!slug) return null;
      const response = await getSalonBySlug(slug);
      if (hasError(response)) {
        throw new Error(response.error?.message || 'Failed to fetch salon');
      }
      return extractData(response);
    },
    enabled: !!slug,
    staleTime: 300000, // 5 minutes
  });
};
