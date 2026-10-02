# Pool and facility model

Existing `Pool`, `Facility`, and `Investment` records are reused.

Added fields: facility priority and funded amount, pool fleet type, risk, term, and incomplete-funding policy, investment reserved/deployed balances, and `investor_facility_allocations`.

Pool status `FULLY_FUNDED` means raised capital equals the target. It does not mean every vehicle is active. `CLOSED` is reserved for when facilities are resolved.
