import {
  fireEvent,
  render,
  RenderResult,
  waitFor,
} from '@testing-library/react';
import React from 'react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { LoginRequestDto, SignupRequestDto } from '../../src/api/auth';
import { AuthContext, AuthContextType } from '../../src/contexts/AuthContext';
import Login from '../../src/pages/login';
import { MaybePromise } from '../../src/utils/promises';
import { MessageContext } from '../../src/contexts/MessageContext';

if (typeof window !== 'undefined' && !window.matchMedia) {
  // @ts-expect-error creating mock to make antd's Grid.useBreakpoint work,
  //   which allows Login to render.
  //   Does not implement all other methods otherwise expected.
  window.matchMedia = () => ({
    matches: false,
    addListener: () => {},
    removeListener: () => {},
  });
}

const pushMock = vi.fn();

vi.mock('next/router', () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

const loginMock = vi.fn((_details: LoginRequestDto) => true);

type TestAuthProviderProps = {
  children: React.ReactNode;
  login?: (details: LoginRequestDto) => MaybePromise<boolean>;
};

export const MockAuthProviderForLogin: React.FC<TestAuthProviderProps> = ({
  children,
  login,
}) => {
  const testContextValue: AuthContextType = {
    isAuthenticated: false,
    login: login || loginMock,
    signup: (_details: SignupRequestDto) => true,
    logout: () => {},
    refreshToken: () => true,
    loading: false,
  };

  return (
    <AuthContext.Provider value={testContextValue}>
      {children}
    </AuthContext.Provider>
  );
};

const renderPage = (
  login:
    | ((details: LoginRequestDto) => MaybePromise<boolean>)
    | undefined = undefined
): RenderResult => {
  return render(
    <MockAuthProviderForLogin login={login}>
      <Login />
    </MockAuthProviderForLogin>
  );
};

describe('Login', () => {
  beforeEach(() => {
    loginMock.mockReset();
    pushMock.mockReset();
  });

  it('contains form fields and buttons', () => {
    const { getByAltText, getByRole, getByPlaceholderText } = renderPage();

    expect(getByAltText('Logo')).toBeInTheDocument();
    expect(getByPlaceholderText(/email/i)).toBeInTheDocument();
    expect(getByPlaceholderText(/password/i)).toBeInTheDocument();

    expect(getByRole('button', { name: /log.?in/i })).toBeInTheDocument();
  });

  it('contains element that redirects to signup', () => {
    const { getByText } = renderPage();

    const signup = getByText(/sign.?up/i);
    expect(signup).toBeInTheDocument();
    fireEvent.click(signup);
    expect(pushMock).toHaveBeenCalledWith('/signup');
  });

  it('errors when missing email', async () => {
    const { getByRole, getByPlaceholderText, getByText } = renderPage();

    const passwordField = getByPlaceholderText(/password/i);
    expect(passwordField).toBeInTheDocument();
    const loginButton = getByRole('button', { name: /log.?in/i });
    expect(loginButton).toBeInTheDocument();

    fireEvent.change(passwordField, {
      target: { value: 'some password' },
    });

    fireEvent.click(loginButton);

    await waitFor(() =>
      expect(getByText(/please enter your email/i)).toBeInTheDocument()
    );
  });

  it('errors when missing password', async () => {
    const { getByRole, getByPlaceholderText, getByText } = renderPage();

    const emailField = getByPlaceholderText(/email/i);
    expect(emailField).toBeInTheDocument();
    const loginButton = getByRole('button', { name: /log.?in/i });
    expect(loginButton).toBeInTheDocument();

    fireEvent.change(emailField, {
      target: { value: 'some email' },
    });

    fireEvent.click(loginButton);

    await waitFor(() =>
      expect(getByText(/please enter your password/i)).toBeInTheDocument()
    );
  });

  it('submits a login request with email and password', async () => {
    const { getByRole, getByPlaceholderText } = renderPage(loginMock);

    const emailField = getByPlaceholderText(/email/i);
    const passwordField = getByPlaceholderText(/password/i);
    const loginButton = getByRole('button', { name: /log.?in/i });

    fireEvent.change(emailField, {
      target: { value: 'valid_email@email.com' },
    });
    fireEvent.change(passwordField, {
      target: { value: 'valid_password' },
    });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(loginMock).toHaveBeenCalledWith({
        email: 'valid_email@email.com',
        password: 'valid_password',
      });
    });
  });
});
