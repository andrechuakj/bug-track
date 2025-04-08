import {
  fireEvent,
  render,
  RenderResult,
  waitFor,
} from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { LoginRequestDto } from '../../src/api/auth';
import Login from '../../src/pages/login';
import { MaybePromise } from '../../src/utils/promises';
import {
  clearMessageMocks,
  mockMessageApi,
  MockMessageProvider,
} from './MockMessageProvider';
import { MockAuthProvider } from './MockAuthProvider';
import { screen } from '@testing-library/react';

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
  login?: (details: LoginRequestDto) => MaybePromise<boolean>;
  isAuthenticated?: boolean;
};

const renderPage = (options: RenderPageOptions = {}): RenderResult => {
  const { login, isAuthenticated } = options;

  return render(
    <MockAuthProvider login={login} isAuthenticated={isAuthenticated}>
      <MockMessageProvider>
        <Login />
      </MockMessageProvider>
    </MockAuthProvider>
  );
};

describe('Login', () => {
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

  it('changes layout based on screen size', () => {
    setScreenSize('small');
    let { unmount } = renderPage();
    let loginButton = screen.getByRole('button', { name: /log.?in/i });
    let formElement = loginButton.closest('form');
    expect(formElement).toBeInTheDocument();
    expect(formElement).toHaveClass('ant-form-vertical');
    expect(formElement).not.toHaveClass('ant-form-horizontal');
    unmount();

    setScreenSize('large');
    renderPage();
    loginButton = screen.getByRole('button', { name: /log.?in/i });
    formElement = loginButton.closest('form');
    expect(formElement).toBeInTheDocument();
    expect(formElement).toHaveClass('ant-form-horizontal');
    expect(formElement).not.toHaveClass('ant-form-vertical');
  });

  it('errors when missing email', async () => {
    const { getByRole, getByPlaceholderText, getByText } = renderPage();

    const passwordField = getByPlaceholderText(/password/i);
    const loginButton = getByRole('button', { name: /log.?in/i });

    fireEvent.change(passwordField, {
      target: { value: 'some password' },
    });

    fireEvent.click(loginButton);

    await waitFor(() =>
      expect(getByText(/please enter your email/i)).toBeInTheDocument()
    );
  });

  it('errors when provided invalid email', async () => {
    const { getByRole, getByText, getByPlaceholderText } = renderPage();

    const emailField = getByPlaceholderText(/email/i);
    const passwordField = getByPlaceholderText(/password/i);
    const loginButton = getByRole('button', { name: /log.?in/i });

    fireEvent.change(emailField, {
      target: { value: 'invalid email' },
    });
    fireEvent.change(passwordField, {
      target: { value: 'valid password' },
    });

    fireEvent.click(loginButton);

    await waitFor(() =>
      expect(getByText(/please enter a valid email/i)).toBeInTheDocument()
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
    const loginMock = vi.fn().mockResolvedValue(true);
    const { getByRole, getByPlaceholderText } = renderPage({
      login: loginMock,
    });

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

  it('catches unexpected errors', async () => {
    const MOCK_ERROR_MESSAGE = 'Internal Server Error';
    const loginMock = vi.fn(async () => {
      throw new Error(MOCK_ERROR_MESSAGE);
    });

    const { getByRole, getByPlaceholderText, findByText } = renderPage({
      login: loginMock,
    });

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

    const errorMessageElement = await findByText(
      /unexpected error|internal server error/i
    );
    expect(errorMessageElement).toBeInTheDocument();

    expect(pushMock).not.toHaveBeenCalled();
  });

  it('popups and redirects on successful login', async () => {
    const loginMock = vi.fn().mockResolvedValue(true);
    const { getByRole, getByPlaceholderText } = renderPage({
      login: loginMock,
    });

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

    expect(mockMessageApi.success).toHaveBeenCalledWith('Login successful!');
    expect(pushMock).toHaveBeenCalledWith('/');
  });

  it('errors when login fails', async () => {
    const loginMock = vi.fn().mockResolvedValue(false);
    const { getByRole, getByPlaceholderText, findByText } = renderPage({
      login: loginMock,
    });

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

    const errorMessageElement = await findByText(/invalid email or password/i);
    expect(errorMessageElement).toBeInTheDocument();

    expect(pushMock).not.toHaveBeenCalled();
  });
});
