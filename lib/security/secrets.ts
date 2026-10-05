import { isAlphaMode } from '@/lib/config/app-mode';
import { facilityContractId, registryContractId } from '@/lib/stellar/keys';

export function alphaSecretProblems() {
  if (!isAlphaMode()) return [];
  const problems: string[] = [];
  if (!process.env.WALLET_KEK || process.env.WALLET_KEK.length < 16) problems.push('WALLET_KEK');
  if (!process.env.STELLAR_ISSUER_SECRET && !facilityContractId()) problems.push('Testnet contracts');
  if (!registryContractId()) problems.push('WALLET_REGISTRY_CONTRACT_ID');
  if (!facilityContractId()) problems.push('FACILITY_CONTRACT_ID');
  if (process.env.STELLAR_NETWORK === 'mainnet') problems.push('Mainnet is disabled');
  return problems;
}
