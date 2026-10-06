# Smart contract security checklist

Status: INTERNAL / PRE-AUDIT self-review. This is not an independent audit.

| Check | Status | Evidence |
| --- | --- | --- |
| Every state-changing function requires authorization from the right role | DONE | contract tests, role wallets |
| Release needs attested conditions, one authorizer and a different payer | DONE | facility_contract tests |
| Release cannot execute twice | DONE | invariant test |
| Settlement cannot close a facility twice | DONE | invariant test |
| Recovery cannot distribute more than realised proceeds | DONE | finance_math tests, `waterfall-v2.test.ts` |
| Investors cannot alter another investor's position | DONE | positions tests |
| Pause rejects protected operations | DONE | pause tests |
| Integer arithmetic only, no float | DONE | i128 in contracts, integer minor units in the TypeScript mirror |
| Saturating or checked arithmetic on user amounts | DONE | finance_math |
| Daily release limit | DONE | facility_contract |
| Two-step admin rotation | DONE | facility_contract |
| Timelocked upgrade path | DONE (Testnet) | contract version, upgrade policy |
| Storage TTL handling | REVIEW | needs production extension policy |
| Event emission on every transition | DONE | indexer reads 136 events without failure |
| Reentrancy | N/A | Soroban host model; no external callbacks in value paths |
| Fuzzing or property-based testing | NOT DONE | planned before audit |
| Formal verification | NOT DONE | not planned |
| Independent audit | NOT STARTED | audit readiness package in `docs/audit-package` |

Known contract flaws found and fixed before v3: settlement terms were not set by operations, any payer could repay, the pause call was signed by the wrong role, recovery did not update allocations.
