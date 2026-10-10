import { copyFileSync, existsSync, rmSync } from 'node:fs';
import path from 'node:path';
import type { PrismaClient } from '@prisma/client';

// Integration-test harness.
//
// Each test process gets its own throwaway SQLite database, copied from the committed demo database
// (which already carries the full schema), so tests never touch real data and run in parallel.
// The database URL is set BEFORE `@/lib/db` is imported, because the Prisma client reads it at construction.

export type TestDatabase = {
  prisma: PrismaClient;
  url: string;
  cleanup: () => void;
};

export async function createTestDatabase(): Promise<TestDatabase> {
  const prismaDir = path.join(process.cwd(), 'prisma');
  const source = path.join(prismaDir, 'prisma', 'dev.db');
  if (!existsSync(source)) {
    throw new Error(`Demo database not found at ${source}. Run "npm run db:seed:demo" first.`);
  }

  const name = `test-${process.pid}-${Date.now()}.db`;
  const target = path.join(prismaDir, name);
  copyFileSync(source, target);

  // Relative SQLite URLs resolve from the schema directory (prisma/), so this points at prisma/<name>.db.
  process.env.DATABASE_URL = `file:./${name}`;
  process.env.APP_MODE = 'DEMO';

  const { prisma } = await import('@/lib/db');

  // Force the simulation ledger so tests never touch Stellar or any network. The committed demo database
  // may carry FINANCIAL_MODE=STELLAR_TESTNET, which would make the services submit real Testnet transactions.
  await prisma.systemSettings.upsert({
    where: { key: 'FINANCIAL_MODE' },
    update: { value: 'SIMULATION' },
    create: { key: 'FINANCIAL_MODE', value: 'SIMULATION', category: 'general' },
  });

  const remove = (file: string) => {
    try {
      if (existsSync(file)) rmSync(file);
    } catch {
      // best effort
    }
  };

  return {
    prisma,
    url: `file:./${name}`,
    cleanup: () => {
      remove(target);
      remove(`${target}-journal`);
      remove(`${target}-wal`);
      remove(`${target}-shm`);
    },
  };
}
