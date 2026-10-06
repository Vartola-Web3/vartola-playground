# Performance benchmarks

## Read this first

The only benchmark run so far is a **LOCAL LOAD SIMULATION**. It runs the platform's own processing code in memory on synthetic data. It makes no network calls and uses no database. It says nothing about Soroban RPC latency, ledger close time, hosted API latency or database performance. **No REAL TESTNET BENCHMARK has been run**; volume on Testnet would be disruptive and the results would mostly measure the network, not Vartola.

Reproduce: `npm run benchmark:local`. Raw output of the run recorded here: `docs/operations/benchmark-latest.json`.

## Local load simulation (2026-10-06, Intel Core i9-14900HX, 32 threads, Node v22.17.0)

| Scenario | Size | Time | Throughput |
| --- | --- | --- | --- |
| Waterfall repayment splits | 50,000 repayments | 3.6 ms | about 14.0 million per second |
| Distribution by Participation Units | 10,000 positions | 0.7 ms | about 14.8 million per second |
| Expected-loss calculation | 1,000 facilities | 12.4 ms | about 81,000 per second |
| Concentration plus six stress scenarios | 1,000 facilities | 1.6 ms | about 642,000 per second |
| Event dedupe and ordering | 100,000 events, 20,000 duplicates | 33.2 ms | about 3.0 million per second |
| Reconciliation comparison | 1,000 facilities, 10 positions each | 13.4 ms | about 74,000 per second |

Duplicate handling: 100,000 events with 20,000 duplicates produced exactly 80,000 stored events. Reconciliation of 1,000 consistent facilities returned HEALTHY.

## Not measured

API latency, database query performance at scale, indexing against live RPC, retry behaviour under real outages (covered functionally by `lib/alpha/resilience.test.ts`). These need a staging environment and are planned.
