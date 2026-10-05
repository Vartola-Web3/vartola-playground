import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { indexSorobanEvents } from '@/lib/stellar/indexer';

export async function POST() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    return NextResponse.json(await indexSorobanEvents());
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Indexer failed' }, { status: 400 });
  }
}
