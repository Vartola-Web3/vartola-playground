import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { allowedType, createUploadTarget, finalizeUpload } from '@/lib/storage/signed-upload';
import { rateLimit } from '@/lib/security/rate-limit';

export const dynamic = 'force-dynamic';

// Step 1 (action "target"): the signed-in user asks for a short-lived upload URL for one file type.
// Step 2 (action "finalize"): after the browser uploaded the file, the server reads it back, checks its size, real
// type and SHA-256, and deletes it if it fails. The result is attached to a record by the caller.
export async function POST(request: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  try {
    rateLimit(request, 'signed-upload', 30);
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Too many requests' }, { status: 429 });
  }
  const body = await request.json().catch(() => ({}));
  const mime = String(body.mimeType || '');
  if (!allowedType(mime)) return NextResponse.json({ error: 'Only PDF, JPG, and PNG files are accepted' }, { status: 400 });
  try {
    if (body.action === 'target') return NextResponse.json(await createUploadTarget(mime));
    if (body.action === 'finalize') return NextResponse.json(await finalizeUpload(String(body.key || ''), mime));
    return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : 'Upload failed' }, { status: 400 });
  }
}
