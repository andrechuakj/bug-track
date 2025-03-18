import { Middleware } from '~api';
import { getTokens } from '../utils/auth';

const unsecuredEnpointsRegex = /^\/public.*/;

const authMiddleware: Middleware = {
  onRequest: ({ request }) => {
    const url = new URL(request.url);
    console.debug(request.method, url.pathname);
    if (unsecuredEnpointsRegex.test(url.pathname)) {
      console.log('Unsecured endpoint, not attaching token');
      return undefined;
    }
    const accessToken = getTokens()?.accessToken;
    if (!accessToken) {
      console.error('No access token found');
      // Early return, skip BE call.
      // Typecast is safe due to incorrect typings in the library
      return new Response('Unauthorized', { status: 401 }) as any;
    }
    request.headers.set('Authorization', `Bearer ${accessToken}`);
    return request;
  },
  // TODO: 401 Could be due to expired token, try to refresh
};

export default authMiddleware;
