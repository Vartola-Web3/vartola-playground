# Vartola Product & Operating Paper

**Version:** 1.0  
**Date:** 3 October 2026  
**Status:** Superseded for public use by the website whitepaper at `/whitepaper` (October 2026). This file is a design note. It is not an offer and it does not describe live fees.

> This document is a product and operating design, not an offer, prospectus, legal opinion, or statement of regulatory approval. Vartola must not accept real customer money until its legal structure, permissions, customer agreements, safeguarding, custody, security, and regulated partners are approved.

## Executive summary

Vartola finances productive assets used by UAE SMEs, starting with motorcycles, vans, pickups, and light trucks. An approved requirement becomes a ring-fenced investment opportunity. Eligible investors fund it, the SME uses the asset, and contractual installments return principal and income to the investors allocated to that facility.

The working Alpha already runs the facility lifecycle in the application ledger. Stellar Testnet holds the non-redeemable VTAED asset and can store event fingerprints. Soroban execution is implemented and not yet deployed. Mainnet settlement stays behind regulatory, legal, operational, and security gates. The fee table below is an illustration, not a current tariff.

## Commercial model

| Charge | Proposed rate | Payer | Timing |
|---|---:|---|---|
| Origination fee | 3.00% of financed amount | SME | Successful funding / facility activation |
| Servicing fee | 0.75% per annum on outstanding principal | SME | Accrued monthly and collected with installments |
| Investor platform fee | 0.00% | Investor | None at launch |
| Secondary-transfer fee | 0.50% | As disclosed | Only if a regulated transfer facility is launched |
| Payment and network cost | Actual cost | As disclosed | Per applicable transaction; absorbed by Vartola in the working Alpha |

Rates are product assumptions, not final customer terms. The final pricing schedule must state annualised cost, taxes, late-payment treatment, early settlement, and third-party costs.

## Operating lifecycle

1. **Onboard:** KYC/KYB, UBO, sanctions, PEP, adverse-media, and source-of-funds checks.
2. **Apply:** SME identifies the asset, supplier, amount, contribution, requested term, and business purpose.
3. **Underwrite:** Review financial capacity, asset value, operating use, contribution, security, insurance, and concentration.
4. **Approve:** Set amount, term, risk grade, payment schedule, covenants, and conditions precedent.
5. **Publish:** Provide investors with terms, risk disclosure, evidence summary, fees, and conflicts.
6. **Fund:** Investor money moves from available to reserved; oversubscription and duplicate commitment are prevented.
7. **Activate:** At full funding and satisfaction of conditions, the facility is created and capital becomes deployed.
8. **Service:** SME installments are reconciled and allocated to costs, platform fee, reserve, principal, and income.
9. **Distribute:** Net principal and income are allocated pro rata to the actual investors in the facility.
10. **Close or recover:** The facility closes after all obligations are satisfied, or follows arrears and recovery procedures.

## Ledger and investor reporting

Every movement has a unique idempotency key, facility reference, payer, beneficiary, amount, currency or token, timestamp, status, source event, and reversal relationship. Investor reporting separates:

- capital deposited, available, reserved, deployed, and returned;
- gross installments, principal returned, and income earned;
- platform and third-party fees;
- paid, overdue, and expected amounts;
- cash-on-cash return and facility-level performance.

## Blockchain model

### Simulation mode

Virtual AED is maintained in the internal ledger. It validates the commercial lifecycle without transmitting real value.

### Stellar Testnet mode

The same successful business event writes a signed transaction to Stellar Testnet. The platform stores the network transaction hash and reconciles it with the source ledger event. Testnet assets have no monetary value.

### Production gate

Mainnet is disabled until Vartola has an approved legal and regulatory structure, regulated fiat on/off-ramp, custody or embedded-wallet design, stablecoin and redemption route, client-money controls, transaction monitoring, sanctions controls, mainnet key governance, reconciliation, incident response, penetration testing, smart-contract assurance, and formal pilot approval.

## Partner architecture

- **Identity and business verification:** Sumsub is the preferred adapter; Veriff is a potential individual-verification fallback; UAE Pass/ICP can be evaluated where access permits.
- **Fiat on/off-ramp:** Transak is the initial embedded-ramp adapter, subject to UAE, AED, customer-type, token, and Stellar-route confirmation.
- **Institutional treasury:** Circle is evaluated for treasury and redemption, subject to account eligibility and supported corridors.
- **Blockchain:** Stellar provides settlement and evidence. It is not itself a bank, payment gateway, custodian, or regulatory approval.

## Material risks

Investor capital and returns are not guaranteed. Risks include SME late payment and default, imperfect recovery, asset damage or theft, depreciation, illiquidity, concentration, fraud, stablecoin depeg, FX and conversion spreads, counterparty failure, custody and key compromise, smart-contract defects, network interruption, privacy breach, regulatory change, and operational error.

## Required controls

- segregated client-money records and daily reconciliation;
- role-based access, maker-checker approval, and immutable audit history;
- underwriting policy, delegated authorities, concentration limits, and exception governance;
- asset invoice, ownership or registration, valuation, inspection, insurance, and security evidence;
- arrears, collections, repossession, recovery, write-off, and investor communication procedures;
- AML/CFT, sanctions, transaction monitoring, escalation, and suspicious-activity reporting;
- vendor due diligence, outsourcing registers, service monitoring, and exit plans;
- cybersecurity, key management, incident response, backups, and business continuity;
- complaints, conflicts, privacy, marketing approval, record retention, and regulatory reporting.

## Roadmap

| Stage | Status | Exit criterion |
|---|---|---|
| Complete lifecycle simulation | Complete | Funding, activation, installments, fees, and investor distributions reconcile |
| Stellar Testnet evidence | Active | Signed transactions, real hashes, failure handling, and reconciliation pass |
| Partner sandboxes | Next | KYC/KYB and ramp webhooks pass happy-path and exception testing |
| Legal and regulatory design | Required gate | Written counsel and/or regulated partner confirms permitted structure |
| Controlled pilot | Future | Approved customers, limits, monitoring, support, and incident procedures |
| Production mainnet | Future | Security, custody, safeguarding, reconciliation, and launch approvals complete |

## Primary references

- [VARA updated activity rulebooks](https://www.vara.ae/en/news/vara-issues-updated-activity-rulebooks-to-strengthen-market-integrity-and-risk-oversight/)
- [VARA whitepaper requirements](https://rulebooks.vara.ae/entiresection/11)
- [VARA real-world-asset token rules](https://rulebooks.vara.ae/entiresection/516)
- [DFSA crypto-token framework](https://www.dfsa.ae/crypto)
- [DFSA client-assets expectations](https://www.dfsa.ae/what-we-do/client-assets)

