import { prisma } from '@/lib/db';
import { uploadDocument } from '@/lib/services/storage';

const ALLOWED = new Set(['application/pdf', 'image/png', 'image/jpeg', 'image/jpg']);
const MAX_BYTES = 8 * 1024 * 1024;

export function inferDocumentType(fileName: string) {
  const name = fileName.toLowerCase();
  if (name.includes('trade') || name.includes('license')) return 'TRADE_LICENSE';
  if (name.includes('bank')) return 'BANK_STATEMENT';
  if (name.includes('quote') || name.includes('asset')) return 'ASSET_QUOTE';
  if (name.includes('company') || name.includes('profile')) return 'COMPANY_PROFILE';
  return 'OTHER';
}

export async function saveUploads(files: File[], applicationId: string, userId: string) {
  const saved = [];
  for (const file of files) {
    const mime = file.type || 'application/octet-stream';
    if (!ALLOWED.has(mime)) {
      throw new Error(`Unsupported file type: ${mime || file.name}`);
    }
    if (file.size > MAX_BYTES) {
      throw new Error('File exceeds 8MB');
    }
    const buffer = Buffer.from(await file.arrayBuffer());
    const stored = await uploadDocument(buffer, file.name, mime);
    const doc = await prisma.document.create({
      data: {
        applicationId,
        documentType: inferDocumentType(file.name),
        fileName: file.name.split(/[/\\]/).pop() || 'upload.bin',
        fileSize: stored.size,
        mimeType: mime,
        storagePath: stored.path,
        documentHash: stored.hash,
        uploadedBy: userId,
      },
    });
    saved.push(doc);
  }
  return saved;
}
