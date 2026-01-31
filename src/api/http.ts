/**
 * Centralized HTTP client for API requests
 * Reads base URL from environment variables
 * Automatically attaches Authorization header
 */

import { getAuthToken } from './client';

/**
 * Get API base URL from environment variables
 * Supports both Vite (VITE_API_BASE_URL) and Next.js (NEXT_PUBLIC_API_BASE_URL)
 */
function getApiBaseUrl(): string {
  // Check for Vite environment variable
  if (import.meta.env?.VITE_API_BASE_URL) {
    return import.meta.env.VITE_API_BASE_URL;
  }

  // Check for Next.js environment variable (fallback)
  if (typeof process !== 'undefined' && process.env?.NEXT_PUBLIC_API_BASE_URL) {
    return process.env.NEXT_PUBLIC_API_BASE_URL;
  }

  // Fail fast if base URL is not configured
  throw new Error(
    'API base URL is not configured. Please set VITE_API_BASE_URL in your .env file.\n' +
    'Example: VITE_API_BASE_URL=http://localhost:3001'
  );
}

/**
 * Centralized API fetch function
 * Automatically prefixes endpoint with base URL and attaches auth token
 * 
 * @param endpoint - API endpoint (e.g., '/api/auth/login')
 * @param options - Fetch options (method, body, headers, etc.)
 * @returns Promise with parsed JSON response
 */
export async function apiFetch<T = unknown>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const baseUrl = getApiBaseUrl();
  
  // Ensure endpoint starts with /
  const normalizedEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  
  // Construct full URL
  const url = `${baseUrl}${normalizedEndpoint}`;

  // Get auth token from localStorage
  const token = getAuthToken();

  // Prepare headers
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...options.headers,
  };

  // Attach Authorization header if token exists
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  // Log request in dev mode only
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.log(`[API] ${options.method || 'GET'} ${url}`);
  }

  // Make request
  const response = await fetch(url, {
    ...options,
    headers,
    // Only include credentials if explicitly needed (for cookie-based auth)
    // For JWT-based auth, we don't need credentials
    credentials: options.credentials || 'omit',
  });

  // Handle non-OK responses
  if (!response.ok) {
    let errorData: { error?: { code?: string; message?: string }; message?: string } = {};
    
    try {
      errorData = await response.json();
    } catch {
      // If response is not JSON, create error from status
      const error = new Error(`HTTP ${response.status}: ${response.statusText}`) as Error & { code?: string; status?: number };
      error.status = response.status;
      error.code = `HTTP_${response.status}`;
      throw error;
    }

    // Extract error code and message
    // Backend may return error.code directly or nested in error.error.code
    const errorCode = errorData.error?.code || `HTTP_${response.status}`;
    const errorMessage = errorData.error?.message || errorData.message || `HTTP ${response.status}: ${response.statusText}`;

    // Create error object that can be caught and handled
    const error = new Error(errorMessage) as Error & { code?: string; status?: number };
    error.code = errorCode;
    error.status = response.status;
    
    // Log error in dev mode only
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.error(`[API] ${options.method || 'GET'} ${url} → Error`, {
        code: errorCode,
        message: errorMessage,
        status: response.status,
      });
    }
    
    throw error;
  }

  // Parse and return JSON response
  try {
    const data = await response.json();
    
    // Log response in dev mode only
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.log(`[API] ${options.method || 'GET'} ${url} → Success`, data);
    }
    
    return data;
  } catch {
    // If response is not JSON, return empty object
    return {} as T;
  }
}

/**
 * Get the configured API base URL (for debugging/logging purposes)
 */
export function getApiBaseUrlValue(): string {
  try {
    return getApiBaseUrl();
  } catch {
    return 'NOT_CONFIGURED';
  }
}
