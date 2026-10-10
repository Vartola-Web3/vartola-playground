# Vartola product direction

This is the canonical product direction. It wins when product language conflicts.

## Positioning

Vartola helps UAE SMEs access productive assets that let them operate, grow, and generate revenue. Logistics fleets are the first vertical; business equipment is the next expansion.

## Experience

- Marketing pages keep the dark, digital Vartola identity.
- Authenticated dashboards use a calm white workspace, pale neutral surfaces, and restrained green highlights.
- Customer-facing language uses `opportunity`, `investment`, `company wallet`, and `payment schedule`. Pool and blockchain vocabulary stays in advanced or administrative views.

## Simulation lifecycle

1. An SME applies for a productive asset and uploads its documents.
2. Underwriting approves the application and creates a financing facility.
3. Admin publishes an investment opportunity.
4. Investors add demo funds, invest, and move cash from available to reserved.
5. When the opportunity is fully funded, allocations move from reserved to deployed and simulation funds are released to the SME wallet.
6. The SME sees the complete installment schedule and can pay the next installment early or on its due date.
7. Each payment is split and distributed only to investors deployed in that facility, in proportion to their allocation.
8. Principal and income return to investor wallets and appear in the transaction history.

No simulation action creates a fake Stellar hash.

## Acceptance

- A user cannot invest more than the available wallet balance or opportunity capacity.
- Investment, wallet reservation, and allocation are one atomic database transaction.
- A fully funded opportunity activates once; retries cannot duplicate credits or distributions.
- An SME cannot pay an installment without sufficient wallet balance.
- A scheduled installment becomes paid rather than creating a duplicate payment row.
- Distributions use facility allocations, never the whole opportunity balance.

