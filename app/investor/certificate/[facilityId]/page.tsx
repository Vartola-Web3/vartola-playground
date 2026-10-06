import { notFound, redirect } from 'next/navigation';
import { auth } from '@/lib/auth/auth';
import { certificateFor } from '@/lib/alpha/positions';
import { explorerTx } from '@/lib/alpha/receipts';
import { PrintButton } from '@/components/web3/print-button';

export const dynamic = 'force-dynamic';

const money = (value: number) => `${value.toLocaleString('en-US', { maximumFractionDigits: 2 })} VTAED`;

export default async function CertificatePage({ params }: { params: Promise<{ facilityId: string }> }) {
  const { facilityId } = await params;
  const session = await auth();
  if (!session?.user || session.user.role !== 'INVESTOR') redirect('/login');
  const certificate = await certificateFor(session.user.id, facilityId);
  if (!certificate) notFound();
  const { position } = certificate;
  return (
    <main className="mx-auto max-w-3xl p-6 text-[#13251E]">
      <div className="rounded-3xl border border-[#DCE6E1] bg-white p-8 shadow-sm print:border-0 print:shadow-none">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#087A50]">Vartola · {certificate.network}</p>
        <h1 className="mt-2 text-3xl font-semibold">Digital participation certificate</h1>
        <p className="mt-3 rounded-xl bg-amber-50 p-3 text-sm text-amber-950">{certificate.notice}</p>
        <dl className="mt-6 grid gap-4 text-sm sm:grid-cols-2">
          <div><dt className="text-[#708078]">Facility</dt><dd className="font-semibold">{position.facilityNo}</dd></div>
          <div><dt className="text-[#708078]">Status</dt><dd className="font-semibold">{position.status.replace('_', ' ')} · facility {position.facilityStatus}</dd></div>
          <div className="sm:col-span-2"><dt className="text-[#708078]">Wallet</dt><dd className="break-all font-mono text-xs">{position.investorWallet || 'Not available'}</dd></div>
          <div><dt className="text-[#708078]">Participation Units</dt><dd className="font-semibold">{position.participationUnits}</dd></div>
          <div><dt className="text-[#708078]">Committed amount</dt><dd className="font-semibold">{money(position.committedAmount)}</dd></div>
          <div><dt className="text-[#708078]">Current outstanding exposure</dt><dd className="font-semibold">{money(position.outstandingExposure)}</dd></div>
          <div><dt className="text-[#708078]">Principal returned</dt><dd className="font-semibold">{money(position.principalReturned)}</dd></div>
          <div><dt className="text-[#708078]">Income distributed</dt><dd className="font-semibold">{money(position.incomeReceived)}</dd></div>
          <div><dt className="text-[#708078]">Recovery received</dt><dd className="font-semibold">{money(position.recoveryReceived)}</dd></div>
          <div className="sm:col-span-2"><dt className="text-[#708078]">Facility contract</dt><dd className="break-all font-mono text-xs">{certificate.contractId}</dd></div>
        </dl>
        <h2 className="mt-6 text-sm font-semibold">Chain references</h2>
        <ul className="mt-2 space-y-1 text-xs">
          {certificate.chainReferences.map((reference) => (
            <li key={reference.transactionHash} className="break-all">{reference.eventType} · ledger {reference.ledger} · <a className="text-[#0D7A52] underline" href={explorerTx(reference.transactionHash)}>{reference.transactionHash}</a></li>
          ))}
        </ul>
        <p className="mt-6 text-xs text-[#708078]">Generated {new Date(certificate.issuedAt).toLocaleString('en-GB')}. Positions are non-transferable.</p>
      </div>
      <div className="mt-4 flex gap-3">
        <PrintButton />
        <a className="rounded-full border border-[#DCE6E1] px-4 py-2 text-sm print:hidden" href={`/api/investor/certificate/${facilityId}`}>Download JSON</a>
      </div>
    </main>
  );
}
