interface LoginResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

class AuthService {
  async login(email: string, password: string): Promise<boolean> {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/token`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ email, password }),
          credentials: 'include',
        }
      );

      if (!response.ok) {
        return false;
      }

      const data: LoginResponse = await response.json();

      if (data.access_token && data.refresh_token) {
        localStorage.setItem('user_token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  }

  async refreshToken(): Promise<boolean> {
    try {
      const refreshToken = this.getRefreshToken();

      if (!refreshToken) {
        return false;
      }

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/api/v1/auth/refresh`,
        {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${refreshToken}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        }
      );

      if (!response.ok) {
        // If refresh fails, clear tokens and return false
        this.logout();
        return false;
      }

      const data: LoginResponse = await response.json();

      if (data.access_token) {
        localStorage.setItem('user_token', data.access_token);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Token refresh failed:', error);
      this.logout();
      return false;
    }
  }

  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user_token');
      localStorage.removeItem('refresh_token');
    }
  }

  getCurrentToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('user_token');
    }
    return null;
  }

  getRefreshToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('refresh_token');
    }
    return null;
  }

  isLoggedIn(): boolean {
    return !!this.getCurrentToken();
  }
}

const authService = new AuthService();
export default authService;
