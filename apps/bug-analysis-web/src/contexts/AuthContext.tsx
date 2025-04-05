import { useRouter } from 'next/router';
import React, {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';
import authService, { LoginRequestDto, SignupRequestDto } from '../api/auth';
import { MaybePromise } from '../utils/promises';

export type AuthContextType = {
  isAuthenticated: boolean;
  login: (details: LoginRequestDto) => MaybePromise<boolean>;
  signup: (details: SignupRequestDto) => MaybePromise<boolean>;
  logout: () => MaybePromise<void>;
  refreshToken: () => MaybePromise<boolean>;
  loading: boolean;
};

export const AuthContext = createContext<AuthContextType | undefined>(
  undefined
);

export const AuthProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
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

  const login = async (details: LoginRequestDto): Promise<boolean> => {
    setLoading(true);
    try {
      const success = await authService.login(details);
      if (success) {
        setIsAuthenticated(true);
        await router.push('/');
      }
      return success;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const signup = useCallback(
    async (details: SignupRequestDto): Promise<boolean> => {
      setLoading(true);
      try {
        const success = await authService.signup(details);
        if (success) {
          setIsAuthenticated(true);
          await router.push('/');
        }
        return success;
      } catch (error) {
        console.error('Login error:', error);
        return false;
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const refreshToken = useCallback(async (): Promise<boolean> => {
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
  }, []);

  const logout = useCallback(async () => {
    setIsAuthenticated(false);
    await router.push('/login');
  }, []);

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, login, signup, logout, refreshToken, loading }}
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
