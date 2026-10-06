import { writeFileSync, mkdirSync, existsSync } from 'fs';
import { join } from 'path';
import * as crypto from 'crypto';

const UPLOAD_DIR = join(process.cwd(), 'uploads');

interface UploadResult {
  path: string;
  hash: string;
  size: number;
}

export async function uploadDocument(
  file: Buffer,
  fileName: string,
  mimeType: string
): Promise<UploadResult> {
  const storageType = process.env.STORAGE_TYPE || 'local';

  if (storageType === 'local') {
    if (!existsSync(UPLOAD_DIR)) {
      mkdirSync(UPLOAD_DIR, { recursive: true });
    }

    const hash = crypto.createHash('sha256').update(file).digest('hex');
    const base = fileName.split(/[/\\]/).pop() || 'upload.bin';
    const safeName = `${Date.now()}-${base.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const filePath = join(UPLOAD_DIR, safeName);

    writeFileSync(filePath, file);

    return {
      path: filePath,
      hash,
      size: file.length,
    };
  }

  console.warn('Storage provider not configured. Using local filesystem.');
  return {
    path: `/uploads/${fileName}`,
    hash: crypto.createHash('sha256').update(file).digest('hex'),
    size: file.length,
  };
}

export async function getDocumentUrl(path: string): Promise<string> {
  return `/api/documents/${encodeURIComponent(path)}`;
}

// Removes the stored object for real. It throws when the object cannot be removed.
export async function deleteDocument(path: string): Promise<boolean> {
  const { deleteStoredDocument } = await import('@/lib/storage/document-provider');
  await deleteStoredDocument(path);
  return true;
}
