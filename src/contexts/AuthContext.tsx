import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import usersData from '@/data/users.json';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  token: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, firstName: string, lastName: string) => Promise<boolean>;
  logout: () => void;
  isAuthenticated: boolean;
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

  useEffect(() => {
    // Check if user is already logged in (from localStorage)
    const storedToken = localStorage.getItem('authToken');
    const storedUser = localStorage.getItem('authUser');
    
    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        // Verify token exists in our dummy data
        const validUser = usersData.users.find(u => u.token === storedToken);
        if (validUser) {
          setUser(parsedUser);
          setIsAuthenticated(true);
        } else {
          // Invalid token, clear storage
          localStorage.removeItem('authToken');
          localStorage.removeItem('authUser');
        }
      } catch (error) {
        console.error('Error parsing stored user data:', error);
        localStorage.removeItem('authToken');
        localStorage.removeItem('authUser');
      }
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Find user in dummy data
      const foundUser = usersData.users.find(
        u => u.email === email && u.password === password
      );

      if (foundUser) {
        const userWithoutPassword = {
          id: foundUser.id,
          email: foundUser.email,
          firstName: foundUser.firstName,
          lastName: foundUser.lastName,
          role: foundUser.role,
          token: foundUser.token
        };

        setUser(userWithoutPassword);
        setIsAuthenticated(true);
        
        // Store in localStorage
        localStorage.setItem('authToken', foundUser.token);
        localStorage.setItem('authUser', JSON.stringify(userWithoutPassword));
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('Login error:', error);
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
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if user already exists
      const existingUser = usersData.users.find(u => u.email === email);
      if (existingUser) {
        return false; // User already exists
      }

      // Create new user (in real app, this would be sent to backend)
      const newUser = {
        id: (usersData.users.length + 1).toString(),
        email,
        firstName,
        lastName,
        role: 'user',
        token: `new_user_token_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };

      const userWithoutPassword = {
        id: newUser.id,
        email: newUser.email,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        role: newUser.role,
        token: newUser.token
      };

      setUser(userWithoutPassword);
      setIsAuthenticated(true);
      
      // Store in localStorage
      localStorage.setItem('authToken', newUser.token);
      localStorage.setItem('authUser', JSON.stringify(userWithoutPassword));
      
      return true;
    } catch (error) {
      console.error('Signup error:', error);
      return false;
    }
  };

  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('authToken');
    localStorage.removeItem('authUser');
  };

  const value = {
    user,
    login,
    signup,
    logout,
    isAuthenticated
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};