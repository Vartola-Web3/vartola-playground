import Link from 'next/link';
import { investorAnalytics, TESTNET_NOTE } from '@/lib/alpha/analytics';
import { positionsForInvestor } from '@/lib/alpha/positions';

const money = (value: number) => `${value.toLocaleString('en-US', { maximumFractionDigits: 2 })} VTAED`;

// "My positions" for an investor: plain amounts first, blockchain proof one click away.
export async function PositionsPanel({ investorId }: { investorId: string }) {
  const [positions, analytics] = await Promise.all([positionsForInvestor(investorId), investorAnalytics(investorId)]);
  if (positions.length === 0) return null;
  return (
    <section className="space-y-4 rounded-3xl border border-[#E5ECE8] bg-white p-6 shadow-sm">
      <div>
        <h2 className="text-xl font-semibold">My positions</h2>
        <p className="text-sm text-[#708078]">{TESTNET_NOTE}</p>
      </div>
      <dl className="grid gap-3 sm:grid-cols-3 lg:grid-cols-5">
        {[
          ['Deployed', money(analytics.totalDeployed)],
          ['Outstanding principal', money(analytics.outstandingPrincipal)],
          ['Principal returned', money(analytics.principalReturned)],
          ['Income received', money(analytics.incomeReceived)],
          ['Recovery received', money(analytics.recoveryReceived)],
          ['Weighted risk grade', analytics.weightedRiskGrade || 'Not scored'],
          ['Active facilities', String(analytics.activeFacilities)],
          ['Late facilities', String(analytics.lateFacilities)],
          ['Default exposure', money(analytics.defaultExposure)],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl bg-[#F6F9F7] p-3">
            <dt className="text-xs text-[#708078]">{label}</dt>
            <dd className="mt-1 font-semibold">{value}</dd>
          </div>
        ))}
      </dl>
      <div className="grid gap-3 lg:grid-cols-2">
        {positions.map((row) => (
          <article key={row.facilityId} className="rounded-2xl border border-[#E5ECE8] p-4">
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-semibold">{row.facilityNo}</h3>
              <span className="rounded-full bg-[#E7F8EF] px-2 py-0.5 text-xs font-semibold text-[#087A50]">{row.status.replace('_', ' ')}</span>
            </div>
            <dl className="mt-3 grid grid-cols-2 gap-2 text-sm">
              <div><dt className="text-xs text-[#708078]">Participation Units</dt><dd>{row.participationUnits}</dd></div>
              <div><dt className="text-xs text-[#708078]">Deployed capital</dt><dd>{money(row.deployedAmount)}</dd></div>
              <div><dt className="text-xs text-[#708078]">Outstanding</dt><dd>{money(row.outstandingExposure)}</dd></div>
              <div><dt className="text-xs text-[#708078]">Principal returned</dt><dd>{money(row.principalReturned)}</dd></div>
              <div><dt className="text-xs text-[#708078]">Income received</dt><dd>{money(row.incomeReceived)}</dd></div>
              <div><dt className="text-xs text-[#708078]">Recovery received</dt><dd>{money(row.recoveryReceived)}</dd></div>
            </dl>
            <div className="mt-3 flex flex-wrap gap-3 text-sm">
              <Link className="text-[#0D7A52] underline" href={`/investor/proof/${row.facilityId}`}>View on-chain proof</Link>
              <Link className="text-[#0D7A52] underline" href={`/investor/certificate/${row.facilityId}`}>Participation certificate</Link>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
