# Post-investment lifecycle

## Completed in the database and admin API

- Release checklist, approved supplier beneficiary, and one-time release record.
- Delivery checklist. Activation moves only that facility's reserved allocation to deployed and sets the income start date.
- Repayments split by the facility fee and reserve rates. Distributions go only to deployed allocations on that facility.
- Early settlement, late/default statuses, and recovery proceeds for the same investors.
- Audit events and console email on repayment.
- Investor detail tabs now list the businesses and vehicles already linked to the opportunity.

Admin screen: `/admin/facilities/[id]`.

## Stellar

Testnet URLs are configured. No issuer secret is present in the environment, and Soroban invocation is still simulated. Release therefore records the ledger and audit event without inventing a network transaction hash. Mainnet was not used. Contract IDs were not deployed.

## Tests

`npx tsx --test lib/lifecycle/__tests__/rules.test.ts lib/marketplace/__tests__/marketplace.test.ts` passed: blocked release, payment split, facility-only shares, waterfall, capacity, and pool risk.

## Not production

No Mainnet, no real AED, no automatic repossession operations, and no silent balance repair.
