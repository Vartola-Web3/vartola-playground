import Link from 'next/link';
import type { Metadata } from 'next';
import { SiteFooter, SiteNav } from '@/components/marketing/site-shell';
import { TESTNET } from '@/lib/docs/testnet';
import { NECESSITY, NECESSITY_CAVEATS } from '@/lib/docs/necessity';
import { QUALITY_STATUS } from '@/lib/docs/quality-status';

export const metadata: Metadata = { title: 'Reviewer overview | Vartola', description: 'A fast technical overview of Vartola for grant and technical reviewers: current facts only.' };

const panel = 'rounded-[28px] border border-[rgba(112,255,184,0.14)] bg-[#091713] p-6';
const a = 'text-[#70FFB8] underline underline-offset-4';

const SECTIONS: [string, string][] = [
  ['Problem', 'UAE SMEs that run vehicle fleets and equipment need asset finance but face slow, opaque and collateral-heavy lending. Investors who could fund productive assets lack a controlled way to participate and see where money goes.'],
  ['Why productive assets', 'A delivery van or a refrigerated truck earns revenue, has a resale market, can be insured and tracked, and secures its own financing. The asset, the supplier and the servicing lifecycle make the loan checkable in a way an unsecured loan is not.'],
  ['Why Stellar', 'Fast, low-cost settlement, a native account and asset model, issuer-controlled assets with trustlines, and an established payments ecosystem. Vartola needs a settlement rail with predictable finality, not a speculative token.'],
  ['Why Soroban', 'Facility rules need to be code, not policy: escrow, participation units, release conditions with separate roles, one waterfall for repayment, settlement and recovery, and events anyone can verify.'],
  ['Current architecture', 'Stellar settles value. Soroban executes facility logic. Prisma is the application read model. Firebase is an append-only operations journal. Private object storage holds sensitive documents. Flow: user action, validation, Soroban execution, chain confirmation, Prisma projection, Firebase event, reconciliation.'],
];

export default function ReviewerPage() {
  const d = TESTNET.deployment;
  const q = QUALITY_STATUS;
  return (
    <div className="vartola-grid min-h-screen text-[#F6FFF9]">
      <SiteNav />
      <main className="vartola-frame space-y-6 py-14">
        <header>
          <p className="text-xs uppercase tracking-[0.18em] text-[#70FFB8]">Reviewer overview · Working Alpha, Stellar Testnet only</p>
          <h1 className="mt-3 text-4xl font-semibold tracking-tight">Vartola in ten minutes</h1>
          <p className="mt-3 max-w-3xl text-sm leading-7 text-[#9FB8AD]">
            Programmable financial infrastructure for productive real-world assets, built on Stellar and executed through Soroban. This page states only current facts. Grant budget details are shared privately with the reviewing team.
          </p>
        </header>

        {SECTIONS.map(([title, body]) => (
          <section key={title} className={panel}><h2 className="text-xl font-semibold">{title}</h2><p className="mt-2 text-sm leading-7 text-[#C3D1CB]">{body}</p></section>
        ))}

        <section className={panel}>
          <h2 className="text-xl font-semibold">Live Testnet proof</h2>
          <p className="mt-2 text-sm leading-7 text-[#C3D1CB]">
            Contracts v{d.contractVersion ?? 3} are deployed on Stellar Testnet with separate wallets for administrator, pauser, treasury, underwriter, operations and compliance. {TESTNET.facilities.length} reference facilities ran end to end, including an early settlement and a default with recovery. See the <Link className={a} href="/proof">Proof Center</Link>.
          </p>
        </section>

        <section className={panel}>
          <h2 className="text-xl font-semibold">Facility lifecycle and web3 financial execution</h2>
          <p className="mt-2 text-sm leading-7 text-[#C3D1CB]">Created, funded by investors for Participation Units, escrow locked, eight release conditions attested, release authorized by one role and paid by another to the approved supplier, asset delivered and registered, repayments split by one waterfall, distributions by units, and early settlement or default and recovery with closure. Capital never reaches the SME. <Link className={a} href="/proof/facility/FAC-FLEET-001">Walk through Facility #001</Link>.</p>
        </section>

        <section className={panel}>
          <h2 className="text-xl font-semibold">Why on-chain? Compared with a private database</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[40rem] text-left text-xs">
              <thead><tr className="text-[#70FFB8]"><th className="py-2 pr-3 font-medium">Function</th><th className="py-2 pr-3 font-medium">Private database only</th><th className="py-2 font-medium">Soroban / Stellar value</th></tr></thead>
              <tbody>
                {NECESSITY.map((row) => (
                  <tr key={row.fn} className="border-t border-white/10 align-top"><th className="w-[18%] py-2 pr-3 font-medium text-[#F6FFF9]">{row.fn}</th><td className="py-2 pr-3 text-[#9FB8AD]">{row.database}</td><td className="py-2 text-[#C3D1CB]">{row.chain}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
          <ul className="mt-4 list-disc space-y-1 pl-5 text-xs text-[#9FB8AD]">{NECESSITY_CAVEATS.map((item) => <li key={item}>{item}</li>)}</ul>
        </section>

        {[
          ['Risk engine', 'A deterministic, explainable facility score (nine components, versioned, hashed inputs) and an internal expected-loss estimate (PD × LGD × EAD) with configurable assumptions. Rule-based, not machine learning, not a regulated rating. The risk hash can be attested on-chain so a score cannot be silently changed after funding.'],
          ['Asset passport', 'Each financed asset has a passport with a hashed serial, supplier, delivery, registration, insurance, valuation and recovery status, and an internal asset health indicator. Each verification check names its source.'],
          ['Reconciliation', 'An indexer reads contract events with a persistent cursor, retries and dead letters. A scheduled reconciliation compares the chain with the read model and reports HEALTHY, WARNING or FAILED. It never rewrites chain history.'],
          ['Security architecture', 'Separate role wallets, release by two different roles, daily release limit, pause, two-step admin rotation, timelocked upgrades, TOTP admin MFA, encrypted provider secrets and private signed document storage. Internal and pre-audit: no independent audit or penetration test yet.'],
        ].map(([title, body]) => (
          <section key={title} className={panel}><h2 className="text-xl font-semibold">{title}</h2><p className="mt-2 text-sm leading-7 text-[#C3D1CB]">{body}</p></section>
        ))}

        <section className={panel}>
          <h2 className="text-xl font-semibold">Traction and pilot pipeline</h2>
          <p className="mt-2 text-sm leading-7 text-[#C3D1CB]">No signed SME, supplier or partner commitments are claimed. Vartola has built the pipeline system that records real pilot discussions, and shows zero until real ones are entered. Early conversations will be reported only once they are real and verifiable.</p>
        </section>

        <section className={panel}>
          <h2 className="text-xl font-semibold">Road to Mainnet</h2>
          <p className="mt-2 text-sm leading-7 text-[#C3D1CB]">Mainnet is a controlled, regulated transition. Required first: independent smart-contract audit and penetration test, regulatory opinion and licensing route or licensed partner, custody and client-money design, an approved settlement asset and payment rail, approved legal agreements and security structure, production operations and monitoring. No Mainnet date is promised. The internal readiness scorecard tracks each gate.</p>
        </section>

        <section className={panel}>
          <h2 className="text-xl font-semibold">Grant objectives</h2>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm leading-7 text-[#C3D1CB]">
            <li>Commission an independent audit of the Soroban contracts and remediate findings.</li>
            <li>Move privileged roles to multisig and managed key custody.</li>
            <li>Run a supervised Testnet pilot with real SMEs and suppliers, using no real money.</li>
            <li>Complete compliance infrastructure and legal structure work with qualified counsel.</li>
            <li>Harden indexing, monitoring and reconciliation for production-grade operations.</li>
          </ul>
        </section>

        <p className="text-xs text-[#9FB8AD]">Engineering evidence recorded {q.recordedOn}: {q.contractTests.passed} contract tests, {q.applicationTests.passed} application tests, {q.lintErrors} lint errors, build {q.build}. See <Link className={a} href="/technical">Technical</Link> and <Link className={a} href="/docs">Docs</Link>.</p>
      </main>
      <SiteFooter />
    </div>
  );
}
