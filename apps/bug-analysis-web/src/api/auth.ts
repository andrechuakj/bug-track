interface LoginResponse {
  access_token: string;
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
        }
      );

      if (!response.ok) {
        return false;
      }

      const data: LoginResponse = await response.json();

      if (data.access_token) {
        localStorage.setItem('user_token', data.access_token);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login failed:', error);
      return false;
    }
  }

  logout(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('user_token');
    }
  }

  getCurrentToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('user_token');
    }
    return null;
  }

  isLoggedIn(): boolean {
    return !!this.getCurrentToken();
  }
}

const authService = new AuthService();
export default authService;
