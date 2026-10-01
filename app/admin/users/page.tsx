import { auth } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDateTime } from '@/lib/formatters';

export default async function UsersListPage() {
  const session = await auth();

  if (!session?.user || session.user.role !== 'ADMIN') {
    redirect('/login');
  }

  const users = await prisma.user.findMany({
    include: {
      company: true,
    },
    orderBy: { createdAt: 'desc' },
  });

  const usersByRole = {
    ADMIN: users.filter((u) => u.role === 'ADMIN').length,
    UNDERWRITER: users.filter((u) => u.role === 'UNDERWRITER').length,
    SME: users.filter((u) => u.role === 'SME').length,
    INVESTOR: users.filter((u) => u.role === 'INVESTOR').length,
  };

  return (
    <DashboardLayout user={session.user}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">User Management</h1>
          <p className="text-slate-600 mt-1">Manage system users and roles</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Admins</CardDescription>
              <CardTitle className="text-3xl">{usersByRole.ADMIN}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Underwriters</CardDescription>
              <CardTitle className="text-3xl">{usersByRole.UNDERWRITER}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>SMEs</CardDescription>
              <CardTitle className="text-3xl">{usersByRole.SME}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Investors</CardDescription>
              <CardTitle className="text-3xl">{usersByRole.INVESTOR}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Users List */}
        <Card>
          <CardHeader>
            <CardTitle>All Users</CardTitle>
            <CardDescription>{users.length} registered users</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {users.map((user) => (
                <div
                  key={user.id}
                  className="flex justify-between items-center p-4 border border-slate-200 rounded-lg"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <div className="font-semibold text-slate-900">{user.name}</div>
                      <span className="px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-700 border border-blue-200">
                        {user.role}
                      </span>
                      {!user.isActive && (
                        <span className="px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-700 border border-red-200">
                          Inactive
                        </span>
                      )}
                    </div>
                    <div className="text-sm text-slate-600 mt-1">{user.email}</div>
                    {user.company && (
                      <div className="text-sm text-slate-600">{user.company.legalName}</div>
                    )}
                  </div>
                  <div className="text-right text-sm">
                    <div className="text-slate-600">Joined</div>
                    <div className="text-slate-500">{formatDateTime(user.createdAt)}</div>
                    {user.lastLoginAt && (
                      <div className="text-slate-500 text-xs mt-1">
                        Last login: {formatDateTime(user.lastLoginAt)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
