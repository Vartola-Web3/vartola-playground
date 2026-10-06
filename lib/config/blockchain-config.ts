/**
 * Live Blockchain Configuration Loader
 * 
 * Reads configuration from database (SystemSettings) FIRST
 * Falls back to process.env ONLY if database is empty or unavailable
 * 
 * This is the ACTIVE configuration system that runtime depends on.
 */

import { prisma } from '@/lib/db';
import { SECRET_SETTING_KEYS, encryptedSecretProvider } from '@/lib/security/encrypted-secrets';

// Secret settings are stored encrypted. A legacy plaintext value still reads correctly until it is migrated.
function readSetting(key: string, value: string) {
  if (!SECRET_SETTING_KEYS.includes(key) || !value) return value;
  try {
    return encryptedSecretProvider.open(value);
  } catch (error) {
    console.error('Could not decrypt a stored secret:', error instanceof Error ? error.message : error);
    return '';
  }
}

/**
 * Blockchain configuration keys stored in SystemSettings
 */
export const BLOCKCHAIN_CONFIG_KEYS = {
  ALCHEMY_API_KEY: 'blockchain.alchemy_api_key',
  STELLAR_RPC_URL: 'blockchain.stellar_rpc_url',
  STELLAR_HORIZON_URL: 'blockchain.stellar_horizon_url',
  STELLAR_SOROBAN_RPC_URL: 'blockchain.stellar_soroban_rpc_url',
  ENABLE_SOROBAN_CONTRACTS: 'blockchain.enable_soroban_contracts',
} as const;

/**
 * Cache for configuration to avoid database queries on every request
 * Expires after 5 minutes
 */
interface ConfigCache {
  data: Record<string, string>;
  timestamp: number;
}

let configCache: ConfigCache | null = null;
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

/**
 * Get a configuration value from database FIRST, then fallback to env
 * 
 * Priority:
 * 1. Database SystemSettings (LIVE config managed by admin)
 * 2. process.env (fallback/bootstrap)
 * 
 * @param key Configuration key
 * @param envFallback process.env key to use as fallback
 * @returns Configuration value or empty string
 */
export async function getBlockchainConfig(
  key: string,
  envFallback?: string
): Promise<string> {
  try {
    // Try database first (LIVE config)
    const setting = await prisma.systemSettings.findUnique({
      where: { key },
    });

    if (setting && setting.value && setting.value.trim() !== '') {
      return readSetting(key, setting.value);
    }

    // Fallback to environment variable
    if (envFallback && process.env[envFallback]) {
      const envValue = process.env[envFallback];
      if (envValue && envValue.trim() !== '') {
        return envValue;
      }
    }

    return '';
  } catch (error) {
    console.error(`Failed to load config ${key} from database, using env:`, error);
    
    // If database fails, use env as last resort
    if (envFallback && process.env[envFallback]) {
      return process.env[envFallback] || '';
    }
    
    return '';
  }
}

/**
 * Load all blockchain configuration at once (with caching)
 * Returns object with all config values
 */
export async function loadBlockchainConfig(): Promise<{
  alchemyApiKey: string;
  stellarRpcUrl: string;
  stellarHorizonUrl: string;
  stellarSorobanRpcUrl: string;
  enableSorobanContracts: boolean;
}> {
  // Check cache
  const now = Date.now();
  if (configCache && (now - configCache.timestamp) < CACHE_TTL) {
    return parseBlockchainConfig(configCache.data);
  }

  try {
    // Load all blockchain settings from database
    const settings = await prisma.systemSettings.findMany({
      where: {
        category: 'blockchain',
      },
    });

    const configData: Record<string, string> = {};
    settings.forEach(setting => {
      configData[setting.key] = readSetting(setting.key, setting.value);
    });

    // Update cache
    configCache = {
      data: configData,
      timestamp: now,
    };

    return parseBlockchainConfig(configData);
  } catch (error) {
    console.error('Failed to load blockchain config from database, using env:', error);
    
    // Fallback to environment variables
    return {
      alchemyApiKey: process.env.ALCHEMY_API_KEY || '',
      stellarRpcUrl: process.env.STELLAR_RPC_URL || '',
      stellarHorizonUrl: process.env.STELLAR_HORIZON_URL || 'https://horizon-testnet.stellar.org',
      stellarSorobanRpcUrl: process.env.STELLAR_SOROBAN_RPC_URL || 'https://soroban-testnet.stellar.org',
      enableSorobanContracts: process.env.ENABLE_SOROBAN_CONTRACTS === 'true',
    };
  }
}

/**
 * Parse blockchain config from database records
 */
function parseBlockchainConfig(data: Record<string, string>) {
  const getValue = (dbKey: string, envKey: string, defaultValue: string = '') => {
    const dbValue = data[dbKey];
    if (dbValue && dbValue.trim() !== '') {
      return dbValue;
    }
    return process.env[envKey] || defaultValue;
  };

  return {
    alchemyApiKey: getValue(
      BLOCKCHAIN_CONFIG_KEYS.ALCHEMY_API_KEY,
      'ALCHEMY_API_KEY'
    ),
    stellarRpcUrl: getValue(
      BLOCKCHAIN_CONFIG_KEYS.STELLAR_RPC_URL,
      'STELLAR_RPC_URL'
    ),
    stellarHorizonUrl: getValue(
      BLOCKCHAIN_CONFIG_KEYS.STELLAR_HORIZON_URL,
      'STELLAR_HORIZON_URL',
      'https://horizon-testnet.stellar.org'
    ),
    stellarSorobanRpcUrl: getValue(
      BLOCKCHAIN_CONFIG_KEYS.STELLAR_SOROBAN_RPC_URL,
      'STELLAR_SOROBAN_RPC_URL',
      'https://soroban-testnet.stellar.org'
    ),
    enableSorobanContracts: getValue(
      BLOCKCHAIN_CONFIG_KEYS.ENABLE_SOROBAN_CONTRACTS,
      'ENABLE_SOROBAN_CONTRACTS',
      'false'
    ) === 'true',
  };
}

/**
 * Set a blockchain configuration value in database
 * This is the LIVE config that will be used at runtime
 * 
 * @param key Configuration key
 * @param value Configuration value
 */
export async function setBlockchainConfig(
  key: string,
  value: string
): Promise<void> {
  const stored = SECRET_SETTING_KEYS.includes(key) && value ? encryptedSecretProvider.seal(value) : value;
  await prisma.systemSettings.upsert({
    where: { key },
    create: {
      key,
      value: stored,
      category: 'blockchain',
    },
    update: {
      value: stored,
    },
  });

  // Clear cache
  configCache = null;
}

/**
 * Bootstrap configuration from environment variables
 * Called once on startup/seed to populate database from .env.local
 * 
 * Only sets values if:
 * 1. Database setting doesn't exist, OR
 * 2. Database setting is empty
 */
export async function bootstrapConfigFromEnv(): Promise<void> {
  const envMappings = [
    {
      dbKey: BLOCKCHAIN_CONFIG_KEYS.ALCHEMY_API_KEY,
      envKey: 'ALCHEMY_API_KEY',
    },
    {
      dbKey: BLOCKCHAIN_CONFIG_KEYS.STELLAR_RPC_URL,
      envKey: 'STELLAR_RPC_URL',
    },
    {
      dbKey: BLOCKCHAIN_CONFIG_KEYS.STELLAR_HORIZON_URL,
      envKey: 'STELLAR_HORIZON_URL',
    },
    {
      dbKey: BLOCKCHAIN_CONFIG_KEYS.STELLAR_SOROBAN_RPC_URL,
      envKey: 'STELLAR_SOROBAN_RPC_URL',
    },
    {
      dbKey: BLOCKCHAIN_CONFIG_KEYS.ENABLE_SOROBAN_CONTRACTS,
      envKey: 'ENABLE_SOROBAN_CONTRACTS',
    },
  ];

  for (const mapping of envMappings) {
    const envValue = process.env[mapping.envKey];
    
    if (envValue && envValue.trim() !== '') {
      // Check if database setting exists and is not empty
      const existing = await prisma.systemSettings.findUnique({
        where: { key: mapping.dbKey },
      });

      if (!existing || !existing.value || existing.value.trim() === '') {
        // Bootstrap from environment
        await setBlockchainConfig(mapping.dbKey, envValue);
        console.log(`✅ Bootstrapped ${mapping.dbKey} from environment`);
      }
    }
  }

  console.log('✅ Configuration bootstrap complete');
}

/**
 * Clear configuration cache (useful after admin updates settings)
 */
export function clearConfigCache(): void {
  configCache = null;
}
