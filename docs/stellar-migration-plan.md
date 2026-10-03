# Stellar migration plan

Simulation is the product specification. Stellar integration begins only after the full lifecycle test passes.

## Phase 1 — Freeze and map

- Freeze the validated simulation states and ledger entry types.
- Map wallet top-up, investment reserve, deployment, disbursement, repayment, and distribution to explicit on-chain operations.
- Keep company identity, licenses, bank information, and documents off-chain; publish hashes and non-sensitive references only.

## Phase 2 — Wallets and test assets

- Create controlled Testnet accounts for platform treasury, investors, SMEs, and settlement.
- Issue a test-only AED-denominated asset with no real-world value.
- Store secret keys server-side only and add multisignature controls for treasury actions.

## Phase 3 — Contracts

- Deploy Soroban contracts for opportunity funding, facility state, repayment, and proportional distribution.
- Preserve the simulation idempotency keys as contract operation identifiers.
- Emit events for every state transition and reconcile them with the database ledger.

## Phase 4 — Dual-run

- Execute each operation in simulation and on Stellar Testnet.
- Compare balances, facility states, installment totals, and investor distributions after every step.
- Stop and surface mismatches; never auto-correct silently.

## Phase 5 — Testnet acceptance

- Run the complete scenario with at least two investors and one SME.
- Verify explorer transactions, retry behavior, duplicate prevention, privacy boundaries, and recovery after an interrupted job.
- Keep the UI labelled Testnet and no-real-value until licensing and production controls exist.

## Production gate

Mainnet requires legal and regulatory approval, KYC/AML, qualified custody and key management, independent contract/security review, monitoring, incident response, and a licensed settlement arrangement. Passing the simulation or Testnet tests is not permission to handle real funds.

