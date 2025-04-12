/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { describe, expect, it, vi } from 'vitest';
import authMiddleware from '../../src/api/authMiddleware';

vi.mock('../../src/utils/auth');
vi.mock('../../src/api/auth');

async function mockTokens() {
  const auth = await import('../../src/utils/auth');
  vi.spyOn(auth, 'getTokens')
    .mockReturnValueOnce({
      accessToken: 'test-token-1',
      refreshToken: 'test-refresh-token-1',
    })
    .mockReturnValueOnce({
      accessToken: 'test-token-2',
      refreshToken: 'test-refresh-token-2',
    });
  return auth;
}

async function mockNoTokens() {
  const auth = await import('../../src/utils/auth');
  vi.spyOn(auth, 'getTokens').mockReturnValueOnce(null);
  return auth;
}

async function mockAuthService(refresh: boolean) {
  const authService = await import('../../src/api/auth');
  const mockAuthService = {
    refreshToken: vi.fn().mockResolvedValue(refresh),
    login: vi.fn().mockResolvedValue(true),
    logout: vi.fn(),
    signup: vi.fn().mockResolvedValue(true),
    getCurrentToken: vi.fn().mockReturnValue('test-token'),
    isLoggedIn: vi.fn().mockReturnValue(true),
  };
  authService.default = mockAuthService;
  return mockAuthService;
}

describe('authMiddleware', () => {
  describe('onRequest', () => {
    it('should set X-Request-Id header if not present', async () => {
      await mockTokens();
      const request = new Request('https://example.com/api', { method: 'GET' });
      const result = authMiddleware.onRequest({ request } as any);
      expect(result.headers.has('X-Request-Id')).toBe(true);
    });

    it('should not attach token for unsecured endpoints', () => {
      const request = new Request('https://example.com/public/api', {
        method: 'GET',
      });
      const result = authMiddleware.onRequest({ request } as any);
      expect(result).toBeUndefined();
    });

    it('should return 401 if no access token is found', async () => {
      await mockNoTokens();
      const request = new Request('https://example.com/api', { method: 'GET' });
      const result = authMiddleware.onRequest({ request } as any);
      //   Check that result is a Response object
      expect(result instanceof Response).toBe(true);
      expect(result.status).toBe(401);
    });

    it('should set Authorization header if access token is found', async () => {
      await mockTokens();
      const request = new Request('https://example.com/api', { method: 'GET' });
      const result = authMiddleware.onRequest({ request } as any);
      expect(result.headers.get('Authorization')).toBe('Bearer test-token-1');
    });
  });

  describe('onResponse', () => {
    it('should delete retryCache entry if response status is not 401', async () => {
      const request = new Request('https://example.com/api', {
        method: 'GET',
        headers: { 'X-Request-Id': 'test-id' },
      });
      const response = new Response(null, { status: 200 });
      const result = await authMiddleware.onResponse({
        request,
        response,
      } as any);
      expect(result.status).toBe(200);
    });

    it('should not retry if already retried', async () => {
      const request = new Request('https://example.com/api', {
        method: 'GET',
        headers: { 'X-Request-Id': 'test-id' },
      });
      const response = new Response(null, { status: 401 });
      const result = await authMiddleware.onResponse({
        request,
        response,
      } as any);
      expect(result.status).toBe(401);
    });

    it('should retry with refreshed token if response status is 401', async () => {
      await mockTokens();
      const { refreshToken } = await mockAuthService(true);

      // First request will return 401
      const request = new Request('https://example.com', { method: 'GET' });
      const result = authMiddleware.onRequest({ request } as any);
      expect(result.headers.get('Authorization')).toBe('Bearer test-token-1');
      expect(refreshToken).not.toHaveBeenCalled();

      // Second request will return 200
      const response = new Response(null, { status: 401 });
      const result2 = await authMiddleware.onResponse({
        request: result ?? request,
        response,
      } as any);
      expect(result2.status).toBe(200);
      expect(refreshToken).toBeCalledTimes(1);
    });

    it('should return original response if token refresh fails', async () => {
      await mockTokens();
      const { refreshToken } = await mockAuthService(false);
      const request = new Request('https://example.com', { method: 'GET' });
      const result = authMiddleware.onRequest({ request } as any);
      expect(result.headers.get('Authorization')).toBe('Bearer test-token-1');
      expect(refreshToken).not.toHaveBeenCalled();

      const response = new Response(null, { status: 401 });
      const result2 = await authMiddleware.onResponse({
        request: result ?? request,
        response,
      } as any);
      expect(result2.status).toBe(401);
      expect(refreshToken).toBeCalledTimes(1);
      expect(result2).toBe(response);
    });

    it('should not retry a request with an existing request ID', async () => {
      await mockTokens();
      const { refreshToken } = await mockAuthService(false);
      const request = new Request('https://example.com', {
        method: 'GET',
        headers: { 'X-Request-Id': 'test-id' },
      });
      const result = authMiddleware.onRequest({ request } as any);
      expect(result.headers.get('Authorization')).toBe('Bearer test-token-1');
      expect(refreshToken).not.toHaveBeenCalled();

      const response = new Response(null, { status: 401 });
      const result2 = await authMiddleware.onResponse({
        request: result ?? request,
        response,
      } as any);
      expect(result2.status).toBe(401);
      expect(refreshToken).not.toHaveBeenCalled();
      expect(result2).toBe(response);
    });
  });
});
