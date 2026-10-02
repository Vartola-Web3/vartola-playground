# Post-investment lifecycle audit

## Already working

- Roles and auth: SME, investor, underwriter, admin.
- Fleet applications and underwriting create a `Facility`.
- `Pool` holds facilities. Investor subscribe in `app/api/investor/subscribe/route.ts` reserves capital and writes `FacilityAllocation` by priority.
- Risk scores exist for company, asset, deal, and an internal pool rating.
- Marketplace and portfolio UI exist. Detail tabs are still summaries.

## Reusable

- `Facility`, `Investment`, `FacilityAllocation`, `Payment`, `Distribution`, `WalletLedger`, `AuditLog`, `StellarTransaction`.
- Job queue: `lib/stellar/outbox`.
- Email: `lib/services/email.ts` (console provider).
- Soroban stub: `lib/stellar/soroban-client.ts`. Rust sketch: `contracts/soroban/facility_contract`.

## Simulated

- Soroban invocation returns a simulated result.
- Many hashes come from `generateSimulatedTxHash`.
- tAED movements for subscribe, release, and distribution are not guaranteed on Horizon.

## Gaps

- No release checklist, beneficiary, or release record.
- No delivery checklist. Reserved capital is not moved to deployed on activation.
- Payments are a single amount. Distributions are not limited to that facility's deployed investors.
- No early settlement, default, or recovery models.
- No reconciliation view.
- Marketplace company, fleet, and payment tabs are not loaded from rows.

## Security

- Release and repayment must be server-side, role-gated, idempotent, and inside a transaction.
- Do not pay the SME by default.
- Do not invent on-chain hashes when Testnet keys or the Rust toolchain are missing.
