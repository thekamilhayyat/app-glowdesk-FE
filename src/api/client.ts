/**
 * Base API client for Glowdesk
 * Handles authentication, error normalization, and network simulation
 */

export interface ApiError {
  code: string;
  message: string;
  details?: Record<string, unknown>;
}

export interface ApiResponse<T> {
  data?: T;
  error?: ApiError;
}

export interface PaginationParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Simulate network delay (300-800ms)
 */
const simulateDelay = (): Promise<void> => {
  const delay = Math.floor(Math.random() * 500) + 300; // 300-800ms
  return new Promise((resolve) => setTimeout(resolve, delay));
};

/**
 * Get auth token from localStorage
 */
export const getAuthToken = (): string | null => {
  return localStorage.getItem('authToken');
};

/**
 * Set auth token in localStorage
 */
export const setAuthToken = (token: string): void => {
  localStorage.setItem('authToken', token);
};

/**
 * Remove auth token from localStorage
 */
export const removeAuthToken = (): void => {
  localStorage.removeItem('authToken');
};

/**
 * Create API error response
 */
export const createApiError = (
  code: string,
  message: string,
  details?: Record<string, unknown>
): ApiResponse<never> => {
  return {
    error: {
      code,
      message,
      details,
    },
  };
};

/**
 * Create API success response
 */
export const createApiSuccess = <T>(data: T): ApiResponse<T> => {
  return { data };
};

/**
 * Base API request handler with error normalization
 */
export const apiRequest = async <T>(
  handler: () => Promise<T>
): Promise<ApiResponse<T>> => {
  try {
    await simulateDelay();
    const data = await handler();
    return createApiSuccess(data);
  } catch (error) {
    if (error instanceof Error) {
      return createApiError('INTERNAL_ERROR', error.message);
    }
    return createApiError('UNKNOWN_ERROR', 'An unknown error occurred');
  }
};

/**
 * Check if response has error
 */
export const hasError = <T>(response: ApiResponse<T>): response is ApiResponse<never> => {
  return 'error' in response && response.error !== undefined;
};

/**
 * Extract data from response or throw error
 */
export const extractData = <T>(response: ApiResponse<T>): T => {
  if (hasError(response)) {
    throw new Error(response.error.message);
  }
  if (!response.data) {
    throw new Error('No data in response');
  }
  return response.data;
};
