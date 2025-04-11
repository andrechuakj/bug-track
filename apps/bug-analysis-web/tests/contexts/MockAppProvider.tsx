import { vi } from 'vitest';
import React, { useState, PropsWithChildren } from 'react';
import { AppContext } from '../../src/contexts/AppContext';
import { AppTheme } from '../../src/utils/types';

export const defaultTheme: AppTheme = 'dark';
export const defaultUpdateTheme = vi.fn();

type MockAppProviderProps = PropsWithChildren<{
  theme?: AppTheme;
  updateTheme?: (newTheme: AppTheme) => void;
}>;

export const MockAppProvider: React.FC<MockAppProviderProps> = ({
  children,
  theme: initialTheme,
  updateTheme: mockUpdateTheme,
}) => {
  const [currentTheme, setCurrentTheme] = useState<AppTheme>(
    initialTheme ?? defaultTheme
  );

  const updateThemeFn =
    mockUpdateTheme ??
    defaultUpdateTheme.mockImplementation((newTheme: AppTheme) => {
      setCurrentTheme(newTheme);
    });

  if (!mockUpdateTheme) {
    defaultUpdateTheme.mockImplementation((newTheme: AppTheme) => {
      setCurrentTheme(newTheme);
    });
  }

  return (
    <AppContext.Provider
      value={{
        theme: currentTheme,
        updateTheme: updateThemeFn,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};
