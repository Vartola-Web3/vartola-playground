import assert from 'node:assert/strict';
import test, { after, before } from 'node:test';
import { createTestDatabase, type TestDatabase } from '../../test-utils/integration-db';

let db: TestDatabase;
let health: typeof import('@/lib/ops/health');

before(async () => {
  db = await createTestDatabase();
  health = await import('@/lib/ops/health');
});

after(async () => {
  if (db) {
    await db.prisma.$disconnect();
    db.cleanup();
  }
});

test('health reports ok when the database answers', async () => {
  const report = await health.healthReport();
  assert.equal(report.status, 'ok');
  assert.equal(report.checks.database, 'ok');
  assert.ok(report.time);
});

test('the request id is non-empty and unique', async () => {
  const { newRequestId } = await import('@/lib/ops/logger');
  const a = newRequestId();
  const b = newRequestId();
  assert.ok(a.length > 0);
  assert.notEqual(a, b);
});
