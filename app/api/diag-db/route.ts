import fs from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const dynamic = 'force-dynamic';

// Temporary diagnostic: which database file is in use and whether it has the current columns.
export async function GET() {
  const preferred = path.join(process.cwd(), 'prisma', 'prisma', 'dev.db');
  const info: Record<string, unknown> = {
    cwd: process.cwd(),
    vercel: process.env.VERCEL,
    databaseUrlScheme: (process.env.DATABASE_URL || '').split(':')[0],
    preferredExists: fs.existsSync(preferred),
    preferredSize: fs.existsSync(preferred) ? fs.statSync(preferred).size : null,
    tmpExists: fs.existsSync('/tmp/vartola-demo.db'),
    tmpSize: fs.existsSync('/tmp/vartola-demo.db') ? fs.statSync('/tmp/vartola-demo.db').size : null,
    legacyExists: fs.existsSync(path.join(process.cwd(), 'prisma', 'dev.db')),
  };
  try {
    const rows = (await prisma.$queryRawUnsafe('PRAGMA table_info(users)')) as { name: string }[];
    info.userColumns = rows.map((row) => row.name);
  } catch (error) {
    info.error = error instanceof Error ? error.message.slice(0, 200) : 'failed';
  }
  return NextResponse.json(info);
}
