# Simulation mode audit

The lifecycle services in `lib/lifecycle/service.ts` already reserve, release, activate, repay, settle, and recover. `WalletLedger` stores notes but does not keep available, reserved, and deployed balances. There is no simulation clock and no installment schedule the SME can pay from a wallet. Stellar hashes must stay empty in simulation.
