import { auth } from '@/lib/auth/auth';

export const dynamic = 'force-dynamic';
export const revalidate = 0;
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

  const [pending, missingDocs, completedToday, recentCompleted] = await Promise.all([
    prisma.application.findMany({
      where: { status: { in: ['SUBMITTED', 'UNDER_REVIEW', 'CONDITIONALLY_APPROVED'] } },
      include: { company: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.application.count({ where: { status: 'DOCUMENT_REQUESTED' } }).catch(() => 0),
    prisma.underwritingReview.count({
      where: { reviewedBy: session.user.id, reviewedAt: { gte: start }, decision: { in: ['APPROVED', 'REJECTED', 'CONDITIONALLY_APPROVED'] } },
    }),
    prisma.underwritingReview.findMany({
      where: { reviewedBy: session.user.id, decision: { in: ['APPROVED', 'REJECTED', 'CONDITIONALLY_APPROVED'] } },
      include: { application: { include: { company: true, facility: true } } },
      orderBy: { reviewedAt: 'desc' },
      take: 8,
    }),
  ]);

  const highRisk = pending.filter((app) => (app.dealRiskScore || 0) > 0 && (app.dealRiskScore || 100) < 55).length;

  return (
    <DashboardLayout role="UNDERWRITER">
      <div className="w-full space-y-6">
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
        <section className="rounded-3xl bg-white p-5 shadow-sm">
          <div className="flex items-end justify-between gap-3">
            <div><h2 className="text-lg font-semibold">Recently completed</h2><p className="text-sm text-[#708078]">Decisions remain visible after they leave the review queue.</p></div>
          </div>
          <div className="mt-4 divide-y divide-[#E6ECE8]">
            {recentCompleted.map((review) => (
              <Link key={review.id} href={`/underwriter/applications/${review.applicationId}`} className="flex flex-wrap items-center justify-between gap-3 py-3 first:pt-0 last:pb-0">
                <div><p className="font-medium">{review.application.applicationNo} · {review.application.company.legalName}</p><p className="text-sm text-[#708078]">{review.application.assetDescription}{review.application.facility ? ` · ${review.application.facility.facilityNo}` : ''}</p></div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${review.decision === 'APPROVED' ? 'bg-emerald-50 text-emerald-800' : review.decision === 'REJECTED' ? 'bg-rose-50 text-rose-800' : 'bg-amber-50 text-amber-800'}`}>{review.decision.replace(/_/g, ' ')}</span>
              </Link>
            ))}
            {recentCompleted.length === 0 && <p className="text-sm text-[#708078]">No completed reviews yet.</p>}
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
