import { auth } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatAED, formatDateTime } from '@/lib/formatters';
import Link from 'next/link';

export default async function AdminDashboard() {
  const session = await auth();

  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/login');
  }

  const [users, applications, facilities, pools, recentAudit] = await Promise.all([
    prisma.user.count(),
    prisma.application.count(),
    prisma.facility.count(),
    prisma.pool.count(),
    prisma.auditLog.findMany({
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: { user: true },
    }),
  ]);

  const totalFinanced = await prisma.facility.aggregate({
    _sum: { financeAmount: true },
  });

  const stats = {
    totalUsers: users,
    totalApplications: applications,
    activeFacilities: facilities,
    totalPools: pools,
    totalFinanced: Number(totalFinanced._sum.financeAmount || 0),
  };

  return (
    <DashboardLayout user={session.user}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Admin Dashboard</h1>
          <p className="text-slate-600 mt-1">System management and monitoring</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Users</CardDescription>
              <CardTitle className="text-3xl">{stats.totalUsers}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Applications</CardDescription>
              <CardTitle className="text-3xl">{stats.totalApplications}</CardTitle>
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
              <CardDescription>Investment Pools</CardDescription>
              <CardTitle className="text-3xl">{stats.totalPools}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Financed</CardDescription>
              <CardTitle className="text-xl">{formatAED(stats.totalFinanced)}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link
                href="/admin/users"
                className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-center"
              >
                <div className="font-semibold text-slate-900">Manage Users</div>
                <div className="text-sm text-slate-600 mt-1">View and manage user accounts</div>
              </Link>
              <Link
                href="/admin/pools"
                className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-center"
              >
                <div className="font-semibold text-slate-900">Manage Pools</div>
                <div className="text-sm text-slate-600 mt-1">Create and manage investment pools</div>
              </Link>
              <Link
                href="/admin/audit"
                className="p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors text-center"
              >
                <div className="font-semibold text-slate-900">Audit Log</div>
                <div className="text-sm text-slate-600 mt-1">View system activity logs</div>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Recent System Activity</CardTitle>
                <CardDescription>Latest audit log entries</CardDescription>
              </div>
              <Link
                href="/admin/audit"
                className="text-sm text-blue-600 hover:underline font-medium"
              >
                View All →
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {recentAudit.map((log) => (
                <div
                  key={log.id}
                  className="flex justify-between items-center p-3 border border-slate-200 rounded text-sm"
                >
                  <div>
                    <span className="font-medium">{log.user.name}</span>
                    <span className="text-slate-600 mx-2">•</span>
                    <span className="text-slate-700">{log.action.replace(/_/g, ' ')}</span>
                    <span className="text-slate-600 mx-2">•</span>
                    <span className="text-slate-600">{log.entityType}</span>
                  </div>
                  <div className="text-slate-500 text-xs">{formatDateTime(log.createdAt)}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
