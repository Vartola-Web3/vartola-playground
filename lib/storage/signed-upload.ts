import { createHash, randomBytes } from 'crypto';

// Signed uploads for private object storage: the browser uploads straight to the bucket with a short-lived signed
// URL, then the server verifies what actually arrived (size, real file type, SHA-256) before it is accepted.
// A file that fails the check is deleted. Buckets stay private; downloads use short-lived signed URLs.

export const MAX_BYTES = 8 * 1024 * 1024;
export const UPLOAD_URL_TTL_SECONDS = 120;
export const DOWNLOAD_URL_TTL_SECONDS = 120;

const TYPES: Record<string, { extension: string; magic: number[][] }> = {
  'application/pdf': { extension: 'pdf', magic: [[0x25, 0x50, 0x44, 0x46]] },
  'image/png': { extension: 'png', magic: [[0x89, 0x50, 0x4e, 0x47]] },
  'image/jpeg': { extension: 'jpg', magic: [[0xff, 0xd8, 0xff]] },
};

export function allowedType(mime: string) {
  return mime in TYPES;
}

// Random object name: nothing about the user, the file name, or the facility appears in the key.
export function newObjectKey(mime: string) {
  const type = TYPES[mime];
  if (!type) throw new Error('Only PDF, JPG, and PNG files are accepted');
  return `documents/${randomBytes(24).toString('hex')}.${type.extension}`;
}

// The first bytes of the file must match the declared type, so a renamed executable is rejected.
export function matchesDeclaredType(bytes: Uint8Array, mime: string) {
  const type = TYPES[mime];
  if (!type) return false;
  return type.magic.some((signature) => signature.every((value, index) => bytes[index] === value));
}

export function inspectUpload(bytes: Buffer, mime: string) {
  if (bytes.length === 0 || bytes.length > MAX_BYTES) throw new Error('File exceeds 8MB');
  if (!matchesDeclaredType(bytes, mime)) throw new Error('The file content does not match its declared type');
  return { hash: createHash('sha256').update(bytes).digest('hex'), size: bytes.length };
}

function s3Client() {
  return import('@aws-sdk/client-s3').then(({ S3Client }) => new S3Client({
    region: process.env.S3_REGION || 'me-central-1',
    endpoint: process.env.S3_ENDPOINT || undefined,
    forcePathStyle: Boolean(process.env.S3_ENDPOINT),
    credentials: { accessKeyId: process.env.S3_ACCESS_KEY_ID || '', secretAccessKey: process.env.S3_SECRET_ACCESS_KEY || '' },
  }));
}

export function bucketConfigured() {
  return Boolean(process.env.S3_BUCKET && process.env.S3_ACCESS_KEY_ID && process.env.S3_SECRET_ACCESS_KEY);
}

export async function createUploadTarget(mime: string) {
  if (!bucketConfigured()) throw new Error('Private object storage is not configured');
  const key = newObjectKey(mime);
  const [{ PutObjectCommand }, { getSignedUrl }, client] = await Promise.all([import('@aws-sdk/client-s3'), import('@aws-sdk/s3-request-presigner'), s3Client()]);
  const url = await getSignedUrl(client, new PutObjectCommand({ Bucket: process.env.S3_BUCKET, Key: key, ContentType: mime, ServerSideEncryption: 'AES256' }), { expiresIn: UPLOAD_URL_TTL_SECONDS });
  return { key, url, expiresInSeconds: UPLOAD_URL_TTL_SECONDS, headers: { 'Content-Type': mime, 'x-amz-server-side-encryption': 'AES256' } };
}

// Reads the uploaded object back, verifies it, and deletes it if it is not acceptable.
export async function finalizeUpload(key: string, mime: string) {
  if (!key.startsWith('documents/') || key.includes('..')) throw new Error('Invalid object key');
  const [{ GetObjectCommand, DeleteObjectCommand, HeadObjectCommand }, client] = await Promise.all([import('@aws-sdk/client-s3'), s3Client()]);
  const head = await client.send(new HeadObjectCommand({ Bucket: process.env.S3_BUCKET, Key: key }));
  if ((head.ContentLength ?? 0) > MAX_BYTES) {
    await client.send(new DeleteObjectCommand({ Bucket: process.env.S3_BUCKET, Key: key }));
    throw new Error('File exceeds 8MB');
  }
  const object = await client.send(new GetObjectCommand({ Bucket: process.env.S3_BUCKET, Key: key }));
  const bytes = Buffer.from(await (object.Body as { transformToByteArray(): Promise<Uint8Array> }).transformToByteArray());
  try {
    const checked = inspectUpload(bytes, mime);
    return { path: `s3://${process.env.S3_BUCKET}/${key}`, hash: checked.hash, size: checked.size };
  } catch (error) {
    await client.send(new DeleteObjectCommand({ Bucket: process.env.S3_BUCKET, Key: key }));
    throw error;
  }
}
