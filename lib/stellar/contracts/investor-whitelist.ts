import { generateSimulatedTxHash, simulateTransactionDelay } from '../config';

/**
 * InvestorWhitelist Contract Stub
 * Phase 1: Simulated implementation
 * Phase 2: Replace with actual Soroban contract calls
 */
export class InvestorWhitelistStub {
  /**
   * Add investor to whitelist
   */
  async addInvestor(investorAddress: string): Promise<string> {
    await simulateTransactionDelay();
    const txHash = generateSimulatedTxHash();
    console.log(`[STELLAR STUB] InvestorWhitelist.addInvestor(${investorAddress}) -> ${txHash}`);
    return txHash;
  }

  /**
   * Remove investor from whitelist
   */
  async removeInvestor(investorAddress: string): Promise<string> {
    await simulateTransactionDelay();
    const txHash = generateSimulatedTxHash();
    console.log(`[STELLAR STUB] InvestorWhitelist.removeInvestor(${investorAddress}) -> ${txHash}`);
    return txHash;
  }

  /**
   * Check if investor is whitelisted
   */
  async isWhitelisted(investorAddress: string): Promise<boolean> {
    console.log(`[STELLAR STUB] InvestorWhitelist.isWhitelisted(${investorAddress}) -> true`);
    // In demo, all addresses are whitelisted
    return true;
  }

  /**
   * List all whitelisted investors
   */
  async listInvestors(): Promise<string[]> {
    console.log(`[STELLAR STUB] InvestorWhitelist.listInvestors() -> [demo addresses]`);
    return [
      'GINVESTOR1EXAMPLE1234567890INV1',
      'GINVESTOR2EXAMPLE1234567890INV2',
      'GINVESTOR3EXAMPLE1234567890INV3',
    ];
  }
}

export const investorWhitelist = new InvestorWhitelistStub();
