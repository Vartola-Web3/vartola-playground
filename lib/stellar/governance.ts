import { prisma } from '@/lib/db';
import { adminKeypair, roleKeypair, type ContractRole } from '@/lib/stellar/keys';
import { callContract, scAddress } from '@/lib/stellar/soroban/call';
import { facilityContractId } from '@/lib/stellar/keys';

// Records which wallet holds which contract role, for the admin view. On Testnet every role has its own wallet when
// the deploy script created one. Mainnet needs multisig and custody for the administrator and treasury roles.
export async function prepareGovernance() {
  const notes: Record<ContractRole, string> = {
    ADMIN: 'Testnet operator key. Replace with a multisig account before any Mainnet use.',
    PAUSER: 'Emergency pause only. It cannot move funds.',
    TREASURY: 'Receives fees and executes the supplier payment after the administrator authorizes it.',
    UNDERWRITER: 'Creates facilities, attests final approval and the risk assessment.',
    OPERATIONS: 'Locks release, attests operational conditions, activates facilities, records servicing status.',
    COMPLIANCE: 'Attests the compliance release condition.',
  };
  for (const role of Object.keys(notes) as ContractRole[]) {
    const address = roleKeypair(role).publicKey();
    await prisma.contractRole.upsert({ where: { role }, create: { role, address, note: notes[role] }, update: { address, note: notes[role] } });
  }
  await prisma.contractRole.upsert({
    where: { role: 'ASSET_WHITELIST' },
    create: { role: 'ASSET_WHITELIST', address: 'VTAED', note: 'Only the Testnet VTAED asset is accepted. No Mainnet stablecoin is configured.' },
    update: { address: 'VTAED' },
  });
  return prisma.contractRole.findMany({ orderBy: { role: 'asc' } });
}

export async function pauseFacilityContract() {
  const contractId = facilityContractId();
  if (!contractId) throw new Error('Facility contract is not configured');
  return callContract({
    contractId,
    method: 'pause',
    signer: roleKeypair('PAUSER'),
    args: [],
  });
}

export async function rotateAdmin(nextAdmin: string) {
  const contractId = facilityContractId();
  if (!contractId) throw new Error('Facility contract is not configured');
  return callContract({
    contractId,
    method: 'propose_admin',
    signer: adminKeypair(),
    args: [scAddress(nextAdmin)],
  });
}
