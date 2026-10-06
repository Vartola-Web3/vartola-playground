> **HISTORICAL — AssetFi-era note.** Written before the October 2026 Vartola Alpha. It may describe an MVP-stage plan that the code has since replaced. The current state is in `README.md`, `docs/project-status-2026-10.md`, and `docs/audit-2026-10-05.md`.

# Simulation mode audit

The lifecycle services in `lib/lifecycle/service.ts` already reserve, release, activate, repay, settle, and recover. `WalletLedger` stores notes but does not keep available, reserved, and deployed balances. There is no simulation clock and no installment schedule the SME can pay from a wallet. Stellar hashes must stay empty in simulation.
