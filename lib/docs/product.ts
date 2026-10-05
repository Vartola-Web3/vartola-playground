// Shared facts for the public documentation: Pitch, White Paper, How It Works,
// Technical, and the roadmap. Every page reads from here so the story stays the same.

export type DocStatus =
  | 'LIVE IN ALPHA'
  | 'TESTNET'
  | 'INTEGRATION IN PROGRESS'
  | 'IN DEVELOPMENT'
  | 'SECURITY GATE'
  | 'PARTNER DEPENDENCY'
  | 'REGULATORY GATE'
  | 'PLANNED'
  | 'MAINNET GATE';

export const ENTITY = {
  name: 'RIMAL TECH - FZCO',
  form: 'UAE Free Zone technology company',
  note: 'The company develops technology infrastructure. It is not a bank, lender, licensed crowdfunding operator, broker, custodian, or investment firm.',
};

export const POSITIONING =
  'Vartola is a productive-asset finance infrastructure platform designed to help UAE SMEs access the vehicles and equipment they need to grow, while giving eligible capital providers structured access to asset-backed financing opportunities.';

export const POSITIONING_DETAIL =
  'It combines underwriting, asset acquisition, servicing, investor participation, and programmable financial execution using Stellar and Soroban.';

export const PILLARS = ['Asset-finance infrastructure', 'Capital marketplace', 'Asset servicing platform', 'Stellar / Soroban financial rail'] as const;

export const CORE_STATEMENT =
  'Vartola is building the financial infrastructure for productive real-world assets — connecting SME demand, capital, suppliers, servicing and asset lifecycle management through programmable finance on Stellar.';

export const CLOSING_LINE = 'Finance the asset. Track the lifecycle. Program the cash flow.';

export const REGULATORY_LINE =
  'Vartola operates as technology infrastructure. Regulated activities will be conducted under the legally approved structure and, where required, through appropriately authorized partners.';

export const STRUCTURE_LINE = 'Subject to final UAE legal and regulatory structuring.';

export const MAINNET_STATEMENT =
  'Mainnet and live-money deployment follow completion of applicable regulatory, legal, security, payment/custody and operational readiness gates.';

export const RETURNS_NOTE =
  'Returns are not guaranteed. Investment eligibility and offering structure remain subject to applicable regulation.';

export const DISCLAIMER =
  'This material describes the Vartola working Alpha and its Stellar Testnet financial layer. It is not an offer, prospectus, or solicitation. It does not promise returns, repayment, or recovery. Vartola does not currently take real client money, issue a redeemable currency, or conduct a licensed financing business. Mainnet and live-money deployment follow regulatory, legal, security, payment/custody, and operational readiness gates.';

export const PUBLIC_NAV = [
  ['Home', '/'],
  ['How It Works', '/how-it-works'],
  ['Whitepaper', '/whitepaper'],
  ['Pitch', '/pitch'],
  ['Technical', '/technical'],
  ['About', '/about'],
] as const;

export const GITHUB = 'https://github.com/fouxh/vartola-playground';

export const VTAED = {
  code: 'VTAED',
  name: 'Vartola Test AED',
  network: 'Stellar Testnet',
  issuer: 'GATMFYSVHN25CTFMW27USR65VTIIH4DSEA2MCRELBGWQBDEZRJTCOW32',
  distributor: 'GA4QQ7PLFRWZW7BDBPPKGTQ2UOBL6IJ35HOMWNEEZ7I52A3VPAEGI3DB',
  assetUrl:
    'https://stellar.expert/explorer/testnet/asset/VTAED-GATMFYSVHN25CTFMW27USR65VTIIH4DSEA2MCRELBGWQBDEZRJTCOW32',
  distributorUrl:
    'https://stellar.expert/explorer/testnet/account/GA4QQ7PLFRWZW7BDBPPKGTQ2UOBL6IJ35HOMWNEEZ7I52A3VPAEGI3DB',
  note: 'Testnet only. No real AED value and no redemption value.',
};

// How the three stores relate. Used on Technical and in the White Paper.
export const ARCHITECTURE = [
  {
    layer: 'Stellar / Soroban',
    role: 'Critical financial execution and authoritative financial state',
    body: 'Facility creation, wallet permissioning, participation, funding, escrow, release, repayment, distribution, settlement, recovery, lifecycle states, and document or asset attestations.',
  },
  {
    layer: 'Prisma',
    role: 'Application and read layer',
    body: 'Users, companies, applications, documents, risk information, analytics, reporting, dashboards, search, and UI projections of chain state.',
  },
  {
    layer: 'Firebase',
    role: 'Operations journal',
    body: 'Operations journal, realtime admin visibility, non-critical event mirroring, and operational metadata. A failed journal write never undoes a confirmed financial result.',
  },
] as const;

export const STELLAR_ROLE =
  'Stellar is the network and the asset and settlement layer: accounts, assets, trustlines, payments, and a public transaction history.';

export const SOROBAN_ROLE =
  'Soroban is Stellar’s smart-contract layer. It executes the programmable financing rules: who may participate, when escrow is released, how a payment splits, and how recovery is allocated.';

export const ONCHAIN_FLOW = [
  'Investor wallet',
  'Compliance permission',
  'Facility',
  'Escrow',
  'Supplier release',
  'Repayment',
  'Distribution',
];

export const LIFECYCLE = ['SME', 'Underwriting', 'Facility', 'Capital', 'Supplier', 'Asset', 'Repayment', 'Distribution'];

export const MONEY_FLOW = [
  'Investor',
  'Stellar wallet',
  'Facility escrow',
  'Funding completion',
  'Conditional supplier release',
  'Asset activation',
  'SME repayment',
  'Programmable distribution',
  'Investor wallet',
];

// Five layers of the Vartola Finance Engine, with what the code does today.
export const RISK_LAYERS: { name: string; status: DocStatus; detail: string }[] = [
  { name: 'Business risk', status: 'LIVE IN ALPHA', detail: 'Company age, revenue, cash flow, liabilities, sector, and documents produce a company score. Credit bureau data and payment capacity are added as providers allow.' },
  { name: 'Asset risk', status: 'LIVE IN ALPHA', detail: 'Asset type, age or condition, value band, and resale liquidity produce an asset score. Depreciation, residual value, supplier, and insurance are reviewed by the underwriter.' },
  { name: 'Deal risk', status: 'LIVE IN ALPHA', detail: 'Business and asset scores plus SME contribution, finance-to-value, term, and payment burden produce a deal score and a risk tier. DSCR applies where data allows.' },
  { name: 'Facility risk', status: 'IN DEVELOPMENT', detail: 'Release conditions, delivery checks, and servicing status (late, default, recovery) are tracked per facility. A single facility risk score is not yet published.' },
  { name: 'Portfolio risk', status: 'LIVE IN ALPHA', detail: 'Marketplace pool ratings weigh diversification, SME contribution, and concentration. Hard limits by SME, asset, industry, geography, maturity, and risk grade are enforced before live volume.' },
];

export const EXTERNAL_DATA_NOTE =
  'External credit and reputation data providers will be integrated according to regulatory and provider availability. They are not claimed as live.';

export const NETWORK_EFFECT = [
  ['More SMEs', 'more finance demand'],
  ['More suppliers', 'more assets'],
  ['More capital providers', 'more funding capacity'],
  ['More financing', 'more performance data'],
  ['More data', 'better underwriting'],
  ['Better underwriting', 'more trusted opportunities and more capital'],
] as const;

// What can proceed now, and what waits for approval.
export const CAN_PROCEED = ['Technology development', 'Testnet operation', 'Smart-contract implementation and audit', 'KYC / KYB integration preparation', 'Security work', 'Legal document drafting', 'Partner integration preparation'];
export const GATED = ['Live money', 'Mainnet financial launch', 'Real investor funds', 'Real financing', 'Real participation securities or investments'];

export const GRANT_TOTAL = 150_000;

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

// The one master timeline. It starts from the working platform in October 2026.
export const ROADMAP = [
  {
    when: 'October 2026',
    title: 'Current platform',
    body: 'Working Vartola Alpha with an end-to-end financing product foundation and the Stellar Testnet layer.',
    points: ['SME workflow', 'Investor workflow', 'Underwriting and risk engine', 'Facilities', 'Servicing, repayment, and distribution', 'Late, default, and recovery', 'VTAED issued on Testnet', 'Soroban contracts written and tested', 'Web3 architecture expansion'],
  },
  {
    when: 'November 2026',
    title: 'Stellar-native financial layer',
    body: 'Deploy the Soroban contracts to Testnet and run the Alpha money path through them.',
    points: ['Facility contracts', 'Escrow', 'Participation Units', 'Wallet infrastructure and permissioning', 'Testnet settlement asset flows', 'Blockchain admin tooling', 'SCF submission and ecosystem engagement'],
  },
  {
    when: 'December 2026',
    title: 'Servicing and asset infrastructure',
    body: 'Harden servicing on-chain and anchor the asset record.',
    points: ['Repayment and distribution contracts', 'Asset Passport', 'Document attestations', 'Secure document storage', 'Event indexing', 'Financial reconciliation', 'Integration testing', 'Supplier workflow improvements'],
  },
  {
    when: 'January 2027',
    title: 'Compliance and risk infrastructure',
    body: 'Connect verification to permissioning and complete the downside workflow.',
    points: ['KYC and KYB integrations', 'Wallet permissioning', 'AML and sanctions architecture', 'Supplier and dealer workflows', 'Servicing hardening', 'Portfolio risk controls', 'Early settlement', 'Default and recovery automation'],
  },
  {
    when: 'February 2027',
    title: 'Security and resilience',
    body: 'Prepare the system for independent review.',
    points: ['Smart-contract testing', 'Audit preparation', 'Penetration testing', 'Web and API security', 'Governance and multisig', 'Treasury controls', 'Reconciliation', 'Monitoring', 'Incident response', 'Business continuity and wind-down preparation'],
  },
  {
    when: 'March 2027',
    title: 'Regulatory and partner structure',
    body: 'Define the approved operating structure. Approval itself is not a date Vartola controls.',
    points: ['Legal and regulatory perimeter', 'Operating structure', 'Licensed-partner discussions', 'Asset ownership and security model', 'Legal documentation', 'Custody and payment design', 'Insurance', 'Recovery and service partners', 'Final agreements'],
  },
  {
    when: 'April–May 2027',
    title: 'Production readiness',
    body: 'Independent review and controlled pilot preparation. No live-money date is promised.',
    points: ['External audits', 'Regulatory implementation', 'Partner integrations', 'Compliance implementation', 'Production reconciliation', 'Production operations testing', 'Controlled pilot preparation'],
  },
  {
    when: 'Mainnet',
    title: 'Gated, not dated',
    body: MAINNET_STATEMENT,
    points: [],
  },
] as const;

export const IMPLEMENTATION: { area: string; status: DocStatus; detail: string }[] = [
  { area: 'SME registration and financing applications', status: 'LIVE IN ALPHA', detail: 'Registration, company profile, vehicle financing application, and document upload with metadata.' },
  { area: 'Underwriting and risk scoring', status: 'LIVE IN ALPHA', detail: 'Business, asset, and deal scores, risk tiers, and an underwriter approve or reject flow. Approval creates a facility and its payment schedule.' },
  { area: 'Facilities, opportunities, and investor participation', status: 'LIVE IN ALPHA', detail: 'Pools, facilities, and investor participation. In the public walkthrough capital is virtual tAED recorded in the application ledger.' },
  { area: 'Supplier release and delivery verification', status: 'LIVE IN ALPHA', detail: 'Release conditions (funding, SME contribution, agreement, invoice, vehicle, insurance, compliance, final approval) and activation checks (delivery, inspection, identifier, registration, insurance, acceptance). The public walkthrough can still activate a fully funded opportunity so reviewers can continue into repayment.' },
  { area: 'Repayments, distributions, early settlement, late payment, default, and recovery', status: 'LIVE IN ALPHA', detail: 'Servicing runs in the application ledger. Alpha mode routes the same events through the Soroban facility contract and records them only after a confirmed transaction.' },
  { area: 'Administration and audit trail', status: 'LIVE IN ALPHA', detail: 'Role-separated SME, investor, underwriter, and admin areas, an audit log, and a Testnet operation log.' },
  { area: 'Prisma application and read model', status: 'LIVE IN ALPHA', detail: 'Users, companies, applications, documents, risk, dashboards, and the read model of chain state.' },
  { area: 'Firebase operations journal', status: 'LIVE IN ALPHA', detail: 'Confirmed operations are journaled for admin visibility. A failed journal write does not undo a confirmed result.' },
  { area: 'VTAED settlement asset', status: 'TESTNET', detail: 'Issued on Stellar Testnet. Testnet only, no real AED value, no redemption value.' },
  { area: 'Testnet event fingerprints', status: 'TESTNET', detail: 'Demo mode writes a SHA-256 fingerprint of each confirmed event with a manage_data operation. It is evidence of an event and does not move value.' },
  { area: 'Soroban wallet registry and facility contract', status: 'INTEGRATION IN PROGRESS', detail: 'Permission registry, facility, escrow, Participation Units, release, repayment, distribution, settlement, default, recovery, passport, and document attestation are implemented with unit tests. Not yet deployed, so no contract IDs are published.' },
  { area: 'Alpha execution path (APP_MODE=ALPHA)', status: 'INTEGRATION IN PROGRESS', detail: 'Investment, escrow, release, repayment, distribution, settlement, and recovery are finalized in the application only after a confirmed Soroban Testnet transaction. Runs once contracts are deployed.' },
  { area: 'Embedded Stellar wallets', status: 'INTEGRATION IN PROGRESS', detail: 'Alpha mode creates a Testnet account and VTAED trustline. The secret is encrypted server-side and never returned to the browser. An external wallet can be linked as an option.' },
  { area: 'Event indexing and reconciliation', status: 'IN DEVELOPMENT', detail: 'An indexer reads Soroban contract events into the read model and the operations journal. Full reconciliation follows deployment.' },
  { area: 'KYC / KYB permissioning', status: 'PARTNER DEPENDENCY', detail: 'Sumsub token and signed webhook handling exist. Approval updates a compliance case and, in Alpha mode, a non-sensitive permission flag in the registry. Production screening depends on the provider contract.' },
  { area: 'Private document storage with on-chain fingerprints', status: 'IN DEVELOPMENT', detail: 'Alpha mode can store files in private object storage, compute a SHA-256 fingerprint, and attest it. The public walkthrough stores uploads locally.' },
  { area: 'Multisig treasury, separated pauser, and production key custody', status: 'SECURITY GATE', detail: 'Pause, admin rotation, and role records exist on Testnet. Production custody, multisig, and an independent audit come before Mainnet.' },
  { area: 'Payment rails and custody for real money', status: 'PARTNER DEPENDENCY', detail: 'Production settlement uses an approved payment or digital-money rail and custody partner selected after legal review.' },
  { area: 'Licensed financing, client money, and real investor assets', status: 'REGULATORY GATE', detail: 'Live money, a regulated offer, and the final ownership or security structure wait on legal opinion, the approved structure, authorized partners where required, and final agreements.' },
  { area: 'Mainnet settlement', status: 'MAINNET GATE', detail: MAINNET_STATEMENT },
];

export const ASSET_CLASSES = [
  ['Now', 'Logistics and commercial productive assets: delivery motorcycles, cargo vans, pickups, commercial vehicles, trucks, and cold-chain vehicles.'],
  ['Next', 'Business equipment and machinery used by operating companies.'],
  ['Later', 'Additional productive real-world assets, each after its own legal classification.'],
];

// Pre-Mainnet checklist. Only after the applicable gates pass: a controlled Mainnet pilot.
export const MAINNET_GATES = [
  ['Technical', 'Soroban contracts complete, contract tests, integration tests, load tests, indexer, reconciliation, transaction retry, monitoring, key management, multisig, emergency pause, upgrade governance, disaster recovery, backups, incident management.'],
  ['Security and audit', 'Smart-contract audit, web-app penetration test, API security assessment, key custody review, secrets review, access controls, admin MFA, rate limiting, webhook validation, dependency scanning, incident response.'],
  ['Financial, custody and payment', 'Settlement asset selected, custody architecture, payment rail, client-money architecture, treasury controls, reconciliation, fees, reserves, accounting, distributions.'],
  ['Compliance', 'KYC, KYB, AML, sanctions, PEP, source of funds, investor limits, jurisdiction controls, ongoing monitoring.'],
  ['Legal and regulatory', 'Regulatory perimeter opinion, licensing or partner model, asset ownership, security interest, investor rights, facility, supplier and servicing agreements, default, recovery, insurance, privacy, blockchain disclosures, wind-down.'],
  ['Operational readiness', 'Customer support, complaints, collections, supplier onboarding, asset verification, recovery partners, insurance workflow, successor servicing.'],
] as const;
