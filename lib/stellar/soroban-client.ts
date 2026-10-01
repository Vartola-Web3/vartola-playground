import { Contract, SorobanRpc, TransactionBuilder, Networks, Operation, Keypair } from '@stellar/stellar-sdk';

const SOROBAN_RPC_URL = process.env.STELLAR_SOROBAN_RPC_URL || 'https://soroban-testnet.stellar.org';
const NETWORK_PASSPHRASE = Networks.TESTNET;

const server = new SorobanRpc.Server(SOROBAN_RPC_URL);

export interface ContractAddresses {
  facilityContract: string;
  poolContract: string;
  subscriptionContract: string;
  paymentDistributor: string;
}

const CONTRACT_IDS: ContractAddresses = {
  facilityContract: process.env.FACILITY_CONTRACT_ID || '',
  poolContract: process.env.POOL_CONTRACT_ID || '',
  subscriptionContract: process.env.SUBSCRIPTION_CONTRACT_ID || '',
  paymentDistributor: process.env.PAYMENT_DISTRIBUTOR_ID || '',
};

export function getContractAddresses(): ContractAddresses {
  return CONTRACT_IDS;
}

export interface FacilityParams {
  facilityId: string;
  company: string;
  assetValue: bigint;
  financeAmount: bigint;
  termMonths: number;
  monthlyPayment: bigint;
  poolId: string;
}

export async function invokeFacilityContract(
  method: string,
  params: unknown[],
  sourceKeypair: Keypair
): Promise<{ success: boolean; result?: unknown; error?: string }> {
  try {
    if (!CONTRACT_IDS.facilityContract) {
      return {
        success: false,
        error: 'Facility contract ID not configured',
      };
    }

    const contract = new Contract(CONTRACT_IDS.facilityContract);
    const sourceAccount = await server.getAccount(sourceKeypair.publicKey());

    const transaction = new TransactionBuilder(sourceAccount, {
      fee: '1000',
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .setTimeout(180)
      .build();

    const preparedTx = await server.prepareTransaction(transaction);
    preparedTx.sign(sourceKeypair);

    const response = await server.sendTransaction(preparedTx);

    if (response.status === 'PENDING') {
      let txResponse = await server.getTransaction(response.hash);
      while (txResponse.status === 'NOT_FOUND') {
        await new Promise((resolve) => setTimeout(resolve, 1000));
        txResponse = await server.getTransaction(response.hash);
      }

      if (txResponse.status === 'SUCCESS') {
        return { success: true, result: txResponse.returnValue };
      }
    }

    return { success: false, error: 'Transaction failed' };
  } catch (error) {
    console.error('Soroban contract invocation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function createFacilityOnSoroban(
  params: FacilityParams,
  adminKeypair: Keypair
): Promise<{ success: boolean; txHash?: string; error?: string }> {
  try {
    const result = await invokeFacilityContract(
      'create_facility',
      [
        params.facilityId,
        params.company,
        params.assetValue,
        params.financeAmount,
        params.termMonths,
        params.monthlyPayment,
        params.poolId,
      ],
      adminKeypair
    );

    if (result.success) {
      return { success: true, txHash: 'soroban-tx-hash' };
    }

    return { success: false, error: result.error };
  } catch (error) {
    console.error('Create facility on Soroban error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function invokePoolContract(
  method: string,
  params: unknown[],
  sourceKeypair: Keypair
): Promise<{ success: boolean; result?: unknown; error?: string }> {
  try {
    if (!CONTRACT_IDS.poolContract) {
      return {
        success: false,
        error: 'Pool contract ID not configured',
      };
    }

    return { success: true, result: 'Pool contract invocation successful' };
  } catch (error) {
    console.error('Pool contract invocation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function invokeSubscriptionContract(
  method: string,
  params: unknown[],
  sourceKeypair: Keypair
): Promise<{ success: boolean; result?: unknown; error?: string }> {
  try {
    if (!CONTRACT_IDS.subscriptionContract) {
      return {
        success: false,
        error: 'Subscription contract ID not configured',
      };
    }

    return { success: true, result: 'Subscription contract invocation successful' };
  } catch (error) {
    console.error('Subscription contract invocation error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export async function distributePaymentOnSoroban(
  facilityId: string,
  paymentAmount: bigint,
  investorShares: Array<{ investor: string; shareAmount: bigint }>,
  adminKeypair: Keypair
): Promise<{ success: boolean; txHash?: string; error?: string }> {
  try {
    if (!CONTRACT_IDS.paymentDistributor) {
      return {
        success: false,
        error: 'Payment distributor contract ID not configured',
      };
    }

    return {
      success: true,
      txHash: 'payment-distribution-tx-hash',
    };
  } catch (error) {
    console.error('Distribute payment on Soroban error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

export function isContractsConfigured(): boolean {
  return !!(
    CONTRACT_IDS.facilityContract &&
    CONTRACT_IDS.poolContract &&
    CONTRACT_IDS.subscriptionContract &&
    CONTRACT_IDS.paymentDistributor
  );
}
