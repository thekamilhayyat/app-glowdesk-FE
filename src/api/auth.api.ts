/**
 * Authentication API endpoints
 * Real backend API implementation
 */

import { ApiResponse, createApiError } from './client';
import { apiFetch } from './http';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    isActive?: boolean;
  };
  token: string;
  expiresAt: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface RegisterResponse {
  message: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  isActive: boolean;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  token: string;
  expiresAt: string;
}

/**
 * POST /api/auth/login
 * Authenticate user and receive JWT token
 */
export const login = async (credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
  try {
    const data = await apiFetch<LoginResponse>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });

    return { data };
  } catch (error) {
    const errorObj = error as Error & { code?: string; status?: number };
    let errorCode = errorObj?.code || 'LOGIN_ERROR';
    let errorMessage = error instanceof Error ? error.message : 'Failed to login';

    // Map backend error codes to user-friendly messages
    if (errorCode === 'EMAIL_NOT_VERIFIED') {
      errorMessage = 'Please verify your email';
    } else if (errorObj?.status === 0 || errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
      errorCode = 'NETWORK_ERROR';
      errorMessage = 'Server not responding';
    }
    
    return createApiError(
      errorCode,
      errorMessage
    );
  }
};

/**
 * POST /api/auth/register
 * Register a new user account (does not auto-login)
 * Backend returns 201 on success, 409 for EMAIL_ALREADY_EXISTS, 400 for validation errors
 */
export const register = async (request: RegisterRequest): Promise<ApiResponse<RegisterResponse>> => {
  try {
    // Ensure request payload matches backend exactly: firstName, lastName, email, password
    const payload = {
      firstName: request.firstName,
      lastName: request.lastName,
      email: request.email,
      password: request.password,
    };

    const data = await apiFetch<RegisterResponse>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });

    return { data };
  } catch (error) {
    // Extract error code from error object
    const errorObj = error as Error & { code?: string; status?: number };
    let errorCode = errorObj?.code || 'REGISTER_ERROR';
    let errorMessage = error instanceof Error ? error.message : 'Failed to create account';

    // Handle specific HTTP status codes
    if (errorObj?.status === 409 || errorCode === 'EMAIL_ALREADY_EXISTS') {
      errorCode = 'EMAIL_ALREADY_EXISTS';
      errorMessage = 'Email already exists';
    } else if (errorObj?.status === 400) {
      errorCode = 'VALIDATION_ERROR';
      // Keep the backend error message for validation errors
    } else if (errorObj?.status === 0 || errorMessage.includes('Failed to fetch') || errorMessage.includes('NetworkError')) {
      errorCode = 'NETWORK_ERROR';
      errorMessage = 'Server not responding';
    }
    
    return createApiError(
      errorCode,
      errorMessage
    );
  }
};

/**
 * POST /api/auth/logout
 * Invalidate current session token
 */
export const logout = async (): Promise<ApiResponse<void>> => {
  try {
    await apiFetch<void>('/api/auth/logout', {
      method: 'POST',
    });

    return { data: undefined };
  } catch (error) {
    return createApiError(
      'LOGOUT_ERROR',
      error instanceof Error ? error.message : 'Failed to logout'
    );
  }
};

/**
 * GET /api/auth/me
 * Get current authenticated user information
 */
export const getCurrentUser = async (token: string): Promise<ApiResponse<{ user: User }>> => {
  try {
    const data = await apiFetch<{ user: User }>('/api/auth/me', {
      headers: {
        'Authorization': `Bearer ${token}`,
      },
    });

    return { data };
  } catch (error) {
    return createApiError(
      'AUTH_ERROR',
      error instanceof Error ? error.message : 'Failed to get current user'
    );
  }
};

/**
 * POST /api/auth/refresh
 * Refresh JWT token before expiration
 */
export const refreshToken = async (
  request: RefreshTokenRequest
): Promise<ApiResponse<RefreshTokenResponse>> => {
  try {
    const data = await apiFetch<RefreshTokenResponse>('/api/auth/refresh', {
      method: 'POST',
      body: JSON.stringify(request),
    });

    return { data };
  } catch (error) {
    return createApiError(
      'REFRESH_ERROR',
      error instanceof Error ? error.message : 'Failed to refresh token'
    );
  }
};
