import { Server } from '@stellar/stellar-sdk/lib/horizon';
import { Server as SorobanRpcServer } from '@stellar/stellar-sdk/lib/soroban';
import {
  Transaction,
  FeeBumpTransaction,
} from '@stellar/stellar-sdk';
import type { StellarProvider, StellarProviderConfig } from './base';

/**
 * Public Stellar RPC Provider
 * 
 * Uses official Stellar Foundation public RPC endpoints.
 * Free to use but may have rate limits and slower performance than Alchemy.
 * Automatically used as fallback when Alchemy is not configured.
 */
export class StellarPublicRpcProvider implements StellarProvider {
  private horizonServer: Server;
  private sorobanServer: SorobanRpcServer;
  private config: StellarProviderConfig;

  constructor(config: StellarProviderConfig) {
    this.config = config;

    // Use official Stellar public endpoints
    const horizonUrl = config.horizonUrl || 'https://horizon-testnet.stellar.org';
    const sorobanUrl = config.sorobanUrl || 'https://soroban-testnet.stellar.org';

    this.horizonServer = new Server(horizonUrl, {
      allowHttp: false,
    });

    this.sorobanServer = new SorobanRpcServer(sorobanUrl, {
      allowHttp: false,
    });

    console.log('[Public RPC] Stellar provider initialized for', config.network);
  }

  getHorizonServer(): Server {
    return this.horizonServer;
  }

  getSorobanServer(): SorobanRpcServer {
    return this.sorobanServer;
  }

  async submitTransaction(
    transaction: Transaction | FeeBumpTransaction
  ): Promise<any> {
    try {
      const response = await this.horizonServer.submitTransaction(transaction);
      console.log('[Public RPC] Transaction submitted:', response.hash);
      return response;
    } catch (error: any) {
      console.error('[Public RPC] Transaction submission failed:', error?.message);
      throw error;
    }
  }

  async getTransaction(hash: string): Promise<any> {
    try {
      const response = await this.horizonServer.transactions().transaction(hash).call();
      return response;
    } catch (error: any) {
      console.error('[Public RPC] Failed to get transaction:', error?.message);
      throw error;
    }
  }

  async getAccount(publicKey: string): Promise<any> {
    try {
      const account = await this.horizonServer.loadAccount(publicKey);
      return account;
    } catch (error: any) {
      console.error('[Public RPC] Failed to load account:', error?.message);
      throw error;
    }
  }

  getProviderName(): string {
    return 'Public RPC';
  }

  async isHealthy(): Promise<boolean> {
    try {
      // Test Horizon health
      await this.horizonServer.ledgers().limit(1).call();
      
      // Test Soroban health
      await this.sorobanServer.getHealth();
      
      return true;
    } catch (error) {
      console.error('[Public RPC] Health check failed:', error);
      return false;
    }
  }
}
