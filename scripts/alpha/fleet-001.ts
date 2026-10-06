import * as bcrypt from 'bcryptjs';
import fs from 'fs';
import { Keypair } from '@stellar/stellar-sdk';
import { prisma } from '../../lib/db';
import { ensureEmbeddedWallet } from '../../lib/stellar/wallets/provider';
import { ensureVtaedTrustline, fundWithFriendbot, payVtaed } from '../../lib/stellar/assets/vtaed';
import { registerWalletOnChain, setEnforceKyc, syncComplianceOnChain, ensureFacilityOnChain } from '../../lib/alpha/chain';
import { subscribeAlpha } from '../../lib/alpha/subscribe';
import { facilityContractId, roleKeypair } from '../../lib/stellar/keys';
import { saveAssetPassport } from '../../lib/alpha/passport';
import { ensureChecklists, activateFacility, markStatus, recordRecovery, recordRepayment, releaseFacilityFunds, settleEarly } from '../../lib/lifecycle/service';

// Runs complete Alpha facilities against real Stellar Testnet and Soroban contracts.
// Scenario "main" is Dubai SME Delivery Fleet — Facility #001 (150,000 VTAED, 1,500 units of 100).
// "settle" tests early settlement and "default" tests default and recovery, each on a small separate facility.
// Run with APP_MODE=ALPHA, WALLET_KEK set, and a dedicated test DATABASE_URL (never the shipped demo database).

type Scenario = 'main' | 'settle' | 'default';
type Spec = {
  code: string;
  scenario: Scenario;
  name: string;
  finance: number;
  term: number;
  monthly: number;
  repayments: number;
  investors: { name: string; amount: number }[];
};

const SPECS: Spec[] = [
  {
    code: '001', scenario: 'main', name: 'Dubai SME Delivery Fleet — Facility #001', finance: 150000, term: 24, monthly: 7000, repayments: 2,
    investors: [{ name: 'Fleet Investor A', amount: 60000 }, { name: 'Fleet Investor B', amount: 50000 }, { name: 'Fleet Investor C', amount: 40000 }],
  },
  {
    code: '002', scenario: 'settle', name: 'Early settlement test — Facility #002', finance: 3000, term: 6, monthly: 600, repayments: 1,
    investors: [{ name: 'Settle Investor A', amount: 2000 }, { name: 'Settle Investor B', amount: 1000 }],
  },
  {
    code: '003', scenario: 'default', name: 'Default and recovery test — Facility #003', finance: 3000, term: 6, monthly: 600, repayments: 1,
    investors: [{ name: 'Default Investor A', amount: 2000 }, { name: 'Default Investor B', amount: 1000 }],
  },
];

const password = 'Fleet-test-123';
const report: Record<string, unknown>[] = [];
const log = (step: string, detail: Record<string, unknown> = {}) => {
  console.log(`[${step}]`, JSON.stringify(detail));
  report.push({ step, ...detail });
};

async function user(email: string, name: string, role: string, companyId?: string) {
  const passwordHash = await bcrypt.hash(password, 10);
  return prisma.user.upsert({
    where: { email },
    update: { name, accountStatus: 'ACTIVE' },
    create: { email, name, role, passwordHash, companyId, accountStatus: 'ACTIVE', country: 'AE', residency: 'AE', investorType: role === 'INVESTOR' ? 'INDIVIDUAL' : null, phone: '+971500000001' },
  });
}

async function verify(subjectType: 'INDIVIDUAL' | 'COMPANY', subjectId: string) {
  await prisma.complianceCase.upsert({
    where: { subjectType_subjectId: { subjectType, subjectId } },
    update: { status: 'VERIFIED', provider: 'SUMSUB' },
    create: { subjectType, subjectId, status: 'VERIFIED', provider: 'SUMSUB' },
  });
}

async function run(spec: Spec, admin: { id: string }) {
  const tag = `${spec.code}`;
  const company = await prisma.company.upsert({
    where: { tradeLicenseNo: `FLEET-${tag}-DED` },
    update: {},
    create: { tradeLicenseNo: `FLEET-${tag}-DED`, legalName: `Dubai SME Fleet ${tag} LLC`, emirate: 'Dubai', industry: 'Logistics', establishedDate: new Date('2020-01-01'), contactEmail: `fleet${tag}-sme@vartola.test`, contactPhone: '+971500000001', address: 'Dubai' },
  });
  const sme = await user(`fleet${tag}-sme@vartola.test`, `Fleet ${tag} SME`, 'SME', company.id);
  const application = await prisma.application.upsert({
    where: { applicationNo: `APP-FLEET-${tag}` },
    update: {},
    create: { applicationNo: `APP-FLEET-${tag}`, companyId: company.id, submittedBy: sme.id, assetType: 'CARGO_VAN', unitCount: 10, assetDescription: spec.name, assetValue: spec.finance * 1.2, smeContribution: spec.finance * 0.2, financeAmount: spec.finance, requestedTerm: spec.term, status: 'APPROVED' },
  });

  // Supplier is a real Testnet account with a VTAED trustline so the contract can pay it.
  const supplierKey = Keypair.random();
  await fundWithFriendbot(supplierKey.publicKey());
  await ensureVtaedTrustline(supplierKey);
  const supplier = await prisma.supplier.create({ data: { companyName: `Fleet Dealer ${tag} LLC`, payoutPublicKey: supplierKey.publicKey(), kybStatus: 'APPROVED', status: 'APPROVED' } });

  const facility = await prisma.facility.create({
    data: { facilityNo: `FAC-FLEET-${tag}`, applicationId: application.id, financeAmount: spec.finance, term: spec.term, monthlyPayment: spec.monthly, status: 'PENDING_FUNDING', supplierId: supplier.id, unitValue: 100, serviceFeeRate: 0.01, reserveRate: 0.005 },
  });
  for (let n = 1; n <= spec.term; n += 1) {
    await prisma.payment.create({ data: { facilityId: facility.id, paymentNo: n, dueDate: new Date(Date.now() + n * 30 * 86400000), amount: spec.monthly, status: 'SCHEDULED' } });
  }
  const pool = await prisma.pool.create({
    data: { poolNo: `POOL-FLEET-${tag}`, poolName: spec.name, targetAmount: spec.finance, minInvestment: 100, targetReturn: 0.12, status: 'OPEN', assetFocus: 'Delivery fleet', termMonths: spec.term },
  });
  await prisma.facility.update({ where: { id: facility.id }, data: { poolId: pool.id } });
  await ensureChecklists(facility.id);
  log('facility-created-db', { facility: spec.name, facilityId: facility.id, supplier: supplierKey.publicKey() });

  const smeWallet = await ensureEmbeddedWallet(sme.id);
  const reg = await registerWalletOnChain(sme.id);
  await verify('COMPANY', company.id);
  await syncComplianceOnChain(sme.id);
  log('sme-wallet-registered', { wallet: smeWallet.publicKey, status: reg.status });

  const created = await ensureFacilityOnChain(facility.id);
  log('facility-created-on-chain', { txHash: created.stellarTxHash });

  let units = 0;
  const investorRows: Record<string, unknown>[] = [];
  for (const [index, entry] of spec.investors.entries()) {
    const account = await user(`fleet${tag}-investor-${index + 1}@vartola.test`, entry.name, 'INVESTOR');
    const wallet = await ensureEmbeddedWallet(account.id);
    await payVtaed(wallet.publicKey, entry.amount);
    await registerWalletOnChain(account.id);
    await verify('INDIVIDUAL', account.id);
    await syncComplianceOnChain(account.id);
    const result = await subscribeAlpha({ investorId: account.id, investorName: entry.name, poolId: pool.id, amount: entry.amount });
    units += result.investment.participationUnits || 0;
    investorRows.push({ investor: entry.name, amount: entry.amount, units: result.investment.participationUnits, txHash: result.txHash });
    log('investor-reserved', { investor: entry.name, wallet: wallet.publicKey, amount: entry.amount, units: result.investment.participationUnits, txHash: result.txHash });
  }
  log('fully-funded', { totalUnits: units, expectedUnits: spec.finance / 100 });

  // Release conditions are verified by operations; the contract then releases escrow to the supplier only.
  await prisma.facilityReleaseCondition.updateMany({ where: { facilityId: facility.id }, data: { status: 'VERIFIED', verifiedAt: new Date() } });
  const release = await releaseFacilityFunds(facility.id, admin.id);
  log('supplier-released', { txHash: (release as { txHash?: string }).txHash });

  await prisma.facilityActivationCheck.updateMany({ where: { facilityId: facility.id }, data: { status: 'VERIFIED' } });
  await saveAssetPassport({ facilityId: facility.id, assetId: `FLEET-${tag}-VAN-01`, serial: `VIN-FLEET-${tag}`, assetType: 'CARGO_VAN', manufacturer: 'Fleet', model: 'Delivery', year: 2024, purchaseValue: spec.finance * 1.2, supplierName: `Fleet Dealer ${tag} LLC`, legalOwner: 'Subject to final legal structure', operatorName: company.legalName, insuranceStatus: 'VERIFIED', registrationStatus: 'VERIFIED', deliveryStatus: 'VERIFIED' }).catch((error) => log('passport-skipped', { reason: String(error) }));
  await activateFacility(facility.id, admin.id);
  log('activated', { status: (await prisma.facility.findUnique({ where: { id: facility.id } }))?.status });

  // The SME wallet needs VTAED to repay.
  const needed = spec.monthly * spec.repayments + (spec.scenario === 'settle' ? spec.finance : 0);
  await payVtaed(smeWallet.publicKey, needed);
  for (let n = 1; n <= spec.repayments; n += 1) {
    const payment = await recordRepayment(facility.id, admin.id, spec.monthly, `fleet-${tag}-pay-${n}`);
    log('repayment-distributed', { paymentNo: n, txHash: (payment as { stellarTxHash?: string | null }).stellarTxHash });
  }

  if (spec.scenario === 'settle') {
    const returned = (await prisma.facilityAllocation.findMany({ where: { facilityId: facility.id } })).reduce((sum, row) => sum + row.principalReturned, 0);
    const outstanding = spec.finance - returned;
    const due = outstanding + outstanding * 0.01;
    await settleEarly(facility.id, admin.id, Number(due.toFixed(2)));
    const closed = await prisma.facility.findUnique({ where: { id: facility.id } });
    log('early-settled', { outstanding, due, status: closed?.status, txHash: closed?.stellarTxHash });
  }

  if (spec.scenario === 'default') {
    for (const status of ['GRACE', 'LATE', 'DEFAULT_NOTICE', 'DEFAULTED', 'REPOSSESSION', 'ASSET_SALE']) {
      await markStatus(facility.id, admin.id, status, 'Fleet test default path');
      log('status', { status });
    }
    // The operations wallet collects the sale proceeds and deposits them into the contract.
    await payVtaed(roleKeypair('OPERATIONS').publicKey(), 2000);
    const recovery = await recordRecovery(facility.id, admin.id, 1800);
    log('recovered', { saleProceeds: 1800, txHash: (recovery as { txHash?: string }).txHash });
  }
  const final = await prisma.facility.findUnique({ where: { id: facility.id } });
  log('final', { facility: spec.name, status: final?.status, chainStatus: final?.chainStatus, investors: investorRows.length });
}

async function main() {
  if (process.env.APP_MODE !== 'ALPHA') throw new Error('Run with APP_MODE=ALPHA');
  if (!facilityContractId()) throw new Error('Deploy the contracts first');
  const only = process.argv[2];
  const admin = await user('fleet-ops@vartola.test', 'Fleet Operations', 'ADMIN');
  await setEnforceKyc(true);
  for (const spec of SPECS.filter((item) => !only || item.scenario === only || item.code === only)) {
    console.log(`\n=== ${spec.name} ===`);
    await run(spec, admin);
  }
  fs.writeFileSync('.alpha/fleet-report.json', JSON.stringify(report, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  fs.writeFileSync('.alpha/fleet-report.json', JSON.stringify(report, null, 2));
  process.exit(1);
}).finally(() => prisma.$disconnect());
