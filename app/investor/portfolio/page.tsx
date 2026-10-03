import { auth } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import DashboardLayout from '@/components/layout/dashboard-layout';
import Link from 'next/link';
import { InvestorPerformanceChart } from '@/components/analytics/finance-charts';
import { stellarReviewUrl } from '@/lib/stellar/explorer';

export default async function PortfolioPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'INVESTOR') redirect('/login');

  const investments = await prisma.investment.findMany({
    where: { investorId: session.user.id },
    include: { pool: true, allocations: { include: { facility: true } } },
    orderBy: { subscribedAt: 'desc' },
  });

  const reserved = investments.reduce((sum, item) => sum + item.reservedAmount, 0);
  const deployed = investments.reduce((sum, item) => sum + item.deployedAmount, 0);
  const income = investments.reduce((sum, item) => sum + item.leaseIncomeReceived, 0);
  const wallet = await prisma.simWallet.findUnique({ where: { ownerType_ownerId: { ownerType: 'INVESTOR', ownerId: session.user.id } } });
  const distributions = await prisma.distribution.findMany({
    where: { investment: { investorId: session.user.id }, status: 'CONFIRMED' },
    select: { id: true, distributedAt: true, amount: true, principalAmount: true, leaseIncomeAmount: true, stellarTxHash: true },
    orderBy: { distributedAt: 'asc' },
  });
  const principalReturned = investments.reduce((sum, item) => sum + item.principalReturned, 0);
  let cumulativePrincipal = 0;
  let cumulativeIncome = 0;
  const monthly = new Map<string, { primary: number; secondary: number }>();
  for (const distribution of distributions) {
    const key = distribution.distributedAt.toLocaleDateString('en-AE', { month: 'short', year: '2-digit' });
    const row = monthly.get(key) || { primary: 0, secondary: 0 };
    cumulativePrincipal += distribution.principalAmount;
    cumulativeIncome += distribution.leaseIncomeAmount;
    row.primary = cumulativePrincipal;
    row.secondary = cumulativeIncome;
    monthly.set(key, row);
  }
  const chartData = Array.from(monthly, ([label, values]) => ({ label, ...values }));

  return (
    <DashboardLayout role={session.user.role}>
      <div className="mx-auto max-w-5xl space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-3xl font-semibold">My portfolio</h1>
          <p className="mt-1 text-sm text-[#708078]">Available to reinvest {wallet ? wallet.available.toLocaleString() : '0'} AED. Reserved amounts earn no lease income until the vehicles are deployed.</p>
        </div>
        <Link href="/marketplace" className="rounded-full bg-[#15C77A] px-4 py-2 text-sm font-semibold text-white">Invest</Link>
      </div>
      <div className="grid gap-3 sm:grid-cols-4">
        <div className="rounded-3xl bg-white p-5 shadow-sm"><p className="text-sm text-[#708078]">Reserved</p><p className="mt-2 text-2xl font-semibold">{reserved.toLocaleString()} AED</p></div>
        <div className="rounded-3xl bg-white p-5 shadow-sm"><p className="text-sm text-[#708078]">Deployed</p><p className="mt-2 text-2xl font-semibold">{deployed.toLocaleString()} AED</p></div>
        <div className="rounded-3xl bg-white p-5 shadow-sm"><p className="text-sm text-[#708078]">Income received</p><p className="mt-2 text-2xl font-semibold">{income.toLocaleString()} AED</p></div>
        <div className="rounded-3xl bg-white p-5 shadow-sm"><p className="text-sm text-[#708078]">Principal returned</p><p className="mt-2 text-2xl font-semibold">{principalReturned.toLocaleString()} AED</p></div>
      </div>
      <section className="rounded-3xl bg-white p-5 shadow-sm">
        <h2 className="font-semibold">Returns over time</h2>
        <p className="mt-1 text-sm text-[#708078]">Cumulative principal and lease income confirmed by the distribution ledger.</p>
        <div className="mt-4"><InvestorPerformanceChart data={chartData}/></div>
      </section>
      <section className="rounded-3xl bg-white p-5 shadow-sm">
        <h2 className="font-semibold">Profit distributions</h2>
        <div className="mt-3 space-y-2 text-sm">
          {[...distributions].reverse().map((distribution) => (
            <div key={distribution.id} className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-[#E5ECE8] px-3 py-2">
              <span>{distribution.distributedAt.toLocaleDateString()} · {distribution.amount.toLocaleString()} AED · income {distribution.leaseIncomeAmount.toLocaleString()}</span>
              {stellarReviewUrl(distribution.stellarTxHash) ? <a className="font-medium text-[#0A4934] underline" href={stellarReviewUrl(distribution.stellarTxHash)!} target="_blank" rel="noreferrer">Stellar reference</a> : <span className="text-[#708078]">Stellar reference pending</span>}
            </div>
          ))}
          {distributions.length === 0 && <p className="text-[#708078]">Distributions appear after an installment is paid.</p>}
        </div>
      </section>
      <div className="mt-6 space-y-3">
        {investments.map((investment) => (
          <article key={investment.id} className="rounded-3xl bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">{investment.pool.poolName.replace(/ Pool/g, '')}</h2>
              <span className="rounded-full bg-[#ECFBF3] px-3 py-1 text-sm text-[#0D4D35]">{investment.pool.riskRating || investment.status}</span>
            </div>
            <p className="mt-3 text-sm text-[#62736C]">Your investment {investment.amount.toLocaleString()} AED · deployed {investment.deployedAmount.toLocaleString()} · reserved {investment.reservedAmount.toLocaleString()} · income {investment.leaseIncomeReceived.toLocaleString()}</p>
            <Link href={`/marketplace/pools/${investment.poolId}`} className="mt-3 inline-block text-sm font-medium text-[#0D4D35]">View investment</Link>
          </article>
        ))}
        {investments.length === 0 && <p className="text-[#62736C]">No investments yet.</p>}
      </div>
      </div>
    </DashboardLayout>
  );
}
