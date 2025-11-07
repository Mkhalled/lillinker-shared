import React from 'react';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';

// Generate static params for locale
export function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'fr' }];
}

// This layout only applies to localized routes under [locale]
// Providers and CSS are handled by root layout
const LocaleLayout = async ({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) => {
  const { locale } = await params;
  
  // Validate locale
  const validLocales = ['en', 'fr'];
  if (!locale || !validLocales.includes(locale)) {
    notFound();
  }
  
  const messages = await getMessages({ locale });
  
  return (
    <NextIntlClientProvider locale={locale} messages={messages}>
      {children}
    </NextIntlClientProvider>
  );
};

export default LocaleLayout;
