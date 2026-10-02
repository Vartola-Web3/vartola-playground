# Post-investment lifecycle plan

## Phase 1 — Release

Tables: `beneficiaries`, `facility_release_conditions`, `facility_releases`.
Service: `releaseFacilityFunds`. Status becomes `READY_FOR_RELEASE` only when required rows are `VERIFIED` or `WAIVED` and funding is complete. Duplicate release is rejected. Admin UI disables the button until then.

## Phase 2 — Activation

Table: `facility_activation_checks`. Status `ACTIVE` moves that facility's allocations from reserved to deployed and sets `incomeStartDate`. No income before that.

## Phase 3 — Repayments

Extend `payments` with principal, lease income, fee, and reserve components from facility rates. Idempotency key blocks duplicates.

## Phase 4 — Distributions

Only deployed allocations on that facility receive principal and income in proportion. Update investment totals and `wallet_ledger`.

## Phase 5 — Early settlement

Configurable outstanding close. Facility becomes `COMPLETED` with `settledEarly`.

## Phase 6 — Default and recovery

Explicit status changes and `facility_recoveries`. Proceeds go only to that facility's investors.

## Phase 7 — Stellar

Use a real Testnet payment only when issuer keys exist. Otherwise store `SIMULATED` and do not fake a network hash. Reconciliation compares ledger sums to recorded chain amounts and never auto-fixes a mismatch.

## Phase 8 — Details and notices

Opportunity tabs read companies, assets, and payments. Lifecycle events write audit rows and console email.

## Acceptance

A fully funded facility cannot release early, cannot release twice, cannot activate before delivery checks, and a repayment reaches only investors deployed on that facility.
