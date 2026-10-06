import { notFound, redirect } from 'next/navigation';
import { auth } from '@/lib/auth/auth';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { positionsForInvestor } from '@/lib/alpha/positions';
import { receiptsForFacility } from '@/lib/alpha/receipts';
import { facilityContractId } from '@/lib/stellar/keys';

export const dynamic = 'force-dynamic';

export default async function ProofPage({ params }: { params: Promise<{ facilityId: string }> }) {
  const { facilityId } = await params;
  const session = await auth();
  if (!session?.user || session.user.role !== 'INVESTOR') redirect('/login');
  const position = (await positionsForInvestor(session.user.id)).find((row) => row.facilityId === facilityId);
  if (!position) notFound();
  const receipts = await receiptsForFacility(facilityId, session.user.id);
  return (
    <DashboardLayout role={session.user.role}>
      <div className="w-full space-y-4">
        <div>
          <h1 className="text-3xl font-semibold">On-chain proof · {position.facilityNo}</h1>
          <p className="mt-1 text-sm text-[#708078]">Each receipt links to a confirmed Stellar Testnet transaction. No private information is published. Testnet values have no monetary value.</p>
        </div>
        <ul className="space-y-3">
          {receipts.map((receipt) => (
            <li key={receipt.receiptHash} className="rounded-2xl border border-[#E5ECE8] bg-white p-4">
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <p className="font-semibold">{receipt.title}</p>
                <p className="text-sm">{receipt.amount.toLocaleString('en-US', { maximumFractionDigits: 2 })} {receipt.asset}</p>
              </div>
              <p className="text-xs text-[#708078]">{new Date(receipt.timestamp).toLocaleString('en-GB')} · ledger {receipt.ledger || 'pending index'}</p>
              <a className="mt-1 inline-block text-sm text-[#0D7A52] underline" href={receipt.explorerUrl} target="_blank" rel="noreferrer">View on Stellar Explorer</a>
              <details className="mt-2 text-xs text-[#708078]">
                <summary className="cursor-pointer">Advanced blockchain details</summary>
                <p className="mt-1 break-all">Transaction {receipt.transactionHash}</p>
                <p className="break-all">Contract {receipt.contractId}</p>
                <p className="break-all">Receipt hash (SHA-256) {receipt.receiptHash}</p>
              </details>
            </li>
          ))}
          {receipts.length === 0 ? <li className="text-sm text-[#708078]">No confirmed transactions yet.</li> : null}
        </ul>
        <p className="break-all text-xs text-[#708078]">Facility contract {facilityContractId()}</p>
      </div>
    </DashboardLayout>
  );
}
