import { auth } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { formatAED, formatDate } from '@/lib/formatters';
import { stellarReviewUrl } from '@/lib/stellar/explorer';

export default async function InvestorActivityPage() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'INVESTOR') redirect('/login');

  const investments = await prisma.investment.findMany({
    where: { investorId: session.user.id },
    include: { pool: true, distributions: true },
    orderBy: { subscribedAt: 'desc' },
  });

  const rows = [
    ...investments.map((item) => ({
      id: `sub-${item.id}`,
      label: `Invested in ${item.pool.poolName.replace(/ Pool/g, '')}`,
      amount: item.amount,
      at: item.subscribedAt,
      review: stellarReviewUrl(item.stellarTxHash),
    })),
    ...investments.flatMap((item) => item.distributions.map((row) => ({
      id: row.id,
      label: `Income from ${item.pool.poolName.replace(/ Pool/g, '')}`,
      amount: row.amount,
      at: row.distributedAt,
      review: stellarReviewUrl(row.stellarTxHash),
    }))),
  ].sort((a, b) => b.at.getTime() - a.at.getTime());

  return (
    <DashboardLayout role="INVESTOR">
      <div className="w-full space-y-4">
        <h1 className="text-3xl font-semibold">Activity</h1>
        <p className="text-[#708078]">Investments and income.</p>
        <div className="space-y-2">
          {rows.map((row) => (
            <article key={row.id} className="flex items-center justify-between rounded-3xl bg-white px-5 py-4 shadow-sm">
              <div>
                <p className="font-medium">{row.label}</p>
                <p className="text-sm text-[#708078]">{formatDate(row.at)}</p>
                {row.review ? <a className="text-sm text-[#0A4934] underline" href={row.review} target="_blank" rel="noreferrer">Stellar reference</a> : <p className="text-sm text-[#708078]">Stellar reference pending</p>}
              </div>
              <p className="font-semibold">{formatAED(row.amount)}</p>
            </article>
          ))}
          {rows.length === 0 && <p className="rounded-3xl bg-white p-8 text-center text-[#708078] shadow-sm">No activity yet.</p>}
        </div>
      </div>
    </DashboardLayout>
  );
}
