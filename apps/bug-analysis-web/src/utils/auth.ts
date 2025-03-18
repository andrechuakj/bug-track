import { compressToUTF16, decompressFromUTF16 } from 'lz-string';

type TokenState = {
  accessToken: string;
  refreshToken: string;
} | null;

export const saveTokens = (token: NonNullable<TokenState>) => {
  localStorage.setItem('token', compressToUTF16(JSON.stringify(token)));
};

export const getTokens = (): TokenState => {
  const token = localStorage.getItem('token');
  if (!token) {
    return null;
  }
  return JSON.parse(decompressFromUTF16(token));
};

export const clearTokens = () => {
  localStorage.removeItem('token');
};
