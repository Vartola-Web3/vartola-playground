# Vartola — Project Status

**Last verified: 10 October 2026.** Stellar Testnet only. No real money.

This is the single current status document. The delivery plan is `docs/updated-general-plan.md`; the sandbox design is `docs/sandbox-interactive-plan.md`.

---

## Verified build and tests

| Check | Command | Result |
| --- | --- | --- |
| Unit tests | `npm test` | 147 pass, 0 fail |
| Lint | `npx eslint . --quiet` | 0 errors |
| Types | `npx tsc --noEmit` | 0 errors |
| Build | `npm run build` | passes |

---

## What works today (Testnet Alpha)

- **Lifecycle:** SME application with documents → underwriting and risk scoring → facility and payment schedule → pool and investor participation → release conditions and delivery checks → repayment, distribution, early settlement, late, default, recovery → audit log.
- **Alpha execution path (`APP_MODE=ALPHA`):** investment, escrow, release, repayment, distribution, settlement and recovery are written to the application only after a confirmed Soroban Testnet transaction.
- **Soroban contracts (v3):** `wallet_registry` and `facility_contract` deployed and initialized on Stellar Testnet with separate role wallets; explicit escrow states, release-condition attestations, one waterfall, per-holder distributions, settlement, recovery.
- **Reference facilities:** #001 (150,000 VTAED, 1,500 Participation Units) through repayment; #002 early settlement; #003 default and recovery. Reconciliation HEALTHY.
- **VTAED:** issued on Stellar Testnet; no monetary value, not redeemable.
- **Risk:** business, asset and deal scores; facility risk score v2 (nine components, versioned, hashed inputs); expected-loss (PD×LGD×EAD) and portfolio risk.
- **Operations:** idempotent cursor-based event indexer with retry and dead letters; reconciliation with a scheduled worker (Vercel cron, Alpha mode, `CRON_SECRET`); operations health; treasury; asset servicing; collections and recovery; insurance and supplier-failure cases.
- **Records and proof:** receipts with recomputable SHA-256; participation certificate; Asset Passport; public `/proof` and `/verify/facility/<id>`.
- **Integrations:** Sumsub token and transactional, idempotent signed webhook; Transak and Circle adapters (need sandbox credentials).
- **Security:** role separation and release limit on Testnet; encrypted provider secrets; admin TOTP MFA (Alpha mode); private object storage with signed URLs and real deletion; Firestore denies all client access; append-only operations journal with retry.
- **Supplier portal:** sign-in, assigned facilities, submissions, and release status (needs the supplier-user migration applied).
- **Public documentation:** `/pitch`, `/whitepaper`, `/how-it-works`, `/technical`, `/proof`, `/docs`, `/legal`, `/contact`, `/marketplace`, `/sandbox`.

---

## What is not current

- No Mainnet, no real AED, no real money, no licensed financing or client money.
- No independent security audit or penetration test.
- Provider sandbox credentials (Sumsub, Transak, Circle) are not configured; the code returns a clear "needs sandbox key" response.
- Some operational services are stubs and are labelled as such (KYB, AECB credit check, card payment, email delivery).
- Document storage is unit-tested but has not been exercised against a real private bucket.
- Multisig is defined but not enforced on-chain; the administrator is a single Testnet key.

---

## Roadmap

- **Delivery plan (30 days, Testnet):** `docs/updated-general-plan.md`
- **Interactive sandbox design:** `docs/sandbox-interactive-plan.md`
- **Audit (10 October 2026):** `docs/audit-2026-10-10.md`

Mainnet and live-money deployment remain gated on independent security validation, a regulated operating structure, production payment and custody rails, and a controlled real-world pilot.
