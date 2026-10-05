import { prisma } from '@/lib/db';
import { adminKeypair, distributorKeypair } from '@/lib/stellar/keys';
import { callContract, scAddress } from '@/lib/stellar/soroban/call';
import { facilityContractId } from '@/lib/stellar/keys';

export async function prepareGovernance() {
  const admin = adminKeypair().publicKey();
  const treasury = distributorKeypair().publicKey();
  const roles = [
    ['ADMIN', admin, 'Testnet operator. Replace with a multisig before any Mainnet use.'],
    ['TREASURY', treasury, 'VTAED distribution account. Mainnet treasury should be a separate multisig.'],
    ['PAUSER', admin, 'Emergency pause. Mainnet should split this from the admin role.'],
    ['ASSET_WHITELIST', 'VTAED', 'Only the Testnet VTAED asset is accepted. No Mainnet stablecoin is configured.'],
  ] as const;
  for (const [role, address, note] of roles) {
    await prisma.contractRole.upsert({
      where: { role },
      create: { role, address, note },
      update: { address, note },
    });
  }
  return prisma.contractRole.findMany({ orderBy: { role: 'asc' } });
}

export async function pauseFacilityContract() {
  const contractId = facilityContractId();
  if (!contractId) throw new Error('Facility contract is not configured');
  return callContract({
    contractId,
    method: 'pause',
    signer: adminKeypair(),
    args: [],
  });
}

export async function rotateAdmin(nextAdmin: string) {
  const contractId = facilityContractId();
  if (!contractId) throw new Error('Facility contract is not configured');
  return callContract({
    contractId,
    method: 'set_admin',
    signer: adminKeypair(),
    args: [scAddress(nextAdmin)],
  });
}
