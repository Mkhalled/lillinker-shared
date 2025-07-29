'use client';

import { usePathname } from 'next/navigation';
import { SessionProvider } from 'next-auth/react';
import { useEffect } from 'react';

import { LoadingProvider, useLoading } from '@/app/context/LoadingContext';

import Loader from './common/Loader';

const InnerProviders = ({ children }: { children: React.ReactNode }) => {
  const { loading, setLoading } = useLoading();
  const pathname = usePathname();

  // Optional initial delay (can remove if unnecessary)
  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 1000);
    return () => clearTimeout(timer);
  }, [setLoading]);

  // Automatically stop loader on route change
  useEffect(() => {
    setLoading(false);
  }, [pathname, setLoading]);

  return loading ? <Loader /> : <SessionProvider>{children}</SessionProvider>;
};

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <LoadingProvider>
      <InnerProviders>{children}</InnerProviders>
    </LoadingProvider>
  );
};
