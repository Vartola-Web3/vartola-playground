import { auth } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { formatAED, formatDate, getStatusColor } from '@/lib/formatters';

export default async function FacilityDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user || session.user.role !== 'SME') {
    redirect('/login');
  }

  const facility = await prisma.facility.findFirst({
    where: {
      id: id,
      application: {
        company: {
          users: {
            some: { id: session.user.id },
          },
        },
      },
    },
    include: {
      application: {
        include: {
          company: true,
        },
      },
      pool: true,
      payments: {
        orderBy: { paymentNo: 'asc' },
      },
    },
  });

  if (!facility) {
    redirect('/sme');
  }

  const paidCount = facility.payments.filter((p) => p.status === 'PAID').length;
  const totalPaid = facility.payments
    .filter((p) => p.status === 'PAID')
    .reduce((sum, p) => sum + Number(p.paidAmount || 0), 0);

  return (
    <DashboardLayout role={session.user.role}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{facility.facilityNo}</h1>
          <p className="text-slate-600 mt-1">{facility.application.assetDescription}</p>
          {facility.pool && (
            <p className="mt-2 text-sm text-slate-700">
              Pool {facility.pool.poolNo} · {facility.pool.poolName}
            </p>
          )}
        </div>

        {/* Facility Summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Finance Amount</CardDescription>
              <CardTitle className="text-2xl">{formatAED(Number(facility.financeAmount))}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Monthly Payment</CardDescription>
              <CardTitle className="text-2xl">{formatAED(Number(facility.monthlyPayment))}</CardTitle>
            </CardHeader>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardDescription>Term</CardDescription>
              <CardTitle className="text-2xl">{facility.term} months</CardTitle>
            </CardHeader>
          </Card>
        </div>

        {/* Payment Progress */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Progress</CardTitle>
            <CardDescription>
              {paidCount} of {facility.term} payments completed â€¢ {formatAED(totalPaid)} paid
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="w-full bg-slate-200 rounded-full h-3">
              <div
                className="bg-green-600 h-3 rounded-full"
                style={{ width: `${(paidCount / facility.term) * 100}%` }}
              />
            </div>
          </CardContent>
        </Card>

        {/* Payment Schedule */}
        <Card>
          <CardHeader>
            <CardTitle>Payment Schedule</CardTitle>
            <CardDescription>Monthly lease payments</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {facility.payments.map((payment) => (
                <div
                  key={payment.id}
                  className="flex justify-between items-center p-3 border border-slate-200 rounded-lg"
                >
                  <div>
                    <div className="font-medium">Payment #{payment.paymentNo}</div>
                    <div className="text-sm text-slate-600">Due: {formatDate(payment.dueDate)}</div>
                    {payment.paidAt && (
                      <div className="text-sm text-green-600">Paid: {formatDate(payment.paidAt)}</div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{formatAED(Number(payment.amount))}</div>
                    <span
                      className={`inline-block mt-1 px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(
                        payment.status
                      )}`}
                    >
                      {payment.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Stellar Transaction */}
        {facility.stellarTxHash && (
          <Card>
            <CardHeader>
              <CardTitle>Blockchain Details</CardTitle>
              <CardDescription>Stellar Testnet transaction references</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-slate-600">Transaction Hash:</span>
                  <div className="font-mono text-xs bg-slate-100 p-2 rounded mt-1 break-all">
                    {facility.stellarTxHash}
                  </div>
                </div>
                {facility.stellarAssetId && (
                  <div>
                    <span className="text-slate-600">Asset ID:</span>
                    <div className="font-mono text-xs bg-slate-100 p-2 rounded mt-1 break-all">
                      {facility.stellarAssetId}
                    </div>
                  </div>
                )}
                <a
                  href={`https://stellar.expert/explorer/testnet/tx/${facility.stellarTxHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-2 text-blue-600 hover:underline text-sm"
                >
                  View on Stellar Explorer â†’
                </a>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
