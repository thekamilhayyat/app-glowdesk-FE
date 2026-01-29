/**
 * Authentication API endpoints
 * Mock implementation matching API_DOCUMENTATION.md
 */

import { apiRequest, createApiError, createApiSuccess, ApiResponse } from './client';
import usersData from '@/data/users.json';

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
 * POST /auth/login
 * Authenticate user and receive JWT token
 */
export const login = async (credentials: LoginRequest): Promise<ApiResponse<LoginResponse>> => {
  return apiRequest(async () => {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Find user in mock data
    const foundUser = usersData.users.find(
      (u) => u.email === credentials.email && u.password === credentials.password
    );

    if (!foundUser) {
      throw new Error('Invalid email or password');
    }

    // Generate expiration (24 hours from now)
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    return {
      user: {
        id: foundUser.id,
        email: foundUser.email,
        firstName: foundUser.firstName,
        lastName: foundUser.lastName,
        role: foundUser.role,
        isActive: true,
      },
      token: foundUser.token,
      expiresAt: expiresAt.toISOString(),
    };
  });
};

/**
 * POST /auth/logout
 * Invalidate current session token
 */
export const logout = async (): Promise<ApiResponse<void>> => {
  return apiRequest(async () => {
    // In real implementation, this would invalidate the token on the server
    // For mock, we just return success
    return undefined;
  });
};

/**
 * GET /auth/me
 * Get current authenticated user information
 */
export const getCurrentUser = async (token: string): Promise<ApiResponse<{ user: User }>> => {
  return apiRequest(async () => {
    // Find user by token
    const foundUser = usersData.users.find((u) => u.token === token);

    if (!foundUser) {
      throw new Error('Unauthorized');
    }

    return {
      user: {
        id: foundUser.id,
        email: foundUser.email,
        firstName: foundUser.firstName,
        lastName: foundUser.lastName,
        role: foundUser.role,
        isActive: true,
      },
    };
  });
};

/**
 * POST /auth/refresh
 * Refresh JWT token before expiration
 */
export const refreshToken = async (
  request: RefreshTokenRequest
): Promise<ApiResponse<RefreshTokenResponse>> => {
  return apiRequest(async () => {
    // In real implementation, validate refresh token
    // For mock, generate new token
    const expiresAt = new Date();
    expiresAt.setHours(expiresAt.getHours() + 24);

    return {
      token: `refreshed_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      expiresAt: expiresAt.toISOString(),
    };
  });
};
