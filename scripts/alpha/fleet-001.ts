import * as bcrypt from 'bcryptjs';
import { Keypair } from '@stellar/stellar-sdk';
import { prisma } from '../../lib/db';
import { ensureEmbeddedWallet } from '../../lib/stellar/wallets/provider';
import { payVtaed } from '../../lib/stellar/assets/vtaed';
import { ensureFacilityOnChain, registerWalletOnChain, setEnforceKyc, subscribeAndReserve, syncComplianceOnChain } from '../../lib/alpha/chain';
import { facilityContractId } from '../../lib/stellar/keys';
import { saveAssetPassport } from '../../lib/alpha/passport';

const password = 'Fleet001-test';
const smeEmail = 'fleet001-sme@vartola.test';
const investors = [
  { email: 'fleet001-investor-a@vartola.test', name: 'Fleet Investor A', amount: 100000 },
  { email: 'fleet001-investor-b@vartola.test', name: 'Fleet Investor B', amount: 50000 },
];

async function user(email: string, name: string, role: string, companyId?: string) {
  const passwordHash = await bcrypt.hash(password, 10);
  return prisma.user.upsert({
    where: { email },
    update: { name, accountStatus: 'ACTIVE', country: 'AE', residency: 'AE', phone: '+971500000001' },
    create: {
      email,
      name,
      role,
      passwordHash,
      companyId,
      accountStatus: 'ACTIVE',
      country: 'AE',
      residency: 'AE',
      investorType: role === 'INVESTOR' ? 'INDIVIDUAL' : null,
      phone: '+971500000001',
    },
  });
}

async function main() {
  const company = await prisma.company.upsert({
    where: { tradeLicenseNo: 'FLEET-001-DED' },
    update: { legalName: 'Dubai SME Delivery Fleet LLC' },
    create: {
      tradeLicenseNo: 'FLEET-001-DED',
      legalName: 'Dubai SME Delivery Fleet LLC',
      emirate: 'Dubai',
      industry: 'Logistics',
      establishedDate: new Date('2020-01-01'),
      contactEmail: smeEmail,
      contactPhone: '+971500000001',
      address: 'Dubai',
    },
  });
  const sme = await user(smeEmail, 'Dubai SME Delivery Fleet', 'SME', company.id);
  const application = await prisma.application.upsert({
    where: { applicationNo: 'APP-FLEET-001' },
    update: {},
    create: {
      applicationNo: 'APP-FLEET-001',
      companyId: company.id,
      submittedBy: sme.id,
      assetType: 'CARGO_VAN',
      unitCount: 10,
      assetDescription: 'Dubai SME Delivery Fleet — Facility #001',
      assetValue: 180000,
      smeContribution: 30000,
      financeAmount: 150000,
      requestedTerm: 24,
      status: 'APPROVED',
    },
  });
  const supplierKey = Keypair.random();
  const supplier = await prisma.supplier.create({
    data: {
      companyName: 'Fleet Dealer LLC',
      payoutPublicKey: supplierKey.publicKey(),
      kybStatus: 'APPROVED',
      status: 'APPROVED',
    },
  });
  const facility = await prisma.facility.upsert({
    where: { applicationId: application.id },
    update: { supplierId: supplier.id, financeAmount: 150000, term: 24, unitValue: 100 },
    create: {
      facilityNo: 'FAC-FLEET-001',
      applicationId: application.id,
      financeAmount: 150000,
      term: 24,
      monthlyPayment: 7000,
      status: 'PENDING_FUNDING',
      supplierId: supplier.id,
      unitValue: 100,
      serviceFeeRate: 0.01,
      reserveRate: 0.005,
    },
  });
  let pool = await prisma.pool.findUnique({ where: { poolNo: 'POOL-FLEET-001' } });
  if (!pool) {
    pool = await prisma.pool.create({
      data: {
        poolNo: 'POOL-FLEET-001',
        poolName: 'Dubai SME Delivery Fleet — Facility #001',
        targetAmount: 150000,
        minInvestment: 100,
        targetReturn: 0.12,
        status: 'OPEN',
        assetFocus: 'Delivery fleet',
        termMonths: 24,
      },
    });
  }
  await prisma.facility.update({ where: { id: facility.id }, data: { poolId: pool.id } });

  if (!facilityContractId()) {
    console.log(JSON.stringify({
      facilityId: facility.id,
      poolId: pool.id,
      password,
      chain: 'not configured',
      note: 'Accounts were created. Deploy contracts and issue VTAED, then rerun this script for Testnet transactions.',
    }, null, 2));
    return;
  }

  await setEnforceKyc(true);
  const smeWallet = await ensureEmbeddedWallet(sme.id);
  await registerWalletOnChain(sme.id);
  await prisma.complianceCase.upsert({
    where: { subjectType_subjectId: { subjectType: 'COMPANY', subjectId: company.id } },
    update: { status: 'VERIFIED', provider: 'SUMSUB' },
    create: { subjectType: 'COMPANY', subjectId: company.id, status: 'VERIFIED', provider: 'SUMSUB' },
  });
  await syncComplianceOnChain(sme.id);
  const created = await ensureFacilityOnChain(facility.id);
  const positions = [];
  for (const investor of investors) {
    const account = await user(investor.email, investor.name, 'INVESTOR');
    const wallet = await ensureEmbeddedWallet(account.id);
    await payVtaed(wallet.publicKey, investor.amount);
    await registerWalletOnChain(account.id);
    await prisma.complianceCase.upsert({
      where: { subjectType_subjectId: { subjectType: 'INDIVIDUAL', subjectId: account.id } },
      update: { status: 'VERIFIED', provider: 'SUMSUB' },
      create: { subjectType: 'INDIVIDUAL', subjectId: account.id, status: 'VERIFIED', provider: 'SUMSUB' },
    });
    await syncComplianceOnChain(account.id);
    const chain = await subscribeAndReserve(account.id, facility.id, investor.amount);
    positions.push({ email: investor.email, units: chain.units, txHash: chain.txHash });
  }
  const passport = await saveAssetPassport({
    facilityId: facility.id,
    assetId: 'FLEET-001-VAN-01',
    serial: 'VIN-FLEET-001-DEMO',
    assetType: 'CARGO_VAN',
    manufacturer: 'Fleet',
    model: 'Delivery',
    year: 2024,
    purchaseValue: 180000,
    supplierName: 'Fleet Dealer LLC',
    legalOwner: 'Vartola Facility',
    operatorName: 'Dubai SME Delivery Fleet LLC',
    insuranceStatus: 'VERIFIED',
    registrationStatus: 'VERIFIED',
    deliveryStatus: 'PENDING',
  });
  console.log(JSON.stringify({
    facilityId: facility.id,
    facilityTx: created.stellarTxHash,
    sme: smeEmail,
    smeWallet: smeWallet.publicKey,
    supplier: supplierKey.publicKey(),
    password,
    positions,
    passport: passport.chainTxHash,
    asset: 'VTAED',
    finance: 150000,
    unit: 100,
    totalUnits: 1500,
  }, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
}).finally(() => prisma.$disconnect());
