import type { StellarProvider, StellarProviderConfig } from './base';
import { AlchemyStellarProvider } from './alchemy';
import { StellarPublicRpcProvider } from './public';
import { loadBlockchainConfig } from '@/lib/config/blockchain-config';

/**
 * Factory function to create the appropriate Stellar provider
 * 
 * ⚠️ READS FROM LIVE DATABASE CONFIG FIRST (SystemSettings)
 * Falls back to process.env ONLY if database is empty or unavailable
 * 
 * Priority:
 * 1. Database SystemSettings (LIVE admin-managed config)
 * 2. process.env (fallback/bootstrap only)
 * 3. Alchemy (if API key configured)
 * 4. Public RPC (final fallback)
 * 
 * @returns Promise<StellarProvider> instance
 */
export async function createStellarProvider(): Promise<StellarProvider> {
  // Load configuration from database FIRST (LIVE config)
  const liveConfig = await loadBlockchainConfig();

  const config: StellarProviderConfig = {
    network: (process.env.STELLAR_NETWORK as 'testnet' | 'mainnet') || 'testnet',
    networkPassphrase: process.env.STELLAR_NETWORK_PASSPHRASE || 'Test SDF Network ; September 2015',
    horizonUrl: liveConfig.stellarHorizonUrl || 'https://horizon-testnet.stellar.org',
    sorobanUrl: liveConfig.stellarSorobanRpcUrl || 'https://soroban-testnet.stellar.org',
  };

  // Try to use Alchemy if API key is configured (from DB or env)
  const alchemyApiKey = liveConfig.alchemyApiKey;
  
  if (alchemyApiKey && alchemyApiKey !== 'your_alchemy_api_key_here' && alchemyApiKey.trim() !== '') {
    try {
      // Override URLs if using Alchemy
      const alchemyRpcUrl = liveConfig.stellarRpcUrl;
      if (alchemyRpcUrl && alchemyRpcUrl.includes('alchemy.com')) {
        config.horizonUrl = alchemyRpcUrl;
        config.sorobanUrl = alchemyRpcUrl;
      }

      console.log('✅ Using Alchemy Stellar RPC (from LIVE config)');
      return new AlchemyStellarProvider(alchemyApiKey, config);
    } catch (error: any) {
      console.warn('⚠️ Failed to initialize Alchemy provider:', error.message);
      console.warn('⚠️ Falling back to public RPC');
    }
  } else {
    console.log('ℹ️ ALCHEMY_API_KEY not configured in database or env, using public RPC');
  }

  // Fallback to public RPC
  console.log('✅ Using Public Stellar RPC');
  return new StellarPublicRpcProvider(config);
}

/**
 * Singleton instance of the Stellar provider
 * Initialized on first access
 */
let providerInstance: StellarProvider | null = null;
let providerPromise: Promise<StellarProvider> | null = null;

/**
 * Get the current Stellar provider instance
 * Creates a new instance on first call (async because it reads from database)
 * 
 * ⚠️ This reads from LIVE database config first
 */
export async function getStellarProvider(): Promise<StellarProvider> {
  if (providerInstance) {
    return providerInstance;
  }

  // Prevent multiple simultaneous initializations
  if (providerPromise) {
    return providerPromise;
  }

  providerPromise = createStellarProvider().then(provider => {
    providerInstance = provider;
    providerPromise = null;
    return provider;
  });

  return providerPromise;
}

/**
 * Reset the provider instance (useful for testing or after config changes)
 */
export function resetStellarProvider(): void {
  providerInstance = null;
  providerPromise = null;
}
