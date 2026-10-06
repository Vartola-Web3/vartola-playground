# Vartola

Vartola is a productive-asset finance infrastructure platform for UAE SMEs. It combines facility origination, a capital marketplace, asset servicing, and a Stellar / Soroban rail. The company behind the product is RIMAL TECH - FZCO, a UAE Free Zone technology company. It is not a licensed lender. The current environment uses test assets only and carries no real monetary value.

The default process mode is `APP_MODE=DEMO`. That walkthrough keeps the seeded accounts, virtual tAED, and a shortcut that activates a facility when an opportunity is fully funded so repayment can be reviewed. `APP_MODE=ALPHA` finalizes investments, escrow, release, repayment, distribution, settlement, and recovery only after a confirmed Soroban Testnet transaction. The Soroban contracts `wallet_registry` and `facility_contract` are deployed and initialized on Stellar Testnet, and Facility #001 ran end to end on them in an isolated Alpha test environment. The public site still runs Demo mode. VTAED, a non-redeemable test asset, is issued on Stellar Testnet. Mainnet is not enabled, and nothing has been independently audited.

The public site is [home.vartola.net](https://home.vartola.net).

## Financing cycle

1. An SME submits a vehicle funding request and can attach company documents.
2. An underwriter reviews the company, the asset, and the deal, then approves or rejects. Approval creates a facility and its payment schedule.
3. An operations admin creates a pool and connects the approved facility. The pool target is the finance amount.
4. Investors participate. In the public walkthrough, virtual balances stay reserved until the pool is full. In Alpha mode, value is reserved in the facility contract.
5. The public walkthrough can activate a facility when funding completes. The intended rail does not. Release checks, supplier payment, and delivery evidence come first, and Alpha mode waits for a confirmed Soroban result.
6. The SME pays the next unpaid installment at any time, including before the due date.
7. Each installment returns an equal share of principal, with any remainder on the last installment, plus the income left after fees. Investors receive their share in proportion to what they deployed.
8. When the principal is fully returned, the facility is completed. When every facility in the pool is completed, the pool is completed.

## Roles

| Role | What they do |
| --- | --- |
| SME | Apply for a vehicle, upload documents, and pay the active schedule. |
| Investor | Fund a wallet, invest in an open opportunity, and receive principal and income. |
| Underwriter | Score and approve or reject applications. |
| Operations admin | Create pools, watch facilities, and review the Testnet operation log. |
| Platform owner | Full admin, including system setup. This account is created by the demo seed and is not shown on the public login screen. |

Public pages do not require a session: home, about, how it works, whitepaper, pitch, documentation, the technical brief, the grant brief, draft legal pages, and the marketplace. Each signed-in role is limited to its own area.

## Stack

- Next.js 16.3.8 and React 19, App Router
- NextAuth credentials sessions
- Prisma 5.22 with SQLite in this repository
- Stellar Testnet through Horizon. Each confirmed job writes one `manage_data` operation carrying a SHA-256 fingerprint of the event
- Firebase project `assetfi-uae`, Firestore database `vartola-ops`, used as an operations journal
- Tailwind CSS 4

| Store | Role |
| --- | --- |
| Prisma | Users, companies, applications, document metadata, compliance, risk, dashboards, and the read model of chain state. It does not override a confirmed Soroban financial result in Alpha. |
| Firebase `vartola-ops` | Operations journal and admin visibility. A failed journal write does not undo a confirmed Soroban transaction. Alpha journal rows use a unique event id. |
| Stellar Testnet | VTAED, a non-redeemable test asset already issued for Alpha. Demo balances stay virtual tAED. Event fingerprints in demo mode are not transfers. |
| Soroban | Wallet registry and facility contract source: escrow, participation units, release, repayment, distribution, recovery, and document or asset hashes. Deployed and initialized on Stellar Testnet; used by Alpha mode only. Not audited, not on Mainnet. |

Demo settlement of virtual balances stays in Prisma. Alpha settlement is the Soroban facility contract. Contract sources are in `contracts/soroban`.

## Public documentation

The public papers share one facts file, `lib/docs/product.ts`, so status, roadmap, and regulatory wording stay identical: `/pitch`, `/whitepaper`, `/how-it-works`, `/technical`, `/grant`, `/docs`, and draft legal documents under `/legal`. Status labels are LIVE IN ALPHA, TESTNET, INTEGRATION IN PROGRESS, IN DEVELOPMENT, SECURITY GATE, PARTNER DEPENDENCY, REGULATORY GATE, and MAINNET GATE. A current summary is in `docs/project-status-2026-10.md`.

## Run locally

Requirements: Node.js 20+.

```bash
npm install
npx prisma generate
npm run db:seed:demo
npm run dev
```

The app listens on [http://localhost:4200](http://localhost:4200).

`DATABASE_URL` for this schema is SQLite. A value of `file:./prisma/dev.db` is resolved from the `prisma` directory, so the file is `prisma/prisma/dev.db`.

The demo seed password for every account on the login screen is `demo123`.

| Role | Email |
| --- | --- |
| Investor | fatima@investor.ae |
| Investor | khalid@investor.ae |
| Investor | mohammed@investor.ae |
| Investor | sara@investor.demo |
| SME, Desert Mile | omar@desertmile.demo |
| SME, Falcon Route | layla@falconroute.demo |
| SME, Harbour Cold Chain | noor@harbourcoldchain.demo |
| Underwriter | underwriter@assetfi.ae |
| Operations admin | operations@vartola.demo |

The seeded opportunities are Dubai Last-Mile Fleet, Abu Dhabi Cargo Vans, and Cold Chain Expansion. They start open and waiting for investors.

## Demo and Alpha

Demo login accounts and the password `demo123` are unchanged. Alpha adds registration states (`EMAIL_PENDING` through `ACTIVE`), phone verification, Sumsub KYC/KYB copied onto the wallet registry, and an embedded Testnet wallet. The wallet secret is encrypted with `WALLET_KEK` and is never returned to the browser.

Alpha participation units are 100 VTAED. Investor cash moves from the embedded wallet into the facility escrow, then to the supplier address after the release checklist. Repayment and recovery run in the facility contract and are mirrored into Prisma.

Issue the test asset, then deploy, initialize, and link the contracts (the script wraps VTAED as a Stellar Asset Contract, sets a separate pauser, validates the result, and records IDs, hashes, and ledgers):

```bash
npx tsx scripts/alpha/issue-vtaed.ts
npx tsx scripts/alpha/deploy-contracts.ts
npx tsx scripts/alpha/verify-deployment.ts   # read-only on-chain check
```

Secrets for that local Testnet setup are written to `.alpha/testnet-keys.json`, which is gitignored. `scripts/alpha/fleet-001.ts` creates Dubai SME Delivery Fleet — Facility #001 with new accounts. It does not change the seeded demo users.

Mainnet stays closed until there is regulatory approval, a legal structure, a KYC/KYB and custody partner, a smart-contract audit, a security audit, and an operations review.

## Alpha status (October 2026)

### Stellar Testnet references

| Item | Value |
| --- | --- |
| Network | Stellar Testnet |
| VTAED issuer | `GATMFYSVHN25CTFMW27USR65VTIIH4DSEA2MCRELBGWQBDEZRJTCOW32` |
| VTAED Stellar Asset Contract | `CCSZAIHVNLOJWHMOZ7W4L3J3YR6I5UZXVMEAATIIRZD4OODODOT4KRJS` |
| wallet_registry (v3) | `CDJ5MMB2JZCWX2HZT7NOHBQRCQTDVEPKJNOQSGDMYVIX7GL5JO7EIDNC` |
| facility_contract (v3) | `CDS5HIFCHMLR7VHOGHDMJEXMUI3CINY2R6FPRA4UVZIPPAUGQ6P4ERFM` |
| Administrator | `GCKPCTIBILOCNFZRN6Q2P3GM6Q3RY3EADRDSAPF7IMUATE2UGPERXM7T` |
| Pauser | `GCIG5QFLRMCAC2BTC2XUJBXKXK3WFN5G2KPQKZ2VKO3YZ2QQZZHASNAJ` |
| Treasury | `GA4QQ7PLFRWZW7BDBPPKGTQ2UOBL6IJ35HOMWNEEZ7I52A3VPAEGI3DB` |
| Underwriter role wallet | `GDKEWLFB4VYJ2ASU434QETOTEAV4NVG2V7CHOMCU5IEUBACRFSGYQCGU` |
| Operations role wallet | `GCQGIQNAJEHL3P57A64W3FZP4YAAS54X6T2I56DHOKBMHTWM3RGHAGMM` |
| Compliance role wallet | `GAJGA57FTBLDB4KZYTL5QV3N3B54OOAUP46MY4K7AJTCKPG3C42JJ54H` |

Earlier versions (v1, v2) are listed as superseded on `/technical`. Transaction hashes and ledgers for the deployment and for Facility #001, #002 (early settlement) and #003 (default and recovery) are on the public `/technical` page and in `lib/docs/testnet-record.generated.json`. Anyone can check a facility live on `/verify/facility/<facility number>`. These are Testnet values with no monetary value.

### What is complete, partial, demo, and planned

| Area | Status | Notes |
| --- | --- | --- |
| SME, underwriting, facilities, pools, servicing, audit log | COMPLETE | Demo ledger by default |
| VTAED on Testnet, embedded wallets, trustlines | COMPLETE | Alpha mode |
| Soroban contracts v3: escrow states, release attestations, waterfall, distribution totals, roles, limits, upgrade timelock | COMPLETE | Testnet only, not audited |
| Facility #001 (150,000 VTAED, 1,500 units), #002 settlement, #003 default and recovery on contract v3 | COMPLETE | Isolated test environment, not the public site |
| Chain-first Alpha lifecycle (CHAIN_PENDING/CONFIRMED/FAILED) | COMPLETE | Prisma is updated only after confirmation |
| Receipts, participation certificate, position and portfolio analytics, public facility verification | COMPLETE | Alpha mode; certificate is a platform record, not a security or proof of title |
| Reconciliation and event indexer | COMPLETE on Testnet | Manual and scheduled (cron, 15 minutes, needs CRON_SECRET); retry and dead letters; alerts to audit log, Firebase, optional email |
| Firebase journal | COMPLETE | Append-only with retry; not financial authority |
| Facility risk score (`facility-risk-v2`) with on-chain attestation | COMPLETE | Rule-based, hashed inputs, drivers shown; not a rating agency score |
| Admin MFA (TOTP) | COMPLETE in Alpha mode | Demo quick-login unchanged |
| Provider secrets encrypted at rest | COMPLETE | Needs SERVER_MASTER_KEY; run `scripts/alpha/encrypt-settings.ts` once |
| Supplier portal and supplier users | COMPLETE | Apply migration `20261006000000_supplier_users_mfa` to the hosted database |
| Sumsub webhook | PARTIAL | Signed, idempotent, transactional, full states; production screening needs the provider agreement and credentials |
| Private storage: signed uploads, short-lived downloads, real deletion | PARTIAL | Not yet tested against a real bucket |
| Email and SMS providers | PARTIAL | Abstractions and templates; no provider connected; default notices are blocked without counsel approval |
| Demo mode (virtual tAED, funded-pool shortcut, quick login) | DEMO | Public site |
| Multisig, production custody, external audit | PLANNED | Security gate |
| Licensed financing, client money, Mainnet | PLANNED | Regulatory gate; no date |

### Roles of each layer

- **Soroban / Stellar:** authoritative financial execution in Alpha mode (escrow, participation units, release, repayment, distribution, settlement, recovery).
- **Prisma:** application and read model. In Alpha it is updated only after a confirmed chain transaction.
- **Firebase:** operations journal and admin visibility. A Firebase failure never blocks or reverses a confirmed transaction.

### Known open issues

See `docs/alpha-completion-report.md` (latest) and `docs/audit-2026-10-05.md` (earlier audit).

## Money and the chain

`FINANCIAL_MODE` can still anchor demo events on Stellar Testnet with `manage_data`. Those hashes prove an event. They do not move VTAED. Alpha financial calls are Soroban invocations and are stored only when the transaction status is confirmed. A failed invocation is `CHAIN_FAILED` and does not mark the payment or investment successful.

The worker accepts the Testnet passphrase only and rejects a mainnet Horizon URL. A hash is shown only when it is 64 hexadecimal characters. Missing historical hashes are left blank.

## Firebase

Confirmed chain events, submitted applications, underwriting decisions, and stored document metadata can be written to `operations` in `vartola-ops`. Demo journal rows are still one document per entity. Alpha rows include the transaction hash so a later event does not replace the earlier one. Demo uploads stay on local disk. Alpha uploads use private object storage when `S3_BUCKET` is set.

Website sign-in uses the demo accounts above. It does not use Firebase Authentication.

## Scripts

| Command | Purpose |
| --- | --- |
| `npm run dev` | Development server on port 4200 |
| `npm run build` | Generate the Prisma client and build Next.js |
| `npm run db:seed:demo` | Load the Vartola demo companies, pools, and login accounts |
| `npm run lint` | ESLint |
| `npm test` | All TypeScript unit tests (`lib/**/*.test.ts`) |
| `npm run test:contracts` | Soroban contract tests (`cargo test`) |

## Further reading

Product language and the intended lifecycle are in `docs/product-direction.md`. The database shape is in `prisma/schema.prisma`. Older notes under `docs/` describe earlier AssetFi plans and are historical when they disagree with this file.
