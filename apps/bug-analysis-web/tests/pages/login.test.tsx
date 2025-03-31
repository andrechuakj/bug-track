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

const loginMock = vi.fn(async (_details: LoginRequestDto) => {
  return true;
});

type TestAuthProviderProps = {
  children: React.ReactNode;
  login?: (details: LoginRequestDto) => Promise<boolean>;
};

export const MockAuthProviderForLogin: React.FC<TestAuthProviderProps> = ({
  children,
  login,
}) => {
  const testContextValue: AuthContextType = {
    isAuthenticated: false,
    login: login || loginMock,
    signup: async (_details: SignupRequestDto) => true,
    logout: () => {},
    refreshToken: async () => true,
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
    | ((details: LoginRequestDto) => Promise<boolean>)
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
    expect(getByRole('button', { name: /sign.?up/i })).toBeInTheDocument();
  });

  it('contains button that redirects to signup', () => {
    const { getByRole } = renderPage();

    const signup = getByRole('button', { name: /sign.?up/i });
    expect(signup).toBeInTheDocument();
    fireEvent.click(signup);
    expect(pushMock).toHaveBeenCalledWith('/signup');
  });

  it('errors when missing email', () => {
    const { getByRole, getByPlaceholderText } = renderPage();

    const passwordField = getByPlaceholderText(/password/i);
    expect(passwordField).toBeInTheDocument();
    const loginButton = getByRole('button', { name: /log.?in/i });
    expect(loginButton).toBeInTheDocument();

    fireEvent.change(passwordField, {
      target: { value: 'some password' },
    });

    expect(loginButton).toBeDisabled();
  });

  it('errors when missing password', () => {
    const { getByRole, getByPlaceholderText } = renderPage();

    const emailField = getByPlaceholderText(/email/i);
    expect(emailField).toBeInTheDocument();
    const loginButton = getByRole('button', { name: /log.?in/i });
    expect(loginButton).toBeInTheDocument();

    fireEvent.change(emailField, {
      target: { value: 'some email' },
    });

    expect(loginButton).toBeDisabled();
  });

  it('enables login button when provided email and password', () => {
    const { getByRole, getByPlaceholderText } = renderPage();

    const emailField = getByPlaceholderText(/email/i);
    expect(emailField).toBeInTheDocument();
    const passwordField = getByPlaceholderText(/password/i);
    expect(passwordField).toBeInTheDocument();
    const loginButton = getByRole('button', { name: /log.?in/i });
    expect(loginButton).toBeInTheDocument();

    fireEvent.change(emailField, {
      target: { value: 'valid_email@email.com' },
    });
    fireEvent.change(passwordField, {
      target: { value: 'valid password' },
    });

    expect(loginButton).toBeEnabled();
  });

  it('submits a login request with email and password', async () => {
    const { getByRole, getByPlaceholderText } = renderPage(loginMock);

    const emailField = getByPlaceholderText(/email/i);
    const passwordField = getByPlaceholderText(/password/i);
    const loginButton = getByRole('button', { name: /log.?in/i });

    fireEvent.change(emailField, {
      target: { value: 'valid_email@email.com' }, // this is not a valid email
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
