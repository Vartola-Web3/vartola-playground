import { auth } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { formatAED, formatDate, getStatusColor, getRiskTierColor } from '@/lib/formatters';
import { SectionHeader, StatCard, StatusBadge } from '@/components/ui/design';
import Link from 'next/link';

export default async function UnderwriterDashboard() {
  const session = await auth();

  if (!session?.user || session.user.role !== 'UNDERWRITER') {
    redirect('/login');
  }

  const pendingApplications = await prisma.application.findMany({
    where: {
      status: {
        in: ['SUBMITTED', 'UNDER_REVIEW', 'CONDITIONALLY_APPROVED', 'DELETION_REQUESTED'],
      },
    },
    include: {
      company: true,
      submitter: true,
    },
    orderBy: { createdAt: 'asc' },
  });

  const notices = await prisma.underwritingReview.findMany({
    where: {
      OR: [
        { decision: 'MESSAGE', reviewer: { role: 'SME' } },
        { decision: 'DOCUMENTS_RECEIVED' },
      ],
      application: { status: { not: 'ARCHIVED' } },
    },
    include: {
      application: { select: { id: true, applicationNo: true, status: true } },
      reviewer: { select: { name: true } },
    },
    orderBy: { reviewedAt: 'desc' },
    take: 6,
  });

  const recentReviews = await prisma.underwritingReview.findMany({
    where: {
      reviewedBy: session.user.id,
    },
    include: {
      application: {
        include: {
          company: true,
        },
      },
    },
    orderBy: { reviewedAt: 'desc' },
    take: 5,
  });

  const scored = pendingApplications.filter((a) => a.dealRiskScore);
  const stats = {
    pending: pendingApplications.length,
    totalReviewed: recentReviews.length,
    avgScore:
      scored.length > 0
        ? Math.round(scored.reduce((sum, a) => sum + (a.dealRiskScore || 0), 0) / scored.length)
        : 0,
  };

  return (
    <DashboardLayout role={session.user.role}>
      <div className="space-y-8">
        <SectionHeader
          eyebrow="Underwriting"
          title="Review queue"
          description="Applications waiting for an institutional credit decision."
        />

        {notices.length > 0 && (
          <section className="rounded-2xl border border-[#E2E8F0] bg-white">
            <header className="border-b border-[#E2E8F0] px-6 py-4">
              <h2 className="text-base font-semibold">Notifications</h2>
              <p className="text-sm text-[#475569]">Applicant replies and uploaded files. Open the application to answer in the same ticket.</p>
            </header>
            <div className="divide-y divide-[#E2E8F0]">
              {notices.map((notice) => (
                <Link key={notice.id} href={`/underwriter/applications/${notice.application.id}`} className="block px-6 py-4 hover:bg-[#F7F9FC]">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-medium">{notice.application.applicationNo}</span>
                    <StatusBadge tone="warning">
                      {notice.decision === 'DOCUMENTS_RECEIVED' ? 'Files uploaded' : 'Reply received'}
                    </StatusBadge>
                  </div>
                  <p className="mt-1 text-sm text-[#475569]">{notice.comments}</p>
                </Link>
              ))}
            </div>
          </section>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <StatCard label="Pending review" value={String(stats.pending)} helper="Submitted or in review" />
          <StatCard label="Your reviews" value={String(stats.totalReviewed)} helper="Latest five shown below" />
          <StatCard label="Average deal score" value={stats.avgScore ? String(stats.avgScore) : '—'} helper="Pending book" />
        </div>

        <section className="overflow-hidden rounded-2xl border border-[#E2E8F0] bg-white">
          <header className="border-b border-[#E2E8F0] px-6 py-4">
            <h2 className="text-base font-semibold">Pending applications</h2>
          </header>
          {pendingApplications.length === 0 ? (
            <p className="px-6 py-12 text-center text-sm text-[#475569]">No applications are waiting for review.</p>
          ) : (
            <div className="divide-y divide-[#E2E8F0]">
              {pendingApplications.map((app) => (
                <Link key={app.id} href={`/underwriter/applications/${app.id}`} className="block px-6 py-4 hover:bg-[#F7F9FC]">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold">{app.applicationNo}</span>
                        {app.riskTier && (
                          <span className={`rounded-full border px-2 py-0.5 text-xs ${getRiskTierColor(app.riskTier)}`}>
                            {app.riskTier.replace('_', ' ')}
                          </span>
                        )}
                      </div>
                      <p className="mt-1 text-sm text-[#475569]">{app.company.legalName}</p>
                      <p className="text-sm text-[#475569]">{app.assetDescription}</p>
                      <p className="mt-1 text-sm text-[#0F172A]">
                        {formatAED(Number(app.financeAmount))} · {app.requestedTerm} months
                        {app.dealRiskScore ? ` · Score ${app.dealRiskScore}` : ''}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-[#475569]">{formatDate(app.createdAt)}</p>
                      <span className={`mt-2 inline-block rounded-full border px-2.5 py-1 text-xs ${getStatusColor(app.status)}`}>
                        {app.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        {recentReviews.length > 0 && (
          <section className="rounded-2xl border border-[#E2E8F0] bg-white">
            <header className="border-b border-[#E2E8F0] px-6 py-4">
              <h2 className="text-base font-semibold">Recent decisions</h2>
            </header>
            <div className="divide-y divide-[#E2E8F0]">
              {recentReviews.map((review) => (
                <div key={review.id} className="flex items-center justify-between gap-4 px-6 py-4">
                  <div>
                    <p className="font-medium">{review.application.applicationNo}</p>
                    <p className="text-sm text-[#475569]">{review.application.company.legalName}</p>
                    <p className="text-xs text-[#475569]">{formatDate(review.reviewedAt)}</p>
                  </div>
                  <StatusBadge tone="primary">{review.decision.replace(/_/g, ' ')}</StatusBadge>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </DashboardLayout>
  );
}
