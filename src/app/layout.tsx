import { Metadata } from 'next';
import React from 'react';
import 'jsvectormap/dist/jsvectormap.css';
import 'flatpickr/dist/flatpickr.min.css';
import './globals.css';
import '../css/satoshi.css';
import '../css/style.css';

import { Providers } from '@/components/providers';

export const metadata: Metadata = {
  title: {
    template: '%s | LILLINKER - Portage Salarial',
    default: 'LILLINKER - La Voie Rapide vers la Société de Portage Parfaite',
  },
  description:
    'Découvrez notre plateforme innovante qui révolutionne la gestion du portage salarial avec des solutions modernes et efficaces.',
  keywords: ['portage salarial', 'freelance', 'consultant', 'entreprise', 'simulation'],
  authors: [{ name: 'LILLINKER' }],
  creator: 'LILLINKER',
  publisher: 'LILLINKER',
};

const RootLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => {
  return (
    <html lang="fr">
      <head>
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body suppressHydrationWarning={true}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
};

export default RootLayout;
