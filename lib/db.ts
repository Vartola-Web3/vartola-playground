import fs from 'fs';
import path from 'path';
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

function findDemoDatabase(dir: string, depth = 0): string | undefined {
  if (depth > 5) return undefined;
  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return undefined;
  }
  for (const entry of entries) {
    if (entry.isFile() && entry.name === 'dev.db') return path.join(dir, entry.name);
  }
  for (const entry of entries) {
    if (!entry.isDirectory() || entry.name === 'node_modules' || entry.name === '.git') continue;
    const found = findDemoDatabase(path.join(dir, entry.name), depth + 1);
    if (found) return found;
  }
  return undefined;
}

function vercelDatabaseUrl() {
  if (process.env.VERCEL !== '1') return undefined;
  const preferred = path.join(process.cwd(), 'prisma', 'prisma', 'dev.db');
  const source = fs.existsSync(preferred) ? preferred : findDemoDatabase(process.cwd());
  if (!source) throw new Error('The demo database was not included in this deployment.');
  const target = '/tmp/vartola-demo.db';
  if (!fs.existsSync(target)) fs.copyFileSync(source, target);
  return `file:${target}`;
}

const vercelUrl = vercelDatabaseUrl();

export const prisma = globalForPrisma.prisma ?? new PrismaClient(
  vercelUrl ? { datasources: { db: { url: vercelUrl } } } : undefined,
);

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
