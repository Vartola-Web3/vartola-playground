import {
  Horizon,
  rpc,
  Transaction,
  FeeBumpTransaction,
} from '@stellar/stellar-sdk';
import type { StellarProvider, StellarProviderConfig } from './base';

/**
 * Alchemy Stellar Provider
 * 
 * Uses Alchemy's Stellar RPC infrastructure for improved reliability and performance.
 * Requires ALCHEMY_API_KEY environment variable.
 * 
 * Documentation: https://docs.alchemy.com/reference/stellar-api-quickstart
 */
export class AlchemyStellarProvider implements StellarProvider {
  private horizonServer: Horizon.Server;
  private sorobanServer: rpc.Server;
  private config: StellarProviderConfig;
  private apiKey: string;

  constructor(apiKey: string, config: StellarProviderConfig) {
    if (!apiKey || apiKey === 'your_alchemy_api_key_here') {
      throw new Error('Invalid Alchemy API key provided');
    }

    this.apiKey = apiKey;
    this.config = config;

    // Alchemy Stellar RPC URLs include the API key
    const alchemyHorizonUrl = config.horizonUrl.includes('alchemy.com')
      ? config.horizonUrl
      : `https://stellar-${config.network}.g.alchemy.com/v2/${apiKey}`;

    const alchemySorobanUrl = config.sorobanUrl?.includes('alchemy.com')
      ? config.sorobanUrl
      : `https://stellar-${config.network}.g.alchemy.com/v2/${apiKey}`;

    this.horizonServer = new Horizon.Server(alchemyHorizonUrl, {
      allowHttp: false,
    });

    this.sorobanServer = new rpc.Server(alchemySorobanUrl, {
      allowHttp: false,
    });

    console.log('[Alchemy] Stellar provider initialized for', config.network);
  }

  getHorizonServer(): Horizon.Server {
    return this.horizonServer;
  }

  getSorobanServer(): rpc.Server {
    return this.sorobanServer;
  }

  async submitTransaction(
    transaction: Transaction | FeeBumpTransaction
  ): Promise<unknown> {
    try {
      const response = await this.horizonServer.submitTransaction(transaction);
      console.log('[Alchemy] Transaction submitted:', response.hash);
      return response;
    } catch (caught) {
    const error = caught as Error & { code?: string; status?: number; response?: { status?: number; data?: unknown } };
      console.error('[Alchemy] Transaction submission failed:', error?.message);
      throw error;
    }
  }

  async getTransaction(hash: string): Promise<unknown> {
    try {
      const response = await this.horizonServer.transactions().transaction(hash).call();
      return response;
    } catch (caught) {
    const error = caught as Error & { code?: string; status?: number; response?: { status?: number; data?: unknown } };
      console.error('[Alchemy] Failed to get transaction:', error?.message);
      throw error;
    }
  }

  async getAccount(publicKey: string): Promise<unknown> {
    try {
      const account = await this.horizonServer.loadAccount(publicKey);
      return account;
    } catch (caught) {
    const error = caught as Error & { code?: string; status?: number; response?: { status?: number; data?: unknown } };
      console.error('[Alchemy] Failed to load account:', error?.message);
      throw error;
    }
  }

  getProviderName(): string {
    return 'Alchemy';
  }

  async isHealthy(): Promise<boolean> {
    try {
      // Test Horizon health
      await this.horizonServer.ledgers().limit(1).call();
      
      // Test Soroban health
      await this.sorobanServer.getHealth();
      
      return true;
    } catch (error) {
      console.error('[Alchemy] Health check failed:', error);
      return false;
    }
  }
}
