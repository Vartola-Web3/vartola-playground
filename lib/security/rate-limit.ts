import { NextRequest } from 'next/server';

const hits = new Map<string, number[]>();

export function rateLimit(request: NextRequest, bucket: string, limit: number, windowMs = 60_000) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
  const key = `${bucket}:${ip}`;
  const now = Date.now();
  const recent = (hits.get(key) || []).filter((time) => now - time < windowMs);
  if (recent.length >= limit) throw new Error('Too many requests. Wait a minute and try again.');
  recent.push(now);
  hits.set(key, recent);
}
