import type { AppProps } from 'next/app';

import Head from 'next/head';
import AppLayout from '../components/AppLayout';
import { AppProvider } from '../contexts/AppContext';
import SessionProvider from '../contexts/SessionContext';
import './globals.css';

const App = ({ Component, pageProps }: AppProps) => {
  return (
    <>
      <Head>
        <title>Bug Track</title>
        <link rel="icon" href="/favicon.ico?v=2" />
      </Head>
      <AppProvider>
        <SessionProvider>
          <AppLayout>
            <Component {...pageProps} />
          </AppLayout>
        </SessionProvider>
      </AppProvider>
    </>
  );
};

export default App;
