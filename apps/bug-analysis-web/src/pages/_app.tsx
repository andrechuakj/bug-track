import type { AppProps } from 'next/app';

import AppLayout from '../components/AppLayout';
import { AppProvider } from '../utils/context';
import './globals.css';

const MyApp = ({ Component, pageProps }: AppProps) => {
  return (
    <AppProvider>
      <AppLayout>
        <Component {...pageProps} />
      </AppLayout>
    </AppProvider>
  );
};

export default MyApp;
