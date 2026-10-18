import assert from 'node:assert/strict';
import test, { after, before } from 'node:test';
import { createTestDatabase, type TestDatabase } from '../../test-utils/integration-db';
import { createCompanyWithUsers } from '../../test-utils/factories';

let db: TestDatabase;
let access: typeof import('@/lib/compliance/access');
let people: Awaited<ReturnType<typeof createCompanyWithUsers>>;

before(async () => {
  db = await createTestDatabase();
  access = await import('@/lib/compliance/access');
  people = await createCompanyWithUsers(db.prisma);
});

after(async () => {
  if (db) {
    await db.prisma.$disconnect();
    db.cleanup();
  }
});

async function withMode<T>(mode: string, run: () => Promise<T>): Promise<T> {
  const previous = process.env.APP_MODE;
  process.env.APP_MODE = mode;
  try {
    return await run();
  } finally {
    if (previous === undefined) delete process.env.APP_MODE;
    else process.env.APP_MODE = previous;
  }
}

test('subjectForUser uses the company for an SME and the user otherwise', () => {
  assert.deepEqual(access.subjectForUser({ id: 'u1', role: 'INVESTOR' }), { subjectType: 'INDIVIDUAL', subjectId: 'u1' });
  assert.deepEqual(access.subjectForUser({ id: 'u2', role: 'SME', companyId: 'c1' }), { subjectType: 'COMPANY', subjectId: 'c1' });
  assert.deepEqual(access.subjectForUser({ id: 'u3', role: 'SME' }), { subjectType: 'INDIVIDUAL', subjectId: 'u3' });
});

test('demo mode does not require verification', async () => {
  await withMode('DEMO', async () => {
    await assert.doesNotReject(access.assertVerifiedInAlpha({ subjectType: 'INDIVIDUAL', subjectId: people.investor.id }));
  });
});

test('alpha mode blocks an unverified investor and allows a verified one', async () => {
  const subject = { subjectType: 'INDIVIDUAL' as const, subjectId: people.investor.id };

  await withMode('ALPHA', async () => {
    assert.equal(await access.complianceStatus(subject), 'NOT_STARTED');
    await assert.rejects(access.assertVerifiedInAlpha(subject), /Identity verification is required/);
  });

  await db.prisma.complianceCase.create({
    data: { subjectType: 'INDIVIDUAL', subjectId: people.investor.id, status: 'VERIFIED', provider: 'SUMSUB' },
  });

  await withMode('ALPHA', async () => {
    assert.equal(await access.complianceStatus(subject), 'VERIFIED');
    await assert.doesNotReject(access.assertVerifiedInAlpha(subject));
  });
});
