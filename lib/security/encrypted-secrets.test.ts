import assert from 'node:assert/strict';
import test from 'node:test';
import { encryptedSecretProvider, maskSecret } from './encrypted-secrets';

process.env.SERVER_MASTER_KEY = 'test-master-key-for-unit-tests-only';

test('a sealed secret is not readable and opens back to the original', () => {
  const sealed = encryptedSecretProvider.seal('alchemy-api-key-123456');
  assert.ok(encryptedSecretProvider.isSealed(sealed));
  assert.equal(sealed.includes('alchemy'), false);
  assert.equal(encryptedSecretProvider.open(sealed), 'alchemy-api-key-123456');
});

test('sealing twice gives different ciphertext and a tampered value fails to open', () => {
  const a = encryptedSecretProvider.seal('same');
  const b = encryptedSecretProvider.seal('same');
  assert.notEqual(a, b);
  const parts = a.split(':');
  parts[parts.length - 1] = Buffer.from('tampered').toString('base64');
  assert.throws(() => encryptedSecretProvider.open(parts.join(':')));
});

test('a legacy plaintext value still opens until it is migrated', () => {
  assert.equal(encryptedSecretProvider.open('plain-legacy-key'), 'plain-legacy-key');
});

test('the master key is required', () => {
  const saved = process.env.SERVER_MASTER_KEY;
  delete process.env.SERVER_MASTER_KEY;
  try {
    assert.throws(() => encryptedSecretProvider.seal('x'), /SERVER_MASTER_KEY/);
  } finally {
    process.env.SERVER_MASTER_KEY = saved;
  }
});

test('masking never reveals the whole secret', () => {
  assert.equal(maskSecret('abcdefghijkl'), '••••ijkl');
  assert.equal(maskSecret('short'), '••••');
  assert.equal(maskSecret(''), '');
});
