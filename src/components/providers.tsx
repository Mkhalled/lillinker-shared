'use client';

import { SessionProvider } from 'next-auth/react';
import { LoadingProvider } from '@/app/context/LoadingContext';

export const Providers = ({ children }: { children: React.ReactNode }) => {
  return (
    <SessionProvider>
      <LoadingProvider>
        {children}
      </LoadingProvider>
    </SessionProvider>
  );
};
