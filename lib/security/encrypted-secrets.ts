import { createCipheriv, createDecipheriv, randomBytes, scryptSync } from 'crypto';

// Encrypts provider secrets (API keys) before they are stored in SystemSettings.
// Format: enc:v1:<iv>:<tag>:<ciphertext>, all base64. AES-256-GCM with a key derived from SERVER_MASTER_KEY.
// This is an abstraction point: production should replace the master key with a managed secrets vault or KMS.

const PREFIX = 'enc:v1:';

export interface SecretProvider {
  seal(plain: string): string;
  open(stored: string): string;
  isSealed(stored: string): boolean;
}

function masterKey() {
  const secret = process.env.SERVER_MASTER_KEY;
  if (!secret || secret.length < 24) {
    throw new Error('SERVER_MASTER_KEY (at least 24 characters) is required to store provider secrets');
  }
  return scryptSync(secret, 'vartola-settings-v1', 32);
}

export const encryptedSecretProvider: SecretProvider = {
  isSealed: (stored) => stored.startsWith(PREFIX),
  seal(plain) {
    if (!plain) return '';
    const iv = randomBytes(12);
    const cipher = createCipheriv('aes-256-gcm', masterKey(), iv);
    const body = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()]);
    return `${PREFIX}${iv.toString('base64')}:${cipher.getAuthTag().toString('base64')}:${body.toString('base64')}`;
  },
  open(stored) {
    if (!stored.startsWith(PREFIX)) return stored; // legacy plaintext value, re-encrypted by the migration
    const [iv, tag, body] = stored.slice(PREFIX.length).split(':');
    const decipher = createDecipheriv('aes-256-gcm', masterKey(), Buffer.from(iv, 'base64'));
    decipher.setAuthTag(Buffer.from(tag, 'base64'));
    return Buffer.concat([decipher.update(Buffer.from(body, 'base64')), decipher.final()]).toString('utf8');
  },
};

// Settings keys whose values are secrets and must never be stored or returned in plaintext.
export const SECRET_SETTING_KEYS = ['blockchain.alchemy_api_key'];

export function maskSecret(value: string) {
  if (!value) return '';
  return value.length <= 8 ? '••••' : `••••${value.slice(-4)}`;
}
