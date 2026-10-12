import assert from 'node:assert/strict';
import test, { after, before } from 'node:test';
import { createTestDatabase, type TestDatabase } from '../../test-utils/integration-db';
import { createCompanyWithUsers } from '../../test-utils/factories';

// Money operations must be replay-safe: the same idempotency key must move value only once.

let db: TestDatabase;
let ledger: typeof import('@/lib/simulation/ledger');
let people: Awaited<ReturnType<typeof createCompanyWithUsers>>;

before(async () => {
  db = await createTestDatabase();
  ledger = await import('@/lib/simulation/ledger');
  people = await createCompanyWithUsers(db.prisma);
});

after(async () => {
  if (db) {
    await db.prisma.$disconnect();
    db.cleanup();
  }
});

const walletOf = (ownerType: string, ownerId: string) =>
  db.prisma.simWallet.findUniqueOrThrow({ where: { ownerType_ownerId: { ownerType, ownerId } } });

test('creditWallet credits once for a repeated key', async () => {
  const key = `credit-${people.investor.id}`;
  const input = { ownerType: 'INVESTOR', ownerId: people.investor.id, amount: 1_000, type: 'TEST', idempotencyKey: key, actorId: 'test', description: 'top-up' };

  await ledger.creditWallet(input);
  await ledger.creditWallet(input);

  assert.equal((await walletOf('INVESTOR', people.investor.id)).available, 1_000);
  assert.equal(await db.prisma.simLedgerEntry.count({ where: { idempotencyKey: key } }), 1);
});

test('debitWallet debits once for a repeated key and refuses to overdraw', async () => {
  const key = `debit-${people.investor.id}`;
  await ledger.debitWallet('INVESTOR', people.investor.id, 400, key, 'payment');
  await ledger.debitWallet('INVESTOR', people.investor.id, 400, key, 'payment');

  assert.equal((await walletOf('INVESTOR', people.investor.id)).available, 600);
  await assert.rejects(() => ledger.debitWallet('INVESTOR', people.investor.id, 10_000, `overdraw-${people.investor.id}`, 'too much'), /Insufficient/);
});

test('payInvestor pays once for a repeated key', async () => {
  const key = `dist-${people.investor.id}`;
  await ledger.payInvestor(people.investor.id, 300, 200, key);
  await ledger.payInvestor(people.investor.id, 300, 200, key);

  assert.equal((await walletOf('INVESTOR', people.investor.id)).available, 1_100);
  assert.equal(await db.prisma.simLedgerEntry.count({ where: { idempotencyKey: key } }), 1);
});

test('reserve then deploy moves value once each', async () => {
  const reserveKey = `reserve-${people.investor.id}`;
  await ledger.moveAvailableToReserved(people.investor.id, 200, reserveKey, 'test');
  await ledger.moveAvailableToReserved(people.investor.id, 200, reserveKey, 'test');
  let wallet = await walletOf('INVESTOR', people.investor.id);
  assert.equal(wallet.reserved, 200);
  assert.equal(wallet.available, 900);

  const deployKey = `deploy-${people.investor.id}`;
  await ledger.moveReservedToDeployed(people.investor.id, 200, deployKey);
  await ledger.moveReservedToDeployed(people.investor.id, 200, deployKey);
  wallet = await walletOf('INVESTOR', people.investor.id);
  assert.equal(wallet.reserved, 0);
  assert.equal(wallet.deployed, 200);
});
