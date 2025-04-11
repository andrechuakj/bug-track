import {
  createContext,
  PropsWithChildren,
  useCallback,
  useContext,
  useState,
} from 'react';
import { AppTheme } from '../utils/types';
import { AuthProvider } from './AuthContext';
import { MessageProvider } from './MessageContext';

type AppContextType = {
  theme: AppTheme;
  updateTheme: (newTheme: AppTheme) => void;
};

export const AppContext = createContext<AppContextType | undefined>(undefined);

export const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }
  return context;
};

export const AppProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [theme, setTheme] = useState<AppTheme>('dark');

  const updateTheme = useCallback((newTheme: AppTheme) => {
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
  }, []);

  return (
    <AppContext.Provider value={{ theme, updateTheme }}>
      <AuthProvider>
        <MessageProvider>{children}</MessageProvider>
      </AuthProvider>
    </AppContext.Provider>
  );
};
