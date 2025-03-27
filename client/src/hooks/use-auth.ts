import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocation } from 'wouter';
import { apiRequest } from '@/lib/queryClient';

interface User {
  id: number;
  username: string;
  notificationSettings?: {
    enabled: boolean;
    phoneNumber?: string;
    notifyBeforeClass?: boolean;
    notifyMissedClass?: boolean;
    reminderTime?: number;
  };
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

export function useAuth(): AuthContextType {
  const [user, setUser] = useState<User | null>(null);
  const [, setLocation] = useLocation();
  const queryClient = useQueryClient();

  // Query to fetch the current user data if authenticated
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['/api/auth/me'],
    queryFn: async () => {
      const token = localStorage.getItem('auth_token');
      
      if (!token) {
        throw new Error('No authentication token found');
      }
      
      return await apiRequest('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    },
    enabled: !!localStorage.getItem('auth_token'), // Only run if we have a token
    retry: false,
    gcTime: 0, // Don't cache this query
  });

  // Update user state when data changes
  useEffect(() => {
    if (data) {
      setUser(data);
      localStorage.setItem('user', JSON.stringify(data));
    }
  }, [data]);

  // Load user from localStorage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Failed to parse user from localStorage:', error);
      }
    }
  }, []);

  // Login function
  const login = async (username: string, password: string) => {
    const response = await apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });

    localStorage.setItem('auth_token', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));
    setUser(response.user);
    await refetch(); // Refresh user data
  };

  // Register function
  const register = async (username: string, password: string) => {
    const response = await apiRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });

    localStorage.setItem('auth_token', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));
    setUser(response.user);
    await refetch(); // Refresh user data
  };

  // Logout function
  const logout = () => {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('user');
    setUser(null);
    
    // Clear user-related queries
    queryClient.invalidateQueries({ queryKey: ['/api/auth/me'] });
    queryClient.removeQueries({ queryKey: ['/api/auth/me'] });
    
    // Redirect to login page
    setLocation('/login');
  };

  return {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    logout,
  };
}