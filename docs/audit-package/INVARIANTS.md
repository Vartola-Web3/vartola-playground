# Financial invariants

Each invariant names where it is tested. A change to any rule requires a new contract version and updated tests.

| # | Invariant | Tested in |
| --- | --- | --- |
| 1 | issuedUnits <= totalUnits | facility_contract tests |
| 2 | sum of investor units == issuedUnits | facility_contract and reconciliation tests (`compareFacility`) |
| 3 | Investor principal exposure reconciles with facility outstanding principal | reconciliation tests |
| 4 | A supplier release cannot exceed the authorized amount | facility_contract tests |
| 5 | A release cannot execute twice | facility_contract tests |
| 6 | A settlement cannot close a facility twice | facility_contract tests |
| 7 | Recovery distributes no more than realised proceeds (plus an allowed reserve) | `finance_math` tests, `lib/finance/waterfall-v2.test.ts` |
| 8 | An unauthorized wallet cannot alter another investor's position | facility_contract tests |
| 9 | A paused contract rejects protected operations | facility_contract tests |
| 10 | A repayment split never exceeds the gross, and principal never exceeds what remains | `finance_math` tests, `waterfall-v2.test.ts` |
| 11 | Distribution by units never over-distributes; remainder stays as dust | `waterfall-v2.test.ts` |
| 12 | Release authorization and supplier payment are different roles | `lib/ops/ops.test.ts` |
| 13 | Finality is only recorded when the chain confirmed it | `lib/alpha/resilience.test.ts` |
