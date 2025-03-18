import { Middleware } from '~api';
import { getTokens } from '../utils/auth';

const unsecuredEnpointsRegex = /^\/public/;

const authMiddleware: Middleware = {
  onRequest: async ({ request }) => {
    const url = new URL(request.url);
    console.debug(request.method, url.pathname);
    if (unsecuredEnpointsRegex.test(url.pathname)) {
      console.log('Unsecured endpoint, not attaching token');
      return undefined;
    }
    const accessToken = getTokens()?.accessToken;
    if (!accessToken) {
      console.error('No access token found');
      throw new Error('No access token found');
    }
    request.headers.set('Authorization', `Bearer ${accessToken}`);
    return request;
  },
  // TODO: 401 Could be due to expired token, try to refresh
};

export default authMiddleware;
