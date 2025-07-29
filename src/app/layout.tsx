'use client';
import React from 'react';
import 'jsvectormap/dist/jsvectormap.css';
import 'flatpickr/dist/flatpickr.min.css';
import '../css/satoshi.css';
import '../css/style.css';
import './globals.css';

import { Providers } from '@/components/providers';

const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>
        <div className="dark:bg-boxdark-2 dark:text-bodydark">
          <Providers>{children}</Providers>
        </div>
      </body>
    </html>
  );
};

export default RootLayout;
