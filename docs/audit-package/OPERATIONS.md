# Emergency controls, deployment and reconciliation

## Emergency controls

- Pause: the PAUSER role (or admin) pauses the facility contract; protected operations are rejected. Pause cannot move funds. Only the admin unpauses.
- Release limit: a daily cap on supplier releases.
- Role revocation and two-step admin rotation.
- Application side: admin sessions can be disabled; Alpha mode can be switched back to Demo.

## Deployment procedure (Testnet)

1. Build the contracts and run `cargo test`.
2. Run `contracts/soroban/deploy-testnet.sh`: it creates separate role wallets, deploys the registry and facility contracts, wires the registry, funds test accounts and records the deployment.
3. Export the record to `lib/docs/testnet-record.generated.json` (contract IDs, wallets, transaction hashes, ledgers).
4. Run the reference facility suite and reconciliation. Proceed only on HEALTHY.

Details: `contracts/soroban/DEPLOYMENT.md`.

## Reconciliation logic

For every chain-confirmed facility the worker reads the contract (`facility_status`, `funded_amount`, `issued_units`, `principal_outstanding`, per-wallet positions) and compares it with the Prisma projection. Checks: status, funded amount, issued units, outstanding principal, per-investor units, transaction hashes. Result HEALTHY, WARNING or FAILED with findings. It never writes to the chain and never rewrites history. The indexer uses a persistent cursor, idempotent storage, retries, dead letters and safe re-index.
