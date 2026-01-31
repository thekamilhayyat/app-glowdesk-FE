import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { QueryClient } from '@tanstack/react-query';
import { login as apiLogin, logout as apiLogout, getCurrentUser, register as apiRegister, LoginResponse } from '@/api/auth.api';
import { getAuthToken, setAuthToken, removeAuthToken, extractData, hasError } from '@/api/client';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  token: string;
  isActive?: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<{ success: boolean; errorCode?: string }>;
  register: (email: string, password: string, firstName: string, lastName: string) => Promise<{ success: boolean; errorCode?: string }>;
  logout: (queryClient?: QueryClient) => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
  salonId: string | null; // Multi-salon support
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [salonId, setSalonId] = useState<string | null>(null);
  
  // Get query client for cache clearing on logout
  // Note: We can't use useQueryClient here directly, so we'll clear cache in logout function
  // by accessing the queryClient from the provider context

  useEffect(() => {
    // Check if user is already logged in (from localStorage)
    const initializeAuth = async () => {
      const storedToken = getAuthToken();
      const storedUser = localStorage.getItem('authUser');
      
      if (storedToken && storedUser) {
        try {
          const parsedUser = JSON.parse(storedUser);
          
          // Verify token with API
          const response = await getCurrentUser(storedToken);
          
          if (!hasError(response) && response.data) {
            setUser({
              ...parsedUser,
              ...response.data.user,
            });
            setIsAuthenticated(true);
            // Set salon ID from user context (would come from API in real app)
            setSalonId('salon-1'); // Default salon for MVP
          } else {
            // Invalid token, clear storage
            removeAuthToken();
            localStorage.removeItem('authUser');
          }
        } catch (error) {
          // Token invalid or expired, clear storage silently
          removeAuthToken();
          localStorage.removeItem('authUser');
        }
      }
      
      setIsLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<{ success: boolean; errorCode?: string }> => {
    try {
      const response = await apiLogin({ email, password });
      
      if (hasError(response)) {
        return {
          success: false,
          errorCode: response.error?.code,
        };
      }

      const data = extractData(response);
      const userData: User = {
        id: data.user.id,
        email: data.user.email,
        firstName: data.user.firstName,
        lastName: data.user.lastName,
        role: data.user.role,
        token: data.token,
        isActive: data.user.isActive ?? true,
      };

      setUser(userData);
      setIsAuthenticated(true);
      setAuthToken(data.token);
      setSalonId('salon-1'); // Default salon for MVP
      
      // Store user in localStorage
      localStorage.setItem('authUser', JSON.stringify(userData));
      
      return { success: true };
    } catch (error) {
      // Error already handled by API layer
      return {
        success: false,
        errorCode: 'LOGIN_ERROR',
      };
    }
  };

  const register = async (
    email: string, 
    password: string, 
    firstName: string, 
    lastName: string
  ): Promise<{ success: boolean; errorCode?: string }> => {
    try {
      const response = await apiRegister({
        email,
        password,
        firstName,
        lastName,
      });
      
      if (hasError(response)) {
        return {
          success: false,
          errorCode: response.error?.code,
        };
      }

      // Registration successful - do NOT auto-login
      // User must verify email first
      return { success: true };
    } catch (error) {
      // Error already handled by API layer
      return {
        success: false,
        errorCode: 'REGISTER_ERROR',
      };
    }
  };

  const logout = async (queryClient?: QueryClient) => {
    try {
      const token = getAuthToken();
      if (token) {
        await apiLogout();
      }
    } catch (error) {
      // Continue with logout even if API call fails
    } finally {
      // Clear React Query cache
      if (queryClient) {
        queryClient.clear();
      }
      
      // Clear auth state
      setUser(null);
      setIsAuthenticated(false);
      setSalonId(null);
      removeAuthToken();
      localStorage.removeItem('authUser');
    }
  };

  const value = {
    user,
    login,
    register,
    logout,
    isAuthenticated,
    isLoading,
    salonId,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};