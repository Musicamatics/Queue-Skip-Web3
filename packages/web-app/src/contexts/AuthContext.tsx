import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User } from '@queue-skip/shared';
import { authAPI } from '../utils/api';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (method: string, credentials: any) => Promise<void>;
  logout: () => void;
  token: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(
    localStorage.getItem('accessToken')
  );

  useEffect(() => {
    // Check if user is logged in on app start
    const storedToken = localStorage.getItem('accessToken');
    const storedUser = localStorage.getItem('user');

    if (storedToken && storedUser) {
      try {
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
      } catch (error) {
        // Clear invalid stored data
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('user');
      }
    }

    setLoading(false);
  }, []);

  const login = async (method: string, credentials: any) => {
    try {
      setLoading(true);
      const response = await authAPI.login(method, credentials);
      
      if (response.data) {
        const { user: userData, accessToken, refreshToken } = response.data;
        
        setUser(userData);
        setToken(accessToken);
        
        // Store in localStorage
        localStorage.setItem('accessToken', accessToken);
        localStorage.setItem('refreshToken', refreshToken);
        localStorage.setItem('user', JSON.stringify(userData));
      }
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    
    // Clear localStorage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    
    // Call logout API
    authAPI.logout().catch(console.error);
  };

  const value = {
    user,
    loading,
    login,
    logout,
    token,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
