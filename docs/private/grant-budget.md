# Grant budget (PRIVATE, internal planning only)

Do not link, render, or expose this file on the public website or through any API.
Proposed allocation, not money already spent. Total: USD 150,000 equivalent in XLM.

```ts
export const BUDGET = [
  { item: 'Soroban and Stellar engineering', amount: 42_000 },
  { item: 'Security and smart-contract audit', amount: 28_000 },
  { item: 'Compliance integration engineering', amount: 16_000 },
  { item: 'Wallet and key infrastructure', amount: 14_000 },
  { item: 'Indexer and reconciliation', amount: 12_000 },
  { item: 'Testing and quality assurance', amount: 10_000 },
  { item: 'DevOps and monitoring', amount: 8_000 },
  { item: 'Legal and regulatory technical implementation', amount: 12_000 },
  { item: 'Controlled pilot preparation', amount: 8_000 },
] as const;

export const GRANT_USE = [
  'Soroban financial contracts',
  'Stellar asset integration',
  'Wallet infrastructure',
  'Security and audits',
  'Testing',
  'Indexing and reconciliation',
  'Compliance infrastructure',
  'Developer resources',
  'Production hardening',
  'Mainnet readiness',
];

export const TRANCHES = [
  {
    name: 'Tranche 1',
    window: 'November–December 2026',
    amount: 50_000,
    deliverables: [
      'Wallet registry and facility contracts deployed on Stellar Testnet',
      'Demonstrated VTAED movement into facility escrow and Participation Units',
      'Embedded Testnet wallet path available in Alpha mode',
      'Admin view of real Testnet transaction references',
    ],
  },
  {
    name: 'Tranche 2',
    window: 'January–February 2027',
    amount: 55_000,
    deliverables: [
      'Repayment, distribution, early settlement, and recovery execution on Testnet',
      'Digital Asset Passport and document attestations anchored for a reviewer facility',
      'Event indexer and reconciliation between Soroban results and the application read model',
      'Security hardening, audit preparation, and multisig or pause governance design',
    ],
  },
  {
    name: 'Tranche 3',
    window: 'March–May 2027',
    amount: 45_000,
    deliverables: [
      'KYC and KYB permissioning connected to the wallet registry',
      'Legal architecture completed as drafts, with a licensed-partner structure prepared',
      'Regulatory dependencies documented as launch gates',
      'External audit engagement and production-operations testing for a controlled pilot',
    ],
  },
] as const;
```
