import { auth } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatAED, formatDate, getStatusColor } from '@/lib/formatters';
import Link from 'next/link';

export default async function SMEDashboard() {
  const session = await auth();

  if (!session?.user || session.user.role !== 'SME') {
    redirect('/login');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      company: true,
      applications: {
        where: { status: { not: 'ARCHIVED' } },
        orderBy: { createdAt: 'desc' },
        take: 5,
      },
    },
  });

  if (!user || !user.companyId) {
    redirect('/login');
  }

  const notices = await prisma.underwritingReview.findMany({
    where: {
      decision: { in: ['MESSAGE', 'DOCUMENT_REQUEST'] },
      reviewer: { role: { in: ['UNDERWRITER', 'ADMIN'] } },
      application: { companyId: user.companyId, status: { not: 'ARCHIVED' } },
    },
    include: { application: { select: { id: true, applicationNo: true } } },
    orderBy: { reviewedAt: 'desc' },
    take: 6,
  });

  const facilities = await prisma.facility.findMany({
    where: {
      application: {
        companyId: user.companyId!,
      },
    },
    include: {
      application: true,
      payments: {
        where: { status: 'SCHEDULED' },
        orderBy: { dueDate: 'asc' },
        take: 1,
      },
    },
  });

  const stats = {
    totalApplications: user.applications.length,
    activeApplications: user.applications.filter((a) => a.status === 'UNDER_REVIEW' || a.status === 'SUBMITTED').length,
    activeFacilities: facilities.filter((f) => f.status === 'ACTIVE' || f.status === 'CURRENT').length,
    totalFinanced: facilities.reduce((sum, f) => sum + Number(f.financeAmount), 0),
  };

  return (
    <DashboardLayout role={session.user.role}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Welcome, {user.name}</h1>
          <p className="text-slate-600 mt-1">{user.company?.legalName}</p>
        </div>

        {notices.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Notifications</CardTitle>
              <CardDescription>Same messages that appear inside each application ticket.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {notices.map((notice) => (
                <Link key={notice.id} href={`/sme/applications/${notice.application.id}`} className="block rounded-xl border border-slate-200 px-4 py-3 hover:bg-slate-50">
                  <div className="flex items-center justify-between gap-3">
                    <span className="text-sm font-medium">{notice.application.applicationNo}</span>
                    <span className="rounded-full bg-amber-50 px-2 py-1 text-xs text-amber-900">
                      {notice.decision === 'DOCUMENT_REQUEST' ? 'Upload files' : 'Reply needed'}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-slate-600">{notice.comments}</p>
                </Link>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Applications</CardDescription>
              <CardTitle className="text-3xl">{stats.totalApplications}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Active Applications</CardDescription>
              <CardTitle className="text-3xl">{stats.activeApplications}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Active Facilities</CardDescription>
              <CardTitle className="text-3xl">{stats.activeFacilities}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Financed</CardDescription>
              <CardTitle className="text-2xl">{formatAED(stats.totalFinanced)}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Recent Applications */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Recent Applications</CardTitle>
                <CardDescription>Your latest financing applications</CardDescription>
              </div>
              <Link
                href="/sme/applications/new"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm font-medium"
              >
                New Application
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {user.applications.length === 0 ? (
              <p className="text-slate-500 text-center py-8">
                No applications yet. Start your first application!
              </p>
            ) : (
              <div className="space-y-3">
                {user.applications.map((app) => (
                  <Link
                    key={app.id}
                    href={`/sme/applications/${app.id}`}
                    className="block p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="font-semibold text-slate-900">{app.applicationNo}</div>
                        <div className="text-sm text-slate-600 mt-1">{app.assetDescription}</div>
                        <div className="text-sm text-slate-500 mt-1">
                          {formatAED(Number(app.assetValue))} • {formatDate(app.createdAt)}
                        </div>
                      </div>
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                          app.status
                        )}`}
                      >
                        {app.status.replace(/_/g, ' ')}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Active Facilities */}
        {facilities.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Active Facilities</CardTitle>
              <CardDescription>Your financed assets</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {facilities.map((facility) => {
                  const nextPayment = facility.payments[0];
                  return (
                    <Link
                      key={facility.id}
                      href={`/sme/facilities/${facility.id}`}
                      className="block p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="font-semibold text-slate-900">{facility.facilityNo}</div>
                          <div className="text-sm text-slate-600 mt-1">
                            {facility.application.assetDescription}
                          </div>
                          <div className="text-sm text-slate-500 mt-1">
                            Monthly Payment: {formatAED(Number(facility.monthlyPayment))}
                            {nextPayment && ` • Next Due: ${formatDate(nextPayment.dueDate)}`}
                          </div>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                            facility.status
                          )}`}
                        >
                          {facility.status}
                        </span>
                      </div>
                    </Link>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
