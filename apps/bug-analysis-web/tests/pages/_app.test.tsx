import { render, screen, waitFor } from '@testing-library/react';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import type { AppProps } from 'next/app';
import React from 'react';

import App from '../../src/pages/_app';
import { useAppContext } from '../../src/contexts/AppContext';
import { useSession } from '../../src/contexts/SessionContext';

// forces metadata to appear as HTML elements
vi.mock('next/head', () => ({
  __esModule: true,
  default: ({ children }: { children: Array<React.ReactElement> }) => (
    <>{children}</>
  ),
}));

const pushMock = vi.fn();

vi.mock('next/router', () => ({
  useRouter: () => ({
    push: pushMock,
  }),
}));

const ContextConsumingComponent: React.FC = () => {
  const appContext = useAppContext();
  const sessionContext = useSession();

  return (
    <div data-testid="consumer">
      <span data-testid="app-context-status">
        {appContext ? 'PASS' : 'FAIL'}
      </span>
      <span data-testid="session-context-status">
        {sessionContext ? 'PASS' : 'FAIL'}
      </span>
    </div>
  );
};

const defaultAppProps: AppProps = {
  Component: () => <div data-testid="mock-page">Mock Page</div>,
  pageProps: {},
  // fully replacing router is complicated and unnecessary for this test.
  // future tests may break, but is unlikely and can probably be mitigated by
  // mocking other router functions.
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
  router: {} as any,
};

describe('App', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    localStorage.clear();
  });

  it('renders the component within AppLayout', async () => {
    const { getByRole } = render(<App {...defaultAppProps} />);

    await waitFor(() => {
      expect(getByRole('menu')).toBeInTheDocument();
    });
  });

  it('renders title and icon', async () => {
    render(<App {...defaultAppProps} />);

    await waitFor(() => {
      expect(document.title).toBe('Bug Track');

      const linkElement = document.querySelector('head > link[rel="icon"]');
      expect(linkElement).toBeInTheDocument();
      expect(linkElement).toHaveAttribute('href', '/favicon.ico?v=2');
    });
  });

  it('provides AppContext and SessionContext to child components', async () => {
    const propsWithConsumer: AppProps = {
      ...defaultAppProps,
      Component: ContextConsumingComponent,
    };

    render(<App {...propsWithConsumer} />);

    await waitFor(() => {
      expect(screen.getByTestId('app-context-status')).toHaveTextContent(
        'PASS'
      );
      expect(screen.getByTestId('session-context-status')).toHaveTextContent(
        'PASS'
      );
    });
  });
});
