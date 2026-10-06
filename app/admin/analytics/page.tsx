import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth/auth';
import { isAdminOperator } from '@/lib/auth/roles';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { TransparencyPanel } from '@/components/web3/transparency-panel';
import { adminAnalytics } from '@/lib/alpha/analytics';
import { isAlphaMode } from '@/lib/config/app-mode';

export const dynamic = 'force-dynamic';

const money = (value: number) => `${value.toLocaleString('en-US', { maximumFractionDigits: 2 })} VTAED`;
const percent = (value: number) => `${Math.round(value * 1000) / 10}%`;

export default async function AdminAnalyticsPage() {
  const session = await auth();
  if (!session?.user || !isAdminOperator(session.user.role)) redirect('/login');
  const alpha = isAlphaMode();
  const stats = alpha ? await adminAnalytics() : null;
  return (
    <DashboardLayout role={session.user.role}>
      <div className="w-full space-y-4">
        <div>
          <h1 className="text-3xl font-semibold">Portfolio analytics</h1>
          <p className="mt-1 text-sm text-[#708078]">Computed from the indexed Stellar Testnet record. Testnet VTAED values are simulated and have no monetary value.</p>
        </div>
        {alpha ? <TransparencyPanel /> : <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-950">Analytics and transparency read the chain-backed Alpha record. Switch to APP_MODE=ALPHA to see them.</p>}
        {stats ? (
          <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              ['On-chain value (Testnet)', money(stats.onChainValue)],
              ['Total facilities', String(stats.totalFacilities)],
              ['Funding rate', percent(stats.fundingRate)],
              ['Repayment rate', percent(stats.repaymentRate)],
              ['Outstanding principal', money(stats.outstandingPrincipal)],
              ['Late exposure', money(stats.lateExposure)],
              ['Default exposure', money(stats.defaultExposure)],
              ['Recovery rate', percent(stats.recoveryRate)],
            ].map(([label, value]) => (
              <div key={label} className="rounded-2xl border border-[#E5ECE8] bg-white p-4 shadow-sm">
                <dt className="text-xs text-[#708078]">{label}</dt>
                <dd className="mt-1 text-lg font-semibold">{value}</dd>
              </div>
            ))}
          </dl>
        ) : null}
      </div>
    </DashboardLayout>
  );
}
