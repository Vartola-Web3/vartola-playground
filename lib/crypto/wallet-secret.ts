import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';

function encryptionKey() {
  const secret = process.env.WALLET_KEK;
  if (!secret || secret.length < 16) {
    throw new Error('WALLET_KEK must be set before an embedded wallet can be stored');
  }
  return scryptSync(secret, 'vartola-wallet-v1', 32);
}

export function sealSecret(secret: string) {
  const iv = randomBytes(12);
  const cipher = createCipheriv('aes-256-gcm', encryptionKey(), iv);
  const ciphertext = Buffer.concat([cipher.update(secret, 'utf8'), cipher.final()]);
  return {
    ciphertext: ciphertext.toString('base64'),
    iv: iv.toString('base64'),
    authTag: cipher.getAuthTag().toString('base64'),
  };
}

export function openSecret(payload: { ciphertext: string; iv: string; authTag: string }) {
  const decipher = createDecipheriv('aes-256-gcm', encryptionKey(), Buffer.from(payload.iv, 'base64'));
  decipher.setAuthTag(Buffer.from(payload.authTag, 'base64'));
  const plain = Buffer.concat([
    decipher.update(Buffer.from(payload.ciphertext, 'base64')),
    decipher.final(),
  ]);
  return plain.toString('utf8');
}
