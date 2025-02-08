import { createContext, PropsWithChildren, useContext, useState } from 'react';

const AppContext = createContext({
  theme: '',
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  updateTheme: (_: string) => {},
});

export const useAppContext = () => useContext(AppContext);

export const AppProvider: React.FC<PropsWithChildren> = ({
  children,
}: PropsWithChildren) => {
  const [theme, setTheme] = useState<string>('dark');

  const updateTheme = (newTheme: string) => {
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
