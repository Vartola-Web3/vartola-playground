import { createHmac, timingSafeEqual } from 'crypto';

const baseUrl = 'https://api.sumsub.com';

function credentials() {
  return {
    token: process.env.SUMSUB_APP_TOKEN || '',
    secret: process.env.SUMSUB_SECRET_KEY || '',
    level: process.env.SUMSUB_LEVEL_NAME || 'vartola-demo',
  };
}

export function sumsubConfigured() {
  const { token, secret } = credentials();
  return Boolean(token && secret);
}

export async function createSumsubSdkToken(userId: string, email?: string | null) {
  const { token, secret, level } = credentials();
  if (!token || !secret) throw new Error('Sumsub Sandbox credentials are not configured');
  const path = '/resources/accessTokens/sdk';
  const body = JSON.stringify({
    userId,
    levelName: level,
    ttlInSecs: 600,
    applicantIdentifiers: email ? { email } : undefined,
  });
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const signature = createHmac('sha256', secret).update(`${timestamp}POST${path}${body}`).digest('hex');
  const response = await fetch(`${baseUrl}${path}`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-App-Token': token,
      'X-App-Access-Ts': timestamp,
      'X-App-Access-Sig': signature,
    },
    body,
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.description || 'Sumsub did not create a verification session');
  return data as { token: string; userId: string };
}

export function verifySumsubWebhook(rawBody: string, digest?: string | null) {
  const secret = process.env.SUMSUB_WEBHOOK_SECRET || '';
  if (!secret || !digest) return false;
  const expected = createHmac('sha256', secret).update(rawBody).digest('hex');
  const supplied = digest.toLowerCase();
  return expected.length === supplied.length && timingSafeEqual(Buffer.from(expected), Buffer.from(supplied));
}
