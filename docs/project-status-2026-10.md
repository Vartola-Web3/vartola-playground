# Vartola — Project status report (October 2026)

Entity: RIMAL TECH - FZCO, a UAE Free Zone technology company. Not a licensed lender, broker, custodian, or investment firm.

## What exists (Working Alpha)

- **Roles and lifecycle:** SME, investor, underwriter, operations admin, platform owner. Application, underwriting, facility, pool, participation, release checklist, delivery checks, repayment, distribution, early settlement, late, default, recovery, audit log.
- **Risk engine:** business, asset, and deal scores with risk tiers; marketplace pool rating weighs diversification, SME contribution, and concentration. A single facility risk score is in development.
- **Stellar Testnet:** VTAED issued (no real value, not redeemable); SHA-256 event fingerprints via `manage_data`; embedded wallet and trustline in Alpha mode.
- **Soroban (integration in progress):** `wallet_registry`, `facility_contract`, `finance_math` implemented with unit tests. Not deployed; no contract IDs published.
- **Stores:** Soroban = intended financial truth, Prisma = application/read layer, Firebase `vartola-ops` = operations journal.
- **Compliance:** Sumsub token and signed webhook; approval can copy a non-sensitive flag to the registry (Alpha). Production screening depends on provider contract.

## Public documentation (rebuilt)

`/pitch` (23 sections), `/whitepaper` (49 sections), `/how-it-works`, `/technical`, `/grant`, `/docs`, `/legal` (18 draft documents, subject to UAE legal and regulatory review). All read shared facts from `lib/docs/product.ts`.

## Gates

Live money, a regulated offer, ownership/security structure, custody and payment rails, independent audit, and Mainnet remain gated. No Mainnet date is promised.

## Roadmap

Oct 2026 current platform → Nov Testnet financial layer → Dec servicing and asset infrastructure → Jan compliance and risk → Feb security → Mar legal and partner structure → Apr–May production readiness → Mainnet after the gates.

## Checks

`next build` passes, ESLint 0 errors, `npm test` 5 pass / 0 fail. Grant budget totals USD 150,000 (proposed, not spent).

## Known open items

Contracts need Testnet deployment; supplier self-service portal; event reconciliation; the older notes under `docs/` (AssetFi era) are historical.
