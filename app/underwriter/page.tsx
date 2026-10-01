import { auth } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatAED, formatDate, getStatusColor, getRiskTierColor } from '@/lib/formatters';
import Link from 'next/link';

export default async function UnderwriterDashboard() {
  const session = await auth();

  if (!session?.user || session.user.role !== 'UNDERWRITER') {
    redirect('/login');
  }

  const pendingApplications = await prisma.application.findMany({
    where: {
      status: {
        in: ['SUBMITTED', 'UNDER_REVIEW'],
      },
    },
    include: {
      company: true,
      submitter: true,
    },
    orderBy: { createdAt: 'asc' },
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

  const stats = {
    pending: pendingApplications.length,
    totalReviewed: recentReviews.length,
    avgScore:
      pendingApplications.filter((a) => a.dealRiskScore).length > 0
        ? Math.round(
            pendingApplications
              .filter((a) => a.dealRiskScore)
              .reduce((sum, a) => sum + (a.dealRiskScore || 0), 0) /
              pendingApplications.filter((a) => a.dealRiskScore).length
          )
        : 0,
  };

  return (
    <DashboardLayout role={session.user.role}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Underwriting Dashboard</h1>
          <p className="text-slate-600 mt-1">Review and approve financing applications</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Pending Review</CardDescription>
              <CardTitle className="text-3xl">{stats.pending}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Your Reviews</CardDescription>
              <CardTitle className="text-3xl">{stats.totalReviewed}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Avg Risk Score</CardDescription>
              <CardTitle className="text-3xl">{stats.avgScore || 'N/A'}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Pending Queue */}
        <Card>
          <CardHeader>
            <CardTitle>Pending Applications</CardTitle>
            <CardDescription>Applications awaiting your review</CardDescription>
          </CardHeader>
          <CardContent>
            {pendingApplications.length === 0 ? (
              <p className="text-slate-500 text-center py-8">No pending applications</p>
            ) : (
              <div className="space-y-3">
                {pendingApplications.map((app) => (
                  <Link
                    key={app.id}
                    href={`/underwriter/applications/${app.id}`}
                    className="block p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <div className="font-semibold text-slate-900">{app.applicationNo}</div>
                          {app.riskTier && (
                            <span
                              className={`px-2 py-1 rounded text-xs font-medium border ${getRiskTierColor(
                                app.riskTier
                              )}`}
                            >
                              {app.riskTier.replace('_', ' ')}
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-slate-600 mt-1">{app.company.legalName}</div>
                        <div className="text-sm text-slate-600">{app.assetDescription}</div>
                        <div className="text-sm text-slate-500 mt-1">
                          {formatAED(Number(app.financeAmount))} • {app.requestedTerm} months
                          {app.dealRiskScore && ` • Score: ${app.dealRiskScore}/100`}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xs text-slate-500">{formatDate(app.createdAt)}</div>
                        <span
                          className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                            app.status
                          )}`}
                        >
                          {app.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Reviews */}
        {recentReviews.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Your Recent Reviews</CardTitle>
              <CardDescription>Recently completed reviews</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentReviews.map((review) => (
                  <div
                    key={review.id}
                    className="p-4 border border-slate-200 rounded-lg"
                  >
                    <div className="flex justify-between">
                      <div>
                        <div className="font-semibold">{review.application.applicationNo}</div>
                        <div className="text-sm text-slate-600">{review.application.company.legalName}</div>
                        <div className="text-sm text-slate-500 mt-1">
                          {formatDate(review.reviewedAt)}
                        </div>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium border h-fit ${getStatusColor(
                          review.decision
                        )}`}
                      >
                        {review.decision.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
