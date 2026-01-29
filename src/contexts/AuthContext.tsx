import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { QueryClient } from '@tanstack/react-query';
import { login as apiLogin, logout as apiLogout, getCurrentUser, LoginResponse } from '@/api/auth.api';
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
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, firstName: string, lastName: string) => Promise<boolean>;
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

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await apiLogin({ email, password });
      
      if (hasError(response)) {
        return false;
      }

      const data = extractData(response);
      const userData: User = {
        id: data.user.id,
        email: data.user.email,
        firstName: data.user.firstName,
        lastName: data.user.lastName,
        role: data.user.role,
        token: data.token,
        isActive: data.user.isActive,
      };

      setUser(userData);
      setIsAuthenticated(true);
      setAuthToken(data.token);
      setSalonId('salon-1'); // Default salon for MVP
      
      // Store user in localStorage
      localStorage.setItem('authUser', JSON.stringify(userData));
      
      return true;
    } catch (error) {
      // Error already handled by API layer
      return false;
    }
  };

  const signup = async (
    email: string, 
    password: string, 
    firstName: string, 
    lastName: string
  ): Promise<boolean> => {
    try {
      // For MVP, signup uses login endpoint after creating account
      // In real app, there would be a separate signup endpoint
      // For now, we'll simulate by checking if user exists
      const response = await apiLogin({ email, password });
      
      if (hasError(response)) {
        // User doesn't exist, create account (mock)
        // In real app, call POST /auth/signup
        const mockToken = `new_user_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const expiresAt = new Date();
        expiresAt.setHours(expiresAt.getHours() + 24);

        const userData: User = {
          id: `user-${Date.now()}`,
          email,
          firstName,
          lastName,
          role: 'user',
          token: mockToken,
          isActive: true,
        };

        setUser(userData);
        setIsAuthenticated(true);
        setAuthToken(mockToken);
        setSalonId('salon-1');
        
        localStorage.setItem('authUser', JSON.stringify(userData));
        
        return true;
      }

      // User already exists
      return false;
    } catch (error) {
      // Error already handled by API layer
      return false;
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
    signup,
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