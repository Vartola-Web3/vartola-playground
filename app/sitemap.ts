import type { MetadataRoute } from 'next';

const BASE = 'https://home.vartola.net';

export default function sitemap(): MetadataRoute.Sitemap {
  const routes: [string, number][] = [
    ['', 1],
    ['/how-it-works', 0.9],
    ['/marketplace', 0.9],
    ['/sandbox', 0.9],
    ['/proof', 0.8],
    ['/technical', 0.8],
    ['/whitepaper', 0.7],
    ['/pitch', 0.7],
    ['/about', 0.6],
    ['/docs', 0.6],
    ['/legal', 0.5],
    ['/contact', 0.5],
  ];

  return routes.map(([path, priority]) => ({
    url: `${BASE}${path}`,
    lastModified: new Date(),
    changeFrequency: path === '' ? 'weekly' : 'monthly',
    priority,
  }));
}
