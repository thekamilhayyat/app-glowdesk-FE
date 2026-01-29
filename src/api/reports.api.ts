/**
 * Reports API endpoints
 * Real backend API implementation
 */

import { ApiResponse, getAuthToken, createApiError } from './client';

const API_BASE_URL = '/api/reports';

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
 * Make authenticated HTTP request
 */
const makeRequest = async <T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const token = getAuthToken();
  const url = `${API_BASE_URL}${endpoint}`;

  const response = await fetch(url, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : '',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error?.message || `HTTP ${response.status}: ${response.statusText}`);
  }

  return response.json();
};

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
    const endpoint = `/sales${queryString ? `?${queryString}` : ''}`;
    const response = await makeRequest<SalesReportResponse>(endpoint);

    return { data: response };
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
    const endpoint = `/appointments${queryString ? `?${queryString}` : ''}`;
    const response = await makeRequest<AppointmentsReportResponse>(endpoint);

    return { data: response };
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
    const response = await makeRequest<InventoryReportResponse>('/inventory');
    return { data: response };
  } catch (error) {
    return createApiError(
      'FETCH_ERROR',
      error instanceof Error ? error.message : 'Failed to fetch inventory report'
    );
  }
};
