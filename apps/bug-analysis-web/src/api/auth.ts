import { components } from '../../../api/client/api';
import { clearTokens, getTokens, saveTokens } from '../utils/auth';
import { api } from './client';

export type AuthResponseDto = components['schemas']['AuthResponseDto'];
export type LoginRequestDto = components['schemas']['LoginRequestDto'];
export type SignupRequestDto = components['schemas']['SignupRequestDto'];

class AuthService {
  async login(user: LoginRequestDto): Promise<boolean> {
    try {
      const { data, error, response } = await api.POST(
        '/public/api/v1/auth/login',
        {
          body: user,
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

  async signup(user: SignupRequestDto): Promise<boolean> {
    try {
      const { data, error, response } = await api.POST(
        '/public/api/v1/auth/signup',
        {
          body: user,
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
