# VARTOLA INSTITUTIONAL MATURITY REPORT

Date: 6 October 2026. Environment: Stellar Testnet, Working Alpha. No real money, no Mainnet, no licence, no regulatory approval, no independent audit.

Classification key: COMPLETE, PARTIAL, BLOCKED, EXTERNAL (needs a third party), REGULATORY (needs legal or regulatory action).

## 1. Executive status

Vartola moved from a strong Financial Web3 Alpha to an operable, evidence-backed platform: a public Proof Center, a portfolio risk and expected-loss framework, treasury control, asset servicing, collections and recovery workspaces, operations health, contract governance, a pilot pipeline that starts at zero, a partner sandbox, and internal security and audit-readiness documents. Maturity here comes from controls and evidence, not claims. Nothing was invented: no partners, LOIs, SMEs, audits, hashes or contract IDs.

Overall: COMPLETE for platform capability on Testnet; PARTIAL for operational readiness; EXTERNAL and REGULATORY for everything that makes it real-money.

## 2. Current Stellar / Soroban architecture — COMPLETE

Stellar settles value, Soroban executes facility logic (contracts v3), Prisma is the read model, Firebase the append-only journal, private storage holds documents. Flow: action, validation, Soroban, confirmation, Prisma projection, Firebase event, reconciliation. Unchanged and preserved.

## 3. Public Proof Center — COMPLETE

`/proof` shows network, VTAED, contract IDs, versions, live ledger from RPC, indexer and reconciliation health where they run, and recorded engineering evidence. `/proof/facility/[id]` shows the lifecycle with every recorded event, ledger and explorer link for the three reference facilities. Values come from the recorded deployment, never hard-coded. The public deployment runs Demo mode so the indexer and reconciliation show "not running on this deployment"; the page says so.

## 4. Financial execution — COMPLETE (Testnet)

Escrow, release conditions, separated authorize/pay roles, repayment, distribution, early settlement, default and recovery executed on Testnet. Waterfall v2 in TypeScript mirrors the contract arithmetic with a facility-configurable reserve and cost lines; invariants tested.

## 5. Risk framework — COMPLETE

Facility risk v2 (nine components, versioned, hashed inputs), underwriter explanation (positives, negatives, key risks, mitigants, suggested actions), hash attestation on-chain. Deterministic and rule-based; no machine learning is claimed.

## 6. Expected Loss framework — COMPLETE (internal estimate)

PD × LGD × EAD with configurable assumptions, model version, input snapshot hash, explanation, and a clear label: internal estimate, not a regulated rating. Assumptions are not calibrated on real default data (PARTIAL for calibration; needs pilot data, EXTERNAL).

## 7. Portfolio risk — COMPLETE

`/admin/risk`: exposure, expected loss, weighted grade, late, default and recovery exposure, concentration by SME, supplier, asset class, sector, geography and grade, top exposures, upcoming breaches, six stress scenarios labelled not a forecast.

## 8. Treasury control — COMPLETE

`/admin/treasury`: committed, funded, deployed, escrow, releases, repayments, outstanding, liabilities, reserves, recovery, settlement, with chain-versus-application state and reconciliation status. Facility reserve configuration recorded per facility; not presented as protection.

## 9. Asset servicing — COMPLETE (manual inputs)

Lifecycle stages, health indicator, verification panel with sources, servicing events, insurance claims. Expiry and maintenance data are administrator inputs; unknown dates lower the score. No registry or insurer API is claimed (EXTERNAL).

## 10. Supplier network — PARTIAL

Supplier portal and submissions exist; the performance score reports NOT ENOUGH DATA until a minimum sample exists; forbidden supplier actions are tested; supplier failure workflow and outcomes recorded. Real supplier onboarding and history are EXTERNAL.

## 11. Collections and recovery — COMPLETE

`/admin/collections`: cases with allowed stage paths, audit trail, recovery fields, neutral lawful-recovery wording. Legal time periods are facility parameters. A servicing partner and legal process are EXTERNAL and REGULATORY.

## 12. Investor reporting — COMPLETE

Positions, proof, receipts (`/receipts`), participation certificate with the required disclaimer, institutional reports (facility, positions, portfolio risk, treasury reconciliation, passport, recovery, system health) as printable HTML or JSON. Native PDF files are not generated; browsers print or save to PDF (PARTIAL).

## 13. Security controls — PARTIAL

Role separation, release limit, pause, two-step rotation, timelock, TOTP MFA for admin roles in Alpha mode, encrypted provider secrets, private document design. Security center and role matrix pages added. Single Testnet keys, no multisig enforcement, no HSM, signed uploads untested on a real bucket (SECURITY dependency).

## 14. Governance — COMPLETE (Testnet)

`/admin/contracts` with version history, deployment transactions, role wallets and a governance log; privileged role matrix with separated duties and a read-only auditor; multisig policies defined but explicitly not enforced.

## 15. Indexer and reconciliation — COMPLETE

Persistent cursor, idempotency, retry, dead letters, safe re-index, scheduled and manual reconciliation (HEALTHY, WARNING, FAILED). Resilience tests cover duplicate and out-of-order events, RPC outage, webhook replay, Firebase outage and mismatches. The scheduler needs `CRON_SECRET` in the hosted environment (EXTERNAL configuration).

## 16. Observability — PARTIAL

`/admin/operations-health` covers Stellar RPC, indexer, reconciliation, providers (configured or not), security counters. No external logging, pager or webhook-delivery history yet.

## 17. Business continuity — PARTIAL

Documented answer to the application-outage question, disaster recovery plan, wind-down plan (draft, needs counsel). No restore drill, no committed RTO or RPO.

## 18. Pilot infrastructure — COMPLETE

`/admin/pilots` pipeline with ten stages, seven entity types, KPIs that show zero when empty. Nothing pre-populated. Real pilot traction itself is EXTERNAL and currently zero.

## 19. Partner readiness — PARTIAL

Five non-binding templates, partner sandbox with six scenarios, reviewer overview. No partner exists yet (EXTERNAL).

## 20. Audit readiness — COMPLETE (package), EXTERNAL (audit)

`docs/audit-package`: architecture, contract inventory, authorization matrix, invariants, known limitations, test summary, threat model, upgrade process, emergency controls, deployment, reconciliation. No audit is engaged.

## 21. Mainnet readiness — BLOCKED

`/admin/mainnet-readiness` tracks 17 required gates; none of audit, penetration test, custody, legal, regulatory and payment-rail gates is complete, so the Mainnet action is locked by a test. No date is promised.

## 22. Test results

- Application tests: 148 pass, 0 fail (was 96).
- Soroban contract tests: 44 pass (facility 26, finance math 8, registry 5, others).
- Local load simulation recorded in `docs/operations/BENCHMARKS.md` (not a Testnet benchmark; no real Testnet benchmark run).

## 23. Build and lint results

`next build` passes. ESLint: 0 errors, 27 warnings (the `<img>` suggestions and unused seed variables). No rule was disabled to reach zero.

## 24. External dependencies

Independent auditor, penetration tester, managed key custody, Sumsub production, email and SMS providers, private storage credentials, hosted cron secret, real SMEs, suppliers, insurers and servicing partners, calibration data for risk assumptions.

## 25. Regulatory dependencies

Regulatory opinion and licensing route or licensed partner, custody and client-money design, approved settlement asset and payment rail, final ownership and security structure, approved agreements. REGULATORY.

## 26. Remaining security dependencies

Multisig enforcement for admin, treasury and upgrades; HSM or managed vault; audit and penetration test; real-bucket test of signed uploads; fuzzing; production monitoring and on-call.

## 27. Top remaining blockers

1. Independent smart-contract audit and penetration test (EXTERNAL).
2. Regulatory opinion, licence route or licensed partner, custody and client money (REGULATORY).
3. Approved settlement asset and payment rail (REGULATORY, EXTERNAL).
4. Multisig and managed key custody (SECURITY).
5. Real pilot SMEs, suppliers and partners (EXTERNAL).
6. Tested backup, restore and wind-down procedures (PARTIAL).

## Not done, and why

- No native PDF generation: reports print to PDF from the browser.
- No real Testnet benchmark: it would measure the network, and would have been disruptive.
- Compliance KYC providers, storage, email and SMS remain unconfigured in the hosted environment: need provider agreements and credentials.
- Dedicated login roles for treasury, pauser, compliance and auditor are mapped to the existing admin logins in this build.
