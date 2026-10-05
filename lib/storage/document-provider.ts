import { createHash, randomBytes } from 'crypto';
import { mkdirSync, writeFileSync } from 'fs';
import { join } from 'path';
import { isAlphaMode } from '@/lib/config/app-mode';

const ALLOWED = new Map([
  ['application/pdf', 'pdf'],
  ['image/png', 'png'],
  ['image/jpeg', 'jpg'],
  ['image/jpg', 'jpg'],
]);

export interface MalwareScanner {
  scan(bytes: Buffer): Promise<'clean' | 'infected' | 'skipped'>;
}

export const passthroughScanner: MalwareScanner = {
  async scan() {
    return 'skipped';
  },
};

export type StoredDocument = { path: string; hash: string; size: number };

function assertFile(bytes: Buffer, fileName: string, mimeType: string) {
  const extension = ALLOWED.get(mimeType);
  const suffix = fileName.split('.').pop()?.toLowerCase();
  if (!extension || (suffix && suffix !== extension && !(extension === 'jpg' && suffix === 'jpeg'))) {
    throw new Error('Only PDF, JPG, and PNG files are accepted');
  }
  if (bytes.length <= 0 || bytes.length > 8 * 1024 * 1024) throw new Error('File exceeds 8MB');
}

export async function storeDocument(bytes: Buffer, fileName: string, mimeType: string, scanner: MalwareScanner = passthroughScanner): Promise<StoredDocument> {
  assertFile(bytes, fileName, mimeType);
  const verdict = await scanner.scan(bytes);
  if (verdict === 'infected') throw new Error('File failed the malware scan');
  const hash = createHash('sha256').update(bytes).digest('hex');
  if (isAlphaMode() && process.env.S3_BUCKET) {
    return storePrivateObject(bytes, mimeType, hash);
  }
  if (isAlphaMode() && process.env.STORAGE_TYPE === 's3') {
    throw new Error('Alpha document storage requires S3_BUCKET, S3_ACCESS_KEY_ID, and S3_SECRET_ACCESS_KEY');
  }
  const dir = join(process.cwd(), 'uploads');
  mkdirSync(dir, { recursive: true });
  const key = `${Date.now()}-${randomBytes(8).toString('hex')}`;
  const filePath = join(dir, key);
  writeFileSync(filePath, bytes);
  return { path: filePath, hash, size: bytes.length };
}

async function storePrivateObject(bytes: Buffer, mimeType: string, hash: string): Promise<StoredDocument> {
  const { S3Client, PutObjectCommand } = await import('@aws-sdk/client-s3');
  const key = `documents/${randomBytes(24).toString('hex')}`;
  const client = new S3Client({
    region: process.env.S3_REGION || 'me-central-1',
    endpoint: process.env.S3_ENDPOINT || undefined,
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
    },
  });
  await client.send(new PutObjectCommand({
    Bucket: process.env.S3_BUCKET,
    Key: key,
    Body: bytes,
    ContentType: mimeType,
  }));
  return { path: `s3://${process.env.S3_BUCKET}/${key}`, hash, size: bytes.length };
}

export async function signedDownloadUrl(storagePath: string) {
  if (!storagePath.startsWith('s3://')) return null;
  const { S3Client, GetObjectCommand } = await import('@aws-sdk/client-s3');
  const { getSignedUrl } = await import('@aws-sdk/s3-request-presigner');
  const without = storagePath.slice('s3://'.length);
  const slash = without.indexOf('/');
  const bucket = without.slice(0, slash);
  const key = without.slice(slash + 1);
  const client = new S3Client({
    region: process.env.S3_REGION || 'me-central-1',
    endpoint: process.env.S3_ENDPOINT || undefined,
    credentials: {
      accessKeyId: process.env.S3_ACCESS_KEY_ID || '',
      secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '',
    },
  });
  return getSignedUrl(client, new GetObjectCommand({ Bucket: bucket, Key: key }), { expiresIn: 300 });
}
