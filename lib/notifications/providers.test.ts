import assert from 'node:assert/strict';
import test from 'node:test';
import { LegalApprovalRequired, TEMPLATES, emailProvider, sendNotification, smsProvider } from './providers';

async function withEnv<T>(values: Record<string, string | undefined>, run: () => Promise<T> | T) {
  const saved: Record<string, string | undefined> = {};
  for (const key of Object.keys(values)) saved[key] = process.env[key];
  for (const [key, value] of Object.entries(values)) {
    if (value === undefined) delete process.env[key];
    else process.env[key] = value;
  }
  try {
    return await run();
  } finally {
    for (const [key, value] of Object.entries(saved)) {
      if (value === undefined) delete process.env[key];
      else process.env[key] = value;
    }
  }
}

test('demo mode uses a console provider that says it did not deliver', async () => {
  await withEnv({ APP_MODE: 'DEMO', EMAIL_PROVIDER_URL: undefined }, async () => {
    const result = await sendNotification('email', 'a@b.test', 'PAYMENT_DUE', 'FAC-1');
    assert.equal(result.delivered, false);
    assert.equal(emailProvider().kind, 'CONSOLE');
  });
});

test('Alpha mode refuses to fall back to a console provider', async () => {
  await withEnv({ APP_MODE: 'ALPHA', EMAIL_PROVIDER_URL: undefined, SMS_PROVIDER_URL: undefined }, () => {
    assert.throws(() => emailProvider(), /EMAIL_PROVIDER_URL/);
    assert.throws(() => smsProvider(), /SMS_PROVIDER_URL/);
  });
});

test('a default notice never sends without explicit counsel approval', async () => {
  await withEnv({ APP_MODE: 'DEMO', DEFAULT_NOTICES_APPROVED_BY_COUNSEL: undefined }, async () => {
    await assert.rejects(() => sendNotification('email', 'a@b.test', 'DEFAULT_NOTICE', 'FAC-1'), LegalApprovalRequired);
    await assert.rejects(() => sendNotification('email', 'a@b.test', 'DEFAULT_NOTICE', 'FAC-1', { legalApproved: true }), LegalApprovalRequired);
  });
  await withEnv({ APP_MODE: 'DEMO', DEFAULT_NOTICES_APPROVED_BY_COUNSEL: 'true' }, async () => {
    const result = await sendNotification('email', 'a@b.test', 'DEFAULT_NOTICE', 'FAC-1', { legalApproved: true });
    assert.equal(result.delivered, false);
  });
});

test('every template names the facility or detail it is about', () => {
  assert.match(TEMPLATES.FACILITY_FUNDED.body('FAC-9'), /FAC-9/);
  assert.match(TEMPLATES.OPERATIONS_ALERT.body('RECONCILIATION_FAILED'), /RECONCILIATION_FAILED/);
});
