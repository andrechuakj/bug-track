import { decompressFromUTF16 } from 'lz-string';
import { beforeEach, describe, expect, it } from 'vitest';
import { clearTokens, getTokens, saveTokens } from '../../src/utils/auth';

describe('auth utils', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  describe('saveTokens', () => {
    it('should save tokens to localStorage', () => {
      const token = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      };
      saveTokens(token);

      const storedToken = localStorage.getItem('token');
      expect(storedToken).not.toBeNull();
      expect(decompressFromUTF16(storedToken!)).toEqual(JSON.stringify(token));
    });

    it('should overwrite existing tokens in localStorage', () => {
      const initialToken = {
        accessToken: 'initial-access-token',
        refreshToken: 'initial-refresh-token',
      };
      const newToken = {
        accessToken: 'new-access-token',
        refreshToken: 'new-refresh-token',
      };

      saveTokens(initialToken);
      saveTokens(newToken);

      const storedToken = localStorage.getItem('token');
      expect(storedToken).not.toBeNull();
      expect(decompressFromUTF16(storedToken!)).toEqual(
        JSON.stringify(newToken)
      );
    });
  });

  describe('getTokens', () => {
    it('should return null if no tokens are saved in localStorage', () => {
      const tokens = getTokens();
      expect(tokens).toBeNull();
    });

    it('should return the saved tokens from localStorage', () => {
      const token = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      };
      saveTokens(token);

      const retrievedToken = getTokens();
      expect(retrievedToken).toEqual(token);
    });
  });
  describe('clearTokens', () => {
    it('should remove tokens from localStorage', () => {
      const token = {
        accessToken: 'access-token',
        refreshToken: 'refresh-token',
      };
      saveTokens(token);

      clearTokens();

      const storedToken = localStorage.getItem('token');
      expect(storedToken).toBeNull();
    });

    it('should do nothing if no tokens are saved in localStorage', () => {
      clearTokens();

      const storedToken = localStorage.getItem('token');
      expect(storedToken).toBeNull();
    });
  });
});
