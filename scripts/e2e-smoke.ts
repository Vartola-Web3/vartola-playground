// End-to-end smoke test. It starts the built Next.js server and checks that the key public routes respond and
// that the API layer (health and the sandbox session) works against a real database. It uses no browser, so it
// runs anywhere the build runs. Set E2E_PORT to change the port.
import { spawn } from 'node:child_process';

const PORT = Number(process.env.E2E_PORT || 4300);
const BASE = `http://127.0.0.1:${PORT}`;

const ROUTES: [string, number][] = [
  ['/', 200],
  ['/sandbox', 200],
  ['/proof', 200],
  ['/marketplace', 200],
  ['/technical', 200],
  ['/login', 200],
];

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function waitForReady(deadline: number): Promise<boolean> {
  while (Date.now() < deadline) {
    try {
      const response = await fetch(`${BASE}/api/health`);
      if (response.ok) return true;
    } catch {
      // not up yet
    }
    await sleep(1_000);
  }
  return false;
}

async function main() {
  const server = spawn('npx', ['next', 'start', '-p', String(PORT)], {
    cwd: process.cwd(),
    stdio: ['ignore', 'inherit', 'inherit'],
    shell: true,
  });

  let failures = 0;
  try {
    if (!(await waitForReady(Date.now() + 90_000))) {
      throw new Error('The server did not become ready within 90 seconds');
    }

    for (const [route, expected] of ROUTES) {
      const response = await fetch(`${BASE}${route}`);
      const ok = response.status === expected;
      console.log(`${ok ? 'ok  ' : 'FAIL'} ${route} -> ${response.status}`);
      if (!ok) failures += 1;
    }

    const health = await fetch(`${BASE}/api/health`).then((response) => response.json());
    const healthOk = health?.status === 'ok' && health?.checks?.database === 'ok';
    console.log(`${healthOk ? 'ok  ' : 'FAIL'} /api/health body -> ${JSON.stringify(health)}`);
    if (!healthOk) failures += 1;

    const sessionResponse = await fetch(`${BASE}/api/sandbox/session`);
    const session = await sessionResponse.json();
    const sessionOk = sessionResponse.status === 200 && typeof session?.state?.phase === 'string' && Array.isArray(session?.actions);
    console.log(`${sessionOk ? 'ok  ' : 'FAIL'} /api/sandbox/session -> ${sessionResponse.status} ${session?.state?.phase ?? ''}`);
    if (!sessionOk) failures += 1;
  } finally {
    if (process.platform === 'win32') {
      spawn('taskkill', ['/pid', String(server.pid), '/T', '/F'], { stdio: 'ignore' });
    } else {
      server.kill('SIGTERM');
    }
  }

  if (failures > 0) {
    console.error(`${failures} end-to-end smoke check(s) failed`);
    process.exit(1);
  }
  console.log('All end-to-end smoke checks passed.');
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
