# Investor accounting

Subscription creates an investment stake and a `RESERVE` wallet ledger row. Facility allocations store how much of that stake sits in each facility.

Yield does not start at subscription. Reserved capital becomes deployed only when a facility is marked active. Repayments must be split by facility allocation, not by the whole pool.
