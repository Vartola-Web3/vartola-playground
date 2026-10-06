import Link from 'next/link';
import type { ReactNode } from 'react';
import { StatusBadge } from '@/components/docs/badge';
import { RoadmapTimeline } from '@/components/docs/roadmap';
import { TESTNET, accountUrl, contractUrl, txUrl } from '@/lib/docs/testnet';
import { SiteFooter, SiteNav } from '@/components/marketing/site-shell';
import {
  ARCHITECTURE,
  CAN_PROCEED,
  CURRENT_POSITION,
  DISCLAIMER,
  ENGINEERING_PRIORITIES,
  GATED,
  GITHUB,
  GRANT_ASK,
  GRANT_MILESTONES,
  GRANT_SENTENCE,
  IMPLEMENTATION,
  MAINNET_GATES,
  MAINNET_STATEMENT,
  MONEY_FLOW,
  NEXT_MILESTONE,
  SOROBAN_ROLE,
  ON_CHAIN_ITEMS,
  PRIVATE_ITEMS,
  SEO,
  STELLAR_ROLE,
  VTAED,
} from '@/lib/docs/product';
import { QUALITY_STATUS } from '@/lib/docs/quality-status';
import type { Metadata } from 'next';

export const metadata: Metadata = { title: SEO.technical.title, description: SEO.technical.description };


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
  ['Facility', 'facility_contract: create_facility (versioned terms), facility, escrow_state, facility_version, set_supplier, advance_status, pause and unpause.'],
  ['Escrow', 'Explicit states: open, partially funded, fully funded, release locked, release authorized, released, refunded, closed. reserve moves the settlement asset in; refund and cancel_reservation return it; funds leave only through the supplier release, settlement or recovery. Every transition emits an event.'],
  ['Participation', 'Units issued on reserve (unit = 100 of the settlement asset); position_units and issued_units read them.'],
  ['Release', 'lock_release, attest_release_condition (eight conditions, each by its responsible role, evidence by hash only), authorize_release (administrator), release_supplier_payment (treasury role, daily limit), activate_facility.'],
  ['Repayment', 'record_repayment (borrower only) uses calculate_waterfall: fee, reserve, principal, income. The same finance_math module serves settlement and recovery.'],
  ['Distribution', 'Pro rata to Participation Units, last holder takes the rounding remainder; cumulative principal, income and recovery are stored per position and per facility; DistributionCalculated and DistributionExecuted events.'],
  ['Settlement', 'set_settlement_quote (operations role) fixes the terms; settle (payer) closes the facility at outstanding principal plus accrued amount plus fee less rebate. A payer cannot choose the terms.'],
  ['Recovery', 'record_recovery allocates net proceeds after recovery costs.'],
  ['Attestations', 'attest_document and attest_risk store hashes, model version and grade only; passport events (created, delivered, activated, insurance, registration, recovered, disposed) are emitted by set_asset_status.'],
];

export default function TechnicalPage() {
  return (
    <div className="vartola-grid min-h-screen text-[#F6FFF9]">
      <SiteNav />
      <main className="vartola-frame space-y-6 py-14">
        <header>
          <p className="text-xs uppercase tracking-[0.18em] text-[#70FFB8]">Technical architecture · CURRENT — STELLAR TESTNET</p>
          <h1 className="mt-3 max-w-4xl text-5xl font-semibold leading-[1.05] tracking-tight">Vartola Technical Architecture</h1>
          <p className="mt-4 max-w-3xl text-lg leading-8 text-[#9FB8AD]">
            For Stellar reviewers, developers, technical partners, and institutional readers. Every claim on this page matches the repository. Contract IDs below are the real Stellar Testnet deployment.
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
              ['facility', 'Facility #001'],
              ['references', 'L · References'],
              ['state', 'M · State'],
              ['risk', 'N · Risk'],
              ['operations', 'O · Operations'],
              ['governance', 'P · Governance'],
              ['priorities', 'Priorities'],
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
            <StatusBadge status="TESTNET" /> Implemented with unit tests, deployed and initialized on Stellar Testnet; not audited, not on Mainnet. Older pool, subscription, and payment_distributor contracts in the repository are not the Alpha money path.
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
          <p>Soroban / Stellar → event indexer → Prisma read model → optional Firebase operations journal. The indexer reads contract events with a stored cursor and mirrors them. <StatusBadge status="TESTNET" /> Duplicate and out-of-order events are handled, failures retry and dead-letter, and re-indexing is safe.</p>
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
                  ['Key-management abstraction', 'Server-held keys, encrypted wallet secrets, wallet-provider interface. Production custody is a security gate.', 'TESTNET'],
                  ['Emergency controls', 'Contract pause, two-step admin rotation, release limit, timelocked upgrades; separate role wallets.', 'TESTNET'],
                  ['Multisig', 'Policies defined (for example 2-of-3, 3-of-5) but not enforced on-chain; Testnet uses single role keys.', 'SECURITY GATE'],
                  ['Admin MFA and encrypted secrets', 'TOTP MFA for admin roles in Alpha mode; provider secrets encrypted at rest.', 'LIVE IN ALPHA'],
                  ['Independent audit and monitoring', 'Audit log, operations health and an audit-readiness package exist. No independent audit or penetration test yet.', 'SECURITY GATE'],
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
              <p className="mt-1">VTAED issued, accounts and trustlines, event fingerprints, Soroban contracts v3 deployed and exercised by three reference facilities. {VTAED.note}</p>
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

        <Block id="facility" letter="Facility #001 and test facilities" title="Executed on Stellar Testnet through the Soroban contracts.">
          <p>Run in an isolated Alpha test environment (not the public Demo walkthrough). Every row below is a confirmed Testnet transaction.</p>
          <div className="mt-4 space-y-5">
            {TESTNET.facilities.map((facility) => (
              <article key={facility.facilityNo} className="rounded-2xl border border-white/10 bg-[#091713] p-4">
                <details open={facility.facilityNo === 'FAC-FLEET-001'}>
                <summary className="cursor-pointer font-semibold text-[#F6FFF9]">{facility.facilityNo}: {facility.financeAmount.toLocaleString('en-US')} VTAED · {facility.participationUnits} Participation Units · {facility.status} · {facility.events.length} confirmed events</summary>
                <div className="mt-2 overflow-x-auto">
                  <table className="w-full min-w-[34rem] text-left text-xs">
                    <tbody>
                      {facility.events.map((event) => (
                        <tr key={event.txHash + event.eventType} className="border-t border-white/10">
                          <th className="w-[26%] py-2 pr-3 font-medium text-[#D7E7DF]">{event.eventType}</th>
                          <td className="py-2 pr-3">ledger {event.ledger}</td>
                          <td className="py-2 break-all"><a className="underline underline-offset-4" href={txUrl(event.txHash)}>{event.txHash}</a></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                </details>
              </article>
            ))}
          </div>
        </Block>

        <Block id="references" letter="L · Real references" title="Only references that exist.">
          <dl className="space-y-3 break-all">
            <div><dt className="text-[#70FFB8]">Network</dt><dd>{VTAED.network}</dd></div>
            <div><dt className="text-[#70FFB8]">VTAED issuer</dt><dd><a className="underline underline-offset-4" href={VTAED.assetUrl}>{VTAED.issuer}</a></dd></div>
            <div><dt className="text-[#70FFB8]">Distribution account</dt><dd><a className="underline underline-offset-4" href={VTAED.distributorUrl}>{VTAED.distributor}</a></dd></div>
            <div><dt className="text-[#70FFB8]">wallet_registry</dt><dd><a className="underline underline-offset-4" href={contractUrl(TESTNET.deployment.registryContractId)}>{TESTNET.deployment.registryContractId}</a></dd></div>
            <div><dt className="text-[#70FFB8]">facility_contract</dt><dd><a className="underline underline-offset-4" href={contractUrl(TESTNET.deployment.facilityContractId)}>{TESTNET.deployment.facilityContractId}</a></dd></div>
            <div><dt className="text-[#70FFB8]">VTAED Stellar Asset Contract</dt><dd><a className="underline underline-offset-4" href={contractUrl(TESTNET.deployment.asset.contractId)}>{TESTNET.deployment.asset.contractId}</a></dd></div>
            <div><dt className="text-[#70FFB8]">Administrator · Pauser · Treasury</dt><dd><a className="underline underline-offset-4" href={accountUrl(TESTNET.deployment.admin)}>{TESTNET.deployment.admin}</a><br /><a className="underline underline-offset-4" href={accountUrl(TESTNET.deployment.pauser)}>{TESTNET.deployment.pauser}</a><br /><a className="underline underline-offset-4" href={accountUrl(TESTNET.deployment.treasury)}>{TESTNET.deployment.treasury}</a></dd></div>
            {Object.entries(TESTNET.deployment.roles || {}).map(([role, address]) => (
              <div key={role}><dt className="text-[#70FFB8]">Role wallet · {role}</dt><dd><a className="underline underline-offset-4" href={accountUrl(address)}>{address}</a></dd></div>
            ))}
            {(TESTNET.deployment.history || []).map((item) => (
              <div key={item.version}><dt className="text-[#70FFB8]">Superseded {item.version} · facility contract</dt><dd><a className="underline underline-offset-4" href={contractUrl(item.facilityContractId)}>{item.facilityContractId}</a><br />{item.note}</dd></div>
            ))}
            {Object.entries(TESTNET.deployment.transactions).map(([label, tx]) => (
              <div key={label}><dt className="text-[#70FFB8]">{label} · ledger {tx.ledger}</dt><dd><a className="underline underline-offset-4" href={txUrl(tx.hash)}>{tx.hash}</a></dd></div>
            ))}
            <div><dt className="text-[#70FFB8]">Source code</dt><dd><a className="underline underline-offset-4" href={GITHUB}>{GITHUB}</a></dd></div>
          </dl>
        </Block>

        <Block id="state" letter="M · Financial state model" title="Wallet permission, facility, position, escrow, release, repayment, distribution, settlement, recovery.">
          <p>Each stage is a contract state with events anyone can read. Permission and position live on-chain; identity and commercial documents do not. Release is authorized by one role and paid by another. One waterfall serves repayment, settlement and recovery, so the arithmetic cannot drift.</p>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <article className="rounded-2xl border border-[#70FFB8]/25 bg-[#091713] p-4"><h3 className="font-semibold text-[#F6FFF9]">On-chain</h3><ul className="mt-2 list-disc space-y-1 pl-5">{ON_CHAIN_ITEMS.map((item) => <li key={item}>{item}</li>)}</ul></article>
            <article className="rounded-2xl border border-white/10 bg-[#091713] p-4"><h3 className="font-semibold text-[#F6FFF9]">Off-chain (private)</h3><ul className="mt-2 list-disc space-y-1 pl-5">{PRIVATE_ITEMS.map((item) => <li key={item}>{item}</li>)}</ul></article>
          </div>
        </Block>

        <Block id="risk" letter="N · Risk, Expected Loss and attestation" title="Deterministic, explainable, and anchored.">
          <p>Facility risk v2 combines nine components with versioned weights and a hashed input snapshot. An internal Expected Loss estimate (PD × LGD × EAD) uses configurable assumptions and stores the model version, input hash and explanation. Rule-based, not machine learning, not a regulated rating. The model version, score, grade and input hash can be attested on-chain so a score cannot be silently changed after funding; the inputs stay private.</p>
        </Block>

        <Block id="operations" letter="O · Passport, treasury, reconciliation and operations" title="What runs after funding.">
          <ul className="list-disc space-y-1 pl-5">
            <li>Digital Asset Passport: hashed serial, supplier, delivery, registration, insurance, valuation, recovery status and a verification panel that names each check&apos;s source.</li>
            <li>Asset servicing and an internal Asset Health indicator; supplier network with a performance score that shows NOT ENOUGH DATA without real history.</li>
            <li>Treasury control center with chain-versus-application state and facility reserves that are never presented as a guarantee.</li>
            <li>Collections and recovery workspaces, insurance-event and supplier-failure workflows, all audit-logged.</li>
            <li>Reconciliation reports HEALTHY, WARNING or FAILED and never rewrites chain history; operations health covers RPC, indexer, providers and security signals.</li>
          </ul>
        </Block>

        <Block id="governance" letter="P · Governance, continuity and testing" title="Controlled, recoverable, tested.">
          <p>Separate role wallets and a privileged role matrix; contract versions, deployments and authorizers are recorded; multisig-ready but not enforced. Facility state lives on the contracts, so an application outage does not change who holds what; backup, disaster-recovery and wind-down plans are documented but not yet drilled. An audit-readiness package (contract inventory, authorization matrix, invariants, known limitations) is prepared; no audit is engaged.</p>
          <p className="mt-3">Recorded engineering evidence: {QUALITY_STATUS.applicationTests.passed} application tests, {QUALITY_STATUS.contractTests.passed} contract tests, {QUALITY_STATUS.lintErrors} lint errors, build {QUALITY_STATUS.build} ({QUALITY_STATUS.recordedOn}). Verify the contracts and each reference facility on the <Link className="text-[#70FFB8] underline underline-offset-4" href="/proof">Proof Center</Link>.</p>
        </Block>

        <section id="priorities" className="scroll-mt-24 rounded-[28px] border border-[rgba(112,255,184,0.14)] bg-[#0E211B] p-6 sm:p-8">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#70FFB8]">Current technical status</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight">Immediate engineering priority</h2>
          <p className="mt-3 text-sm leading-7 text-[#9FB8AD]">{CURRENT_POSITION} The Soroban execution path is complete end to end on Testnet. Vartola is not Mainnet-ready, production-ready or audited: the next stage is independent security, a regulated operating structure, production financial rails and a controlled pilot.</p>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {ENGINEERING_PRIORITIES.map((group, index) => (
              <article key={group.title} className="rounded-2xl border border-white/10 bg-[#091713] p-4">
                <p className="text-xs font-semibold text-[#70FFB8]">Priority {index + 1}</p>
                <h3 className="mt-1 font-semibold text-[#F6FFF9]">{group.title}</h3>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-[#9FB8AD]">
                  {group.items.map((item) => <li key={item}>{item}</li>)}
                </ul>
              </article>
            ))}
          </div>
          <p className="mt-4 text-sm leading-7 text-[#D7E7DF]"><strong>Next milestone:</strong> {NEXT_MILESTONE}</p>
        </section>

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
          <h2 className="text-2xl font-semibold">Ecosystem support · {GRANT_ASK}</h2>
          <p className="mt-3 text-sm leading-7 text-[#52635C]">{GRANT_SENTENCE} Regulatory approval is not a deliverable Vartola controls. The detailed budget is shared privately.</p>
          <div className="mt-6 grid gap-4 lg:grid-cols-3">
            {GRANT_MILESTONES.map((milestone) => (
              <article key={milestone.name} className="rounded-2xl border border-[#DDE7E1] bg-white p-4">
                <p className="text-xs font-semibold text-[#087A50]">{milestone.name} · {milestone.window}</p>
                <ul className="mt-3 list-disc space-y-1 pl-4 text-sm leading-6 text-[#52635C]">
                  {milestone.deliverables.map((item) => <li key={item}>{item}</li>)}
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
