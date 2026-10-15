import assert from 'node:assert/strict';
import test from 'node:test';
import { circleConfigured, circleEnvironment, getCircleBalances } from './circle';

function withEnv(vars: Record<string, string | undefined>, run: () => void) {
  const previous: Record<string, string | undefined> = {};
  for (const [key, value] of Object.entries(vars)) {
    previous[key] = process.env[key];
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
  try {
    run();
  } finally {
    for (const [key, value] of Object.entries(previous)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
}

test('sandbox is the default environment and unconfigured without a key', () => {
  withEnv({ CIRCLE_ENVIRONMENT: undefined, CIRCLE_API_KEY: undefined, CIRCLE_PROD_API_KEY: undefined }, () => {
    assert.equal(circleEnvironment(), 'sandbox');
    assert.equal(circleConfigured(), false);
  });
});

test('a sandbox key configures the client and production needs an explicit flag', () => {
  withEnv({ CIRCLE_ENVIRONMENT: undefined, CIRCLE_API_KEY: 'sandbox-key', CIRCLE_PROD_API_KEY: undefined }, () => {
    assert.equal(circleEnvironment(), 'sandbox');
    assert.equal(circleConfigured(), true);
  });
  withEnv({ CIRCLE_ENVIRONMENT: 'production', CIRCLE_API_KEY: 'sandbox-key', CIRCLE_PROD_API_KEY: undefined }, () => {
    assert.equal(circleEnvironment(), 'production');
    assert.equal(circleConfigured(), false);
  });
});

test('balances throw a safe error when unconfigured', async () => {
  await withEnv({ CIRCLE_API_KEY: undefined, CIRCLE_PROD_API_KEY: undefined }, async () => {
    await assert.rejects(() => getCircleBalances(), /not configured/);
  });
});

test('balances parse the business-account payload and never leak the key', async () => {
  const realFetch = globalThis.fetch;
  const seen: { url: string; auth: string | null }[] = [];
  globalThis.fetch = (async (url: unknown, init?: { headers?: Record<string, string> }) => {
    seen.push({ url: String(url), auth: init?.headers?.Authorization || null });
    return { ok: true, json: async () => ({ data: { available: [{ currency: 'USD', amount: '12.50' }], unsettled: [] } }) };
  }) as typeof fetch;
  try {
    await withEnv({ CIRCLE_ENVIRONMENT: undefined, CIRCLE_API_KEY: 'sandbox-key' }, async () => {
      const balances = await getCircleBalances();
      assert.deepEqual(balances, [{ currency: 'USD', available: '12.50' }]);
      assert.equal(seen.length, 1);
      assert.match(seen[0].url, /^https:\/\/api-sandbox\.circle\.com\/v1\/businessAccount\/balances$/);
      assert.notEqual(seen[0].auth, null);
    });
  } finally {
    globalThis.fetch = realFetch;
  }
});

test('a non-OK response becomes a status-only error', async () => {
  const realFetch = globalThis.fetch;
  globalThis.fetch = (async () => ({ ok: false, status: 401, json: async () => ({ secret: 'must-not-leak' }) })) as unknown as Response;
  try {
    await withEnv({ CIRCLE_API_KEY: 'sandbox-key' }, async () => {
      await assert.rejects(() => getCircleBalances(), /HTTP 401/);
    });
  } finally {
    globalThis.fetch = realFetch;
  }
});
