import {
  Horizon,
  rpc,
  Transaction,
  FeeBumpTransaction,
} from '@stellar/stellar-sdk';

/**
 * Base interface for Stellar RPC providers
 * Abstracts Alchemy vs public RPC implementations
 */
export interface StellarProvider {
  /**
   * Get Horizon server instance for classic Stellar operations
   * Used for: account creation, payments, trustlines, asset transfers
   */
  getHorizonServer(): Horizon.Server;

  /**
   * Get Soroban RPC server instance for smart contract operations
   * Used for: contract deployment, contract invocation, contract queries
   */
  getSorobanServer(): rpc.Server;

  /**
   * Submit a transaction to the Stellar network
   * Returns transaction response with status
   */
  submitTransaction(
    transaction: Transaction | FeeBumpTransaction
  ): Promise<unknown>;

  /**
   * Get transaction by hash
   * Used to verify transaction status after submission
   */
  getTransaction(hash: string): Promise<unknown>;

  /**
   * Get account information
   * Returns account details including balances, sequence number
   */
  getAccount(publicKey: string): Promise<unknown>;

  /**
   * Get provider name for logging/debugging
   */
  getProviderName(): string;

  /**
   * Health check - returns true if provider is accessible
   */
  isHealthy(): Promise<boolean>;
}

/**
 * Configuration for Stellar providers
 */
export interface StellarProviderConfig {
  network: 'testnet' | 'mainnet';
  networkPassphrase: string;
  horizonUrl: string;
  sorobanUrl?: string;
}
