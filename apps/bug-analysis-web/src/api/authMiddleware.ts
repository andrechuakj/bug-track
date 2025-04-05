import type { Middleware } from '~api';
import { getTokens } from '../utils/auth';
import authService from './auth';

const retryCache: Record<string, boolean> = {};

const unsecuredEnpointsRegex = /^\/public.*/;

const authMiddleware = {
  onRequest: ({ request }) => {
    const url = new URL(request.url);
    console.debug(request.method, url.pathname);
    if (!request.headers.has('X-Request-Id')) {
      const requestId = Math.random().toString(36).slice(16);
      request = request.clone();
      request.headers.set('X-Request-Id', requestId);
      retryCache[requestId] = true;
    }
    if (unsecuredEnpointsRegex.test(url.pathname)) {
      console.log('Unsecured endpoint, not attaching token');
      return undefined;
    }
    const accessToken = getTokens()?.accessToken;
    if (!accessToken) {
      console.error('No access token found');
      // Early return, skip BE call.
      // Typecast is safe due to incorrect typings in the library
      // eslint-disable-next-line @typescript-eslint/no-unsafe-return
      return new Response('Unauthorized', { status: 401 }) as any;
    }
    if (!request.headers.has('Authorization')) {
      request = request.clone();
      request.headers.set('Authorization', `Bearer ${accessToken}`);
    }
    return request;
  },
  onResponse: async ({ request, response }) => {
    const requestId = request.headers.get('X-Request-Id')!;
    if (response.status !== 401) {
      console.debug('Response status:', response.status);
      delete retryCache[requestId];
      return response;
    }
    if (!retryCache[requestId]) {
      console.error('Already retried, not retrying again');
      delete retryCache[requestId];
      return response;
    }
    console.warn('Unauthorized, retrying with refresh token');
    const ok = await authService.refreshToken();
    if (!ok) {
      console.error('Failed to refresh token');
      return response;
    }
    const newRequest = request.clone();
    newRequest.headers.set(
      'Authorization',
      `Bearer ${getTokens()?.accessToken}`
    );
    retryCache[requestId] = false;
    return await fetch(newRequest);
  },
} satisfies Middleware;

export default authMiddleware;
