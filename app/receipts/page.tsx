import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/auth';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { prisma } from '@/lib/db';
import { positionsForInvestor } from '@/lib/alpha/positions';
import { receiptsForFacility, type Receipt } from '@/lib/alpha/receipts';
import { isAdminOperator } from '@/lib/auth/roles';

export const dynamic = 'force-dynamic';

// Receipt center. Each receipt is tied to a confirmed chain event, so a facility with no confirmed events has none.
// Investors see their own facilities; administrators see confirmed facilities.
export default async function ReceiptsPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');
  const role = session.user.role;
  let receipts: Receipt[] = [];
  try {
    if (role === 'INVESTOR') {
      const positions = await positionsForInvestor(session.user.id);
      for (const position of positions) receipts.push(...(await receiptsForFacility(position.facilityId, session.user.id)));
    } else if (isAdminOperator(role)) {
      const facilities = await prisma.facility.findMany({ where: { chainStatus: 'CHAIN_CONFIRMED' }, select: { id: true }, take: 20 });
      for (const facility of facilities) receipts.push(...(await receiptsForFacility(facility.id)));
    }
  } catch {
    receipts = [];
  }
  receipts.sort((a, b) => b.timestamp.localeCompare(a.timestamp));
  return (
    <DashboardLayout role={role}>
      <div className="w-full space-y-4">
        <div>
          <h1 className="text-3xl font-semibold">Receipts</h1>
          <p className="mt-1 text-sm text-[#708078]">Investment, release, repayment, distribution, settlement and recovery receipts. Each is tied to a confirmed Stellar Testnet transaction and carries a SHA-256 you can recompute. Testnet values have no monetary value.</p>
        </div>
        {receipts.length === 0 ? (
          <p className="rounded-2xl border border-[#E5ECE8] bg-white p-6 text-sm text-[#708078]">No confirmed receipts yet. Receipts appear only after an operation is confirmed on chain; the public Demo does not produce chain receipts.</p>
        ) : (
          <ul className="space-y-3">
            {receipts.map((receipt) => (
              <li key={receipt.receiptHash} className="rounded-2xl border border-[#E5ECE8] bg-white p-4">
                <div className="flex flex-wrap items-baseline justify-between gap-2">
                  <p className="font-semibold">{receipt.title} · {receipt.facilityNo}</p>
                  <p className="text-sm">{receipt.amount.toLocaleString('en-US', { maximumFractionDigits: 2 })} {receipt.asset}</p>
                </div>
                <p className="text-xs text-[#708078]">{new Date(receipt.timestamp).toLocaleString('en-GB')} · ledger {receipt.ledger || 'pending index'} · {receipt.operationType}</p>
                <a className="mt-1 inline-block text-sm text-[#0D7A52] underline" href={receipt.explorerUrl} target="_blank" rel="noreferrer">View on Stellar Explorer</a>
                <details className="mt-2 text-xs text-[#708078]">
                  <summary className="cursor-pointer">Advanced blockchain details</summary>
                  <p className="mt-1 break-all">Wallet {receipt.wallet || 'n/a'}</p>
                  <p className="break-all">Transaction {receipt.transactionHash}</p>
                  <p className="break-all">Contract {receipt.contractId}</p>
                  <p className="break-all">Receipt hash (SHA-256) {receipt.receiptHash}</p>
                </details>
              </li>
            ))}
          </ul>
        )}
      </div>
    </DashboardLayout>
  );
}
