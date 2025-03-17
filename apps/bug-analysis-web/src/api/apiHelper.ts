import authService from './auth';

export async function fetchWithAuth(
  url: string,
  options: RequestInit = {}
): Promise<Response> {
  const token = authService.getCurrentToken();

  const headers = {
    ...options.headers,
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const response = await fetch(url, {
    ...options,
    headers,
    credentials: 'include',
  });

  // Handle 401 Unauthorized errors
  if (response.status === 401) {
    // Try to refresh the token
    const refreshSuccess = await authService.refreshToken();

    if (refreshSuccess) {
      // If refresh successful, retry the original request with new token
      const newToken = authService.getCurrentToken();
      const newHeaders = {
        ...options.headers,
        Authorization: `Bearer ${newToken}`,
      };

      return fetch(url, {
        ...options,
        headers: newHeaders,
        credentials: 'include',
      });
    } else {
      // If refresh failed, logout and redirect
      authService.logout();
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
  }

  return response;
}

export async function get<T>(url: string): Promise<T> {
  const response = await fetchWithAuth(url);

  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }

  return response.json();
}

export async function post<T>(url: string, data: unknown): Promise<T> {
  const response = await fetchWithAuth(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }

  return response.json();
}

export async function put<T>(url: string, data: unknown): Promise<T> {
  const response = await fetchWithAuth(url, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }

  return response.json();
}

export async function del<T>(url: string): Promise<T> {
  const response = await fetchWithAuth(url, {
    method: 'DELETE',
  });

  if (!response.ok) {
    throw new Error(`HTTP error! Status: ${response.status}`);
  }

  return response.json();
}
