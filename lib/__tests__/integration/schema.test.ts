import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import test, { after, before } from 'node:test';
import { createTestDatabase, type TestDatabase } from '../../test-utils/integration-db';

let db: TestDatabase;

before(async () => {
  db = await createTestDatabase();
});

after(async () => {
  if (db) {
    await db.prisma.$disconnect();
    db.cleanup();
  }
});

// Schema parity: every Prisma model must be backed by a table in the database, using its @@map name when
// present. This catches drift between the schema and the shipped database before it reaches production.
test('every Prisma model has a backing table', async () => {
  const schema = readFileSync(path.join(process.cwd(), 'prisma', 'schema.prisma'), 'utf8');
  const models = [...schema.matchAll(/^model\s+(\w+)\s*\{([\s\S]*?)^\}/gm)].map(([, name, body]) => {
    const map = body.match(/@@map\("([^"]+)"\)/);
    return { name, table: map ? map[1] : name };
  });
  assert.ok(models.length > 20, 'expected a meaningful number of models in the schema');

  const rows = await db.prisma.$queryRaw<{ name: string }[]>`SELECT name FROM sqlite_master WHERE type = 'table'`;
  const tables = new Set(rows.map((row) => row.name));

  const missing = models.filter((model) => !tables.has(model.table)).map((model) => `${model.name} -> ${model.table}`);
  assert.deepEqual(missing, [], `models without a backing table: ${missing.join(', ')}`);
});
