import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

const demoPassword = 'demo123';

const companies = [
  {
    key: 'VTL-DXB-240781', legalName: 'Falcon Route Logistics LLC', tradingName: 'Falcon Route',
    emirate: 'Dubai', industry: 'Last-mile delivery', established: '2019-04-18', revenue: 285000, expenses: 204000,
    contact: 'layla@falconroute.demo', owner: 'Layla Al Marri', address: 'Ras Al Khor Industrial Area, Dubai',
    applicationNo: 'APP-VTL-1001', facilityNo: 'FAC-VTL-1001', assetType: 'MOTORCYCLE', units: 10,
    asset: '10 Yamaha NMAX 155 delivery motorcycles with insulated cargo boxes', value: 180000, contribution: 45000,
    finance: 135000, term: 24, monthly: 6385, poolNo: 'POOL-VTL-101', poolName: 'Dubai Last-Mile Fleet',
    focus: 'Delivery motorcycles', fleetType: 'MOTORCYCLES', yield: 10.8, risk: 78, rating: 'B+',
  },
  {
    key: 'VTL-AUH-190442', legalName: 'Desert Mile Delivery Services LLC', tradingName: 'Desert Mile',
    emirate: 'Abu Dhabi', industry: 'E-commerce fulfilment', established: '2018-09-02', revenue: 410000, expenses: 298000,
    contact: 'omar@desertmile.demo', owner: 'Omar Al Nuaimi', address: 'Mussafah M-40, Abu Dhabi',
    applicationNo: 'APP-VTL-1002', facilityNo: 'FAC-VTL-1002', assetType: 'VAN', units: 3,
    asset: '3 Toyota Hiace high-roof cargo vans, 2026 model', value: 480000, contribution: 120000,
    finance: 360000, term: 30, monthly: 13560, poolNo: 'POOL-VTL-102', poolName: 'Abu Dhabi Cargo Vans',
    focus: 'Commercial cargo vans', fleetType: 'VANS', yield: 9.6, risk: 84, rating: 'A-',
  },
  {
    key: 'VTL-SHJ-220916', legalName: 'Harbour Cold Chain Transport LLC', tradingName: 'Harbour Cold Chain',
    emirate: 'Sharjah', industry: 'Temperature-controlled logistics', established: '2020-02-11', revenue: 530000, expenses: 386000,
    contact: 'noor@harbourcoldchain.demo', owner: 'Noor Al Suwaidi', address: 'Sharjah Industrial Area 10, Sharjah',
    applicationNo: 'APP-VTL-1003', facilityNo: 'FAC-VTL-1003', assetType: 'TRUCK', units: 2,
    asset: '2 Isuzu NQR refrigerated trucks with Carrier cooling units', value: 650000, contribution: 162500,
    finance: 487500, term: 36, monthly: 15795, poolNo: 'POOL-VTL-103', poolName: 'Cold Chain Expansion',
    focus: 'Refrigerated trucks', fleetType: 'SMALL_TRUCKS', yield: 11.2, risk: 75, rating: 'B+',
  },
];

async function upsertWallet(ownerType: string, ownerId: string, label: string, available: number) {
  return prisma.simWallet.upsert({
    where: { ownerType_ownerId: { ownerType, ownerId } },
    update: { label },
    create: { ownerType, ownerId, label, available, currency: 'tAED' },
  });
}

async function main() {
  const passwordHash = await bcrypt.hash(demoPassword, 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@assetfi.ae' },
    update: { name: 'Vartola Admin', role: 'ADMIN', passwordHash },
    create: { email: 'admin@assetfi.ae', passwordHash, name: 'Vartola Admin', role: 'ADMIN' },
  });

  const underwriter = await prisma.user.upsert({
    where: { email: 'underwriter@assetfi.ae' },
    update: { name: 'Mariam — Senior Underwriter', role: 'UNDERWRITER', passwordHash },
    create: { email: 'underwriter@assetfi.ae', passwordHash, name: 'Mariam — Senior Underwriter', role: 'UNDERWRITER' },
  });
  await prisma.user.upsert({
    where: { email: 'operations@vartola.demo' },
    update: { name: 'Operations Admin', role: 'ADMIN_REVIEWER', passwordHash },
    create: { email: 'operations@vartola.demo', passwordHash, name: 'Operations Admin', role: 'ADMIN_REVIEWER' },
  });

  for (const item of companies) {
    const company = await prisma.company.upsert({
      where: { tradeLicenseNo: item.key },
      update: {
        legalName: item.legalName, tradingName: item.tradingName, monthlyRevenue: item.revenue,
        monthlyExpenses: item.expenses, verifiedAt: new Date(), verifiedBy: admin.id,
      },
      create: {
        tradeLicenseNo: item.key, legalName: item.legalName, tradingName: item.tradingName,
        emirate: item.emirate, industry: item.industry, establishedDate: new Date(item.established),
        monthlyRevenue: item.revenue, monthlyExpenses: item.expenses, liabilities: item.finance * 0.18,
        contactEmail: item.contact, contactPhone: '+971 50 555 0101', address: item.address,
        verifiedAt: new Date(), verifiedBy: admin.id,
      },
    });

    const sme = await prisma.user.upsert({
      where: { email: item.contact },
      update: { name: item.owner, companyId: company.id, role: 'SME', passwordHash },
      create: { email: item.contact, passwordHash, name: item.owner, role: 'SME', companyId: company.id },
    });
    await upsertWallet('SME', sme.id, item.tradingName, 50000);

    const application = await prisma.application.upsert({
      where: { applicationNo: item.applicationNo },
      update: {
        companyId: company.id, submittedBy: sme.id, assetDescription: item.asset, unitCount: item.units,
        assetValue: item.value, smeContribution: item.contribution, financeAmount: item.finance,
      },
      create: {
        applicationNo: item.applicationNo, companyId: company.id, submittedBy: sme.id,
        assetType: item.assetType, unitCount: item.units, assetDescription: item.asset,
        assetValue: item.value, smeContribution: item.contribution, financeAmount: item.finance,
        requestedTerm: item.term, status: 'APPROVED', companyRiskScore: item.risk,
        assetRiskScore: item.risk + 3, dealRiskScore: item.risk, riskTier: `TIER_${item.rating[0]}`,
        approvedAt: new Date(), approvedBy: underwriter.id,
      },
    });

    const pool = await prisma.pool.upsert({
      where: { poolNo: item.poolNo },
      update: {
        poolName: item.poolName, targetAmount: item.finance, minInvestment: 25000,
        targetReturn: item.yield, status: 'OPEN', assetFocus: item.focus, fleetType: item.fleetType,
        riskScore: item.risk, riskRating: item.rating, termMonths: item.term,
        raisedAmount: 0, stellarPoolId: null, stellarTxHash: null,
      },
      create: {
        poolNo: item.poolNo, poolName: item.poolName, targetAmount: item.finance, raisedAmount: 0,
        minInvestment: 25000, targetReturn: item.yield, status: 'OPEN', assetFocus: item.focus,
        description: `${item.units} productive vehicles operated by ${item.tradingName} in ${item.emirate}.`,
        fleetType: item.fleetType, riskScore: item.risk, riskRating: item.rating,
        termMonths: item.term, openedAt: new Date(), stellarPoolId: null, stellarTxHash: null,
      },
    });

    await prisma.facility.upsert({
      where: { facilityNo: item.facilityNo },
      update: {
        applicationId: application.id, poolId: pool.id, financeAmount: item.finance,
        term: item.term, monthlyPayment: item.monthly, status: 'PENDING_FUNDING',
        leaseYield: item.yield, riskScore: item.risk, riskTier: item.rating,
        fundedAmount: 0, stellarTxHash: null, stellarAssetId: null,
      },
      create: {
        facilityNo: item.facilityNo, applicationId: application.id, poolId: pool.id,
        financeAmount: item.finance, term: item.term, monthlyPayment: item.monthly,
        status: 'PENDING_FUNDING', leaseYield: item.yield, riskScore: item.risk, riskTier: item.rating,
      },
    });
  }

  const investors = [
    ['khalid@investor.ae', 'Khalid Al Fahim', 300000],
    ['fatima@investor.ae', 'Fatima Al Zahra', 225000],
    ['mohammed@investor.ae', 'Mohammed Al Rashid', 175000],
    ['sara@investor.demo', 'Sara Al Hashimi', 400000],
  ] as const;
  for (const [email, name, balance] of investors) {
    const investor = await prisma.user.upsert({
      where: { email },
      update: { name, role: 'INVESTOR', passwordHash },
      create: { email, passwordHash, name, role: 'INVESTOR' },
    });
    await upsertWallet('INVESTOR', investor.id, name, balance);
  }

  console.log('Realistic Vartola demo data is ready. All demo users use demo123.');
}

main().finally(() => prisma.$disconnect());
