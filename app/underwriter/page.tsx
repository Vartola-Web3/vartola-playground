import { auth } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { formatAED, formatDate } from '@/lib/formatters';
import Link from 'next/link';

export default async function UnderwriterDashboard() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'UNDERWRITER') redirect('/login');

  const start = new Date();
  start.setHours(0, 0, 0, 0);

  const [pending, missingDocs, completedToday] = await Promise.all([
    prisma.application.findMany({
      where: { status: { in: ['SUBMITTED', 'UNDER_REVIEW', 'CONDITIONALLY_APPROVED'] } },
      include: { company: true },
      orderBy: { createdAt: 'asc' },
    }),
    prisma.application.count({ where: { status: 'DOCUMENT_REQUESTED' } }).catch(() => 0),
    prisma.underwritingReview.count({
      where: { reviewedBy: session.user.id, reviewedAt: { gte: start }, decision: { in: ['APPROVED', 'REJECTED', 'CONDITIONALLY_APPROVED'] } },
    }),
  ]);

  const highRisk = pending.filter((app) => (app.dealRiskScore || 0) > 0 && (app.dealRiskScore || 100) < 55).length;

  return (
    <DashboardLayout role="UNDERWRITER">
      <div className="mx-auto max-w-5xl space-y-6">
        <div>
          <h1 className="text-3xl font-semibold">Reviews</h1>
          <p className="text-[#708078]">One decision at a time.</p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            ['Waiting for review', String(pending.length)],
            ['High risk reviews', String(highRisk)],
            ['Missing documents', String(missingDocs)],
            ['Completed today', String(completedToday)],
          ].map(([label, value]) => (
            <article key={label} className="rounded-3xl bg-white p-5 shadow-sm">
              <p className="text-sm text-[#708078]">{label}</p>
              <p className="mt-2 text-2xl font-semibold">{value}</p>
            </article>
          ))}
        </div>
        <section className="space-y-3">
          {pending.length === 0 && <p className="rounded-3xl bg-white p-8 text-center text-[#708078] shadow-sm">Nothing is waiting.</p>}
          {pending.map((app) => (
            <Link key={app.id} href={`/underwriter/applications/${app.id}`} className="block rounded-3xl bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold">{app.company.legalName}</h2>
                  <p className="text-sm text-[#708078]">{app.assetDescription} · {app.unitCount} units</p>
                  <p className="mt-2 font-medium">{formatAED(Number(app.financeAmount))}</p>
                </div>
                <div className="text-right text-sm">
                  <p className="rounded-full bg-[#EAF9F1] px-3 py-1 text-[#0A4934]">{app.riskTier?.replace(/_/g, ' ') || 'Unscored'}</p>
                  <p className="mt-2 text-[#708078]">{formatDate(app.createdAt)}</p>
                </div>
              </div>
            </Link>
          ))}
        </section>
      </div>
    </DashboardLayout>
  );
}
