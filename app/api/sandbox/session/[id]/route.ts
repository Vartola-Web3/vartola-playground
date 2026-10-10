import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { deleteSession, getSession, resetSession, saveState, setScenario } from '@/lib/sandbox/store';
import { applyAction, nextActions, type SandboxAction } from '@/lib/sandbox/engine';
import { rateLimit } from '@/lib/security/rate-limit';
import { SANDBOX_COOKIE, SANDBOX_SCENARIOS } from '@/lib/sandbox/constants';

export const dynamic = 'force-dynamic';

async function ownsSession(id: string) {
  const store = await cookies();
  return store.get(SANDBOX_COOKIE)?.value === id;
}

export async function GET(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!(await ownsSession(id))) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const session = await getSession(id);
  if (!session) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ state: session.state, actions: nextActions(session.state) });
}

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!(await ownsSession(id))) return NextResponse.json({ error: 'Not found' }, { status: 404 });

  try {
    rateLimit(request, 'sandbox-action', 60);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 429 });
  }

  const body = (await request.json().catch(() => ({}))) as { action?: SandboxAction; reset?: boolean; scenario?: string };

  if (body.reset) {
    const state = await resetSession(id);
    if (!state) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ state, actions: nextActions(state) });
  }

  if (body.scenario) {
    const scenarioKey = SANDBOX_SCENARIOS.includes(body.scenario) ? body.scenario : 'normal';
    const state = await setScenario(id, scenarioKey);
    if (!state) return NextResponse.json({ error: 'Not found' }, { status: 404 });
    return NextResponse.json({ state, actions: nextActions(state) });
  }

  if (!body.action) return NextResponse.json({ error: 'Missing action' }, { status: 400 });

  const session = await getSession(id);
  if (!session) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  try {
    const state = applyAction(session.state, body.action);
    await saveState(id, state, session.step + 1);
    return NextResponse.json({ state, actions: nextActions(state) });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 422 });
  }
}

export async function DELETE(_request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!(await ownsSession(id))) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  await deleteSession(id);
  return NextResponse.json({ deleted: true });
}
