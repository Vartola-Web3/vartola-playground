import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';
import * as crypto from 'crypto';

const CONFIG_DIR = join(process.cwd(), '.platform-config');
const CONFIG_FILE = join(CONFIG_DIR, 'config.json');
const ENCRYPTION_KEY = process.env.CONFIG_ENCRYPTION_KEY || 'assetfi-default-key-change-in-production-32bytes!!';

interface PlatformConfig {
  stellarNetwork: string;
  stellarHorizonUrl: string;
  firebaseProjectId: string;
  emailProvider: string;
  paymentProvider: string;
  aecbApiUrl: string;
  storageType: string;
}

function encrypt(text: string): string {
  const iv = crypto.randomBytes(16);
  const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
  const cipher = crypto.createCipheriv('aes-256-gcm', key, iv);
  
  let encrypted = cipher.update(text, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  const authTag = cipher.getAuthTag();
  
  return JSON.stringify({
    iv: iv.toString('hex'),
    data: encrypted,
    tag: authTag.toString('hex'),
  });
}

function decrypt(encryptedText: string): string {
  const { iv, data, tag } = JSON.parse(encryptedText);
  const key = crypto.scryptSync(ENCRYPTION_KEY, 'salt', 32);
  const decipher = crypto.createDecipheriv('aes-256-gcm', key, Buffer.from(iv, 'hex'));
  
  decipher.setAuthTag(Buffer.from(tag, 'hex'));
  
  let decrypted = decipher.update(data, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  
  return decrypted;
}

export async function getPlatformConfig(): Promise<PlatformConfig> {
  try {
    if (!existsSync(CONFIG_FILE)) {
      return {
        stellarNetwork: 'testnet',
        stellarHorizonUrl: 'https://horizon-testnet.stellar.org',
        firebaseProjectId: '',
        emailProvider: 'console',
        paymentProvider: 'console',
        aecbApiUrl: '',
        storageType: 'local',
      };
    }

    const encryptedData = readFileSync(CONFIG_FILE, 'utf8');
    const decryptedData = decrypt(encryptedData);
    return JSON.parse(decryptedData);
  } catch (error) {
    console.error('Failed to load config:', error);
    return {
      stellarNetwork: 'testnet',
      stellarHorizonUrl: 'https://horizon-testnet.stellar.org',
      firebaseProjectId: '',
      emailProvider: 'console',
      paymentProvider: 'console',
      aecbApiUrl: '',
      storageType: 'local',
    };
  }
}

export async function savePlatformConfig(config: PlatformConfig): Promise<void> {
  try {
    if (!existsSync(CONFIG_DIR)) {
      mkdirSync(CONFIG_DIR, { recursive: true });
    }

    const configString = JSON.stringify(config, null, 2);
    const encryptedData = encrypt(configString);
    
    writeFileSync(CONFIG_FILE, encryptedData, 'utf8');
  } catch (error) {
    console.error('Failed to save config:', error);
    throw error;
  }
}
