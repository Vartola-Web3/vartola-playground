import { auth } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { formatDateTime } from '@/lib/formatters';
import Link from 'next/link';

export default async function AdminDashboard() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'ADMIN') redirect('/login');

  const [pending, awaiting, late, active, recent] = await Promise.all([
    prisma.application.count({ where: { status: { in: ['SUBMITTED', 'UNDER_REVIEW', 'CONDITIONALLY_APPROVED'] } } }),
    prisma.facility.count({ where: { status: { in: ['APPROVED', 'FUNDED', 'RELEASED'] } } }),
    prisma.payment.count({ where: { status: 'LATE' } }),
    prisma.pool.count({ where: { status: { in: ['OPEN', 'FUNDING', 'ACTIVE', 'FULLY_FUNDED'] } } }),
    prisma.auditLog.findMany({ take: 5, orderBy: { createdAt: 'desc' }, include: { user: true } }),
  ]);

  return (
    <DashboardLayout role="ADMIN">
      <div className="mx-auto max-w-5xl space-y-6">
        <div className="flex items-end justify-between">
          <div>
            <h1 className="text-3xl font-semibold">Operations</h1>
            <p className="text-[#708078]">What needs attention today.</p>
          </div>
          <Link href="/admin/pools" className="rounded-full bg-[#15C77A] px-4 py-2 text-sm font-semibold text-white">Opportunities</Link>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            ['Applications pending', String(pending), '/admin/users'],
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
