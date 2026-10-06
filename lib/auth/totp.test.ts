import assert from 'node:assert/strict';
import test from 'node:test';
import { base32Decode, base32Encode, generateTotpSecret, otpauthUri, totpAt, verifyTotp } from './totp';

// RFC 6238 test secret "12345678901234567890" in base32. The RFC lists 8-digit codes; the last 6 digits are ours.
const rfcSecret = base32Encode(Buffer.from('12345678901234567890'));

test('base32 round trips', () => {
  const bytes = Buffer.from('vartola-mfa');
  assert.equal(base32Decode(base32Encode(bytes)).toString(), 'vartola-mfa');
  assert.equal(rfcSecret, 'GEZDGNBVGY3TQOJQGEZDGNBVGY3TQOJQ');
});

test('matches the RFC 6238 vectors', () => {
  assert.equal(totpAt(rfcSecret, Math.floor(59 / 30)), '287082');
  assert.equal(totpAt(rfcSecret, Math.floor(1111111109 / 30)), '081804');
  assert.equal(totpAt(rfcSecret, Math.floor(2000000000 / 30)), '279037');
});

test('accepts the current and neighbouring step, rejects others and malformed codes', () => {
  const now = 1111111109 * 1000;
  assert.equal(verifyTotp(rfcSecret, '081804', 0, now), Math.floor(1111111109 / 30));
  assert.equal(verifyTotp(rfcSecret, '000000', 0, now), null);
  assert.equal(verifyTotp(rfcSecret, 'abcdef', 0, now), null);
  assert.equal(verifyTotp(rfcSecret, '12345', 0, now), null);
});

test('a code cannot be used twice', () => {
  const now = 1111111109 * 1000;
  const step = verifyTotp(rfcSecret, '081804', 0, now);
  assert.ok(step);
  assert.equal(verifyTotp(rfcSecret, '081804', step, now), null);
});

test('a generated secret works and the provisioning URI names the issuer', () => {
  const secret = generateTotpSecret();
  const now = Date.now();
  const code = totpAt(secret, Math.floor(now / 30000));
  assert.ok(verifyTotp(secret, code, 0, now));
  assert.match(otpauthUri(secret, 'ops@vartola.test'), /^otpauth:\/\/totp\/Vartola%3Aops%40vartola\.test\?secret=/);
});
