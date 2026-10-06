# Test summary

Recorded on 2026-10-06. Re-run before sharing.

| Suite | Command | Result |
| --- | --- | --- |
| Soroban contracts | `cargo test` in `contracts/soroban` | 44 passed (facility 26, finance math 8, registry 5, others) |
| Application | `npm test` | see `lib/docs/quality-status.ts` for the recorded count |
| Lint | `npm run lint` | 0 errors |
| Build | `npm run build` | passing |

## Real Testnet runs

Three facilities executed on contract v3: #001 (150,000 VTAED, 1,500 units, three investors, two repayments distributed), #002 early settlement, #003 default and recovery. Reconciliation HEALTHY on all three. The indexer read 136 contract events without failures. Hashes and ledgers: `/technical`, `/proof`.

## Resilience tests

Duplicate event, out-of-order event, RPC outage, webhook replay, Firebase outage, reconciliation mismatch and fabricated-finality checks are in `lib/alpha/resilience.test.ts`. Provider timeout and storage failure paths are covered by the retry and journal-safety tests.
