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
  statement: 'Vartola is developed by RIMAL TECH - FZCO. Regulated financial activities, where applicable, are intended to operate through appropriate legal structures and/or licensed partners subject to legal and regulatory approval.',
};

export const POSITIONING =
  'Vartola is building programmable financial infrastructure for productive real-world assets.';

export const POSITIONING_DETAIL =
  'It connects SME asset demand, capital, underwriting, suppliers, asset lifecycle management, servicing, collections, recovery, treasury and financial settlement through programmable finance on Stellar and Soroban.';

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
  'This material describes working Financial Web3 infrastructure on Stellar Testnet. It is not an offer, prospectus, or solicitation. It does not promise returns, repayment, or recovery. Vartola does not currently take real client money, issue a redeemable currency, or conduct a licensed financing business. Mainnet and live-money deployment follow regulatory, legal, security, payment/custody, and operational readiness gates.';

export const PUBLIC_NAV = [
  ['How It Works', '/how-it-works'],
  ['Marketplace', '/marketplace'],
  ['Pitch', '/pitch'],
  ['White Paper', '/whitepaper'],
  ['Technical', '/technical'],
  ['Proof', '/proof'],
  ['About', '/about'],
  ['Contact', '/contact'],
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
  { name: 'Facility risk', status: 'LIVE IN ALPHA', detail: 'A deterministic, versioned facility score (nine components, hashed inputs) with an underwriter explanation of positives, negatives, key risks and mitigants. An internal expected-loss estimate (PD × LGD × EAD) uses configurable assumptions. Rule-based, not machine learning, not a regulated rating. The score hash can be attested on-chain.' },
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

// The one master timeline. It begins with the current Testnet architecture and promises no Mainnet date.
export const ROADMAP = [
  {
    when: 'CURRENT — STELLAR TESTNET',
    title: 'Working Financial Web3 infrastructure',
    body: 'Embedded wallets and permissioning, Soroban facility contracts, Participation Units, programmable escrow, controlled supplier release, waterfalls, repayment, distribution, early settlement, default and recovery, asset servicing, risk and expected loss, treasury, reconciliation, proof and governance. Three reference facilities executed on Testnet.',
    points: ['Facility contracts v3', 'Escrow and controlled release', 'Positions and distributions', 'Asset Passport and servicing', 'Risk and Expected Loss', 'Treasury and reconciliation', 'Proof Center', 'Audit-readiness package'],
  },
  {
    when: 'NEXT — INDEPENDENT SECURITY',
    title: 'Independent security validation',
    body: 'External review of the contracts and the platform before any production use.',
    points: ['External Soroban contract audit', 'Platform penetration test', 'Production key and custody review', 'Production multisig configuration', 'Security monitoring'],
  },
  {
    when: 'REGULATORY GATE',
    title: 'Regulated operating structure',
    body: 'Approval is not a date Vartola controls. The structure is defined with counsel and, where required, licensed partners.',
    points: ['UAE legal classification', 'Final facility structure', 'Asset ownership and security model', 'Licensed financing or regulated partner model where required', 'Client-money responsibilities', 'Approved agreements'],
  },
  {
    when: 'PRODUCTION FINANCIAL RAILS',
    title: 'Settlement, custody and treasury',
    body: 'An approved settlement asset and regulated rails replace the Testnet asset.',
    points: ['Approved settlement asset', 'Regulated payment rails', 'Custody', 'Treasury operations', 'Fiat and Stellar connectivity', 'Settlement reconciliation'],
  },
  {
    when: 'CONTROLLED PILOT',
    title: 'Real-world pilot, no fake traction',
    body: 'A controlled facility with real counterparties once the gates above allow it.',
    points: ['Real SMEs', 'Real suppliers', 'Qualified partners', 'One controlled facility'],
  },
  {
    when: 'CONTROLLED MAINNET',
    title: 'Gated, not dated',
    body: MAINNET_STATEMENT,
    points: [],
  },
  {
    when: 'SCALE',
    title: 'More productive assets',
    body: 'Logistics fleets first, then broader productive assets, each after its own legal classification.',
    points: ['Logistics fleets', 'Delivery motorcycles', 'Vans', 'Trucks', 'Cold-chain vehicles', 'Later business equipment and other productive asset classes'],
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
  { area: 'Soroban wallet registry and facility contract (v3)', status: 'TESTNET', detail: 'Deployed and initialized on Stellar Testnet. The facility contract holds explicit escrow states, release-condition attestations, the repayment waterfall, per-holder distributions and cumulative totals, settlement, recovery, risk and document attestations, and passport events. Covered by unit tests and exercised on Testnet by Facility #001, #002 and #003. Not audited.' },
  { area: 'Alpha execution path (APP_MODE=ALPHA)', status: 'TESTNET', detail: 'Investment, escrow, release, repayment, distribution, settlement and recovery are finalized in the application only after a confirmed Soroban Testnet transaction. Run end to end for Facility #001 in an isolated Alpha test environment; the public walkthrough remains Demo mode.' },
  { area: 'Embedded Stellar wallets', status: 'TESTNET', detail: 'Alpha mode creates a Testnet account and VTAED trustline. The secret is encrypted server-side and never returned to the browser. An external wallet can be linked as an option.' },
  { area: 'Event indexing and reconciliation', status: 'TESTNET', detail: 'An idempotent, cursor-based indexer reads contract events into the read model with retry and a dead-letter list. Reconciliation compares chain state with the database for every confirmed facility. A scheduled worker runs both daily on the Vercel Hobby plan (every 15 minutes on Pro, by changing the schedule in vercel.json) in Alpha mode when CRON_SECRET is set; an operator can also run them from the admin page.' },
  { area: 'KYC / KYB permissioning', status: 'PARTNER DEPENDENCY', detail: 'Sumsub token and signed webhook handling exist. Approval updates a compliance case and, in Alpha mode, a non-sensitive permission flag in the registry. Production screening depends on the provider contract.' },
  { area: 'Private document storage with on-chain fingerprints', status: 'IN DEVELOPMENT', detail: 'Alpha mode requires private object storage (no silent local fallback), with SHA-256 fingerprints, signed upload and download URLs, content-type checks, server-side encryption, and real deletion. The signed-upload path has unit tests but has not been exercised against a real bucket.' },
  { area: 'Role separation, release limits, pause, upgrade timelock, and admin rotation', status: 'TESTNET', detail: 'Administrator, pauser, treasury, underwriter, operations and compliance roles have separate wallets on Testnet; release is authorized by one role and executed by another, with a daily release limit, a pause switch, two-step admin rotation, and a scheduled-upgrade timelock.' },
  { area: 'Proof Center', status: 'LIVE IN ALPHA', detail: 'Public /proof shows the real Testnet contracts, asset, reference facilities, live ledger and recorded engineering evidence; /proof/facility/<id> walks a facility lifecycle with explorer links.' },
  { area: 'Portfolio risk, expected loss, treasury, and stress scenarios', status: 'LIVE IN ALPHA', detail: 'Admin pages for portfolio concentration by SME, supplier, asset, sector, geography and grade, expected loss, treasury control with chain-versus-application state, and scenario analysis that is not a forecast.' },
  { area: 'Asset servicing, collections, recovery, insurance and supplier failure workflows', status: 'LIVE IN ALPHA', detail: 'Asset health indicator, verification panel with sources, collections cases with allowed stage paths and an audit trail, recovery workspace, insurance claims and supplier failure cases. Time periods are facility parameters, not legal periods.' },
  { area: 'Operations health, contract governance, compliance cases and role matrix', status: 'LIVE IN ALPHA', detail: 'Operations health, contract version history, compliance case view without personal data, a privileged role matrix with separated duties, and institutional reports (printable or JSON).' },
  { area: 'Pilot pipeline and partner sandbox', status: 'LIVE IN ALPHA', detail: 'A pilot pipeline that shows only what an administrator enters (zero today), partner templates, and a sandbox of six scenarios on illustrative numbers. No partner, LOI or traction is claimed.' },
  { area: 'Audit readiness package, security documents and Mainnet scorecard', status: 'IN DEVELOPMENT', detail: 'Internal, pre-audit documents (threat model, key management, incident response, disaster recovery, upgrade and disclosure policies, audit package) and a readiness scorecard that keeps Mainnet locked until every gate is complete. Not an independent audit.' },
  { area: 'Multisig, production key custody, and independent audit', status: 'SECURITY GATE', detail: 'The administrator is a single Testnet key. Multisig, hardware or MPC custody, and an independent contract and application audit come before Mainnet.' },
  { area: 'Admin multi-factor authentication', status: 'LIVE IN ALPHA', detail: 'Time-based one-time passwords (RFC 6238) are required for administrative roles in Alpha mode; demo quick-login accounts are unchanged outside Alpha mode.' },
  { area: 'Supplier self-service portal', status: 'LIVE IN ALPHA', detail: 'Suppliers sign in, see assigned facilities, submit invoices, VIN or serial hashes, and delivery evidence, and see release status. They cannot approve a release. Needs the supplier-user database migration applied.' },
  { area: 'Provider secrets at rest', status: 'LIVE IN ALPHA', detail: 'Provider API keys in platform settings are encrypted (AES-256-GCM, key from SERVER_MASTER_KEY) and are never returned to the browser.' },
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

export const CURRENT_POSITION =
  'Vartola is working Financial Web3 infrastructure for productive real-world asset finance on Stellar Testnet: VTAED, deployed Soroban contracts, escrow, programmable release, repayment, distribution, early settlement, default and recovery, risk, treasury and reconciliation. It uses no real money and no real AED, is not licensed financing, has no independent audit, and is not on Mainnet.';

export const NEXT_MILESTONE =
  'Independent security validation, a regulated operating structure, production financial rails and a controlled real-world pilot, in that order of dependency, before any controlled Mainnet step.';

export const ENGINEERING_PRIORITIES: { title: string; items: string[] }[] = [
  {
    title: 'Completed on Testnet',
    items: ['VTAED wrapped as a Stellar Asset Contract', 'Registry and facility contract v3 deployed, initialized and linked, with separate role wallets', 'Explicit escrow states and release-condition attestations', 'Facility #001 (150,000 VTAED, 1,500 Participation Units) executed through repayment', 'Early settlement and default-recovery paths executed on separate test facilities', 'Reconciliation, indexer health, receipts, participation certificate, and public facility verification', 'Proof Center, expected-loss and portfolio risk, treasury control, asset servicing, collections and recovery workspaces, operations health, contract governance, pilot pipeline and partner sandbox'],
  },
  {
    title: 'Next engineering',
    items: ['Commission the independent audit using the audit readiness package', 'Test signed uploads against a real non-production bucket', 'Run the scheduled worker in the hosted environment and watch its alerts', 'Apply the supplier and MFA database migration to the hosted database', 'Move the administrator to a multisig account and rehearse an upgrade', 'Wire production Sumsub and email or SMS providers after provider agreements'],
  },
  {
    title: 'Before Mainnet',
    items: ['Independent smart-contract audit and penetration test', 'Production key custody, multisig, and a monitored on-call process', 'Regulatory, legal, custody and payment gates', 'No Mainnet date is promised'],
  },
];

// ---------------------------------------------------------------------------------------------------------------
// Shared public facts. Public pages read from here so the story stays the same everywhere.
// ---------------------------------------------------------------------------------------------------------------

export const HEADLINE = 'Working Financial Web3 infrastructure for productive real-world asset finance on Stellar Testnet.';

export const SEO = {
  home: { title: 'Vartola | Programmable Asset Finance on Stellar', description: 'Programmable financial infrastructure for productive real-world assets, working on Stellar Testnet with Soroban facility contracts.' },
  pitch: { title: 'Vartola Pitch | Financial Web3 Infrastructure', description: 'The productive-asset finance gap, the working Stellar and Soroban architecture, and the road to controlled Mainnet.' },
  whitepaper: { title: 'Vartola Whitepaper | Productive Asset Finance Infrastructure', description: 'The authoritative product document: facilities, escrow, risk, servicing, recovery, governance and regulatory path.' },
  technical: { title: 'Vartola Technical Architecture | Stellar & Soroban', description: 'Contracts, financial state model, finality, indexing, reconciliation, security and real Testnet references.' },
  proof: { title: 'Vartola Proof Center | Stellar Testnet Execution', description: 'Verify the contracts, asset and reference facilities on Stellar Testnet.' },
  howItWorks: { title: 'How Vartola Works | Productive Asset Finance', description: 'The path for SMEs, investors, suppliers and operations, and what happens on-chain and what stays private.' },
  contact: { title: 'Contact Vartola | Partnerships & SME Pilots', description: 'Talk to Vartola about SME pilots, suppliers, capital partners, institutions and technical collaboration.' },
  about: { title: 'About Vartola | RIMAL TECH - FZCO', description: 'A technology company building programmable financial infrastructure for productive real-world assets.' },
} as const;

export const CONNECTS = ['SME asset demand', 'Capital', 'Underwriting', 'Suppliers', 'Asset lifecycle management', 'Servicing', 'Collections', 'Recovery', 'Treasury', 'Financial settlement'] as const;

export const STATUS_LABELS = {
  current: 'CURRENT — STELLAR TESTNET',
  working: 'WORKING FINANCIAL WEB3 INFRASTRUCTURE',
  security: 'NEXT — INDEPENDENT SECURITY',
  regulatory: 'REGULATORY GATE',
  rails: 'PRODUCTION FINANCIAL RAILS',
  pilot: 'CONTROLLED PILOT',
  mainnet: 'CONTROLLED MAINNET',
} as const;

export const CURRENT_CAPABILITIES = [
  ['Wallets and access', ['Embedded Stellar wallets', 'Wallet permissioning', 'KYC and KYB aware access']],
  ['Financial execution', ['Soroban facility contracts', 'Facility-level financial positions and Participation Units', 'Programmable escrow', 'Controlled supplier release', 'Financial waterfalls', 'Repayments and distributions', 'Early settlement', 'Default and recovery']],
  ['Records and proof', ['Financial receipts', 'Digital Participation Records', 'Digital Asset Passport and asset verification', 'Risk snapshot attestations', 'Public Proof Center']],
  ['Risk and treasury', ['Facility risk score', 'Expected Loss framework', 'Portfolio risk', 'Treasury control center', 'Facility reserves']],
  ['Servicing and operations', ['Asset servicing', 'Supplier network and performance scoring', 'Servicing and collections', 'Recovery workspace', 'Insurance-event and supplier-failure workflows', 'Continuous event indexing', 'Automated reconciliation', 'Operations health monitoring']],
  ['Security and governance', ['Role separation', 'Admin MFA', 'Encrypted platform secrets', 'Private signed document storage', 'Contract governance', 'Multisig-ready architecture', 'Business continuity and wind-down architecture', 'Audit-readiness package']],
  ['Pilot readiness', ['Institutional sandbox', 'Pilot-management infrastructure']],
] as const;

export const NOT_CURRENT = ['Mainnet', 'Real-money investor activity', 'A regulated public offering', 'Licensed lending', 'Production custody', 'An independent security audit', 'Production settlement rails'] as const;

export const ROLE_FLOWS = {
  sme: ['Apply', 'Verify', 'Underwrite', 'Facility created', 'Capital committed', 'Release conditions verified', 'Supplier paid', 'Asset delivered', 'Facility active', 'Repay', 'Complete or settle'],
  investor: ['Verify', 'Embedded Stellar wallet', 'Browse facilities', 'Review risk', 'Participate', 'Capital enters programmable escrow', 'Release conditions verified', 'Supplier paid', 'Track position', 'Receive distributions', 'Settlement or recovery'],
  supplier: ['KYB', 'Quote', 'Invoice', 'Asset allocation', 'Delivery evidence', 'Payment status', 'Service and warranty records'],
  operations: ['Underwriting', 'Release control', 'Asset verification', 'Servicing', 'Collections', 'Recovery', 'Reconciliation'],
} as const;

export const ON_CHAIN_ITEMS = ['Wallet address and permission flags', 'Facility financial state', 'Escrow state and balances', 'Participation Units and positions', 'Release-condition attestations (evidence hash only)', 'Repayment, distribution, settlement and recovery events', 'Risk snapshot and document hashes', 'Asset passport events'] as const;
export const PRIVATE_ITEMS = ['Identity and KYC data', 'Company and commercial documents', 'Bank and credit information', 'Supplier contracts and invoices', 'The risk model inputs themselves', 'Internal notes and collections cases'] as const;
