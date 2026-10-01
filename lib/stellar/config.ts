import { getStellarProvider } from './providers';
import { Networks } from '@stellar/stellar-sdk';

/**
 * Stellar Network Configuration
 * 
 * ⚠️ NOTE: This uses process.env for network-level config
 * For RPC URLs and API keys, the system reads from database FIRST via blockchain-config.ts
 */
export const STELLAR_CONFIG = {
  network: (process.env.STELLAR_NETWORK || 'testnet') as 'testnet' | 'mainnet',
  networkPassphrase: process.env.STELLAR_NETWORK_PASSPHRASE || Networks.TESTNET,
  horizonUrl: process.env.STELLAR_HORIZON_URL || 'https://horizon-testnet.stellar.org',
  sorobanRpcUrl: process.env.STELLAR_SOROBAN_RPC_URL || 'https://soroban-testnet.stellar.org',
  explorerUrl: process.env.STELLAR_EXPLORER_URL || 'https://stellar.expert/explorer/testnet',
  friendbotUrl: process.env.STELLAR_FRIENDBOT_URL || 'https://friendbot.stellar.org',
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

// ============================================================================
// DEPRECATED FUNCTIONS (Phase 1 stubs - will be removed)
// ============================================================================

/**
 * @deprecated Use real Stellar transactions instead
 * Generate simulated transaction hash (Phase 1 only)
 */
export function generateSimulatedTxHash(): string {
  console.warn('⚠️ DEPRECATED: generateSimulatedTxHash() - Use real Stellar transactions');
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 15);
  return `SIMULATED_${timestamp}${random}`.toUpperCase();
}

/**
 * @deprecated Use real Stellar asset IDs
 * Generate simulated asset ID (Phase 1 only)
 */
export function generateSimulatedAssetId(): string {
  console.warn('⚠️ DEPRECATED: generateSimulatedAssetId() - Use real Stellar asset IDs');
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 10);
  return `ASSET_${timestamp}${random}`.toUpperCase();
}

/**
 * @deprecated Use real Stellar pool IDs
 * Generate simulated pool ID (Phase 1 only)
 */
export function generateSimulatedPoolId(): string {
  console.warn('⚠️ DEPRECATED: generateSimulatedPoolId() - Use real Stellar pool IDs');
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 10);
  return `POOL_${timestamp}${random}`.toUpperCase();
}

/**
 * @deprecated No longer needed with real transactions
 * Simulate transaction delay (Phase 1 only)
 */
export async function simulateTransactionDelay(): Promise<void> {
  console.warn('⚠️ DEPRECATED: simulateTransactionDelay() - Not needed with real transactions');
  const delay = 500 + Math.random() * 1000;
  return new Promise((resolve) => setTimeout(resolve, delay));
}
