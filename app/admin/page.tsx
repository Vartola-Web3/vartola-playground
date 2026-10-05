import { auth } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { formatDateTime } from '@/lib/formatters';
import Link from 'next/link';
import { isAdminOperator } from '@/lib/auth/roles';
import { AdminFinanceChart } from '@/components/analytics/finance-charts';

export default async function AdminDashboard() {
  const session = await auth();
  if (!session?.user || !isAdminOperator(session.user.role)) redirect('/login');

  const [pending, awaiting, late, active, recent, facilities, paidPayments, chainProofs] = await Promise.all([
    prisma.application.count({ where: { status: { in: ['SUBMITTED', 'UNDER_REVIEW', 'CONDITIONALLY_APPROVED'] } } }),
    prisma.facility.count({ where: { status: { in: ['PENDING_FUNDING', 'APPROVED', 'FUNDED', 'RELEASED'] } } }),
    prisma.payment.count({ where: { status: 'LATE' } }),
    prisma.pool.count({ where: { status: { in: ['OPEN', 'FUNDING', 'ACTIVE', 'FULLY_FUNDED'] } } }),
    prisma.auditLog.findMany({ take: 5, orderBy: { createdAt: 'desc' }, include: { user: true } }),
    prisma.facility.findMany({ select: { financeAmount: true } }),
    prisma.payment.findMany({ where: { status: 'PAID' }, select: { paidAmount: true, principalComponent: true, serviceFee: true, paidAt: true } }),
    prisma.stellarTransaction.count({ where: { status: 'CONFIRMED' } }),
  ]);

  const financed = facilities.reduce((sum, item) => sum + item.financeAmount, 0);
  const principalCollected = paidPayments.reduce((sum, item) => sum + item.principalComponent, 0);
  const outstanding = Math.max(0, financed - principalCollected);
  const platformFees = paidPayments.reduce((sum, item) => sum + item.serviceFee, 0);
  const monthly = new Map<string, { primary: number; secondary: number }>();
  for (const payment of paidPayments) {
    const date = payment.paidAt || new Date();
    const key = date.toLocaleDateString('en-AE', { month: 'short', year: '2-digit' });
    const row = monthly.get(key) || { primary: 0, secondary: 0 };
    row.primary += payment.paidAmount || payment.principalComponent;
    row.secondary += payment.serviceFee;
    monthly.set(key, row);
  }
  const chartData = Array.from(monthly, ([label, values]) => ({ label, ...values }));

  return (
    <DashboardLayout role={session.user.role}>
      <div className="w-full space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Operations</h1>
            <p className="text-[#708078]">What needs attention today.</p>
          </div>
          <Link href="/admin/pools" className="rounded-full bg-[#15C77A] px-4 py-2 text-sm font-semibold text-white">Opportunities</Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            ['Applications pending', String(pending), '/admin/applications'],
            ['Facilities awaiting release', String(awaiting), '/admin/pools'],
            ['Payments late', String(late), '/admin/simulation'],
            ['Active investments', String(active), '/admin/pools'],
          ].map(([label, value, href]) => (
            <Link key={label} href={href} className="rounded-3xl border-l-4 border-[#15C77A] bg-white p-5 shadow-sm">
              <p className="text-sm text-[#708078]">{label}</p>
              <p className="mt-2 text-2xl font-semibold">{value}</p>
            </Link>
          ))}
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            ['Total financed', `${financed.toLocaleString()} AED`],
            ['Outstanding principal', `${outstanding.toLocaleString()} AED`],
            ['Recorded platform fees', `${platformFees.toLocaleString()} AED`],
            ['Confirmed Testnet proofs', String(chainProofs)],
          ].map(([label, value]) => <div key={label} className="rounded-3xl bg-white p-5 shadow-sm"><p className="text-sm text-[#708078]">{label}</p><p className="mt-2 text-xl font-semibold">{value}</p></div>)}
        </div>
        <section className="rounded-3xl bg-white p-5 shadow-sm">
          <div className="flex flex-wrap items-end justify-between gap-2"><div><h2 className="font-semibold">Collections and platform revenue</h2><p className="text-sm text-[#708078]">Paid installments only; fees are the servicing fees recorded in the ledger.</p></div><Link href="/admin/blockchain" className="text-sm font-medium text-[#0D7A52]">View on-chain evidence</Link></div>
          <div className="mt-4"><AdminFinanceChart data={chartData}/></div>
        </section>
        <section className="rounded-3xl bg-white p-5 shadow-sm">
          <h2 className="font-semibold">Recent actions</h2>
          <div className="mt-3 space-y-2">
            {recent.map((log) => (
              <div key={log.id} className="flex justify-between gap-3 text-sm">
                <span>{log.user?.name || 'System'} · {log.action.replace(/_/g, ' ')}</span>
                <span className="text-[#708078]">{formatDateTime(log.createdAt)}</span>
              </div>
            ))}
            {recent.length === 0 && <p className="text-sm text-[#708078]">No recent actions.</p>}
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
