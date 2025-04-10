import { RequestBody } from '~api';
import { clearTokens, getTokens, saveTokens, saveUser } from '../utils/auth';
import { api } from './client';

export type LoginRequestDto = RequestBody<'LoginRequestDto'>;
export type SignupRequestDto = RequestBody<'SignupRequestDto'>;

class AuthService {
  async login(user: LoginRequestDto): Promise<number> {
    try {
      const { data, error, response } = await api.POST(
        '/public/api/v1/auth/login',
        {
          body: user,
        }
      );

      if (!response.ok || error) {
        return 0;
      }

      saveTokens({
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
      });
      saveUser(data.user_id);
      return data.user_id;
    } catch (error) {
      console.error('Login failed:', error);
      return 0;
    }
  }

  async signup(user: SignupRequestDto): Promise<number> {
    try {
      const { data, error, response } = await api.POST(
        '/public/api/v1/auth/signup',
        {
          body: user,
        }
      );

      if (!response.ok || error) {
        return 0;
      }

      saveTokens({
        accessToken: data.access_token,
        refreshToken: data.refresh_token,
      });
      saveUser(data.user_id);
      return data.user_id;
    } catch (error) {
      console.error('Signup failed:', error);
      return 0;
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
