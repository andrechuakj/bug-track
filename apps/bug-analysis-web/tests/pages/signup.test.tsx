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
import Signup from '../../src/pages/signup';

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

const signupMock = vi.fn(async (_details: SignupRequestDto) => {
  return true;
});

type TestAuthProviderProps = {
  children: React.ReactNode;
  signup?: (details: SignupRequestDto) => Promise<boolean>;
};

export const MockAuthProviderForLogin: React.FC<TestAuthProviderProps> = ({
  children,
  signup,
}) => {
  const testContextValue: AuthContextType = {
    isAuthenticated: false,
    login: async (_details: LoginRequestDto) => true,
    signup: signup || signupMock,
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
  signup:
    | ((details: SignupRequestDto) => Promise<boolean>)
    | undefined = undefined
): RenderResult => {
  return render(
    <MockAuthProviderForLogin signup={signup}>
      <Signup />
    </MockAuthProviderForLogin>
  );
};

describe('Signup', () => {
  beforeEach(() => {
    signupMock.mockReset();
    pushMock.mockReset();
  });

  it('contains form fields and buttons', () => {
    const {
      getByAltText,
      getByRole,
      getByPlaceholderText,
      getAllByPlaceholderText,
    } = renderPage();

    expect(getByAltText('Logo')).toBeInTheDocument();
    expect(getByPlaceholderText(/email/i)).toBeInTheDocument();
    expect(getByPlaceholderText(/name/i)).toBeInTheDocument();
    expect(getAllByPlaceholderText(/password/i).length).toBe(2);

    expect(getByRole('button', { name: /sign.?up/i })).toBeInTheDocument();
  });

  it('contains element that redirects to login', () => {
    const { getByText } = renderPage();

    const login = getByText(/log.?in/i);
    expect(login).toBeInTheDocument();
    fireEvent.click(login);
    expect(pushMock).toHaveBeenCalledWith('/login');
  });

  it('errors when missing email', async () => {
    const {
      getByRole,
      getByText,
      getByPlaceholderText,
      getAllByPlaceholderText,
    } = renderPage();

    // const emailField = getByPlaceholderText(/email/i);
    const nameField = getByPlaceholderText(/name/i);
    const [passwordField, confirmPasswordField] =
      getAllByPlaceholderText(/password/i);
    const signupButton = getByRole('button', { name: /sign.?up/i });

    fireEvent.change(nameField, {
      target: { value: 'valid name' },
    });
    fireEvent.change(passwordField, {
      target: { value: 'valid password' },
    });
    fireEvent.change(confirmPasswordField, {
      target: { value: 'valid password' },
    });

    fireEvent.click(signupButton);

    await waitFor(() =>
      expect(getByText(/please enter your email/i)).toBeInTheDocument()
    );
  });

  it('errors when provided invalid email', async () => {
    const {
      getByRole,
      getByText,
      getByPlaceholderText,
      getAllByPlaceholderText,
    } = renderPage();

    const emailField = getByPlaceholderText(/email/i);
    const nameField = getByPlaceholderText(/name/i);
    const [passwordField, confirmPasswordField] =
      getAllByPlaceholderText(/password/i);
    const signupButton = getByRole('button', { name: /sign.?up/i });

    fireEvent.change(emailField, {
      target: { value: 'invalid email' },
    });
    fireEvent.change(nameField, {
      target: { value: 'valid name' },
    });
    fireEvent.change(passwordField, {
      target: { value: 'valid password' },
    });
    fireEvent.change(confirmPasswordField, {
      target: { value: 'valid password' },
    });

    fireEvent.click(signupButton);

    await waitFor(() =>
      expect(getByText(/please enter a valid email/i)).toBeInTheDocument()
    );
  });

  it('errors when missing name', async () => {
    const {
      getByRole,
      getByText,
      getByPlaceholderText,
      getAllByPlaceholderText,
    } = renderPage();

    const emailField = getByPlaceholderText(/email/i);
    // const nameField = getByPlaceholderText(/name/i);
    const [passwordField, confirmPasswordField] =
      getAllByPlaceholderText(/password/i);
    const signupButton = getByRole('button', { name: /sign.?up/i });

    fireEvent.change(emailField, {
      target: { value: 'valid@example.com' },
    });
    fireEvent.change(passwordField, {
      target: { value: 'valid password' },
    });
    fireEvent.change(confirmPasswordField, {
      target: { value: 'valid password' },
    });

    fireEvent.click(signupButton);

    await waitFor(() =>
      expect(getByText(/please enter your name/i)).toBeInTheDocument()
    );
  });

  it('errors when missing password', async () => {
    const { getByRole, getByText, getByPlaceholderText } = renderPage();

    const emailField = getByPlaceholderText(/email/i);
    const nameField = getByPlaceholderText(/name/i);
    // const [passwordField, confirmPasswordField] =
    //   getAllByPlaceholderText(/password/i);
    const signupButton = getByRole('button', { name: /sign.?up/i });

    fireEvent.change(emailField, {
      target: { value: 'valid@example.com' },
    });
    fireEvent.change(nameField, {
      target: { value: 'valid name' },
    });

    fireEvent.click(signupButton);

    await waitFor(() => {
      expect(getByText(/please enter your password/i)).toBeInTheDocument();
      expect(getByText(/please confirm your password/i)).toBeInTheDocument();
    });
  });

  it('errors when password mismatch', async () => {
    const {
      getByRole,
      getByText,
      getByPlaceholderText,
      getAllByPlaceholderText,
    } = renderPage();

    const emailField = getByPlaceholderText(/email/i);
    const nameField = getByPlaceholderText(/name/i);
    const [passwordField, confirmPasswordField] =
      getAllByPlaceholderText(/password/i);
    const signupButton = getByRole('button', { name: /sign.?up/i });

    fireEvent.change(emailField, {
      target: { value: 'valid@example.com' },
    });
    fireEvent.change(nameField, {
      target: { value: 'valid name' },
    });
    fireEvent.change(passwordField, {
      target: { value: 'password1' },
    });
    fireEvent.change(confirmPasswordField, {
      target: { value: 'password2' },
    });

    fireEvent.click(signupButton);

    await waitFor(() =>
      expect(getByText(/passwords do not match/i)).toBeInTheDocument()
    );
  });

  it('submits a signup request with all fields filled', async () => {
    const { getByRole, getByPlaceholderText, getAllByPlaceholderText } =
      renderPage();

    const emailField = getByPlaceholderText(/email/i);
    const nameField = getByPlaceholderText(/name/i);
    const [passwordField, confirmPasswordField] =
      getAllByPlaceholderText(/password/i);
    const signupButton = getByRole('button', { name: /sign.?up/i });

    fireEvent.change(emailField, {
      target: { value: 'valid_email@email.com' },
    });
    fireEvent.change(nameField, {
      target: { value: 'valid name' },
    });
    fireEvent.change(passwordField, {
      target: { value: 'valid password' },
    });
    fireEvent.change(confirmPasswordField, {
      target: { value: 'valid password' },
    });

    fireEvent.click(signupButton);

    await waitFor(() =>
      expect(signupMock).toHaveBeenCalledWith({
        name: 'valid name',
        email: 'valid_email@email.com',
        password: 'valid password',
      })
    );
  });
});
