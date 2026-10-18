import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/api',
          '/dashboard',
          '/sme',
          '/investor',
          '/underwriter',
          '/supplier',
          '/documents',
          '/receipts',
          '/verify-identity',
        ],
      },
    ],
    sitemap: 'https://home.vartola.net/sitemap.xml',
  };
}
