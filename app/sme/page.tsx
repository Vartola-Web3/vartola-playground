import { auth } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { formatAED, formatDate } from '@/lib/formatters';
import { countsFromAssetTypes, fleetImage, getFleetVisualType } from '@/lib/fleet-visual';
import Link from 'next/link';

export default async function SMEDashboard() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'SME') redirect('/login');

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
  if (!user?.companyId) redirect('/login');

  const facilities = await prisma.facility.findMany({
    where: { application: { companyId: user.companyId } },
    include: {
      application: true,
      payments: { orderBy: { dueDate: 'asc' } },
    },
  });

  const fleetUnits = facilities.reduce((sum, facility) => sum + (facility.application.unitCount || 1), 0);
  const outstanding = facilities
    .filter((facility) => !['SETTLED', 'CLOSED'].includes(facility.status))
    .reduce((sum, facility) => sum + Number(facility.financeAmount), 0);
  const next = facilities
    .flatMap((facility) => facility.payments)
    .filter((payment) => payment.status === 'SCHEDULED' || payment.status === 'LATE')
    .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())[0];
  const allPayments = facilities.flatMap((facility) => facility.payments);
  const paid = allPayments.filter((payment) => payment.status === 'PAID').length;
  const progress = allPayments.length ? Math.round((paid / allPayments.length) * 100) : 0;
  const image = fleetImage(getFleetVisualType(countsFromAssetTypes(facilities.map((facility) => facility.application.assetType))));

  return (
    <DashboardLayout role="SME">
      <div className="mx-auto max-w-6xl space-y-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-3xl font-semibold">{user.company?.legalName}</h1>
            <p className="text-[#708078]">Your fleet, financing, and next payment.</p>
          </div>
          <Link href="/sme/applications/new" className="rounded-full bg-[#15C77A] px-4 py-2 text-sm font-semibold text-white">
            Finance a vehicle
          </Link>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {[
            ['Fleet units', String(fleetUnits || user.applications.length)],
            ['Outstanding finance', formatAED(outstanding)],
            ['Next payment', next ? formatAED(next.amount) : '—'],
            ['Lease progress', `${progress}%`],
          ].map(([label, value]) => (
            <article key={label} className="rounded-3xl bg-white p-5 shadow-sm">
              <p className="text-sm text-[#708078]">{label}</p>
              <p className="mt-2 text-2xl font-semibold">{value}</p>
              {label === 'Next payment' && next && <p className="mt-1 text-xs text-[#708078]">Due {formatDate(next.dueDate)}</p>}
            </article>
          ))}
        </div>

        <section className="overflow-hidden rounded-3xl bg-white shadow-sm">
          <img src={image} alt="" className="h-44 w-full object-cover" />
          <div className="flex items-center justify-between gap-3 p-5">
            <div>
              <h2 className="font-semibold">My fleet</h2>
              <p className="text-sm text-[#708078]">{facilities.length} financed vehicles</p>
            </div>
            <Link href="/sme/payments" className="rounded-full bg-[#EAF9F1] px-4 py-2 text-sm font-medium text-[#0A4934]">Payments</Link>
          </div>
        </section>

        <section className="rounded-3xl bg-white p-5 shadow-sm">
          <h2 className="font-semibold">Applications</h2>
          <div className="mt-4 space-y-3">
            {user.applications.length === 0 && <p className="text-sm text-[#708078]">No applications yet.</p>}
            {user.applications.map((app) => (
              <Link key={app.id} href={`/sme/applications/${app.id}`} className="flex items-center justify-between rounded-2xl border border-[#E5ECE8] px-4 py-3">
                <div>
                  <p className="font-medium">{app.assetDescription}</p>
                  <p className="text-sm text-[#708078]">{formatAED(Number(app.financeAmount))} · {app.unitCount} units</p>
                </div>
                <span className="rounded-full bg-[#EAF9F1] px-3 py-1 text-xs text-[#0A4934]">{app.status.replace(/_/g, ' ')}</span>
              </Link>
            ))}
          </div>
        </section>
      </div>
    </DashboardLayout>
  );
}
