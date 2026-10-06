import assert from 'node:assert/strict';
import test from 'node:test';
import { storeDocument } from './document-provider';

test('only PDF, JPG and PNG are accepted and size is limited', async () => {
  await assert.rejects(() => storeDocument(Buffer.from('x'), 'a.exe', 'application/x-msdownload'), /PDF, JPG, and PNG/);
  await assert.rejects(() => storeDocument(Buffer.from('x'), 'a.pdf', 'image/png'), /PDF, JPG, and PNG/);
  await assert.rejects(() => storeDocument(Buffer.alloc(9 * 1024 * 1024), 'a.pdf', 'application/pdf'), /8MB/);
});

test('Alpha mode refuses to fall back to local disk', async () => {
  const before = { mode: process.env.APP_MODE, bucket: process.env.S3_BUCKET, allow: process.env.ALPHA_ALLOW_LOCAL_STORAGE };
  process.env.APP_MODE = 'ALPHA';
  delete process.env.S3_BUCKET;
  delete process.env.ALPHA_ALLOW_LOCAL_STORAGE;
  try {
    await assert.rejects(() => storeDocument(Buffer.from('%PDF-1.4'), 'a.pdf', 'application/pdf'), /Alpha document storage requires/);
  } finally {
    if (before.mode === undefined) delete process.env.APP_MODE; else process.env.APP_MODE = before.mode;
    if (before.bucket) process.env.S3_BUCKET = before.bucket;
    if (before.allow) process.env.ALPHA_ALLOW_LOCAL_STORAGE = before.allow;
  }
});
