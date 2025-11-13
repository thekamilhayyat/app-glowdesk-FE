import { QueryClient } from '@tanstack/react-query';

const API_BASE_URL = 'http://localhost:3001/api';

export async function apiRequest(
  url: string,
  options?: RequestInit
): Promise<Response> {
  const token = localStorage.getItem('authToken');
  
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...(options?.headers || {}),
  };
  
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  
  const response = await fetch(`${API_BASE_URL}${url}`, {
    ...options,
    headers,
    credentials: 'include',
  });
  
  if (!response.ok) {
    const error = await response.json().catch(() => ({
      message: response.statusText || 'An error occurred',
    }));
    throw new Error(error.message || `HTTP ${response.status}: ${response.statusText}`);
  }
  
  return response;
}

async function defaultQueryFn({ queryKey }: { queryKey: readonly unknown[] }): Promise<any> {
  const url = queryKey[0] as string;
  
  if (!url || typeof url !== 'string') {
    throw new Error('Query key must be a URL string');
  }
  
  const response = await apiRequest(url);
  return response.json();
}

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: defaultQueryFn,
      staleTime: 1000 * 60 * 5,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});
