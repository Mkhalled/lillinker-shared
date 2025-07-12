'use client';
import React, { useEffect, useState } from 'react';
import 'jsvectormap/dist/jsvectormap.css';
import 'flatpickr/dist/flatpickr.min.css';
import '../css/satoshi.css';
import '../css/style.css';
import "./globals.css";

import Loader from '@/components/common/Loader';
import { Providers } from '@/components/providers';

const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  const [loading, setLoading] = useState<boolean>(true);

  // const pathname = usePathname();

  useEffect(() => {
    setTimeout(() => setLoading(false), 1000);
  }, []);

  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>
        <div className="dark:bg-boxdark-2 dark:text-bodydark">
          {loading ? <Loader /> : <Providers>{children}</Providers>}
        </div>
      </body>
    </html>
  );
};

export default RootLayout;
