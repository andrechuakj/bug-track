import { createContext, PropsWithChildren, useContext, useState } from 'react';
import { AppTheme } from './types';

const AppContext = createContext({
  theme: '',
  updateTheme: (_: AppTheme) => {},
});

export const useAppContext = () => useContext(AppContext);

export const AppProvider: React.FC<PropsWithChildren> = ({
  children,
}: PropsWithChildren) => {
  const [theme, setTheme] = useState<AppTheme>('dark');

  const updateTheme = (newTheme: AppTheme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  };

  const contextValue = {
    theme,
    updateTheme,
  };

  return (
    <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>
  );
};
