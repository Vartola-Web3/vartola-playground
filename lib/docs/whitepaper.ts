import type { DocBlock } from '@/components/docs/article';
import {
  ARCHITECTURE,
  CAN_PROCEED,
  CLOSING_LINE,
  CORE_STATEMENT,
  ENTITY,
  EXTERNAL_DATA_NOTE,
  GATED,
  MAINNET_GATES,
  MAINNET_STATEMENT,
  NETWORK_EFFECT,
  REGULATORY_LINE,
  RISK_LAYERS,
  ROADMAP,
  SOROBAN_ROLE,
  STELLAR_ROLE,
  STRUCTURE_LINE,
  VTAED,
} from '@/lib/docs/product';

const sections: (Omit<DocBlock, 'kicker'> & { label: string })[] = [
  {
    id: 'summary',
    label: 'Executive Summary',
    title: 'Productive-asset finance infrastructure for UAE SMEs.',
    paragraphs: [
      'Vartola is a productive-asset finance infrastructure platform for UAE SMEs. It combines underwriting, asset acquisition, servicing, investor participation, and programmable financial execution using Stellar and Soroban.',
      'The working Alpha already runs the full cycle: an SME applies, an underwriter scores the business, asset, and deal, an approved facility opens for funding, investors participate, release and delivery checks gate activation, and the SME repays while investors receive principal and income. Early settlement, late payment, default, and recovery are implemented.',
      'Stellar is the network and settlement layer. Soroban is the contract layer that executes the financing rules. VTAED, a non-redeemable test asset, is issued on Stellar Testnet. The Soroban registry and facility contracts are written and tested and are being deployed to Testnet. Mainnet and live money follow the regulatory, legal, security, payment and custody, and operational gates.',
      `${ENTITY.name} is a ${ENTITY.form}. ${ENTITY.note}`,
    ],
  },
  {
    id: 'vision',
    label: 'Vartola Vision',
    title: 'Finance the asset that earns the repayment.',
    paragraphs: [
      CORE_STATEMENT,
      'Vartola is not a crypto project, a speculative token platform, or a simple crowdfunding website. The asset has an operating job. The financing follows that job, and every step from application to recovery is recorded once and shared by every party.',
    ],
  },
  {
    id: 'problem',
    label: 'The SME Productive-Asset Problem',
    title: 'The asset is productive. Access to it is not.',
    paragraphs: [
      'SMEs need productive assets to grow. Buying a motorcycle fleet, a van, or a truck upfront consumes the working capital that pays salaries, fuel, and suppliers. Traditional financing can be slow, rigid, or inaccessible for smaller and younger companies.',
      'Capital providers face the opposite problem: they lack efficient access to transparent, asset-linked SME opportunities. The process is fragmented across SMEs, capital, suppliers, underwriting, payments, asset ownership, servicing, and recovery.',
      'This paper does not quote an unsourced market size. The working assumption is that a facility tied to an identifiable productive asset is easier to underwrite, service, and explain than an unsecured cash loan.',
    ],
  },
  {
    id: 'why-assets',
    label: 'Why Productive Asset Finance',
    title: 'Revenue-generating, identifiable, recoverable, observable.',
    bullets: [
      'Productive assets directly support the revenue that repays the facility.',
      'They can be identified and tracked by VIN or serial, registration, and insurance.',
      'They keep resale and recovery value.',
      'Their business utility is observable through delivery, registration, and servicing events.',
      'Starting market: logistics and commercial assets, meaning delivery motorcycles, cargo vans, pickups, commercial vehicles, trucks, and cold-chain vehicles.',
      'Future expansion: business equipment, machinery, and further productive assets, each after its own legal classification.',
    ],
  },
  {
    id: 'ecosystem',
    label: 'Vartola Ecosystem',
    title: 'Seven roles around one facility record.',
    rows: [
      ['SME', 'Applies, completes verification, contributes where required, operates the asset, and repays.'],
      ['Investor / capital provider', 'Completes eligibility checks, takes a participation position, and receives eligible distributions.'],
      ['Supplier', 'Passes KYB, quotes and invoices the asset, receives payment at an approved beneficiary, and supports delivery evidence.'],
      ['Underwriter', 'Scores business, asset, and deal risk and approves or rejects.'],
      ['Servicer', 'Collects installments, manages late, default, and recovery, and allocates distributions.'],
      ['Licensed / regulated partner', 'Where required, conducts regulated activities such as client money, custody, or the regulated offer.'],
      ['Vartola', 'Operates the technology infrastructure: origination workflow, risk engine, servicing record, wallets, and the Stellar and Soroban layer.'],
    ],
  },
  {
    id: 'lifecycle',
    label: 'End-to-End Financing Lifecycle',
    title: 'Funding is not the same event as activation.',
    bullets: [
      'The SME applies for a productive asset.',
      'Company verification and underwriting run against business, asset, and deal risk.',
      'An approved facility is created with its payment schedule and opened for funding.',
      'Eligible investors participate. Capital is held in escrow for that facility.',
      'Release conditions are verified: funding, SME contribution, agreement, supplier invoice, vehicle, insurance, compliance, and final approval.',
      'Capital is released to the approved supplier.',
      'Delivery, inspection, identifier, registration, insurance, and acceptance are confirmed. The facility becomes active.',
      'The SME pays. Each payment is split into principal, investor income, platform or servicing fee, and any reserve.',
      'Investors receive distributions in proportion to their Participation Units. The facility completes. Title follows the approved structure.',
    ],
    paragraphs: [
      'The public walkthrough can activate a fully funded opportunity directly so reviewers can continue into repayment. That shortcut is a demonstration convenience. The release checklist, delivery checks, and the Alpha execution path make activation wait for those conditions and for a confirmed Soroban result.',
    ],
  },
  {
    id: 'sme-journey',
    label: 'SME Journey',
    title: 'Apply, verify, receive the asset, repay.',
    bullets: [
      'Tell Vartola what the business needs: asset, amount, and term.',
      'Complete company verification: trade licence, controlling persons, and documents.',
      'Receive an assessment and, if approved, a financing offer.',
      'The facility opens for funding. The SME pays any agreed contribution.',
      'After release conditions pass, the supplier is paid and the asset is delivered.',
      'Pay scheduled installments, including early, from the SME area. Settle early if desired.',
      'At completion, title follows the applicable financing structure.',
    ],
  },
  {
    id: 'investor-journey',
    label: 'Investor Journey',
    title: 'Verify, review, participate, track.',
    bullets: [
      'Create an account and complete verification.',
      'Receive an embedded Stellar wallet (Alpha mode).',
      'Review opportunities: business risk, asset, facility, term, economics, protection, and status.',
      'Participate. Capital moves into the facility escrow and Participation Units are recorded.',
      'Track release, activation, repayments, distributions, and the facility lifecycle.',
      'Returns are not guaranteed. Investment eligibility and offering structure remain subject to applicable regulation.',
    ],
  },
  {
    id: 'supplier-journey',
    label: 'Supplier Journey',
    title: 'Get paid against a verified invoice and asset.',
    bullets: [
      'Join as an approved payee and pass KYB and beneficiary verification.',
      'Provide the quotation and invoice for the asset.',
      'Receive payment only after the release checklist is complete.',
      'Confirm delivery and support registration and asset data.',
    ],
    paragraphs: ['Supplier records and release payouts are in the product today. A self-service supplier portal is in development.'],
  },
  {
    id: 'underwriting',
    label: 'Underwriting Framework',
    title: 'Five layers of risk.',
    rows: RISK_LAYERS.map((layer) => [`${layer.name} · ${layer.status}`, layer.detail] as [string, string]),
    paragraphs: [
      `${EXTERNAL_DATA_NOTE} Portfolio limits by SME, asset, industry, geography, maturity, and risk grade are an operating control enforced before live volume.`,
    ],
  },
  {
    id: 'facility',
    label: 'Facility Structure',
    title: 'One facility per financed asset or asset group.',
    paragraphs: [
      'A facility has a finance amount, an SME contribution, a term, a payment schedule, an income rate, a platform or servicing fee, and an optional reserve. It moves through approved, funding, funded, release, active, late, default, recovery, repaid, and closed states. On Soroban these states are held by the facility contract.',
    ],
  },
  {
    id: 'funding',
    label: 'Funding Model',
    title: 'Investors fill the facility. Nothing moves to the supplier yet.',
    paragraphs: [
      'Investors subscribe to an amount. In the contract, subscribe records intent and reserve moves the settlement asset from the investor wallet into the contract and issues Participation Units. If the facility does not proceed, refund returns the reserved amount. In the public walkthrough, virtual tAED balances stay reserved in the application ledger until the pool is full.',
    ],
  },
  {
    id: 'escrow',
    label: 'Escrow',
    title: 'Capital is held by the facility contract.',
    paragraphs: [
      'Escrow is the facility contract balance for that facility. It can leave only by supplier release after authorization, by refund, or under recovery rules. The application cannot mark a release complete unless the Soroban transaction confirms.',
    ],
  },
  {
    id: 'units',
    label: 'Participation Units',
    title: 'Economic participation, not legal ownership of the asset.',
    paragraphs: [
      'A facility is divided into Participation Units. In the Alpha design one unit is 100 of the settlement asset. Example only: a facility of 1,000,000 has 10,000 units; a commitment of 25,000 is 250 units.',
      'Units determine an investor’s share of principal, income, and eligible recovery. They are economic participation in the facility. They do not give legal ownership of the physical asset. Initially, units are non-transferable or permissioned and allowlist-restricted. They are not described as sukuk, security tokens, or ownership tokens until legal classification is complete. The interface calls them a Digital Investment Position, recorded as an Economic Participation Record.',
    ],
  },
  {
    id: 'ownership',
    label: 'Asset Ownership & Security',
    title: 'Ownership is a legal document, not a wallet balance.',
    paragraphs: [
      'Final ownership and security structure is subject to UAE legal and regulatory approval. Potential structures include an AssetCo, a portfolio SPV, licensed finance company ownership, lease-to-own, SME ownership with a registered security interest, and a security-agent structure.',
      'None of these is chosen as legally final. Investors do not automatically become registered owners of any vehicle.',
    ],
  },
  {
    id: 'passport',
    label: 'Digital Asset Passport',
    title: 'One lifecycle record for each financed asset.',
    paragraphs: [
      'The passport can hold an asset ID, a VIN or serial hash, type, manufacturer, model, purchase value, supplier, facility, legal ownership structure, SME operator, registration, insurance, delivery confirmation, valuation, maintenance information where integrated, default or recovery status, and disposal status. Sensitive data remains private. Critical evidence is anchored on Stellar. The facility contract stores a hash and status for each passport.',
      'The passport model, admin API, and contract function exist, and a passport hash was anchored on Testnet for Facility #001.',
    ],
  },
  {
    id: 'release',
    label: 'Supplier Release Controls',
    title: 'Eight conditions before funds leave escrow.',
    bullets: [
      'Facility fully funded',
      'SME contribution received',
      'Financing agreement signed',
      'Supplier invoice verified',
      'Vehicle verified',
      'Insurance confirmed',
      'Compliance approved',
      'Final underwriting approval',
    ],
    paragraphs: ['On Soroban, release requires an authorization step and pays only the supplier address registered for that facility.'],
  },
  {
    id: 'activation',
    label: 'Asset Delivery & Activation',
    title: 'The facility starts when the asset is in use.',
    bullets: ['Asset delivered', 'Asset inspected', 'Identifier verified', 'Registration confirmed', 'Insurance active', 'Customer acceptance'],
  },
  {
    id: 'repayment',
    label: 'Repayment',
    title: 'One installment, four uses.',
    paragraphs: [
      'Each payment is applied to principal, investor income, a platform or servicing fee, and a reserve where the facility defines one. Principal for each period is an equal share of the financed amount, with any remainder on the last installment. Income is what remains after fees and principal. The SME can pay the next unpaid installment at any time, including before the due date.',
    ],
  },
  {
    id: 'distribution',
    label: 'Investor Distribution',
    title: 'Pro-rata to Participation Units.',
    paragraphs: [
      'Investors receive principal and income in proportion to their units. The last position can receive a rounding remainder. When principal is fully returned the facility completes; when every facility in a pool completes, the pool completes.',
    ],
  },
  {
    id: 'early',
    label: 'Early Settlement',
    title: 'Close the facility before term.',
    paragraphs: [
      'Early settlement equals outstanding principal plus accrued contractual amount plus permitted fees, minus any applicable rebate. The contract quote and settle functions exist. The Alpha quote treats accrued income and rebate as zero until a product rule sets them. Final economics follow the agreement.',
    ],
  },
  {
    id: 'late',
    label: 'Late Payment',
    title: 'Missed, grace, late, remediation.',
    paragraphs: [
      'Servicing lifecycle: payment due → missed → grace → late → remediation → restructuring review → default notice → default → recovery → asset realization → recovery distribution → closed.',
      'The application and contract can record late, default, recovery, and closed states. The final grace period, default definition, notice, repossession process, and recovery waterfall will be defined in approved financing agreements. ' + STRUCTURE_LINE,
    ],
  },
  {
    id: 'default',
    label: 'Default',
    title: 'A defined legal event, not a button.',
    paragraphs: [
      'Triggers that require legal definition include material non-payment, insolvency, fraud, concealment, loss of required insurance, material covenant breach, unauthorized disposal, and business cessation. Default follows a default notice under the agreement.',
    ],
  },
  {
    id: 'recovery',
    label: 'Recovery',
    title: 'A lawful process under the agreement and UAE law.',
    paragraphs: [
      'Recovery may include asset retrieval, inspection, valuation, and sale or other realization by the party legally entitled to do so. Vartola does not claim a private right to seize an asset. The application and contract record recovery and allocate net proceeds.',
    ],
  },
  {
    id: 'waterfall',
    label: 'Recovery Waterfall',
    title: 'Illustrative order of proceeds.',
    bullets: [
      'Recovered asset → inspection → valuation → sale or realization → gross recovery proceeds',
      'Permitted recovery costs',
      'Secured obligations as the legal structure requires',
      'Eligible investor recovery, pro-rata to Participation Units',
      'Residual handling per the agreement',
    ],
    paragraphs: ['Full recovery is not guaranteed. The final waterfall is subject to final UAE legal and regulatory structuring.'],
  },
  {
    id: 'insurance',
    label: 'Insurance',
    title: 'Mandatory before release and activation.',
    paragraphs: [
      'Insurance for loss, theft, accident, and total loss is a release and activation check. Claims follow the policy terms. After a total loss, insurance proceeds are expected to reduce or close the facility. Who holds the policy, who is loss payee, and whether proceeds repair the asset or repay the facility are legal terms not yet fixed.',
    ],
  },
  {
    id: 'supplier-failure',
    label: 'Supplier Failure',
    title: 'Escrow protects capital until delivery.',
    paragraphs: [
      'Because capital stays in escrow until release conditions pass, a supplier that fails before release does not receive funds, and reserved capital can be refunded or redirected. Failure after release, such as non-delivery, is handled through the supplier agreement and, where applicable, recovery. Supplier KYB and beneficiary verification reduce this risk.',
    ],
  },
  {
    id: 'business-model',
    label: 'Platform Business Model',
    title: 'Revenue follows volume and servicing.',
    paragraphs: [
      'Potential revenue includes origination or arrangement, servicing, administration, platform fees, and supplier or originator partnerships. No fee is a filed tariff. Whether a fee is charged, and by whom, is subject to the final regulatory structure. Vartola does not need to hold every asset on its own balance sheet.',
    ],
  },
  {
    id: 'stellar',
    label: 'Stellar Architecture',
    title: 'The network and the settlement layer.',
    paragraphs: [
      STELLAR_ROLE,
      'Stellar suits installment finance because it issues assets natively, settles in seconds, and keeps fees low. Stellar Asset Contracts let a classic asset be held and moved by Soroban contracts. In demo mode, each confirmed operation also writes a SHA-256 event fingerprint on Testnet with a manage_data operation; that fingerprint is evidence of an event and does not move value.',
    ],
  },
  {
    id: 'soroban',
    label: 'Soroban Architecture',
    title: 'The contract layer that executes the financing rules.',
    paragraphs: [
      SOROBAN_ROLE,
      'The wallet registry stores a user-id hash, address, role, KYC and KYB flags, jurisdiction code, limit, and status, and rejects investors who are missing, suspended, unverified, outside an allowed jurisdiction, or over limit.',
      'The facility contract implements facility creation with versioned economic terms, subscribe and reserve into escrow, refund, cancel-reservation, explicit escrow states (open, partially funded, fully funded, release locked, release authorized, released, refunded, closed), release-condition attestations by role, authorization by the administrator and payment by the treasury role to the approved supplier only, a repayment waterfall, per-holder distribution with cumulative totals, administrator-set settlement quotes, recovery allocation, risk attestations, document attestations, and asset passport events. Privileged actions are split across administrator, pauser, treasury, underwriter, operations and compliance roles, with a daily release limit, a pause switch, two-step administrator rotation, and a timelocked upgrade path.',
      'These contracts are implemented with unit tests and are deployed and initialized on Stellar Testnet; the contract IDs are published on the Technical page. They have not been independently audited and are not on Mainnet.',
    ],
  },
  {
    id: 'wallets',
    label: 'Embedded Wallets',
    title: 'Web3 without crypto UX.',
    paragraphs: [
      'Users sign in normally. In Alpha mode the platform creates an embedded Stellar Testnet account and VTAED trustline. The secret is encrypted server-side and never returned to the browser. Users never handle seed phrases or network fees. An external wallet can be linked optionally.',
    ],
  },
  {
    id: 'permissioning',
    label: 'Compliance Registry / Permissioning',
    title: 'Permission state on-chain. Identity data off-chain.',
    paragraphs: [
      'Verification outcomes from the KYC and KYB provider update a compliance case. In Alpha mode a non-sensitive approval flag, jurisdiction code, and limit are written to the wallet registry. The facility contract checks the registry before accepting participation.',
    ],
  },
  {
    id: 'test-asset',
    label: 'Test Settlement Asset',
    title: `${VTAED.code}: ${VTAED.name}.`,
    rows: [
      ['Network', 'Stellar Testnet only'],
      ['Value', 'No real AED value'],
      ['Redemption', 'No redemption value or right'],
      ['Issuer', VTAED.issuer],
      ['Production', 'An approved payment or digital-money rail selected after legal review. Vartola does not plan to issue its own unregulated AED stablecoin.'],
    ],
  },
  {
    id: 'attestations',
    label: 'Asset & Document Attestations',
    title: 'Private data off-chain + verifiable hash on-chain.',
    paragraphs: [
      'Trade licences, agreements, invoices, insurance, registration, identifier evidence, and delivery confirmations stay in private storage. A SHA-256 fingerprint is attested on Soroban with a document type, entity hash, time, and verification status. File bytes never go on the ledger. Alpha mode supports private object storage; the public walkthrough stores uploads locally.',
    ],
  },
  {
    id: 'prisma',
    label: 'Prisma Role',
    title: 'Application and read layer.',
    paragraphs: [
      `${ARCHITECTURE[1].body} In Alpha, Prisma never overrides a confirmed Soroban financial result, and a failed chain transaction cannot be marked successful by the database alone. Prisma is not being removed.`,
    ],
  },
  {
    id: 'firebase',
    label: 'Firebase Role',
    title: 'Operations journal.',
    paragraphs: [`${ARCHITECTURE[2].body} Firebase is not being removed.`],
  },
  {
    id: 'security',
    label: 'Security Architecture',
    title: 'Controls in place, and controls that are gates.',
    bullets: [
      'Role-based authorization separates SME, investor, underwriter, and admin areas.',
      'Wallet secrets are encrypted and kept off the client.',
      'Alpha financial calls use idempotency keys and wait for chain confirmation.',
      'Rate limits on sensitive routes and signed webhook validation.',
      'Contract pause and admin rotation exist on Testnet; multisig and a separated pauser are prepared.',
      'Independent smart-contract audit, penetration test, production key custody, and admin MFA are security gates before Mainnet.',
    ],
  },
  {
    id: 'kyc',
    label: 'KYC / KYB / AML',
    title: 'Who is checked before live money.',
    rows: [
      ['Investors', 'Identity, sanctions, PEP, source of funds where required, eligibility, limits, jurisdiction.'],
      ['SMEs', 'Trade licence, UBO, authorized representative, directors, sanctions, business verification, credit assessment.'],
      ['Suppliers', 'KYB and beneficiary verification.'],
    ],
    paragraphs: ['Sumsub integration (token and signed webhook) exists. Production screening and ongoing AML monitoring depend on the provider contract and are not claimed as live.'],
  },
  {
    id: 'privacy',
    label: 'Privacy & Sensitive Information',
    title: 'Nothing personal on the ledger.',
    paragraphs: [
      'Names, phone numbers, email addresses, Emirates ID, passports, licence PDFs, bank statements, and private financials are never contract fields. On-chain records use hashes and flags. Access to private files uses signed, time-limited URLs.',
    ],
  },
  {
    id: 'regulation',
    label: 'Regulatory Strategy',
    title: 'Regulation is a launch gate, planned from the start.',
    paragraphs: [
      'Vartola currently operates as a technology platform. Live regulated financial activity will require the appropriate approved structure.',
      `The intended approach is Vartola technology infrastructure plus appropriately licensed or regulated partners where required. ${REGULATORY_LINE} Using a partner allocates the regulated function; it does not avoid regulation.`,
      'Before live regulated deployment: obtain a regulatory legal opinion, select the operating structure, determine licence requirements, evaluate the licensed-partner model, finalize asset ownership, the client-money structure, and investor classification, complete the KYC, KYB, and AML framework, finalize custody and payment rails, approve agreements, audit the smart contracts, and complete a security review.',
    ],
    rows: [
      ['Can proceed now', CAN_PROCEED.join(', ') + '.'],
      ['Gated by approval', GATED.join(', ') + '.'],
    ],
  },
  {
    id: 'partner-strategy',
    label: 'Licensed Partner Strategy',
    title: 'Allocate each regulated function to an authorized party.',
    paragraphs: [
      'Where commercially preferable, Vartola may initially operate its infrastructure alongside appropriately licensed partners rather than independently performing every regulated function. Candidate functions include client money and custody, the regulated investment offer, finance-company ownership of assets, and payment services.',
      'This does not avoid regulation. It allocates regulated functions to appropriately authorized parties, with Vartola providing origination, underwriting technology, servicing infrastructure, and the Stellar and Soroban layer. No partner agreement is claimed as signed.',
    ],
  },
  {
    id: 'mainnet',
    label: 'Mainnet Gate',
    title: 'A pre-Mainnet checklist, not a date.',
    rows: MAINNET_GATES.map(([gate, body]) => [gate, body] as [string, string]),
    paragraphs: ['Only after the applicable gates pass does a controlled Mainnet pilot start.', MAINNET_STATEMENT],
  },
  {
    id: 'continuity',
    label: 'Business Continuity',
    title: 'The financial record survives the application.',
    paragraphs: [
      'If the operations journal fails, a confirmed Soroban result still stands and can be re-indexed. If the read model lags, it is rebuilt from chain events. Production drills are part of the February 2027 security and resilience work.',
    ],
  },
  {
    id: 'wind-down',
    label: 'Wind-Down',
    title: 'What happens if Vartola stops operating.',
    paragraphs: [
      'New facilities stop. Existing facilities continue to be serviced or are transferred to a successor servicer under the agreements. Facility state remains readable on the public chain record, and read-model data is exported. No live client money is held today. A full wind-down plan is part of the regulatory and partner structure.',
    ],
  },
  {
    id: 'expansion',
    label: 'Market Expansion',
    title: 'Logistics, then equipment, then broader productive assets.',
    paragraphs: [
      'Expansion stays in logistics and commercial fleets until facility, servicing, and controls operate under an approved structure. Business equipment follows. Broader productive assets and regulated real-world-asset financing structures come later, each with its own legal classification.',
      'The network effect is the strategy, not a claim of current scale:',
    ],
    rows: NETWORK_EFFECT.map(([from, to]) => [from, `→ ${to}`] as [string, string]),
  },
  {
    id: 'roadmap',
    label: 'Roadmap',
    title: 'From the October 2026 working platform to a gated Mainnet.',
    rows: ROADMAP.map((item) => [`${item.when} · ${item.title}`, item.points.length ? item.points.join(', ') + '.' : item.body] as [string, string]),
  },
  {
    id: 'legal-qa',
    label: 'Key Legal Questions',
    title: 'Direct answers, and where they are still open.',
    rows: [
      ['Who applies?', 'A verified UAE SME that needs a productive asset.'],
      ['Who funds?', 'Eligible investors or capital providers, under the approved offering structure.'],
      ['Who supplies the asset?', 'An approved supplier that has passed KYB.'],
      ['Who uses the asset?', 'The SME operates it during the term.'],
      ['Who may legally own it?', 'Open. One of the structures in the Asset Ownership section. Subject to final UAE legal and regulatory structuring.'],
      ['How are payments serviced?', 'The SME pays installments; the servicer splits them and distributes to unit holders.'],
      ['What is late payment?', 'A missed installment after grace. Exact terms set by the agreement.'],
      ['What is default?', 'A defined legal event after notice. Triggers set by the agreement.'],
      ['What happens during recovery?', 'Lawful retrieval and realization by the entitled party, then the waterfall.'],
      ['How are sale proceeds handled?', 'Costs, secured obligations, then pro-rata investor recovery, then residual.'],
      ['What after total loss?', 'Insurance proceeds are expected to reduce or close the facility. Loss-payee terms are open.'],
      ['What if Vartola stops operating?', 'Servicing continues or transfers to a successor; chain state remains readable.'],
    ],
  },
  {
    id: 'risks',
    label: 'Key Risks',
    title: 'What can go wrong, stated directly.',
    rows: [
      ['Credit', 'An SME may pay late or not at all.'],
      ['Asset', 'Assets can be damaged, stolen, or worth less than assumed.'],
      ['Liquidity', 'Positions have no promised secondary market.'],
      ['Operational', 'Servicing, reconciliation, or partner processes can fail.'],
      ['Cyber', 'Systems and accounts can be attacked.'],
      ['Smart contract', 'Contracts can contain defects until independently audited.'],
      ['Custody', 'Keys and client assets need approved custody.'],
      ['Regulatory', 'The permitted structure may be narrower or slower than described.'],
      ['Insurance', 'Cover may be refused, insufficient, or delayed.'],
      ['Recovery', 'Realization may be slow and may not cover the balance.'],
      ['Supplier', 'A supplier may fail to deliver or misrepresent an asset.'],
    ],
  },
  {
    id: 'disclaimer',
    label: 'Disclaimer',
    title: CLOSING_LINE,
    paragraphs: [
      'This document describes a working Alpha and a Testnet financial layer. It is not an offer, prospectus, or solicitation, and nothing here is a forecast of profit. Returns are not guaranteed. Investment eligibility and offering structure remain subject to applicable regulation.',
    ],
  },
];

export const WHITEPAPER_SECTIONS: DocBlock[] = sections.map((section, index) => {
  const { label, ...rest } = section;
  return { ...rest, kicker: `${String(index + 1).padStart(2, '0')} · ${label}` };
});

export const WHITEPAPER_NAV = sections.map((section) => ({ id: section.id, label: section.label }));
