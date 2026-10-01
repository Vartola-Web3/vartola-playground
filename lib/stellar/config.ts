// Stellar Testnet configuration
export const STELLAR_CONFIG = {
  network: 'testnet',
  horizonUrl: 'https://horizon-testnet.stellar.org',
  sorobanRpcUrl: 'https://soroban-testnet.stellar.org',
  explorerUrl: 'https://stellar.expert/explorer/testnet',
};

// Generate simulated transaction hash
export function generateSimulatedTxHash(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 15);
  return `SIMULATED_${timestamp}${random}`.toUpperCase();
}

// Generate simulated asset ID
export function generateSimulatedAssetId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 10);
  return `ASSET_${timestamp}${random}`.toUpperCase();
}

// Generate simulated pool ID
export function generateSimulatedPoolId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substring(2, 10);
  return `POOL_${timestamp}${random}`.toUpperCase();
}

// Get Stellar Explorer URL for a transaction
export function getStellarExplorerUrl(txHash: string): string {
  return `${STELLAR_CONFIG.explorerUrl}/tx/${txHash}`;
}

// Get Stellar Explorer URL for an account
export function getStellarAccountUrl(publicKey: string): string {
  return `${STELLAR_CONFIG.explorerUrl}/account/${publicKey}`;
}

// Simulate transaction delay
export async function simulateTransactionDelay(): Promise<void> {
  const delay = 500 + Math.random() * 1000; // 0.5-1.5 seconds
  return new Promise((resolve) => setTimeout(resolve, delay));
}
