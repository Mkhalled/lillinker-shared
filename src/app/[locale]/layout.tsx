import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getTranslations } from 'next-intl/server';
import React from 'react';

export function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'fr' }];
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: 'metadata' });

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://lillinker.com';
  const canonicalUrl = `${baseUrl}/${locale}`;

  // SEO-optimized metadata for portage salarial
  return {
    title: t('title'),
    description: t('description'),
    keywords: t('keywords'),
    authors: [{ name: 'Lillinker' }],
    creator: 'Lillinker',
    publisher: 'Lillinker',

    metadataBase: new URL(baseUrl),

    alternates: {
      canonical: canonicalUrl,
      languages: {
        en: `${baseUrl}/en`,
        fr: `${baseUrl}/fr`,
        'x-default': `${baseUrl}/fr`,
      },
    },

    openGraph: {
      title: t('title'),
      description: t('description'),
      url: canonicalUrl,
      siteName: 'Lillinker',
      locale: locale === 'fr' ? 'fr_FR' : 'en_US',
      type: 'website',
      images: [
        {
          url: `${baseUrl}/images/og-image.jpg`,
          width: 1200,
          height: 630,
          alt: t('title'),
        },
      ],
    },

    twitter: {
      card: 'summary_large_image',
      title: t('title'),
      description: t('description'),
      images: [`${baseUrl}/images/og-image.jpg`],
    },

    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },

    verification: {
      google: process.env.GOOGLE_SITE_VERIFICATION,
    },
  };
}

const LocaleLayout = async ({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) => {
  const { locale } = await params;

  const validLocales = ['en', 'fr'];
  if (!locale || !validLocales.includes(locale)) {
    notFound();
  }

  const messages = await getMessages({ locale });
  const t = await getTranslations({ locale, namespace: 'metadata' });
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://lillinker.com';

  // Structured Data (JSON-LD) for SEO
  const organizationSchema = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Lillinker',
    description: t('description'),
    url: baseUrl,
    logo: `${baseUrl}/images/logo/logo.png`,
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      availableLanguage: ['French', 'English'],
    },
  };

  const websiteSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Lillinker',
    url: baseUrl,
    description: t('description'),
    inLanguage: [locale === 'fr' ? 'fr-FR' : 'en-US'],
    potentialAction: {
      '@type': 'SearchAction',
      target: `${baseUrl}/search?q={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  };

  return (
    <>
      {/* Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(organizationSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(websiteSchema),
        }}
      />
      <NextIntlClientProvider locale={locale} messages={messages}>
        {children}
      </NextIntlClientProvider>
    </>
  );
};

export default LocaleLayout;
