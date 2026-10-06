import { Keypair } from '@stellar/stellar-sdk';
import { facilityContractId, registryContractId } from '@/lib/stellar/keys';

export interface ContractAddresses {
  facilityContract: string;
  registryContract: string;
  poolContract: string;
  subscriptionContract: string;
  paymentDistributor: string;
}

export const CONTRACT_IDS: ContractAddresses = {
  facilityContract: facilityContractId(),
  registryContract: registryContractId(),
  poolContract: process.env.NEXT_PUBLIC_POOL_CONTRACT_ID || '',
  subscriptionContract: process.env.NEXT_PUBLIC_SUBSCRIPTION_CONTRACT_ID || '',
  paymentDistributor: process.env.NEXT_PUBLIC_PAYMENT_DISTRIBUTOR_ID || '',
};

export interface FacilityParams {
  facilityId: string;
  company: string;
  assetValue: number | bigint;
  financeAmount: number | bigint;
  termMonths: number;
  monthlyPayment: number | bigint;
  poolId?: string;
}

const refused = (name: string) => ({
  success: false as const,
  error: `${name} requires a confirmed Soroban Testnet transaction. Alpha calls lib/stellar/soroban/call.ts.`,
});

export async function invokeSorobanContract(functionName: string, args: unknown[] = [], sourceKeypair?: Keypair) {
  void functionName;
  void args;
  void sourceKeypair;
  return refused('Contract invocation');
}

export async function invokeFacilityContract(method: string, args: unknown[] = []) {
  void args;
  return refused(method);
}

export async function createFacilityOnSoroban(params: FacilityParams, adminKeypair: Keypair) {
  void params;
  void adminKeypair;
  return refused('create_facility');
}

export async function recordPaymentOnSoroban(facilityId: string, paymentNumber: number, amount: number, adminKeypair: Keypair) {
  void facilityId;
  void paymentNumber;
  void amount;
  void adminKeypair;
  return refused('record_repayment');
}

export async function distributePayment(facilityId: string, paymentId: string, distributions: Array<{ investorId: string; amount: number }>, adminKeypair: Keypair) {
  void facilityId;
  void paymentId;
  void distributions;
  void adminKeypair;
  return refused('distribute');
}

export async function getContractState(contractId: string) {
  return { status: 'unconfigured', contractId, message: 'Read facility state from a confirmed Testnet transaction.' };
}

export function isContractsConfigured() {
  return Boolean(CONTRACT_IDS.facilityContract && CONTRACT_IDS.registryContract);
}
