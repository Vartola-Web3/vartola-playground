# AUDIT READINESS PACKAGE

**This is not an independent audit.** It is the material Vartola would hand an independent auditor, prepared so that an engagement can start quickly. No audit has been commissioned and none is claimed.

Environment: Stellar Testnet. Contracts: v3. Date prepared: 2026-10-06.

## Contents

1. Architecture overview (this file)
2. Contract inventory and IDs: `CONTRACTS.md`
3. Authorization matrix: `docs/security/ACCESS-CONTROL-MATRIX.md` and `CONTRACTS.md`
4. Financial invariants: `INVARIANTS.md`
5. Known limitations: `KNOWN-LIMITATIONS.md`
6. Test summary: `TEST-SUMMARY.md`
7. Threat model: `docs/security/THREAT-MODEL.md`
8. Upgrade process: `docs/security/CONTRACT-UPGRADE-POLICY.md`
9. Emergency controls, deployment procedure and reconciliation logic: `OPERATIONS.md`

## Architecture overview

Stellar settles value. Soroban executes facility logic. Prisma is the application read model. Firebase is an append-only operations journal. Private object storage holds sensitive documents.

Flow: user action, application validation, Soroban or Stellar execution, chain confirmation, Prisma projection, Firebase event, reconciliation. In Alpha mode the chain is the financial source; the database never rewrites chain history. Sensitive personal data and commercial documents stay off-chain; only hashes and non-sensitive permissions are anchored.

Source layout: `contracts/soroban/` (Rust, soroban-sdk 21.7: `wallet_registry`, `facility_contract`, `finance_math`), `lib/alpha/` (chain calls, lifecycle, reconcile, receipts, positions), `lib/stellar/` (config, keys, indexer, soroban call helpers).
