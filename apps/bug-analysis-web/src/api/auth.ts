import { clearTokens, getTokens, saveTokens } from '../utils/auth';
import { api } from './client';

export interface LoginValues {
  email: string;
  password: string;
}

export interface SignupValues {
  email: string;
  name: string;
  password: string;
}

interface AuthResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

class AuthService {
  async login(details: LoginValues): Promise<boolean> {
    try {
      const { data, error, response } = await api.POST(
        '/public/api/v1/auth/login',
        {
          body: { email, password },
        }
      );

      if (!response.ok || error) {
        return false;
      }

      saveTokens({
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
      });
      return true;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  }

  async signup(details: LoginValues): Promise<boolean> {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/signup`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(details),
          credentials: 'include',
        }
      );

      if (!response.ok) {
        return false;
      }

      const data: AuthResponse = await response.json();

      if (data.access_token && data.refresh_token) {
        localStorage.setItem('user_token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Signup failed:', error);
      return false;
    }
  }

  async refreshToken(): Promise<boolean> {
    try {
      const refreshToken = getTokens()?.refreshToken;
      if (!refreshToken) {
        return false;
      }
      const { data, response } = await api.POST('/api/v1/auth/refresh', {
        headers: { Authorization: `Bearer ${refreshToken}` },
      });

      if (!response.ok || !data) {
        clearTokens();
        return false;
      }

      saveTokens({
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
      });
      return true;
    } catch (error) {
      console.error('Token refresh failed:', error);
      clearTokens();
      return false;
    }
  }

  getCurrentToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('user_token');
    }
    return null;
  }

  isLoggedIn(): boolean {
    return !!getTokens();
  }
}

const authService = new AuthService();
export default authService;
