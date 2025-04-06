import { useRouter } from 'next/router';
import { ReactNode, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import Dashboard from './dashboard';

// This is the main page of the application. It checks if the user is authenticated. This is the layer that abstracts out he authentication logic.
const Homepage: React.FC = (): ReactNode => {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (!isAuthenticated) {
      console.log('User not authenticated, redirecting to login page');
      router.push('/login');
    }
  }, [loading, isAuthenticated, router]);

  return <Dashboard />;
};

export default Homepage;
