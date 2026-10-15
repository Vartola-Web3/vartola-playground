// Minimal Circle settlement-provider client (sandbox first).
//
// Reads the Circle sandbox API key from the server environment only. The key is never returned to the
// browser and never written to the database. Production credentials live in separate variables and are only
// used when CIRCLE_ENVIRONMENT=production is set explicitly after a provider agreement exists.

export type CircleEnvironment = 'sandbox' | 'production';

export function circleEnvironment(): CircleEnvironment {
  return process.env.CIRCLE_ENVIRONMENT === 'production' ? 'production' : 'sandbox';
}

function baseUrl() {
  return circleEnvironment() === 'production' ? 'https://api.circle.com' : 'https://api-sandbox.circle.com';
}

function apiKey() {
  const production = circleEnvironment() === 'production';
  return (production ? process.env.CIRCLE_PROD_API_KEY : process.env.CIRCLE_API_KEY) || '';
}

export function circleConfigured() {
  return Boolean(apiKey());
}

export type CircleBalance = { currency: string; available: string };

function asBalances(data: unknown): CircleBalance[] {
  if (!data || typeof data !== 'object') return [];
  // Live shape: { data: { available: [{ amount, currency }], unsettled: [...] } }.
  const root = (data as { data?: unknown }).data;
  if (!root || typeof root !== 'object') return [];
  const available = (root as { available?: unknown; balances?: unknown }).available
    ?? (root as { balances?: unknown }).balances;
  if (!Array.isArray(available)) return [];
  return available
    .filter((row): row is Record<string, unknown> => Boolean(row && typeof row === 'object'))
    .map((row) => ({ currency: String(row.currency || ''), available: String(row.amount ?? row.available ?? '0') }))
    .filter((row) => row.currency.length > 0);
}

// Read-only treasury check: business-account balances. Used by the admin treasury page to prove the
// sandbox credential works. Throws a safe message (no key material, no raw body) on any failure.
export async function getCircleBalances(): Promise<CircleBalance[]> {
  const key = apiKey();
  if (!key) throw new Error('Circle sandbox credentials are not configured');
  const response = await fetch(`${baseUrl()}/v1/businessAccount/balances`, {
    headers: { Authorization: `Bearer ${key}`, Accept: 'application/json' },
  });
  if (!response.ok) throw new Error(`Circle did not return balances (HTTP ${response.status})`);
  return asBalances(await response.json().catch(() => ({})));
}
