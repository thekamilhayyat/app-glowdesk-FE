/**
 * React Query hooks for Reports API
 * MVP simplified contract
 */

import { useQuery } from '@tanstack/react-query';
import {
  getSalesReport,
  getAppointmentsReport,
  getInventoryReport,
  ReportDateRange,
  SalesReportResponse,
  AppointmentsReportResponse,
  InventoryReportResponse,
} from '@/api/reports.api';
import { extractData, hasError } from '@/api/client';

/**
 * Hook for sales report
 */
export const useSalesReport = (filters?: ReportDateRange) => {
  return useQuery({
    queryKey: ['reports', 'sales', filters],
    queryFn: async () => {
      const response = await getSalesReport(filters);
      if (hasError(response)) {
        throw new Error(response.error?.message || 'Failed to fetch sales report');
      }
      return extractData(response);
    },
    staleTime: 60000, // 1 minute - reports can be slightly stale
    enabled: !!filters?.startDate && !!filters?.endDate, // Only fetch when dates are provided
  });
};

/**
 * Hook for appointments report
 */
export const useAppointmentsReport = (filters?: ReportDateRange) => {
  return useQuery({
    queryKey: ['reports', 'appointments', filters],
    queryFn: async () => {
      const response = await getAppointmentsReport(filters);
      if (hasError(response)) {
        throw new Error(response.error?.message || 'Failed to fetch appointments report');
      }
      return extractData(response);
    },
    staleTime: 60000, // 1 minute
    enabled: !!filters?.startDate && !!filters?.endDate, // Only fetch when dates are provided
  });
};

/**
 * Hook for inventory report (no date filters)
 */
export const useInventoryReport = () => {
  return useQuery({
    queryKey: ['reports', 'inventory'],
    queryFn: async () => {
      const response = await getInventoryReport();
      if (hasError(response)) {
        throw new Error(response.error?.message || 'Failed to fetch inventory report');
      }
      return extractData(response);
    },
    staleTime: 60000, // 1 minute
  });
};
