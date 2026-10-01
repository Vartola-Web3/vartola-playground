import { auth } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatAED, formatPercentage, formatDate, getStatusColor } from '@/lib/formatters';
import Link from 'next/link';

export default async function InvestorDashboard() {
  const session = await auth();

  if (!session?.user || session.user.role !== 'INVESTOR') {
    redirect('/login');
  }

  const investments = await prisma.investment.findMany({
    where: { investorId: session.user.id },
    include: {
      pool: true,
      distributions: true,
    },
  });

  const availablePools = await prisma.pool.findMany({
    where: {
      status: {
        in: ['OPEN', 'FUNDING'],
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  const stats = {
    totalInvested: investments.reduce((sum, inv) => sum + Number(inv.amount), 0),
    totalDistributions: investments.reduce(
      (sum, inv) => sum + inv.distributions.reduce((s, d) => s + Number(d.amount), 0),
      0
    ),
    activeInvestments: investments.filter((i) => i.status === 'ACTIVE').length,
  };

  return (
    <DashboardLayout role={session.user.role}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Investment Dashboard</h1>
          <p className="text-slate-600 mt-1">Manage your portfolio and explore opportunities</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Invested</CardDescription>
              <CardTitle className="text-2xl">{formatAED(stats.totalInvested)}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Total Distributions</CardDescription>
              <CardTitle className="text-2xl">{formatAED(stats.totalDistributions)}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Active Investments</CardDescription>
              <CardTitle className="text-3xl">{stats.activeInvestments}</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Available Pools */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Available Investment Pools</CardTitle>
                <CardDescription>Explore financing opportunities</CardDescription>
              </div>
              <Link
                href="/investor/pools"
                className="text-sm text-blue-600 hover:underline font-medium"
              >
                View All →
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {availablePools.length === 0 ? (
              <p className="text-slate-500 text-center py-8">No pools available at this time</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {availablePools.map((pool) => {
                  const progress = (Number(pool.raisedAmount) / Number(pool.targetAmount)) * 100;
                  return (
                    <Link
                      key={pool.id}
                      href={`/investor/pools/${pool.id}`}
                      className="block p-4 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="font-semibold text-slate-900">{pool.poolName}</div>
                          <div className="text-sm text-slate-600">{pool.poolNo}</div>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                            pool.status
                          )}`}
                        >
                          {pool.status}
                        </span>
                      </div>
                      <div className="text-sm text-slate-600 mb-3">{pool.assetFocus}</div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-600">Target Return</span>
                          <span className="font-semibold">{formatPercentage(Number(pool.targetReturn))}%</span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-slate-600">Min Investment</span>
                          <span className="font-semibold">{formatAED(Number(pool.minInvestment))}</span>
                        </div>
                        <div>
                          <div className="flex justify-between text-xs text-slate-600 mb-1">
                            <span>Raised</span>
                            <span>
                              {formatAED(Number(pool.raisedAmount))} / {formatAED(Number(pool.targetAmount))}
                            </span>
                          </div>
                          <div className="w-full bg-slate-200 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full"
                              style={{ width: `${Math.min(progress, 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* My Portfolio */}
        {investments.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <div>
                  <CardTitle>My Portfolio</CardTitle>
                  <CardDescription>Your active investments</CardDescription>
                </div>
                <Link
                  href="/investor/portfolio"
                  className="text-sm text-blue-600 hover:underline font-medium"
                >
                  View Details →
                </Link>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {investments.map((investment) => {
                  const totalDistributed = investment.distributions.reduce(
                    (sum, d) => sum + Number(d.amount),
                    0
                  );
                  return (
                    <div
                      key={investment.id}
                      className="flex justify-between items-center p-4 border border-slate-200 rounded-lg"
                    >
                      <div>
                        <div className="font-semibold">{investment.pool.poolName}</div>
                        <div className="text-sm text-slate-600 mt-1">
                          Invested: {formatAED(Number(investment.amount))}
                        </div>
                        <div className="text-sm text-slate-600">
                          Distributions: {formatAED(totalDistributed)}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm text-slate-600">{formatDate(investment.subscribedAt)}</div>
                        <span
                          className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                            investment.status
                          )}`}
                        >
                          {investment.status}
                        </span>
                      </div>
                    </div>
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
