import assert from 'node:assert/strict';
import test from 'node:test';
import { allowedType, inspectUpload, matchesDeclaredType, newObjectKey } from './signed-upload';

test('object keys are random and reveal nothing', () => {
  const a = newObjectKey('application/pdf');
  const b = newObjectKey('application/pdf');
  assert.notEqual(a, b);
  assert.match(a, /^documents\/[a-f0-9]{48}\.pdf$/);
  assert.throws(() => newObjectKey('application/x-msdownload'));
});

test('only PDF, JPEG and PNG are allowed', () => {
  assert.ok(allowedType('application/pdf') && allowedType('image/png') && allowedType('image/jpeg'));
  assert.equal(allowedType('text/html'), false);
});

test('file content must match the declared type', () => {
  const pdf = Buffer.from('%PDF-1.7 content');
  const png = Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a]);
  assert.equal(matchesDeclaredType(pdf, 'application/pdf'), true);
  assert.equal(matchesDeclaredType(png, 'image/png'), true);
  assert.equal(matchesDeclaredType(pdf, 'image/png'), false);
  assert.equal(matchesDeclaredType(Buffer.from('MZ executable'), 'application/pdf'), false);
});

test('inspection returns the SHA-256 and rejects empty or oversized files', () => {
  const checked = inspectUpload(Buffer.from('%PDF-1.4 x'), 'application/pdf');
  assert.match(checked.hash, /^[a-f0-9]{64}$/);
  assert.throws(() => inspectUpload(Buffer.alloc(0), 'application/pdf'), /8MB/);
  assert.throws(() => inspectUpload(Buffer.concat([Buffer.from('%PDF'), Buffer.alloc(9 * 1024 * 1024)]), 'application/pdf'), /8MB/);
  assert.throws(() => inspectUpload(Buffer.from('not a pdf'), 'application/pdf'), /does not match/);
});
