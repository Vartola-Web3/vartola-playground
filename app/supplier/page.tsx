import { redirect } from 'next/navigation';
import Link from 'next/link';
import { auth } from '@/lib/auth/auth';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { assignedFacilities, supplierForUser } from '@/lib/supplier/service';

export const dynamic = 'force-dynamic';

export default async function SupplierHomePage() {
  const session = await auth();
  if (!session?.user || session.user.role !== 'SUPPLIER') redirect('/login');
  const supplier = await supplierForUser(session.user.id);
  const facilities = supplier ? await assignedFacilities(supplier.id) : [];
  return (
    <DashboardLayout role={session.user.role}>
      <div className="w-full space-y-4">
        <div>
          <h1 className="text-3xl font-semibold">{supplier ? supplier.companyName : 'Supplier'}</h1>
          <p className="mt-1 text-sm text-[#708078]">Verification (KYB): <strong>{supplier?.kybStatus.replaceAll('_', ' ') || 'not linked'}</strong>. You provide evidence; operations approve each release. You cannot approve a release or change facility terms.</p>
        </div>
        {!supplier ? <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-950">This account is not linked to a supplier yet. Ask Vartola operations to link it.</p> : null}
        <div className="grid gap-4 lg:grid-cols-2">
          {facilities.map((facility) => (
            <article key={facility.id} className="rounded-3xl border border-[#E5ECE8] bg-white p-5 shadow-sm">
              <div className="flex items-start justify-between gap-2">
                <h2 className="font-semibold">{facility.facilityNo}</h2>
                <span className="rounded-full bg-[#E7F8EF] px-2 py-0.5 text-xs font-semibold text-[#087A50]">{facility.status.replaceAll('_', ' ')}</span>
              </div>
              <p className="mt-1 text-sm text-[#52635C]">{facility.asset} · {facility.units} unit(s)</p>
              <p className="mt-3 text-sm"><span className="text-[#708078]">Payment status:</span> {facility.releaseStatus}</p>
              <p className="text-sm"><span className="text-[#708078]">Delivery check:</span> {facility.deliveryCheck.replaceAll('_', ' ')}</p>
              <p className="text-sm"><span className="text-[#708078]">Your submissions:</span> {facility.submissions.length}</p>
              <Link href={`/supplier/facilities/${facility.id}`} className="mt-4 inline-block rounded-full bg-[#15C77A] px-4 py-2 text-sm font-semibold text-white">Submit invoice, asset or delivery details</Link>
            </article>
          ))}
          {supplier && facilities.length === 0 ? <p className="text-sm text-[#708078]">No facilities are assigned to you yet.</p> : null}
        </div>
      </div>
    </DashboardLayout>
  );
}
