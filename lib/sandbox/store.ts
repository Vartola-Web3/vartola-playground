import { prisma } from '@/lib/db';
import { initialState, type SandboxState } from './state';

// Sandbox session store. The whole simulated world lives in one JSON column, so a session is isolated by
// construction and a reset is just replacing that column. No other table is read or written.

export const SESSION_TTL_MS = 24 * 60 * 60 * 1000;
const MAX_STATE_BYTES = 1_000_000;

export type SessionView = { id: string; scenarioKey: string; state: SandboxState; step: number };

export async function createSession(scenarioKey = 'normal'): Promise<{ id: string; state: SandboxState }> {
  const state = initialState(scenarioKey);
  const row = await prisma.sandboxSession.create({
    data: {
      scenarioKey,
      state: JSON.stringify(state),
      version: state.version,
      expiresAt: new Date(Date.now() + SESSION_TTL_MS),
    },
  });
  return { id: row.id, state };
}

export async function getSession(id: string): Promise<SessionView | null> {
  const row = await prisma.sandboxSession.findUnique({ where: { id } });
  if (!row) return null;
  if (row.expiresAt.getTime() < Date.now()) {
    await deleteSession(id);
    return null;
  }
  return { id: row.id, scenarioKey: row.scenarioKey, state: JSON.parse(row.state) as SandboxState, step: row.step };
}

export async function saveState(id: string, state: SandboxState, step: number): Promise<void> {
  const serialized = JSON.stringify(state);
  if (serialized.length > MAX_STATE_BYTES) throw new Error('Sandbox state is too large');
  await prisma.sandboxSession.update({
    where: { id },
    data: { state: serialized, step, scenarioKey: state.scenarioKey },
  });
}

export async function resetSession(id: string): Promise<SandboxState | null> {
  const row = await prisma.sandboxSession.findUnique({ where: { id } });
  if (!row) return null;
  const state = initialState(row.scenarioKey);
  await saveState(id, state, 0);
  return state;
}

export async function setScenario(id: string, scenarioKey: string): Promise<SandboxState | null> {
  const row = await prisma.sandboxSession.findUnique({ where: { id } });
  if (!row) return null;
  const state = initialState(scenarioKey);
  await prisma.sandboxSession.update({ where: { id }, data: { scenarioKey, state: JSON.stringify(state), step: 0 } });
  return state;
}

export async function deleteSession(id: string): Promise<void> {
  await prisma.sandboxSession.deleteMany({ where: { id } });
}

export async function purgeExpired(now = new Date()): Promise<number> {
  const result = await prisma.sandboxSession.deleteMany({ where: { expiresAt: { lt: now } } });
  return result.count;
}
