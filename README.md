# Vartola

**Programmable financial infrastructure for productive real-world assets.**

Working Financial Web3 infrastructure for productive real-world asset finance on Stellar Testnet. Built on Stellar. Executed through Soroban. Developed by RIMAL TECH - FZCO.

> **Status: CURRENT — STELLAR TESTNET.** VTAED is a test asset with no monetary value and is not redeemable. There is no Mainnet deployment, no real-money activity, no independent security audit and no licence or regulatory approval. See [Regulatory status](#regulatory-status).

## What Vartola is

Vartola connects SME asset demand, capital, underwriting, suppliers, asset lifecycle management, servicing, collections, recovery, treasury and financial settlement through programmable finance on Stellar and Soroban. The first asset class is UAE logistics fleets: delivery motorcycles, vans, trucks and cold-chain vehicles.

It is not a crypto exchange, a DeFi protocol, a crowdfunding site or a token project. The financed asset earns the repayment, and the facility rules are enforced by contracts rather than by a spreadsheet.

## Why it exists

SMEs need productive assets (vehicles, later equipment) to grow, but buying them upfront consumes the working capital they need to operate, and financing infrastructure is fragmented across underwriting, suppliers, servicing and recovery. Capital providers lack a controlled, verifiable way to take part in a single financed asset and follow where the money goes. Vartola puts the whole lifecycle in one facility record.

## Current Financial Web3 architecture

| Layer | Role |
| --- | --- |
| **Stellar** | Asset and value settlement rail: VTAED test asset, accounts, trustlines, Stellar Asset Contract |
| **Soroban** | Programmable financial execution: wallet registry and facility contracts (v3) |
| **Prisma** | Application and read model (SQLite locally, PostgreSQL when hosted) |
| **Firebase** | Append-only operations journal and admin visibility |
| **Private object storage** | Sensitive documents with signed, short-lived access |

Financial flow:

```
USER ACTION → APPLICATION VALIDATION → SOROBAN / STELLAR EXECUTION → CHAIN CONFIRMATION
            → PRISMA PROJECTION → FIREBASE OPERATIONAL EVENT → RECONCILIATION
```

In Alpha mode the chain is the financial source. Prisma is updated only after a confirmed transaction, a failed or unconfirmed call can never be recorded as successful, and a Firebase failure never blocks or reverses a confirmed result. Contract sources are in `contracts/soroban`.

## Current capabilities (Stellar Testnet)

- **Access:** embedded Stellar wallets, wallet permissioning, KYC and KYB aware access.
- **Execution:** Soroban facility contracts, facility-level positions and Participation Units, programmable escrow, controlled supplier release (eight attested conditions, one role authorizes and another pays), one waterfall for repayment, settlement and recovery, distributions, early settlement, default and recovery.
- **Records and proof:** financial receipts, Digital Participation Records, Digital Asset Passport and asset verification, risk snapshot attestations, a public Proof Center.
- **Risk and treasury:** facility risk score, Expected Loss framework (PD × LGD × EAD, internal estimate), portfolio risk, treasury control center, facility reserves.
- **Servicing and operations:** asset servicing and health indicator, supplier network and performance score, collections and recovery workspace, insurance-event and supplier-failure workflows, continuous event indexing, scheduled reconciliation, operations health.
- **Security and governance:** role separation and a privileged role matrix, admin MFA (TOTP), encrypted platform secrets, private signed document storage, contract governance, multisig-ready architecture, business continuity and wind-down plans, an audit-readiness package.
- **Pilot readiness:** an institutional sandbox and a pilot pipeline that shows only what an administrator enters (zero today).

## Financial lifecycle

SME application → underwriting → facility → investor participation → escrow → controlled release → supplier → asset delivered → repayment → distribution → settlement or recovery.

## On-chain vs off-chain

| On-chain (verifiable) | Off-chain (private) |
| --- | --- |
| Wallet address and permission flags | Identity and KYC data |
| Facility financial state | Company and commercial documents |
| Escrow state and balances | Bank and credit information |
| Participation Units and positions | Supplier contracts and invoices |
| Release-condition attestations (evidence hash only) | Risk model inputs |
| Repayment, distribution, settlement, recovery events | Internal notes and collections cases |
| Risk snapshot and document hashes | Application, analytics and UI data |

## Proof and verification

- **`/proof`**: real Testnet contracts, the VTAED test asset, the latest ledger, and the lifecycle of three reference facilities with an explorer link per recorded event.
- **`/technical`**: the full technical architecture, state model, finality, indexing, reconciliation, security and every recorded transaction.
- `/verify/facility/<number>` reads a facility live from the contract and exposes no private data.

Stellar Testnet references (also in `lib/docs/testnet-record.generated.json`):

| Item | Value |
| --- | --- |
| VTAED issuer | `GATMFYSVHN25CTFMW27USR65VTIIH4DSEA2MCRELBGWQBDEZRJTCOW32` |
| VTAED Stellar Asset Contract | `CCSZAIHVNLOJWHMOZ7W4L3J3YR6I5UZXVMEAATIIRZD4OODODOT4KRJS` |
| wallet_registry (v3) | `CDJ5MMB2JZCWX2HZT7NOHBQRCQTDVEPKJNOQSGDMYVIX7GL5JO7EIDNC` |
| facility_contract (v3) | `CDS5HIFCHMLR7VHOGHDMJEXMUI3CINY2R6FPRA4UVZIPPAUGQ6P4ERFM` |

Facility #001 (150,000 VTAED, 1,500 Participation Units), #002 (early settlement) and #003 (default and recovery) ran on contract v3 with reconciliation HEALTHY. Superseded v1 and v2 contracts are listed on `/technical`. These are Testnet values with no monetary value.

## Security

Current controls: separate role wallets (administrator, pauser, treasury, underwriter, operations, compliance), release limit, pause, two-step admin rotation, timelocked upgrades, admin MFA, encrypted provider secrets, private signed document storage, audit log, idempotency keys, rate limiting, signed webhooks. Multisig policies are defined but not enforced on-chain, keys are single Testnet keys, and **no independent audit or penetration test has been done**. The internal security documents (INTERNAL / PRE-AUDIT) are in `docs/security`, and the audit-readiness package is in `docs/audit-package`.

## Current environment

Stellar Testnet. The public website runs Demo mode (virtual balances); the Alpha path (real Soroban calls) ran in an isolated Testnet environment with its own database. Not current: Mainnet, real-money investor activity, a regulated public offering, licensed lending, production custody, an independent security audit, production settlement rails.

## Road to Mainnet

1. **Independent security:** external Soroban audit, platform penetration test, production key and custody review, production multisig, security monitoring.
2. **Regulated operating structure:** UAE legal classification, final facility structure, asset ownership and security model, licensed or regulated partner model where required, client-money responsibilities, approved agreements.
3. **Production financial rails:** approved settlement asset, regulated payment rails, custody, treasury operations, fiat and Stellar connectivity, settlement reconciliation.
4. **Controlled real-world pilot:** real SMEs, real suppliers, qualified partners, one controlled facility. No fake traction.
5. **Controlled Mainnet:** only after every applicable gate is satisfied. No date is promised.
6. **Scale:** logistics fleets first, later business equipment and other productive asset classes.

## Regulatory status

Vartola is developed by RIMAL TECH - FZCO, a UAE Free Zone technology company. No licence is claimed and no real-money activity takes place. Regulated financial activities, where applicable, are intended to operate through appropriate legal structures and/or licensed partners, subject to legal and regulatory approval, and subject to the UAE legal and regulatory structure before any regulated deployment. Nothing here is an offer, a prospectus or investment advice, and returns are not guaranteed.

## Development

Requirements: Node.js 20+.

```bash
npm install
npx prisma generate
npm run db:seed:demo
npm run dev
```

The app listens on [http://localhost:4200](http://localhost:4200). `DATABASE_URL` for this schema is SQLite; `file:./prisma/dev.db` is resolved from the `prisma` directory, so the file is `prisma/prisma/dev.db`. Hosted deployments use PostgreSQL; `scripts/prepare-prisma.js` and `scripts/sync-postgres-schema.js` run during the Vercel build and apply additive schema changes only.

The demo seed password for every account on the login screen is `demo123`:

| Role | Email |
| --- | --- |
| Investor | fatima@investor.ae, khalid@investor.ae, mohammed@investor.ae, sara@investor.demo |
| SME | omar@desertmile.demo, layla@falconroute.demo, noor@harbourcoldchain.demo |
| Underwriter | underwriter@assetfi.ae |
| Operations admin | operations@vartola.demo |

| Command | Purpose |
| --- | --- |
| `npm run dev` | Development server on port 4200 |
| `npm run build` | Generate the Prisma client and build Next.js |
| `npm run db:seed:demo` | Load the demo companies, pools and login accounts |
| `npm run lint` | ESLint |
| `npm test` | TypeScript unit tests (`lib/**/*.test.ts`) |
| `npm run test:contracts` | Soroban contract tests (`cargo test`) |
| `npm run benchmark:local` | Local load simulation (not a Testnet benchmark) |

Demo and Alpha: `APP_MODE=DEMO` keeps virtual balances in Prisma. `APP_MODE=ALPHA` routes the financial path through Soroban and needs the Testnet setup below. Alpha participation units are 100 VTAED.

```bash
npx tsx scripts/alpha/issue-vtaed.ts
npx tsx scripts/alpha/deploy-contracts.ts
npx tsx scripts/alpha/verify-deployment.ts   # read-only on-chain check
```

Testnet secrets for that setup are written to `.alpha/testnet-keys.json`, which is gitignored. Reports: `docs/institutional-maturity-report.md`, `docs/alpha-completion-report.md`. Operations documents: `docs/operations`. Partner templates (non-binding): `docs/partners`.

The public papers (`/pitch`, `/whitepaper`, `/how-it-works`, `/technical`, `/docs`) read from one facts file, `lib/docs/product.ts`, so status, roadmap and regulatory wording stay identical.

Contact: the public form at `/contact` stores enquiries in the database; staff review them at `/admin/contacts`. Optional email notification uses `EMAIL_PROVIDER_URL` and `CONTACT_NOTIFY_EMAIL`.

The current status is in `docs/project-status.md`; the delivery plan is in `docs/updated-general-plan.md`.
