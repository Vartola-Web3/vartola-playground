import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth/auth';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { SupplierForm } from '@/components/web3/supplier-form';
import { assignedFacilities, supplierForUser } from '@/lib/supplier/service';

export const dynamic = 'force-dynamic';

export default async function SupplierFacilityPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user || session.user.role !== 'SUPPLIER') redirect('/login');
  const supplier = await supplierForUser(session.user.id);
  if (!supplier) notFound();
  const facility = (await assignedFacilities(supplier.id)).find((row) => row.id === id);
  if (!facility) notFound();
  return (
    <DashboardLayout role={session.user.role}>
      <div className="w-full max-w-2xl space-y-4">
        <Link href="/supplier" className="text-sm text-[#0D7A52] underline">Back to my facilities</Link>
        <div>
          <h1 className="text-3xl font-semibold">{facility.facilityNo}</h1>
          <p className="text-sm text-[#52635C]">{facility.asset}</p>
          <p className="mt-2 text-sm"><span className="text-[#708078]">Payment status:</span> {facility.releaseStatus}</p>
        </div>
        {supplier.kybStatus !== 'APPROVED' ? <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-950">Submissions open once your verification (KYB) is approved.</p> : <SupplierForm facilityId={facility.id} />}
        <section>
          <h2 className="font-semibold">Your submissions</h2>
          <ul className="mt-2 space-y-1 text-sm">
            {facility.submissions.map((row) => <li key={row.id}>{row.kind.replaceAll('_', ' ')} · {row.reference || 'no reference'} · {row.status} · {row.createdAt.toLocaleDateString('en-GB')}</li>)}
            {facility.submissions.length === 0 ? <li className="text-[#708078]">None yet.</li> : null}
          </ul>
        </section>
      </div>
    </DashboardLayout>
  );
}
