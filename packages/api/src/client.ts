import _createClient, { type ClientOptions } from 'openapi-fetch';
import type { paths } from './api';

const client = _createClient<paths>();
export type ApiClient = typeof client;

type ApiClientOptions = Pick<ClientOptions, 'baseUrl'>;
export const createClient = (options: ApiClientOptions): ApiClient =>
  _createClient(options);
