import type { AppProps } from 'next/app';

import Head from 'next/head';
import AppLayout from '../components/AppLayout';
import { AppProvider } from '../utils/context';
import './globals.css';

const MyApp = ({ Component, pageProps }: AppProps) => {
  return (
    <>
      <Head>
        <title>Bug Track</title>
        <link rel="icon" href="/favicon.ico?v=2" />
      </Head>
      <AppProvider>
        <AppLayout>
          <Component {...pageProps} />
        </AppLayout>
      </AppProvider>
    </>
  );
};

export default MyApp;
