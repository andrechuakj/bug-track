import { useRouter } from 'next/router';
import React, { createContext, useContext, useEffect, useState } from 'react';
import authService from '../api/auth';

interface AuthContextType {
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<boolean>;
  logout: () => void;
  refreshToken: () => Promise<boolean>;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const router = useRouter();

  // Check if the user is authenticated on initial load
  useEffect(() => {
    const checkAuth = () => {
      const isLoggedIn = authService.isLoggedIn();
      setIsAuthenticated(isLoggedIn);
      setLoading(false);
    };

    // Need to handle the Next.js server-side rendering
    if (typeof window !== 'undefined') {
      checkAuth();
    } else {
      setLoading(false);
    }
  }, []);

  const login = async (
    username: string,
    password: string
  ): Promise<boolean> => {
    setLoading(true);
    try {
      const success = await authService.login(username, password);
      if (success) {
        setIsAuthenticated(true);
        router.push('/');
      }
      return success;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const refreshToken = async (): Promise<boolean> => {
    try {
      const success = await authService.refreshToken();
      if (success) {
        setIsAuthenticated(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Token refresh error:', error);
      setIsAuthenticated(false);
      return false;
    }
  };

  const logout = () => {
    authService.logout();
    setIsAuthenticated(false);
    router.push('/login');
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, login, logout, refreshToken, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
