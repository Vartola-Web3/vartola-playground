import {
  generateSimulatedTxHash,
  generateSimulatedAssetId,
  generateSimulatedPoolId,
  simulateTransactionDelay,
} from '../config';

/**
 * AssetRegistry Contract Stub
 */
export class AssetRegistryStub {
  async registerAsset(assetData: {
    assetType: string;
    assetValue: number;
    vinOrSerial: string;
    documentHash: string;
  }): Promise<{ txHash: string; assetId: string }> {
    await simulateTransactionDelay();
    const txHash = generateSimulatedTxHash();
    const assetId = generateSimulatedAssetId();
    console.log(`[STELLAR STUB] AssetRegistry.registerAsset() -> ${assetId}, tx: ${txHash}`);
    return { txHash, assetId };
  }

  async updateStatus(assetId: string, status: string): Promise<string> {
    await simulateTransactionDelay();
    const txHash = generateSimulatedTxHash();
    console.log(`[STELLAR STUB] AssetRegistry.updateStatus(${assetId}, ${status}) -> ${txHash}`);
    return txHash;
  }
}

/**
 * FinancingFacility Contract Stub
 */
export class FinancingFacilityStub {
  async createFacility(facilityData: {
    applicationId: string;
    assetId: string;
    financeAmount: number;
    term: number;
    monthlyPayment: number;
  }): Promise<string> {
    await simulateTransactionDelay();
    const txHash = generateSimulatedTxHash();
    console.log(`[STELLAR STUB] FinancingFacility.createFacility() -> ${txHash}`);
    return txHash;
  }

  async activateFacility(facilityId: string): Promise<string> {
    await simulateTransactionDelay();
    const txHash = generateSimulatedTxHash();
    console.log(`[STELLAR STUB] FinancingFacility.activateFacility(${facilityId}) -> ${txHash}`);
    return txHash;
  }
}

/**
 * FinancingPool Contract Stub
 */
export class FinancingPoolStub {
  async createPool(poolData: {
    poolName: string;
    targetAmount: number;
    minInvestment: number;
    targetReturn: number;
  }): Promise<{ txHash: string; poolId: string }> {
    await simulateTransactionDelay();
    const txHash = generateSimulatedTxHash();
    const poolId = generateSimulatedPoolId();
    console.log(`[STELLAR STUB] FinancingPool.createPool() -> ${poolId}, tx: ${txHash}`);
    return { txHash, poolId };
  }

  async subscribe(poolId: string, investorAddress: string, amount: number): Promise<string> {
    await simulateTransactionDelay();
    const txHash = generateSimulatedTxHash();
    console.log(`[STELLAR STUB] FinancingPool.subscribe(${poolId}, ${amount}) -> ${txHash}`);
    return txHash;
  }
}

/**
 * PaymentDistributor Contract Stub
 */
export class PaymentDistributorStub {
  async recordPayment(facilityId: string, paymentNo: number, amount: number): Promise<string> {
    await simulateTransactionDelay();
    const txHash = generateSimulatedTxHash();
    console.log(`[STELLAR STUB] PaymentDistributor.recordPayment(${facilityId}, #${paymentNo}) -> ${txHash}`);
    return txHash;
  }

  async distributeToInvestors(paymentId: string, distributions: Array<{ investor: string; amount: number }>): Promise<string> {
    await simulateTransactionDelay();
    const txHash = generateSimulatedTxHash();
    console.log(`[STELLAR STUB] PaymentDistributor.distributeToInvestors(${distributions.length} investors) -> ${txHash}`);
    return txHash;
  }
}

// Export singleton instances
export const assetRegistry = new AssetRegistryStub();
export const financingFacility = new FinancingFacilityStub();
export const financingPool = new FinancingPoolStub();
export const paymentDistributor = new PaymentDistributorStub();
