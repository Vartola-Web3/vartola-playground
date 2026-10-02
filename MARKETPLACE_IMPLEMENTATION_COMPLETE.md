# Marketplace implementation

## Database
Extended `pools`, `facilities`, and `investments`. Added `investor_facility_allocations` and `wallet_ledger`.

## API
- `GET /api/marketplace/pools`
- `POST /api/investor/subscribe` now checks open status, minimum, remaining capacity, writes a terms snapshot, and allocates by facility priority inside a transaction.

## Routes
- `/marketplace`
- `/marketplace/pools/[poolId]`
- `/investor/portfolio`

## Risk
`lib/marketplace/risk.ts` and `lib/marketplace/allocate.ts`.

## Wallet
A reserve ledger entry is written on subscription. Live Stellar balance is still the existing testnet wallet. This ledger is the internal reservation record.

## Known limits
Release checklist UI, repayment waterfall, default recovery, and on-chain Soroban state are specified in `docs/` and not fully automated in this increment. Notifications stay on the existing audit and email paths. No mainnet and no real money.

## Demo
Open `/marketplace` as an investor. Invest an amount at or above the pool minimum and within available capacity. The stake appears under Portfolio as reserved capital.
