import { auth } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { formatAED, formatDate } from '@/lib/formatters';
import { isAdminOperator } from '@/lib/auth/roles';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const queue = ['SUBMITTED', 'UNDER_REVIEW', 'CONDITIONALLY_APPROVED', 'DOCUMENT_REQUESTED'];

export default async function AdminApplicationsPage() {
  const session = await auth();
  if (!session?.user || !isAdminOperator(session.user.role)) redirect('/login');

  const applications = await prisma.application.findMany({
    where: { status: { in: queue } },
    include: { company: true, submitter: true },
    orderBy: { createdAt: 'desc' },
  });

  return (
    <DashboardLayout role={session.user.role}>
      <div className="w-full space-y-6">
        <div>
          <h1 className="text-3xl font-semibold">Applications</h1>
          <p className="text-[#708078]">Submitted financing requests waiting for underwriting.</p>
        </div>
        <section className="space-y-3">
          {applications.length === 0 && (
            <p className="rounded-3xl bg-white p-8 text-center text-[#708078] shadow-sm">No applications are waiting.</p>
          )}
          {applications.map((application) => (
            <article key={application.id} className="rounded-3xl bg-white p-5 shadow-sm">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="text-lg font-semibold">{application.company.legalName}</h2>
                  <p className="text-sm text-[#708078]">
                    {application.applicationNo} · {application.assetDescription} · {application.unitCount} units
                  </p>
                  <p className="mt-2 font-medium">{formatAED(Number(application.financeAmount))}</p>
                  <p className="mt-1 text-sm text-[#708078]">Submitted by {application.submitter.name}</p>
                </div>
                <div className="text-right text-sm">
                  <p className="rounded-full bg-[#EAF9F1] px-3 py-1 text-[#0A4934]">{application.status.replace(/_/g, ' ')}</p>
                  <p className="mt-2 text-[#708078]">{formatDate(application.createdAt)}</p>
                </div>
              </div>
            </article>
          ))}
        </section>
      </div>
    </DashboardLayout>
  );
}
