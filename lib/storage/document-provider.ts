import { createHash, randomBytes } from 'crypto';
import { mkdirSync, unlinkSync, writeFileSync, existsSync } from 'fs';
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
  // Alpha stores documents only in private object storage. Local disk is not durable on the hosting platform, so
  // there is no silent fallback; set ALPHA_ALLOW_LOCAL_STORAGE=1 only for an isolated local test.
  if (isAlphaMode() && process.env.ALPHA_ALLOW_LOCAL_STORAGE !== '1') {
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
    ServerSideEncryption: 'AES256',
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

function parseS3Path(storagePath: string) {
  const without = storagePath.slice('s3://'.length);
  const slash = without.indexOf('/');
  return { bucket: without.slice(0, slash), key: without.slice(slash + 1) };
}

// Really removes the stored object. Throws if the object cannot be removed, so callers never report a fake success.
export async function deleteStoredDocument(storagePath: string) {
  if (storagePath.startsWith('s3://')) {
    const { S3Client, DeleteObjectCommand } = await import('@aws-sdk/client-s3');
    const { bucket, key } = parseS3Path(storagePath);
    const client = new S3Client({
      region: process.env.S3_REGION || 'me-central-1',
      endpoint: process.env.S3_ENDPOINT || undefined,
      credentials: { accessKeyId: process.env.S3_ACCESS_KEY_ID || '', secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '' },
    });
    await client.send(new DeleteObjectCommand({ Bucket: bucket, Key: key }));
    return 's3';
  }
  const uploads = join(process.cwd(), 'uploads');
  const resolved = join(storagePath);
  if (!resolved.startsWith(uploads)) throw new Error('Refusing to delete a file outside the uploads directory');
  if (existsSync(resolved)) unlinkSync(resolved);
  return 'local';
}
