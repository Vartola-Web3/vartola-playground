import { NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { isAdminOperator } from '@/lib/auth/roles';
import { prisma } from '@/lib/db';
import { appMode } from '@/lib/config/app-mode';
import { adminKeypair, distributorKeypair, facilityContractId, issuerKeypair, registryContractId } from '@/lib/stellar/keys';
import { VTAED_CODE } from '@/lib/stellar/assets/vtaed';
import { STELLAR_CONFIG } from '@/lib/stellar/config';
import { prepareGovernance } from '@/lib/stellar/governance';
import { alphaSecretProblems } from '@/lib/security/secrets';

function publicKey(load: () => { publicKey(): string }) {
  try {
    return load().publicKey();
  } catch {
    return null;
  }
}

export async function GET() {
  const session = await auth();
  if (!session?.user || !isAdminOperator(session.user.role)) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const [events, facilities, attestations, roles, passports] = await Promise.all([
    prisma.chainEvent.findMany({ orderBy: { createdAt: 'desc' }, take: 20 }),
    prisma.facility.findMany({
      where: { chainStatus: { not: null } },
      select: { id: true, facilityNo: true, status: true, chainStatus: true, participationUnits: true, stellarTxHash: true, fundedAmount: true },
      take: 20,
    }),
    prisma.documentAttestation.findMany({ orderBy: { createdAt: 'desc' }, take: 12 }),
    prisma.contractRole.findMany(),
    prisma.assetPassport.findMany({ orderBy: { createdAt: 'desc' }, take: 8 }),
  ]);
  const issuer = publicKey(issuerKeypair);
  const distributor = publicKey(distributorKeypair);
  return NextResponse.json({
    mode: appMode(),
    network: STELLAR_CONFIG.network,
    rpcUrl: STELLAR_CONFIG.sorobanRpcUrl,
    horizonUrl: STELLAR_CONFIG.horizonUrl,
    asset: { code: VTAED_CODE, issuer, distributor, label: 'Vartola Test AED · no monetary value' },
    admin: publicKey(adminKeypair),
    contracts: { facility: facilityContractId() || null, registry: registryContractId() || null },
    problems: alphaSecretProblems(),
    events,
    facilities,
    attestations,
    passports,
    roles,
  });
}

export async function POST() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const roles = await prepareGovernance();
  return NextResponse.json({ roles });
}
