import Link from 'next/link';
import type { ReactNode } from 'react';
import { StatusBadge } from '@/components/docs/badge';
import { RoadmapTimeline } from '@/components/docs/roadmap';
import { SiteFooter, SiteNav } from '@/components/marketing/site-shell';
import {
  ARCHITECTURE,
  BUDGET,
  CAN_PROCEED,
  DISCLAIMER,
  GATED,
  GITHUB,
  GRANT_TOTAL,
  IMPLEMENTATION,
  MAINNET_GATES,
  MAINNET_STATEMENT,
  MONEY_FLOW,
  SOROBAN_ROLE,
  STELLAR_ROLE,
  TRANCHES,
  VTAED,
} from '@/lib/docs/product';

const money = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

function Block({ id, letter, title, children }: { id: string; letter: string; title: string; children: ReactNode }) {
  return (
    <section id={id} className="scroll-mt-24 rounded-[28px] border border-[rgba(112,255,184,0.14)] bg-[#0E211B] p-6 sm:p-8">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#70FFB8]">{letter}</p>
      <h2 className="mt-2 text-2xl font-semibold tracking-tight">{title}</h2>
      <div className="mt-4 text-sm leading-7 text-[#9FB8AD]">{children}</div>
    </section>
  );
}

const SYSTEM = [
  ['Frontend', 'Next.js App Router, role-separated SME, investor, underwriter, and admin areas.'],
  ['API / application layer', 'Next.js route handlers, NextAuth sessions, lifecycle and risk services.'],
  ['Prisma', 'Application data and read model (SQLite in this repository).'],
  ['Firebase', 'Firestore operations journal for admin visibility.'],
  ['Stellar', 'Testnet accounts, VTAED asset, trustlines, payments, event fingerprints via Horizon.'],
  ['Soroban', 'Wallet registry and facility contracts, called through Soroban RPC.'],
  ['Secure storage', 'Private object storage with signed URLs in Alpha mode; local disk in the walkthrough.'],
  ['Compliance providers', 'Sumsub token and signed webhook integration.'],
  ['Payment / custody providers', 'Selected after legal review. Not integrated for real money.'],
];

const CONTRACTS: [string, string][] = [
  ['Permission registry', 'wallet_registry: wallet registration, KYC and KYB flags, jurisdiction allowlist, investment limit, suspend and restore, is_allowed_to_invest.'],
  ['Facility', 'facility_contract: create_facility, set_supplier, advance_status, facility_status, pause and unpause.'],
  ['Escrow', 'reserve moves the settlement asset into the contract; refund returns it; funds leave only through release, settlement, or recovery rules.'],
  ['Participation', 'Units issued on reserve (unit = 100 of the settlement asset); position_units and issued_units read them.'],
  ['Release', 'mark_funded, authorize_release, release_to_supplier, activate_facility.'],
  ['Repayment', 'record_repayment splits gross into fee, reserve, principal, and income using finance_math.'],
  ['Distribution', 'Pro-rata to units, with the remainder to the last position.'],
  ['Settlement', 'quote_settlement and settle for early settlement.'],
  ['Recovery', 'record_recovery allocates net proceeds after recovery costs.'],
  ['Attestations', 'attest_document and upsert_passport store hashes and statuses only.'],
];

export default function TechnicalPage() {
  return (
    <div className="vartola-grid min-h-screen text-[#F6FFF9]">
      <SiteNav />
      <main className="vartola-frame space-y-6 py-14">
        <header>
          <p className="text-xs uppercase tracking-[0.18em] text-[#70FFB8]">Technical & grant brief</p>
          <h1 className="mt-3 max-w-4xl text-5xl font-semibold leading-[1.05] tracking-tight">Vartola Technical Architecture</h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-[#9FB8AD]">
            For Stellar reviewers, developers, technical partners, and institutional readers. Every claim on this page matches the repository. Contract IDs are omitted because the Soroban contracts are not yet deployed.
          </p>
          <nav className="mt-6 flex flex-wrap gap-2 text-xs">
            {[
              ['overview', 'A · System'],
              ['onchain', 'B · On / off-chain'],
              ['stellar', 'C · Stellar'],
              ['soroban', 'D · Soroban'],
              ['wallets', 'E · Wallets'],
              ['finality', 'F · Finality'],
              ['indexing', 'G · Indexing'],
              ['documents', 'H · Documents'],
              ['security', 'I · Security'],
              ['testnet', 'J · Testnet'],
              ['gates', 'K · Mainnet gates'],
              ['references', 'L · References'],
              ['status', 'Status'],
              ['grant', 'Grant'],
            ].map(([id, label]) => (
              <a key={id} href={`#${id}`} className="rounded-full border border-[rgba(112,255,184,0.25)] px-3 py-1.5 text-[#D7E7DF] hover:border-[#70FFB8]">{label}</a>
            ))}
          </nav>
        </header>

        <Block id="overview" letter="A · System overview" title="Three stores, three jobs.">
          <div className="grid gap-3 lg:grid-cols-3">
            {ARCHITECTURE.map((item) => (
              <article key={item.layer} className="rounded-2xl border border-white/10 bg-[#091713] p-4">
                <p className="text-xs uppercase tracking-[0.14em] text-[#70FFB8]">{item.role}</p>
                <h3 className="mt-1 text-lg font-semibold text-[#F6FFF9]">{item.layer}</h3>
                <p className="mt-1">{item.body}</p>
              </article>
            ))}
          </div>
          <p className="mt-4">The platform is deliberately hybrid. Prisma and Firebase are not being replaced.</p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[36rem] text-left">
              <tbody>
                {SYSTEM.map(([layer, body]) => (
                  <tr key={layer} className="border-t border-white/10 align-top">
                    <th className="w-[30%] py-3 pr-4 font-semibold text-[#F6FFF9]">{layer}</th>
                    <td className="py-3">{body}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Block>

        <Block id="onchain" letter="B · On-chain / off-chain model" title="Privacy off-chain. Integrity and money on-chain.">
          <div className="grid gap-4 md:grid-cols-2">
            <article className="rounded-2xl border border-[#70FFB8]/25 bg-[#091713] p-4">
              <h3 className="font-semibold text-[#F6FFF9]">On-chain</h3>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                {['Wallet address', 'Permission flags', 'Facility financial state', 'Escrow balances', 'Participation Units', 'Financial events', 'Repayment and distribution', 'Asset and document hashes'].map((item) => <li key={item}>{item}</li>)}
              </ul>
            </article>
            <article className="rounded-2xl border border-white/10 bg-[#091713] p-4">
              <h3 className="font-semibold text-[#F6FFF9]">Off-chain</h3>
              <ul className="mt-2 list-disc space-y-1 pl-5">
                {['Personal data (PII)', 'KYC documents', 'Company documents', 'Bank data', 'Credit information', 'Commercial contracts', 'Analytics', 'UI data'].map((item) => <li key={item}>{item}</li>)}
              </ul>
            </article>
          </div>
        </Block>

        <Block id="stellar" letter="C · Stellar layer" title="The network and the settlement layer.">
          <p>{STELLAR_ROLE}</p>
          <ul className="mt-3 list-disc space-y-1 pl-5">
            <li>Wallets: Stellar accounts per user and system role (issuer, distributor, admin).</li>
            <li>Assets: VTAED issued on Testnet; trustlines created for embedded wallets.</li>
            <li>Transactions: payments and, in demo mode, a manage_data event fingerprint per confirmed operation.</li>
            <li>Settlement: in Alpha mode, value moves through Soroban using the Stellar Asset Contract for VTAED.</li>
          </ul>
          <ol className="mt-4 flex flex-wrap items-center gap-2 text-xs">
            {MONEY_FLOW.map((step, index) => (
              <li key={step} className="flex items-center gap-2">
                <span className="rounded-xl bg-[#091713] px-3 py-2 text-[#D7E7DF]">{step}</span>
                {index < MONEY_FLOW.length - 1 ? <span className="text-[#70FFB8]">→</span> : null}
              </li>
            ))}
          </ol>
        </Block>

        <Block id="soroban" letter="D · Soroban layer" title="Contracts that execute the financing rules.">
          <p>{SOROBAN_ROLE}</p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[36rem] text-left">
              <tbody>
                {CONTRACTS.map(([module, body]) => (
                  <tr key={module} className="border-t border-white/10 align-top">
                    <th className="w-[22%] py-3 pr-4 font-semibold text-[#F6FFF9]">{module}</th>
                    <td className="py-3">{body}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="mt-4 flex flex-wrap items-center gap-2">
            <StatusBadge status="INTEGRATION IN PROGRESS" /> Implemented with unit tests. Not deployed; no contract IDs. Older pool, subscription, and payment_distributor contracts in the repository are not the Alpha money path.
          </p>
        </Block>

        <Block id="wallets" letter="E · Wallet architecture" title="Embedded wallet first. External wallet optional.">
          <p>Create account → identity verification → embedded Stellar wallet created → user uses Vartola normally. Users see cash, investments, payments, and distributions, and never handle seed phrases, gas, Soroban, or manual signing.</p>
          <p className="mt-3">In Alpha mode the Testnet secret is encrypted server-side and never returned to the client. A wallet-provider interface defines embedded, external, MPC, and custody wallet kinds; embedded and external linking are implemented. Production key custody is a security gate.</p>
        </Block>

        <Block id="finality" letter="F · Financial finality" title="The chain decides. The database follows.">
          <ol className="flex flex-wrap items-center gap-2 text-xs">
            {['Critical financial transaction', 'Soroban submission', 'Confirmation', 'Application read model updated'].map((step, index) => (
              <li key={step} className="flex items-center gap-2">
                <span className="rounded-xl bg-[#091713] px-3 py-2 text-[#D7E7DF]">{step}</span>
                {index < 3 ? <span className="text-[#70FFB8]">→</span> : null}
              </li>
            ))}
          </ol>
          <p className="mt-4">In Alpha mode the application simulates the call, submits it, and polls for the result. A failed or unconfirmed transaction throws, and no Prisma record is written as successful. Financial calls carry idempotency keys so a duplicate is rejected.</p>
        </Block>

        <Block id="indexing" letter="G · Event indexing" title="Chain events rebuild the read model.">
          <p>Soroban / Stellar → event indexer → Prisma read model → optional Firebase operations journal. The indexer reads contract events with a stored cursor and mirrors them. <StatusBadge status="IN DEVELOPMENT" /></p>
        </Block>

        <Block id="documents" letter="H · Document security" title="Private file → hash → attestation.">
          <p>Trade licence, lease agreement, supplier invoice, insurance, vehicle registration, VIN evidence, and delivery confirmation stay in private storage. A SHA-256 fingerprint is computed and attested on Soroban with a document type, entity hash, time, and verification status. The hash proves the verified document has not changed; the document itself stays private.</p>
        </Block>

        <Block id="security" letter="I · Security" title="Controls in place, and controls that are gates.">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[32rem] text-left">
              <tbody>
                {([
                  ['Role-based authorization', 'Per-role route protection for SME, investor, underwriter, and admin.', 'LIVE IN ALPHA'],
                  ['Rate limiting', 'On registration, subscription, and verification routes.', 'LIVE IN ALPHA'],
                  ['Webhook validation', 'Signed KYC webhooks.', 'LIVE IN ALPHA'],
                  ['Key-management abstraction', 'Server-held keys, encrypted wallet secrets, wallet-provider interface.', 'INTEGRATION IN PROGRESS'],
                  ['Emergency controls', 'Contract pause and admin rotation; role records for admin, treasury, pauser.', 'INTEGRATION IN PROGRESS'],
                  ['Multisig', 'Prepared in the governance design; Testnet uses a single operator.', 'SECURITY GATE'],
                  ['MFA-ready administration', 'Admin MFA required before Mainnet.', 'SECURITY GATE'],
                  ['Auditing and monitoring', 'Audit log in the product; independent audit and production monitoring before Mainnet.', 'SECURITY GATE'],
                ] as const).map(([control, body, status]) => (
                  <tr key={control} className="border-t border-white/10 align-top">
                    <th className="w-[28%] py-3 pr-4 font-semibold text-[#F6FFF9]">{control}</th>
                    <td className="py-3 pr-4">{body}</td>
                    <td className="py-3"><StatusBadge status={status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Block>

        <Block id="testnet" letter="J · Testnet status" title="Testnet now. Mainnet is not enabled.">
          <div className="grid gap-4 md:grid-cols-2">
            <article className="rounded-2xl border border-[#70FFB8]/25 bg-[#091713] p-4">
              <h3 className="font-semibold text-[#F6FFF9]">Testnet</h3>
              <p className="mt-1">VTAED issued, accounts and trustlines, event fingerprints, Soroban contracts ready for deployment. {VTAED.note}</p>
            </article>
            <article className="rounded-2xl border border-amber-200/25 bg-[#091713] p-4">
              <h3 className="font-semibold text-[#F6FFF9]">Mainnet</h3>
              <p className="mt-1">Not enabled. No real money, no live stablecoin, no regulated activity. {MAINNET_STATEMENT}</p>
            </article>
          </div>
        </Block>

        <Block id="gates" letter="K · Mainnet gates" title="Pre-Mainnet checklist.">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[36rem] text-left">
              <tbody>
                {MAINNET_GATES.map(([gate, body]) => (
                  <tr key={gate} className="border-t border-white/10 align-top">
                    <th className="w-[26%] py-3 pr-4 font-semibold text-[#F6FFF9]">{gate}</th>
                    <td className="py-3">{body}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div>
              <p className="font-semibold text-[#F6FFF9]">Can proceed now</p>
              <p className="mt-1">{CAN_PROCEED.join(' · ')}</p>
            </div>
            <div>
              <p className="font-semibold text-amber-100">Gated by approval</p>
              <p className="mt-1">{GATED.join(' · ')}</p>
            </div>
          </div>
        </Block>

        <Block id="references" letter="L · Real references" title="Only references that exist.">
          <dl className="space-y-3 break-all">
            <div><dt className="text-[#70FFB8]">Network</dt><dd>{VTAED.network}</dd></div>
            <div><dt className="text-[#70FFB8]">VTAED issuer</dt><dd><a className="underline underline-offset-4" href={VTAED.assetUrl}>{VTAED.issuer}</a></dd></div>
            <div><dt className="text-[#70FFB8]">Distribution account</dt><dd><a className="underline underline-offset-4" href={VTAED.distributorUrl}>{VTAED.distributor}</a></dd></div>
            <div><dt className="text-[#70FFB8]">Contract IDs</dt><dd>Not published. Contracts are not yet deployed.</dd></div>
            <div><dt className="text-[#70FFB8]">Source code</dt><dd><a className="underline underline-offset-4" href={GITHUB}>{GITHUB}</a></dd></div>
          </dl>
        </Block>

        <section id="status" className="scroll-mt-24 rounded-[28px] border border-white/10 bg-[#0D211A] p-6 sm:p-8">
          <h2 className="text-2xl font-semibold">Implementation status</h2>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[40rem] text-left text-sm">
              <tbody>
                {IMPLEMENTATION.map((item) => (
                  <tr key={item.area} className="border-t border-white/10 align-top">
                    <th className="w-[28%] py-4 pr-4 font-semibold">{item.area}</th>
                    <td className="py-4 pr-4 text-[#C3D1CB]">{item.detail}</td>
                    <td className="py-4"><StatusBadge status={item.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="rounded-[28px] border border-[rgba(112,255,184,0.14)] bg-[#091713] p-6 sm:p-8">
          <h2 className="text-2xl font-semibold">Roadmap</h2>
          <RoadmapTimeline />
        </section>

        <section id="grant" className="scroll-mt-24 rounded-[28px] bg-[#F7FAF8] p-6 text-[#102019] sm:p-8">
          <h2 className="text-2xl font-semibold">Grant milestones · {money.format(GRANT_TOTAL)} equivalent in XLM</h2>
          <p className="mt-3 text-sm leading-7 text-[#52635C]">Proposed allocation, the same on the Pitch and the Grant brief. Not historical spend. Regulatory approval is not a deliverable Vartola controls.</p>
          <div className="mt-4 overflow-x-auto">
            <table className="w-full min-w-[28rem] text-left text-sm">
              <tbody>
                {BUDGET.map((row) => (
                  <tr key={row.item} className="border-t border-[#DDE7E1]">
                    <td className="py-2 pr-4">{row.item}</td>
                    <td className="py-2 text-right font-medium">{money.format(row.amount)}</td>
                  </tr>
                ))}
                <tr className="border-t border-[#102019]">
                  <td className="py-2 font-semibold">Total</td>
                  <td className="py-2 text-right font-semibold">{money.format(BUDGET.reduce((sum, row) => sum + row.amount, 0))}</td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            {TRANCHES.map((tranche) => (
              <article key={tranche.name} className="rounded-2xl border border-[#DDE7E1] bg-white p-4">
                <p className="text-xs font-semibold text-[#087A50]">{tranche.name} · {tranche.window}</p>
                <p className="mt-1 font-semibold">{money.format(tranche.amount)}</p>
                <ul className="mt-3 list-disc space-y-1 pl-4 text-sm leading-6 text-[#52635C]">
                  {tranche.deliverables.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </article>
            ))}
          </div>
          <Link href="/grant" className="mt-4 inline-block text-sm font-medium text-[#087A50] underline underline-offset-4">Open the grant narrative</Link>
        </section>

        <p className="text-sm leading-7 text-[#9FB8AD]">{DISCLAIMER}</p>
      </main>
      <SiteFooter />
    </div>
  );
}
