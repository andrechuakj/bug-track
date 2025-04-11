import { render, RenderResult, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import React from 'react';
import Homepage from '../../src/pages';
import { MockAuthProvider } from '../contexts/MockAuthProvider';

const pushMock = vi.fn();

vi.mock('next/router', () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

vi.mock('../../src/pages/dashboard', () => ({
  default: () => <div data-testid="mock-homepage">Mock Homepage</div>,
}));

type RenderPageOptions = {
  isAuthenticated?: boolean;
  isLoading?: boolean;
};

const renderPage = (options: RenderPageOptions = {}): RenderResult => {
  const { isAuthenticated, isLoading } = options;

  return render(
    <MockAuthProvider isAuthenticated={isAuthenticated} loading={isLoading}>
      <Homepage />
    </MockAuthProvider>
  );
};

describe('index', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the dashboard if authenticated', async () => {
    const { getByTestId } = renderPage({ isAuthenticated: true });

    await waitFor(() => {
      expect(getByTestId('mock-homepage')).toBeInTheDocument();
    });
  });

  it('redirects to login if not authenticated', async () => {
    renderPage({ isAuthenticated: false, isLoading: false });

    await waitFor(() => {
      expect(pushMock).toHaveBeenCalledWith('/login');
    });
  });

  it('does nothing if not authenticated but is loading', async () => {
    renderPage({ isAuthenticated: false, isLoading: true });

    await waitFor(() => {
      expect(pushMock).not.toHaveBeenCalled();
    });
  });
});
