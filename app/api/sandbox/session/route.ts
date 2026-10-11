import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { createSession, getSession } from '@/lib/sandbox/store';
import { nextActions } from '@/lib/sandbox/engine';
import { rateLimit } from '@/lib/security/rate-limit';
import { SANDBOX_COOKIE, SANDBOX_SCENARIOS } from '@/lib/sandbox/constants';

export const dynamic = 'force-dynamic';

async function startSession(scenarioKey: string) {
  const { id, state } = await createSession(scenarioKey);
  const store = await cookies();
  store.set(SANDBOX_COOKIE, id, { httpOnly: true, sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 });
  return NextResponse.json({ id, state, actions: nextActions(state) });
}

// Returns the visitor's current session, creating one on first visit so the sandbox works without a click.
export async function GET(request: NextRequest) {
  try {
    rateLimit(request, 'sandbox-get', 60);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 429 });
  }

  const store = await cookies();
  const existing = store.get(SANDBOX_COOKIE)?.value;
  if (existing) {
    const session = await getSession(existing);
    if (session) {
      return NextResponse.json({ id: session.id, state: session.state, actions: nextActions(session.state) });
    }
  }
  return startSession('normal');
}

// Starts a session for a chosen scenario. Rate limited because it writes a new row.
export async function POST(request: NextRequest) {
  try {
    rateLimit(request, 'sandbox-create', 30);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 429 });
  }

  const body = (await request.json().catch(() => ({}))) as { scenarioKey?: string };
  const scenarioKey = body.scenarioKey && SANDBOX_SCENARIOS.includes(body.scenarioKey) ? body.scenarioKey : 'normal';

  return startSession(scenarioKey);
}
