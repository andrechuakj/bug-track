import { createClient } from '~api';
import Constants from '../utils/constants';
import authMiddleware from './authMiddleware';

const client = createClient({
  baseUrl: Constants.BACKEND_URL,
  // JSON API
  headers: {
    Accept: 'application/json',
    'Accept-Encoding': 'gzip, br, deflate',
    'Content-Type': 'application/json',
  },
});

client.use(authMiddleware);

export { client as api };
