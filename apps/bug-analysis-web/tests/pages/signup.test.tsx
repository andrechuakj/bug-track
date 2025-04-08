import {
  fireEvent,
  render,
  RenderResult,
  screen,
  waitFor,
} from '@testing-library/react';
import React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LoginRequestDto, SignupRequestDto } from '../../src/api/auth';
import { AuthContext, AuthContextType } from '../../src/contexts/AuthContext';
import Signup from '../../src/pages/signup';
import { MaybePromise } from '../../src/utils/promises';
import { MockAuthProvider } from './MockAuthProvider';
import {
  clearMessageMocks,
  mockMessageApi,
  MockMessageProvider,
} from './MockMessageProvider';
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

const originalMatchMedia = window.matchMedia;
const mdQuery = '(min-width: 768px)'; // Ant Design's default md breakpoint query

const setScreenSize = (size: 'small' | 'large') => {
  if (size === 'small') {
    // Mock for SMALL: Always return false for matches
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
  } else {
    // 'large' (or 'medium', anything >= md)
    // Mock for LARGE: Return true only if the query IS the 'md' breakpoint query
    window.matchMedia = vi.fn().mockImplementation((query) => ({
      matches: query === mdQuery, // The core logic!
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
  }
};

const restoreScreenSize = () => {
  window.matchMedia = originalMatchMedia;
};

const pushMock = vi.fn();

vi.mock('next/router', () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

type RenderPageOptions = {
  signup?: (details: SignupRequestDto) => MaybePromise<boolean>;
  isAuthenticated?: boolean;
};

const renderPage = (options: RenderPageOptions = {}): RenderResult => {
  const { signup, isAuthenticated } = options;

  return render(
    <MockAuthProvider signup={signup} isAuthenticated={isAuthenticated}>
      <MockMessageProvider>
        <Signup />
      </MockMessageProvider>
    </MockAuthProvider>
  );
};

describe('Signup', () => {
  beforeEach(() => {
    pushMock.mockReset();
    clearMessageMocks();
  });
  afterEach(() => {
    restoreScreenSize();
  });

  it('redirects if already authenticated', () => {
    renderPage({ isAuthenticated: true });
    expect(pushMock).toHaveBeenCalledWith('/');
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

  it('changes layout based on screen size', () => {
    setScreenSize('small');
    let { unmount } = renderPage();
    let signupButton = screen.getByRole('button', { name: /sign.?up/i });
    let formElement = signupButton.closest('form');
    expect(formElement).toBeInTheDocument();
    expect(formElement).toHaveClass('ant-form-vertical');
    expect(formElement).not.toHaveClass('ant-form-horizontal');
    unmount();

    setScreenSize('large');
    renderPage();
    signupButton = screen.getByRole('button', { name: /sign.?up/i });
    formElement = signupButton.closest('form');
    expect(formElement).toBeInTheDocument();
    expect(formElement).toHaveClass('ant-form-horizontal');
    expect(formElement).not.toHaveClass('ant-form-vertical');
  });

  it('errors when missing email', async () => {
    const {
      getByRole,
      getByText,
      getByPlaceholderText,
      getAllByPlaceholderText,
    } = renderPage();

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
    expect(pushMock).not.toHaveBeenCalled();
  });

  it('submits a signup request with all fields filled', async () => {
    const signupMock = vi.fn().mockResolvedValue(true);
    const { getByRole, getByPlaceholderText, getAllByPlaceholderText } =
      renderPage({
        signup: signupMock,
      });

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

  it('catches unexpected errors', async () => {
    const MOCK_ERROR_MESSAGE = 'Internal Server Error';
    const signupMock = vi.fn(async () => {
      throw new Error(MOCK_ERROR_MESSAGE);
    });

    const {
      getByRole,
      getByPlaceholderText,
      getAllByPlaceholderText,
      findByText,
    } = renderPage({
      signup: signupMock,
    });

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

    const errorMessageElement = await findByText(
      /error occurred during signup/i
    );
    expect(errorMessageElement).toBeInTheDocument();

    expect(pushMock).not.toHaveBeenCalled();
  });

  it('popups and redirects on successful signup', async () => {
    const signupMock = vi.fn().mockResolvedValue(true);
    const { getByRole, getByPlaceholderText, getAllByPlaceholderText } =
      renderPage({
        signup: signupMock,
      });

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

    expect(mockMessageApi.success).toHaveBeenCalledWith('Signup successful!');
    expect(pushMock).toHaveBeenCalledWith('/');
  });

  it('errors when signup fails', async () => {
    const signupMock = vi.fn().mockResolvedValue(false);
    const {
      getByRole,
      getByPlaceholderText,
      getAllByPlaceholderText,
      findByText,
    } = renderPage({
      signup: signupMock,
    });

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

    const errorMessageElement = await findByText(
      /Signup failed. Please try again./i
    );
    expect(errorMessageElement).toBeInTheDocument();

    expect(pushMock).not.toHaveBeenCalled();
  });
});
