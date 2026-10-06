import { prisma } from '@/lib/db';
import { facilityContractId } from '@/lib/stellar/keys';
import { receiptsForFacility } from '@/lib/alpha/receipts';

const money = (value: number) => `${value.toLocaleString('en-US', { maximumFractionDigits: 2 })} VTAED`;

// SME view of a financed facility: balance and next payment first, blockchain references under Advanced.
export async function SmeFacilityPanel({ facilityId }: { facilityId: string }) {
  const facility = await prisma.facility.findUnique({
    where: { id: facilityId },
    include: { payments: { orderBy: { paymentNo: 'asc' } }, allocations: true, passports: true, attestations: true },
  });
  if (!facility || facility.chainStatus !== 'CHAIN_CONFIRMED') return null;
  const principalRepaid = facility.allocations.reduce((sum, row) => sum + row.principalReturned, 0);
  const closed = ['COMPLETED', 'CLOSED'].includes(facility.status);
  const outstanding = closed ? 0 : Math.max(facility.financeAmount - principalRepaid, 0);
  const next = facility.payments.find((row) => row.status !== 'PAID');
  const receipts = (await receiptsForFacility(facilityId)).filter((row) => row.type !== 'INVESTMENT' && row.type !== 'DISTRIBUTION');
  return (
    <section className="rounded-3xl border border-[#E5ECE8] bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold">Facility summary</h2>
      <p className="text-sm text-[#708078]">Testnet values have no monetary value.</p>
      <dl className="mt-4 grid gap-3 sm:grid-cols-3">
        {[
          ['Outstanding balance', money(outstanding)],
          ['Principal repaid', money(principalRepaid)],
          ['Next payment', next ? `${money(next.amount)} · ${next.dueDate.toLocaleDateString('en-GB')}` : 'None due'],
          ['Facility status', facility.status.replaceAll('_', ' ')],
          ['Asset', facility.passports[0] ? `${facility.passports[0].assetType} · ${facility.passports[0].deliveryStatus}` : 'Not recorded'],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl bg-[#F6F9F7] p-3">
            <dt className="text-xs text-[#708078]">{label}</dt>
            <dd className="mt-1 font-semibold">{value}</dd>
          </div>
        ))}
      </dl>
      <details className="mt-4 text-sm">
        <summary className="cursor-pointer font-medium text-[#0D7A52]">Advanced: Stellar references</summary>
        <div className="mt-3 space-y-2 text-xs text-[#52635C]">
          <p className="break-all">Facility contract {facilityContractId()}</p>
          <p>Document attestations: {facility.attestations.length} · Asset attestations: {facility.passports.filter((row) => row.chainTxHash).length}</p>
          <ul className="space-y-1">
            {receipts.map((receipt) => (
              <li key={receipt.receiptHash} className="break-all">
                {receipt.title} · ledger {receipt.ledger || 'pending'} · <a className="text-[#0D7A52] underline" href={receipt.explorerUrl} target="_blank" rel="noreferrer">{receipt.transactionHash.slice(0, 16)}…</a>
              </li>
            ))}
          </ul>
        </div>
      </details>
    </section>
  );
}
