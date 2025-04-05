import _createClient, { type ClientOptions } from 'openapi-fetch';
import type { components, paths } from './api';

const client = _createClient<paths>();
export type ApiClient = typeof client;

type ApiClientOptions = Pick<ClientOptions, 'baseUrl' | 'headers'>;
export const createClient = (options: ApiClientOptions): ApiClient =>
  _createClient(options);

export { type Middleware } from 'openapi-fetch';

type Schemas = components['schemas'];

export type Responses<T extends keyof Schemas & `${string}ResponseDto`> =
  Schemas[T];

export type RequestBody<T extends keyof Schemas & `${string}RequestDto`> =
  Schemas[T];
