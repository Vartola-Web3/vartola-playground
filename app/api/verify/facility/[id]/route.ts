import { NextResponse } from 'next/server';
import { facilityProof } from '@/lib/alpha/verify';

export const dynamic = 'force-dynamic';

// Public, read-only. Returns chain references and counts only.
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const proof = await facilityProof(decodeURIComponent(id));
  if (!proof) return NextResponse.json({ error: 'No chain-confirmed facility with this identifier' }, { status: 404 });
  return NextResponse.json(proof);
}
