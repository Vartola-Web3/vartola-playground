import { NextRequest } from 'next/server';

export function assertSameOrigin(request: NextRequest) {
  const origin = request.headers.get('origin');
  if (!origin) return;
  const host = request.headers.get('host');
  let originHost = '';
  try {
    originHost = new URL(origin).host;
  } catch {
    throw new Error('Cross-site request blocked');
  }
  if (!host || originHost !== host) throw new Error('Cross-site request blocked');
}
