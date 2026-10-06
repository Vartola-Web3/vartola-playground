# VARTOLA ALPHA COMPLETION REPORT (6 October 2026)

Stellar Testnet only. No Mainnet, no real money, nothing independently audited, no regulatory approval claimed.

## Position

Vartola is a working Soroban-native asset-finance Alpha on Stellar Testnet: VTAED, deployed contracts, escrow, programmable release, repayment, distribution, early settlement, default and recovery, and reconciliation. The public website still runs Demo mode; the Alpha path ran in an isolated test environment with its own database.

## Network and asset

- Network: Stellar Testnet. VTAED (Vartola Test AED) issuer `GATMFYSVHN25CTFMW27USR65VTIIH4DSEA2MCRELBGWQBDEZRJTCOW32`; no real value, not redeemable.
- VTAED Stellar Asset Contract `CCSZAIHVNLOJWHMOZ7W4L3J3YR6I5UZXVMEAATIIRZD4OODODOT4KRJS`.

## Deployed contracts (v3, current)

| Contract | ID |
| --- | --- |
| wallet_registry | `CDJ5MMB2JZCWX2HZT7NOHBQRCQTDVEPKJNOQSGDMYVIX7GL5JO7EIDNC` |
| facility_contract | `CDS5HIFCHMLR7VHOGHDMJEXMUI3CINY2R6FPRA4UVZIPPAUGQ6P4ERFM` |

Deployed in ledgers 5045343 to 5045355 with separate wallets for the administrator, pauser, treasury, underwriter, operations and compliance roles (addresses and every transaction hash are on `/technical`). Superseded: v1 (`CBJQTADV…`, replaced after the authorization review) and v2 (`CACYOVPK…`, replaced by role separation and explicit escrow). Neither had real use.

## What v3 added

- **Explicit escrow states** (open, partially funded, fully funded, release locked, release authorized, released, refunded, closed) with an event on every transition; `reserve`, `cancel_reservation`, `refund`, `cancel_funding`, `mark_fully_funded`, `lock_release`, `authorize_release`, `release_supplier_payment`.
- **Release governance**: eight conditions attested on-chain, each by its responsible role, with the hash of the evidence only. The administrator authorizes; a different role (treasury) pays the approved supplier, subject to a daily release limit. Capital never reaches the SME.
- **One waterfall** in `finance_math` used by repayment, settlement and recovery; distribution is deterministic by Participation Units and keeps cumulative principal, income and recovery per holder and per facility. Position view with status and outstanding exposure. Positions are non-transferable.
- **Roles and controls**: separate wallets, role revocation, two-step admin rotation, pause, release limit, timelocked upgrade path with a contract version.
- **Attestations**: risk (input hash, model version, score, grade), documents, and asset passport events (created, delivered, activated, insurance, registration, recovered, disposed).

## Facilities executed on contract v3 (real Testnet transactions)

| Facility | Result |
| --- | --- |
| #001 Dubai SME Delivery Fleet, 150,000 VTAED, 1,500 units of 100, three investors | ACTIVE; two repayments distributed |
| #002 early settlement, 3,000 VTAED | COMPLETED after one repayment and a settlement of 2,525 |
| #003 default and recovery, 3,000 VTAED | grace, late, notice, default, repossession, asset sale, recovery of 1,800, CLOSED |

Reconciliation on all three: HEALTHY, no findings. The indexer read 136 contract events without failures. Full hashes and ledgers: `/technical`.

## Application work in this phase

- **Positions, receipts, certificate, verification**: investor positions panel with on-chain proof; receipts with a recomputable SHA-256; downloadable participation certificate with the legal disclaimer; public `/verify/facility/<id>` that reads the contract live and shows no private data; SME facility summary with an Advanced section; admin analytics and a transparency panel.
- **Reconciliation and indexer**: scheduled worker (Vercel cron every 15 minutes, needs `CRON_SECRET`, Alpha only), manual run, alerts to audit log, Firebase and optional email, indexer health, retries, dead letters, safe re-index.
- **Security**: provider secrets encrypted at rest; admin TOTP MFA enforced in Alpha mode (RFC 6238 vectors pass); signed-upload code for private storage; Sumsub test and production credentials separated; supplier users and portal behind a migration; Firebase journal append-only with retry.
- **Facility risk score v2** with nine components, versioned, hashed inputs, drivers shown, and on-chain attestation. Rule-based, not a rating agency score.
- **Lint to zero errors** with a reusable `useApiResource` hook. No rule was disabled.
- **Bugs found by the new tests and the real runs**: an analytics error that counted unfunded facilities as outstanding principal; a pause call signed by the wrong role; a compliance lookup that passed an extra field; recovery that did not update investor positions in the read model.

## Results

- `npm test`: **96 tests, all pass** (was 51).
- Soroban contract tests: **44 pass** (was 19): facility 26, finance math 8, registry 5, others.
- `next build`: passes. ESLint: **0 errors**, 27 warnings (19 are `<img>` suggestions).
- Reconciliation: HEALTHY (3 facilities).

## Classification

| Area | Status |
| --- | --- |
| Contracts v3 deployed, roles separated, facilities executed | COMPLETE (not audited) |
| Positions, receipts, certificate, verification page, analytics | COMPLETE |
| Scheduled reconciliation and indexer health | COMPLETE on Testnet; cron needs configuration in the hosted environment |
| Risk score v2 and attestation | COMPLETE |
| MFA, encrypted secrets, supplier portal | COMPLETE in Alpha mode; supplier and MFA need the migration applied |
| Signed uploads and private storage | PARTIAL: implemented and unit-tested, not tested against a real bucket (no credentials were available) |
| Sumsub production, email and SMS providers | PARTIAL / BLOCKED on provider agreements |
| Multisig, production custody, independent audit | PLANNED (security gate) |
| Licensed financing, client money, Mainnet | PLANNED (regulatory gate, no date) |

## Remaining security issues

Single administrator key on Testnet; no multisig; no independent audit; signed uploads untested on a real bucket; server-held wallet secrets use one key (`WALLET_KEK`); `SERVER_MASTER_KEY` is a single secret, not a managed vault; the earlier public budget text and 1.7 GB of build output remain in this private repository's history.

## Remaining regulatory and Mainnet gates

Regulatory opinion and structure, licence or licensed partner, custody and client-money design, approved settlement asset and payment rail, final ownership and security structure, approved agreements, independent contract and security audits, production monitoring, operations readiness. No Mainnet date is promised.
