import React, { ReactNode } from 'react';
import { vi } from 'vitest';
import { LoginRequestDto, SignupRequestDto } from '../../src/api/auth';
import { AuthContext, AuthContextType } from '../../src/contexts/AuthContext';
import { MaybePromise } from '../../src/utils/promises';

const defaultLoginMock = vi.fn<
  (details: LoginRequestDto) => MaybePromise<boolean>
>((_details) => Promise.resolve(true));

const defaultSignupMock = vi.fn<
  (details: SignupRequestDto) => MaybePromise<boolean>
>((_details) => Promise.resolve(true));

const defaultLogoutMock = vi.fn<() => void>(() => {});

const defaultRefreshTokenMock = vi.fn<() => MaybePromise<boolean>>(() =>
  Promise.resolve(true)
);

type MockAuthProviderProps = {
  children: ReactNode;
  isAuthenticated?: boolean;
  login?: (details: LoginRequestDto) => MaybePromise<boolean>;
  signup?: (details: SignupRequestDto) => MaybePromise<boolean>;
  logout?: () => void;
  refreshToken?: () => MaybePromise<boolean>;
  loading?: boolean;
};

export const MockAuthProvider: React.FC<MockAuthProviderProps> = ({
  children,
  isAuthenticated: isAuthenticatedOverride,
  login: loginOverride,
  signup: signupOverride,
  logout: logoutOverride,
  refreshToken: refreshTokenOverride,
  loading: loadingOverride,
}) => {
  const contextValue: AuthContextType = {
    isAuthenticated: isAuthenticatedOverride ?? false,
    login: loginOverride || defaultLoginMock,
    signup: signupOverride || defaultSignupMock,
    logout: logoutOverride || defaultLogoutMock,
    refreshToken: refreshTokenOverride || defaultRefreshTokenMock,
    loading: loadingOverride ?? false,
  };

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};

export const clearAuthMocks = () => {
  defaultLoginMock.mockClear();
  defaultSignupMock.mockClear();
  defaultLogoutMock.mockClear();
  defaultRefreshTokenMock.mockClear();
};
