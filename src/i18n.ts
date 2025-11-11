import { getRequestConfig } from 'next-intl/server';

export const locales = ['en', 'fr'] as const;
export type Locale = (typeof locales)[number];

export default getRequestConfig(async ({ locale }) => {
  // Fallback to default locale if undefined
  const currentLocale = locale || 'en';

  // Load all translation files and merge them
  const [landingMessages, onboardingMessages, metadataMessages] = await Promise.all([
    import(`./messages/landing/${currentLocale}.json`).then(module => module.default),
    import(`./messages/onboarding/${currentLocale}.json`).then(module => module.default),
    import(`./messages/metadata/${currentLocale}.json`).then(module => module.default),
  ]);

  return {
    locale: currentLocale,
    messages: {
      landing: landingMessages,
      onboarding: onboardingMessages,
      metadata: metadataMessages,
    },
  };
});
