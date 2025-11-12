/** @type {import('next-sitemap').IConfig} */
module.exports = {
  siteUrl: process.env.SITE_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000',
  generateRobotsTxt: true,
  generateIndexSitemap: false,

  exclude: ['/auth/*', '/admin/*', '/company/*', '/consultant/*', '/api/*'],

  // Alternate language pages configuration for internationalization
  alternateRefs: [
    {
      href: `${process.env.SITE_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000'}/en`,
      hreflang: 'en',
    },
    {
      href: `${process.env.SITE_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000'}/fr`,
      hreflang: 'fr',
    },
    {
      href: `${process.env.SITE_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000'}/fr`,
      hreflang: 'x-default',
    },
  ],

  // Robots.txt configuration
  robotsTxtOptions: {
    policies: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/auth/', '/admin/', '/company/', '/consultant/', '/api/'],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: ['/auth/', '/admin/', '/company/', '/consultant/', '/api/'],
        crawlDelay: 0,
      },
    ],
    additionalSitemaps: [
      `${process.env.SITE_URL || process.env.NEXTAUTH_URL || 'http://localhost:3000'}/sitemap.xml`,
    ],
  },

  // Custom transformation for localized URLs
  transform: async (config, path) => {
    // Handle localized routes
    if (path === '/en' || path === '/fr') {
      return {
        loc: path,
        changefreq: 'weekly',
        priority: 1.0,
        lastmod: new Date().toISOString(),
        alternateRefs: [
          {
            href: `${config.siteUrl}/en`,
            hreflang: 'en',
          },
          {
            href: `${config.siteUrl}/fr`,
            hreflang: 'fr',
          },
          {
            href: `${config.siteUrl}/fr`,
            hreflang: 'x-default',
          },
        ],
      };
    }

    // Default transformation
    return {
      loc: path,
      changefreq: config.changefreq,
      priority: config.priority,
      lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
    };
  },
};
