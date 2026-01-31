/**
 * Reports API endpoints
 * Real backend API implementation
 */

import { ApiResponse, createApiError } from './client';
import { apiFetch } from './http';

/**
 * Date range filter for reports
 */
export interface ReportDateRange {
  startDate?: string; // YYYY-MM-DD format
  endDate?: string; // YYYY-MM-DD format
}

/**
 * Sales Report Response (simplified MVP contract)
 */
export interface SalesReportResponse {
  totalRevenue: number;
  totalTransactions: number;
  averageTicket: number;
}

/**
 * Appointments Report Response (simplified MVP contract)
 */
export interface AppointmentsReportResponse {
  total: number;
  completed: number;
  cancelled: number;
  noShow: number;
}

/**
 * Inventory Report Response (simplified MVP contract)
 */
export interface InventoryReportResponse {
  lowStock: number;
  outOfStock: number;
  totalProducts: number;
}


/**
 * GET /api/reports/sales?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
 * Get sales report
 */
export const getSalesReport = async (
  filters?: ReportDateRange
): Promise<ApiResponse<SalesReportResponse>> => {
  try {
    const params = new URLSearchParams();
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);

    const queryString = params.toString();
    const endpoint = `/api/reports/sales${queryString ? `?${queryString}` : ''}`;
    const data = await apiFetch<SalesReportResponse>(endpoint);

    return { data };
  } catch (error) {
    return createApiError(
      'FETCH_ERROR',
      error instanceof Error ? error.message : 'Failed to fetch sales report'
    );
  }
};

/**
 * GET /api/reports/appointments?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD
 * Get appointments report
 */
export const getAppointmentsReport = async (
  filters?: ReportDateRange
): Promise<ApiResponse<AppointmentsReportResponse>> => {
  try {
    const params = new URLSearchParams();
    if (filters?.startDate) params.append('startDate', filters.startDate);
    if (filters?.endDate) params.append('endDate', filters.endDate);

    const queryString = params.toString();
    const endpoint = `/api/reports/appointments${queryString ? `?${queryString}` : ''}`;
    const data = await apiFetch<AppointmentsReportResponse>(endpoint);

    return { data };
  } catch (error) {
    return createApiError(
      'FETCH_ERROR',
      error instanceof Error ? error.message : 'Failed to fetch appointments report'
    );
  }
};

/**
 * GET /api/reports/inventory
 * Get inventory report (no date filters)
 */
export const getInventoryReport = async (): Promise<ApiResponse<InventoryReportResponse>> => {
  try {
    const data = await apiFetch<InventoryReportResponse>('/api/reports/inventory');
    return { data };
  } catch (error) {
    return createApiError(
      'FETCH_ERROR',
      error instanceof Error ? error.message : 'Failed to fetch inventory report'
    );
  }
};
