import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create Admin User
  const adminPassword = await bcrypt.hash('admin123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@assetfi.ae' },
    update: {},
    create: {
      email: 'admin@assetfi.ae',
      passwordHash: adminPassword,
      name: 'System Admin',
      role: 'ADMIN',
      stellarPublicKey: 'GADMINEXAMPLE1234567890ADMINEXAMPLE',
    },
  });
  console.log('✅ Admin user created');

  // Create Underwriter User
  const underwriterPassword = await bcrypt.hash('underwriter123', 10);
  const underwriter = await prisma.user.upsert({
    where: { email: 'underwriter@assetfi.ae' },
    update: {},
    create: {
      email: 'underwriter@assetfi.ae',
      passwordHash: underwriterPassword,
      name: 'Senior Underwriter',
      role: 'UNDERWRITER',
      stellarPublicKey: 'GUNDERWRITEREXAMPLE1234567890UNDER',
    },
  });
  console.log('✅ Underwriter user created');

  // Create SME Company (Gulf Logistics LLC)
  const company = await prisma.company.upsert({
    where: { tradeLicenseNo: 'DED-123456-2021' },
    update: {},
    create: {
      tradeLicenseNo: 'DED-123456-2021',
      legalName: 'Gulf Logistics LLC',
      tradingName: 'Gulf Logistics',
      emirate: 'Dubai',
      industry: 'Logistics & Transportation',
      establishedDate: new Date('2021-01-15'),
      monthlyRevenue: 180000,
      monthlyExpenses: 140000,
      liabilities: 300000,
      contactEmail: 'info@gulflogistics.ae',
      contactPhone: '+971-4-1234567',
      address: 'Sheikh Zayed Road, Dubai, UAE',
      verifiedAt: new Date(),
      verifiedBy: admin.id,
    },
  });
  console.log('✅ Gulf Logistics LLC created');

  // Create SME User
  const smePassword = await bcrypt.hash('sme123', 10);
  const smeUser = await prisma.user.upsert({
    where: { email: 'ahmed@gulflogistics.ae' },
    update: {},
    create: {
      email: 'ahmed@gulflogistics.ae',
      passwordHash: smePassword,
      name: 'Ahmed Al-Mansoori',
      role: 'SME',
      companyId: company.id,
      stellarPublicKey: 'GSMEEXAMPLE1234567890SMEEXAMPLE123',
    },
  });
  console.log('✅ SME user created');

  // Create Investor Users
  const investor1Password = await bcrypt.hash('investor123', 10);
  const investor1 = await prisma.user.upsert({
    where: { email: 'khalid@investor.ae' },
    update: {},
    create: {
      email: 'khalid@investor.ae',
      passwordHash: investor1Password,
      name: 'Khalid Al-Fahim',
      role: 'INVESTOR',
      stellarPublicKey: 'GINVESTOR1EXAMPLE1234567890INV1',
    },
  });

  const investor2Password = await bcrypt.hash('investor123', 10);
  const investor2 = await prisma.user.upsert({
    where: { email: 'fatima@investor.ae' },
    update: {},
    create: {
      email: 'fatima@investor.ae',
      passwordHash: investor2Password,
      name: 'Fatima Al-Zahra',
      role: 'INVESTOR',
      stellarPublicKey: 'GINVESTOR2EXAMPLE1234567890INV2',
    },
  });

  const investor3Password = await bcrypt.hash('investor123', 10);
  const investor3 = await prisma.user.upsert({
    where: { email: 'mohammed@investor.ae' },
    update: {},
    create: {
      email: 'mohammed@investor.ae',
      passwordHash: investor3Password,
      name: 'Mohammed Al-Rashid',
      role: 'INVESTOR',
      stellarPublicKey: 'GINVESTOR3EXAMPLE1234567890INV3',
    },
  });
  console.log('✅ Investor users created');

  // Create Application (300K Truck)
  const application = await prisma.application.upsert({
    where: { applicationNo: 'APP-2024-001' },
    update: {},
    create: {
      applicationNo: 'APP-2024-001',
      companyId: company.id,
      submittedBy: smeUser.id,
      assetType: 'TRUCK',
      assetDescription: 'Isuzu NPR 75P 16FT Box Truck - Brand New',
      assetValue: 300000,
      smeContribution: 75000,
      financeAmount: 225000,
      requestedTerm: 36,
      status: 'APPROVED',
      companyRiskScore: 72,
      assetRiskScore: 84,
      dealRiskScore: 75,
      riskTier: 'TIER_B',
      approvedAt: new Date(),
      approvedBy: underwriter.id,
    },
  });
  console.log('✅ Application created');

  // Create Logistics Pool 001
  const pool = await prisma.pool.upsert({
    where: { poolNo: 'POOL-001' },
    update: {},
    create: {
      poolNo: 'POOL-001',
      poolName: 'Logistics Pool 001',
      targetAmount: 500000,
      raisedAmount: 225000,
      minInvestment: 25000,
      targetReturn: 9.5,
      status: 'ACTIVE',
      assetFocus: 'UAE Commercial Trucks & Vans',
      stellarTxHash: 'SIMULATED_POOL_TX_' + Date.now(),
      stellarPoolId: 'POOL_STELLAR_' + Date.now(),
      openedAt: new Date(),
    },
  });
  console.log('✅ Logistics Pool 001 created');

  // Create Facility
  const facility = await prisma.facility.upsert({
    where: { facilityNo: 'FAC-2024-001' },
    update: {},
    create: {
      facilityNo: 'FAC-2024-001',
      applicationId: application.id,
      poolId: pool.id,
      financeAmount: 225000,
      term: 36,
      monthlyPayment: 7020,
      status: 'ACTIVE',
      stellarTxHash: 'SIMULATED_FACILITY_TX_' + Date.now(),
      stellarAssetId: 'ASSET_STELLAR_' + Date.now(),
      activatedAt: new Date(),
      maturityDate: new Date(new Date().setMonth(new Date().getMonth() + 36)),
    },
  });
  console.log('✅ Facility created');

  // Create Investments
  const investment1 = await prisma.investment.create({
    data: {
      investorId: investor1.id,
      poolId: pool.id,
      amount: 100000,
      shares: 100000,
      status: 'ACTIVE',
      stellarTxHash: 'SIMULATED_INV1_TX_' + Date.now(),
      activatedAt: new Date(),
    },
  });

  const investment2 = await prisma.investment.create({
    data: {
      investorId: investor2.id,
      poolId: pool.id,
      amount: 75000,
      shares: 75000,
      status: 'ACTIVE',
      stellarTxHash: 'SIMULATED_INV2_TX_' + Date.now(),
      activatedAt: new Date(),
    },
  });

  const investment3 = await prisma.investment.create({
    data: {
      investorId: investor3.id,
      poolId: pool.id,
      amount: 50000,
      shares: 50000,
      status: 'ACTIVE',
      stellarTxHash: 'SIMULATED_INV3_TX_' + Date.now(),
      activatedAt: new Date(),
    },
  });
  console.log('✅ Investments created');

  // Create Payment Schedule (3 payments: 1 paid, 2 upcoming)
  const payment1 = await prisma.payment.create({
    data: {
      facilityId: facility.id,
      paymentNo: 1,
      dueDate: new Date(new Date().setMonth(new Date().getMonth() - 1)),
      amount: 7020,
      paidAt: new Date(new Date().setMonth(new Date().getMonth() - 1)),
      paidAmount: 7020,
      status: 'PAID',
      stellarTxHash: 'SIMULATED_PAYMENT1_TX_' + Date.now(),
    },
  });

  const payment2 = await prisma.payment.create({
    data: {
      facilityId: facility.id,
      paymentNo: 2,
      dueDate: new Date(),
      amount: 7020,
      status: 'SCHEDULED',
    },
  });

  const payment3 = await prisma.payment.create({
    data: {
      facilityId: facility.id,
      paymentNo: 3,
      dueDate: new Date(new Date().setMonth(new Date().getMonth() + 1)),
      amount: 7020,
      status: 'SCHEDULED',
    },
  });
  console.log('✅ Payment schedule created');

  // Create Distributions for Payment 1
  const dist1 = await prisma.distribution.create({
    data: {
      investmentId: investment1.id,
      paymentId: payment1.id,
      amount: 3120, // (100000/225000) * 7020
      stellarTxHash: 'SIMULATED_DIST1_TX_' + Date.now(),
      distributedAt: payment1.paidAt!,
    },
  });

  const dist2 = await prisma.distribution.create({
    data: {
      investmentId: investment2.id,
      paymentId: payment1.id,
      amount: 2340, // (75000/225000) * 7020
      stellarTxHash: 'SIMULATED_DIST2_TX_' + Date.now(),
      distributedAt: payment1.paidAt!,
    },
  });

  const dist3 = await prisma.distribution.create({
    data: {
      investmentId: investment3.id,
      paymentId: payment1.id,
      amount: 1560, // (50000/225000) * 7020
      stellarTxHash: 'SIMULATED_DIST3_TX_' + Date.now(),
      distributedAt: payment1.paidAt!,
    },
  });
  console.log('✅ Distributions created');

  // Create Audit Logs
  await prisma.auditLog.create({
    data: {
      userId: admin.id,
      action: 'CREATE_POOL',
      entityType: 'Pool',
      entityId: pool.id,
      changes: JSON.stringify({ poolNo: 'POOL-001', status: 'ACTIVE' }),
      ipAddress: '127.0.0.1',
      userAgent: 'AssetFi Seed Script',
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: underwriter.id,
      action: 'APPROVE_APPLICATION',
      entityType: 'Application',
      entityId: application.id,
      changes: JSON.stringify({ status: 'APPROVED', tier: 'TIER_B' }),
      ipAddress: '127.0.0.1',
      userAgent: 'AssetFi Seed Script',
    },
  });
  console.log('✅ Audit logs created');

  console.log('');
  console.log('🎉 Database seeding completed!');
  console.log('');
  console.log('📝 Demo Credentials:');
  console.log('   Admin:        admin@assetfi.ae / admin123');
  console.log('   Underwriter:  underwriter@assetfi.ae / underwriter123');
  console.log('   SME:          ahmed@gulflogistics.ae / sme123');
  console.log('   Investor 1:   khalid@investor.ae / investor123');
  console.log('   Investor 2:   fatima@investor.ae / investor123');
  console.log('   Investor 3:   mohammed@investor.ae / investor123');
  console.log('');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
