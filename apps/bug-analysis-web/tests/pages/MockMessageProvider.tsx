import { PropsWithChildren } from 'react';
import type { MessageInstance } from 'antd/es/message/interface';
import { vi } from 'vitest';
import { MessageContext } from '../../src/contexts/MessageContext';

export const mockMessageApi = {
  info: vi.fn(),
  success: vi.fn(),
  error: vi.fn(),
  warning: vi.fn(),
  loading: vi.fn(),
  open: vi.fn(),
  destroy: vi.fn(),
} satisfies MessageInstance;

export const MockMessageProvider: React.FC<PropsWithChildren> = ({
  children,
}) => {
  return (
    <MessageContext.Provider value={mockMessageApi}>
      {children}
    </MessageContext.Provider>
  );
};

export const clearMessageMocks = (): void => {
  mockMessageApi.info.mockClear();
  mockMessageApi.success.mockClear();
  mockMessageApi.error.mockClear();
  mockMessageApi.warning.mockClear();
  mockMessageApi.loading.mockClear();
  mockMessageApi.open.mockClear();
  mockMessageApi.destroy.mockClear();
};
