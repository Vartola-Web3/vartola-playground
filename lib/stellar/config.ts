import { getStellarProvider } from './providers';
import { Networks } from '@stellar/stellar-sdk';

/**
 * Stellar Network Configuration
 * 
 * ⚠️ NOTE: This uses process.env for network-level config
 * For RPC URLs and API keys, the system reads from database FIRST via blockchain-config.ts
 */
// Hosted environment variables are often pasted with quotes or spaces. A value that is not a valid URL falls back to
// the Testnet default instead of crashing the build when a module is loaded.
export function cleanUrl(value: string | undefined, fallback: string) {
  const text = (value || '').trim().replace(/^["']+|["']+$/g, '').trim();
  if (!text) return fallback;
  try {
    return new URL(text).toString().replace(/\/$/, '');
  } catch {
    return fallback;
  }
}

export const STELLAR_CONFIG = {
  network: (process.env.STELLAR_NETWORK || 'testnet') as 'testnet' | 'mainnet',
  networkPassphrase: process.env.STELLAR_NETWORK_PASSPHRASE || Networks.TESTNET,
  horizonUrl: cleanUrl(process.env.STELLAR_HORIZON_URL, 'https://horizon-testnet.stellar.org'),
  sorobanRpcUrl: cleanUrl(process.env.STELLAR_SOROBAN_RPC_URL, 'https://soroban-testnet.stellar.org'),
  explorerUrl: cleanUrl(process.env.STELLAR_EXPLORER_URL, 'https://stellar.expert/explorer/testnet'),
  friendbotUrl: cleanUrl(process.env.STELLAR_FRIENDBOT_URL, 'https://friendbot.stellar.org'),
} as const;

/**
 * Get the active Stellar provider instance
 * ⚠️ This is now async because it reads from database config
 */
export async function getProvider() {
  return await getStellarProvider();
}

/**
 * Get Stellar Explorer URL for a transaction
 */
export function getStellarExplorerUrl(txHash: string): string {
  return `${STELLAR_CONFIG.explorerUrl}/tx/${txHash}`;
}

/**
 * Get Stellar Explorer URL for an account
 */
export function getStellarAccountUrl(publicKey: string): string {
  return `${STELLAR_CONFIG.explorerUrl}/account/${publicKey}`;
}

/**
 * Get Stellar Explorer URL for an asset
 */
export function getStellarAssetUrl(assetCode: string, issuer: string): string {
  return `${STELLAR_CONFIG.explorerUrl}/asset/${assetCode}-${issuer}`;
}

/**
 * Check if we're on testnet
 */
export function isTestnet(): boolean {
  return STELLAR_CONFIG.network === 'testnet';
}

/**
 * Get the network passphrase for transaction building
 */
export function getNetworkPassphrase(): string {
  return STELLAR_CONFIG.networkPassphrase;
}

