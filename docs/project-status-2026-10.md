# Vartola — Project status report (October 2026)

Entity: RIMAL TECH - FZCO, a UAE Free Zone technology company. Not a licensed lender, broker, custodian, or investment firm.

## Current technical status

Vartola is a working Alpha with real Stellar Testnet asset infrastructure, Soroban contracts deployed on Testnet, and a facility executed end to end on-chain in an isolated Alpha test environment. It is not yet fully Soroban-native, Mainnet-ready, production-ready, or audit-ready. Next milestone: deployed Soroban contracts, real contract IDs, and Facility #001 completed end to end on Testnet. Priorities are listed on /technical#priorities and in docs/audit-2026-10-05.md.

## What exists (Working Alpha)

- **Roles and lifecycle:** SME, investor, underwriter, operations admin, platform owner. Application, underwriting, facility, pool, participation, release checklist, delivery checks, repayment, distribution, early settlement, late, default, recovery, audit log.
- **Risk engine:** business, asset, and deal scores with risk tiers; marketplace pool rating weighs diversification, SME contribution, and concentration. A single facility risk score is in development.
- **Stellar Testnet:** VTAED issued (no real value, not redeemable); SHA-256 event fingerprints via `manage_data`; embedded wallet and trustline in Alpha mode.
- **Soroban (Testnet):** `wallet_registry` and `facility_contract` (with `finance_math`) deployed and initialized on Stellar Testnet with a separate pauser; Facility #001, #002, #003 executed end to end. IDs and hashes are in README.md and /technical. Not audited, not on Mainnet.
- **Stores:** Soroban = intended financial truth, Prisma = application/read layer, Firebase `vartola-ops` = operations journal.
- **Compliance:** Sumsub token and signed webhook; approval can copy a non-sensitive flag to the registry (Alpha). Production screening depends on provider contract.

## Public documentation (rebuilt)

`/pitch` (23 sections), `/whitepaper` (49 sections), `/how-it-works`, `/technical`, `/grant`, `/docs`, `/legal` (18 draft documents, subject to UAE legal and regulatory review). All read shared facts from `lib/docs/product.ts`.

## Gates

Live money, a regulated offer, ownership/security structure, custody and payment rails, independent audit, and Mainnet remain gated. No Mainnet date is promised.

## Roadmap

Oct 2026 current platform → Nov Testnet financial layer → Dec servicing and asset infrastructure → Jan compliance and risk → Feb security → Mar legal and partner structure → Apr–May production readiness → Mainnet after the gates.

## Checks

`next build` passes. `npm test` runs 2 files (5 tests, all pass). Running every test file gives 19 tests, 18 pass and 1 fails (`lib/risk-engine/__tests__/risk-engine.test.ts` uses `describe`, which the Node runner does not provide). Contract tests: 10 pass. Full-repo ESLint reports 63 errors outside the temporary scripts (mostly require imports, hooks rules, and `any`); the documentation files lint clean. Grant budget totals USD 150,000 (proposed, not spent). See `docs/audit-2026-10-05.md`.

## Known open items

Supplier self-service portal (needs a schema change), scheduled reconciliation and continuous indexing, signed uploads and a real-bucket test of document storage, ten repository lint errors (react-hooks set-state-in-effect), multisig and admin MFA, independent audit, and every regulatory and custody gate. The older notes under `docs/` (AssetFi era) carry a HISTORICAL banner.
