import { auth } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { formatAED, formatDate } from '@/lib/formatters';
import { countsFromAssetTypes, fleetImage, getFleetVisualType } from '@/lib/fleet-visual';
import Link from 'next/link';

export default async function InvestorDashboard() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'INVESTOR') redirect('/login');

  const [investments, opportunities, wallet] = await Promise.all([
    prisma.investment.findMany({
      where: { investorId: session.user.id },
      include: {
        pool: { include: { facilities: { include: { application: true, payments: { where: { status: { in: ['SCHEDULED', 'LATE'] } }, orderBy: { dueDate: 'asc' }, take: 1 } } } } },
        distributions: true,
      },
      orderBy: { subscribedAt: 'desc' },
      take: 3,
    }),
    prisma.pool.findMany({
      where: { status: { in: ['OPEN', 'FUNDING', 'ACTIVE'] } },
      include: { facilities: { include: { application: true } } },
      orderBy: { createdAt: 'desc' },
      take: 3,
    }),
    prisma.simWallet.findUnique({ where: { ownerType_ownerId: { ownerType: 'INVESTOR', ownerId: session.user.id } } }),
  ]);

  const invested = investments.reduce((sum, item) => sum + item.amount, 0);
  const income = investments.reduce((sum, item) => sum + item.leaseIncomeReceived, 0);
  const nextDistribution = investments
    .flatMap((item) => item.pool.facilities.flatMap((facility) => facility.payments.map((payment) => ({ payment, name: item.pool.poolName }))))
    .sort((a, b) => a.payment.dueDate.getTime() - b.payment.dueDate.getTime())[0];
  const firstName = session.user.name?.split(' ')[0] || 'there';
  const chartEnd = income > 0 ? 36 : 78;

  return (
    <DashboardLayout role="INVESTOR">
      <div className="mx-auto max-w-6xl space-y-8">
        <div>
          <h1 className="text-3xl font-semibold">Welcome back, {firstName}</h1>
          <p className="mt-1 text-[#708078]">Build wealth through real fleet investments in the UAE.</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            ['Available cash', formatAED(wallet?.available || 0)],
            ['Total invested', formatAED(invested)],
            ['Total income', formatAED(income)],
            ['Active investments', String(investments.length)],
          ].map(([label, value]) => (
            <article key={label} className="rounded-2xl border border-[#E5ECE8] bg-white p-5 shadow-sm">
              <p className="text-sm text-[#708078]">{label}</p>
              <p className="mt-3 text-3xl font-semibold tracking-tight">{value}</p>
            </article>
          ))}
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.6fr_0.8fr]">
          <section className="rounded-2xl border border-[#E5ECE8] bg-white p-6 shadow-sm">
            <h2 className="font-semibold">Portfolio performance</h2>
            <p className="text-sm text-[#708078]">Total value of your investments</p>
            <svg viewBox="0 0 480 150" className="mt-4 h-40 w-full">
              <path d={`M0 120 C120 116 200 100 280 88 S400 ${chartEnd + 8} 470 ${chartEnd}`} fill="none" stroke="#15C77A" strokeWidth="3" />
              <path d={`M0 120 C120 116 200 100 280 88 S400 ${chartEnd + 8} 470 ${chartEnd} V150 H0 Z`} fill="#EAF9F1" opacity="0.9" />
              <circle cx="470" cy={chartEnd} r="5" fill="#15C77A" />
            </svg>
            <p className="text-right text-sm font-medium text-[#0A4934]">{formatAED(invested + income)}</p>
          </section>
          <section className="flex flex-col justify-between rounded-2xl border border-[#E5ECE8] bg-white p-6 shadow-sm">
            <div>
              <p className="text-sm text-[#708078]">Next distribution</p>
              <p className="mt-3 text-3xl font-semibold">{nextDistribution ? formatAED(nextDistribution.payment.amount) : '—'}</p>
              <p className="mt-2 text-sm text-[#708078]">
                {nextDistribution ? `${formatDate(nextDistribution.payment.dueDate)} · ${nextDistribution.name.replace(/ Pool/g, '')}` : 'Nothing scheduled'}
              </p>
            </div>
          </section>
        </div>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">My investments</h2>
            <Link href="/investor/portfolio" className="text-sm text-[#0A4934]">View portfolio</Link>
          </div>
          <div className="grid gap-4 lg:grid-cols-2">
            {investments.map((item) => {
              const types = item.pool.facilities.map((facility) => facility.application.assetType);
              const image = fleetImage(getFleetVisualType(countsFromAssetTypes(types)), 'card');
              const next = item.pool.facilities.flatMap((facility) => facility.payments)[0];
              return (
                <Link key={item.id} href={`/marketplace/pools/${item.poolId}`} className="overflow-hidden rounded-2xl border border-[#E5ECE8] bg-white shadow-sm">
                  <img src={image} alt="" className="h-40 w-full object-cover" />
                  <div className="space-y-3 p-5">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="text-lg font-semibold">{item.pool.poolName.replace(/ Pool/g, '')}</h3>
                      <span className="rounded-full bg-[#EAF9F1] px-2.5 py-1 text-xs font-medium text-[#0A4934]">{item.pool.riskRating || 'B'}</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <p><span className="block text-[#708078]">Invested</span>{formatAED(item.amount)}</p>
                      <p><span className="block text-[#708078]">Income</span>{formatAED(item.leaseIncomeReceived)}</p>
                      <p><span className="block text-[#708078]">Next payment</span>{next ? formatDate(next.dueDate) : '—'}</p>
                      <p><span className="block text-[#708078]">Status</span>{item.status === 'ACTIVE' ? 'Active' : 'Reserved'}</p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </section>

        <section>
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Discover investments</h2>
            <Link href="/marketplace" className="text-sm text-[#0A4934]">View all</Link>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            {opportunities.map((pool) => {
              const types = pool.facilities.map((facility) => facility.application.assetType);
              const image = fleetImage(getFleetVisualType(countsFromAssetTypes(types)), 'card');
              return (
                <article key={pool.id} className="overflow-hidden rounded-2xl border border-[#E5ECE8] bg-white shadow-sm">
                  <img src={image} alt="" className="h-36 w-full object-cover" />
                  <div className="p-4">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-semibold">{pool.poolName.replace(/ Pool/g, '')}</h3>
                      <span className="text-sm text-[#0A4934]">{pool.riskRating || 'B'}</span>
                    </div>
                    <p className="mt-2 text-sm text-[#708078]">{pool.targetReturn}% · {pool.termMonths || '—'} months</p>
                    <p className="mt-1 text-sm text-[#708078]">Minimum {formatAED(pool.minInvestment)}</p>
                    <div className="mt-4 flex gap-2">
                      <Link href={`/marketplace?invest=${pool.id}`} className="rounded-full bg-[#15C77A] px-3 py-1.5 text-sm font-semibold text-white">Invest now</Link>
                      <Link href={`/marketplace/pools/${pool.id}`} className="rounded-full border border-[#E5ECE8] px-3 py-1.5 text-sm">View details</Link>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
