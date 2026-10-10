import assert from 'node:assert/strict';
import test, { after, before } from 'node:test';
import { createTestDatabase, type TestDatabase } from '../../test-utils/integration-db';

let db: TestDatabase;
let store: typeof import('@/lib/sandbox/store');
let engine: typeof import('@/lib/sandbox/engine');

before(async () => {
  db = await createTestDatabase();
  store = await import('@/lib/sandbox/store');
  engine = await import('@/lib/sandbox/engine');
});

after(async () => {
  if (db) {
    await db.prisma.$disconnect();
    db.cleanup();
  }
});

test('a session is created, advanced and read back', async () => {
  const { id, state } = await store.createSession('normal');
  assert.equal(state.phase, 'APPLICATION');

  const advanced = engine.applyAction(state, { type: 'SUBMIT_APPLICATION' });
  await store.saveState(id, advanced, 1);

  const session = await store.getSession(id);
  assert.ok(session);
  assert.equal(session!.state.phase, 'UNDER_REVIEW');
  assert.equal(session!.step, 1);
});

test('two sessions are isolated from each other', async () => {
  const a = await store.createSession('normal');
  const b = await store.createSession('normal');
  assert.notEqual(a.id, b.id);

  await store.saveState(a.id, engine.applyAction(a.state, { type: 'SUBMIT_APPLICATION' }), 1);

  const untouched = await store.getSession(b.id);
  assert.equal(untouched!.state.phase, 'APPLICATION');
});

test('reset returns the scenario to its initial state', async () => {
  const { id, state } = await store.createSession('normal');
  await store.saveState(id, engine.applyAction(state, { type: 'SUBMIT_APPLICATION' }), 1);

  const reset = await store.resetSession(id);
  assert.equal(reset!.phase, 'APPLICATION');
  assert.equal((await store.getSession(id))!.step, 0);
});

test('changing the scenario re-initialises the session', async () => {
  const { id } = await store.createSession('normal');
  const state = await store.setScenario(id, 'default');
  assert.equal(state!.scenarioKey, 'default');
  assert.equal(state!.phase, 'APPLICATION');
});

test('delete removes the session', async () => {
  const { id } = await store.createSession('normal');
  await store.deleteSession(id);
  assert.equal(await store.getSession(id), null);
});

test('purgeExpired removes expired sessions only', async () => {
  const expired = await store.createSession('normal');
  const live = await store.createSession('normal');
  await db.prisma.sandboxSession.update({ where: { id: expired.id }, data: { expiresAt: new Date(Date.now() - 1_000) } });

  const removed = await store.purgeExpired();
  assert.ok(removed >= 1);
  assert.equal(await store.getSession(expired.id), null);
  assert.ok(await store.getSession(live.id), 'a live session survives the purge');
});
