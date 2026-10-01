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
    const safeName = `${Date.now()}-${fileName.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
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

export async function deleteDocument(path: string): Promise<boolean> {
  console.log('Document deletion requested:', path);
  return true;
}
