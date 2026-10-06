export type LegalDoc = {
  slug: string;
  title: string;
  audience: string;
  points: string[];
};

const banner = 'DRAFT — SUBJECT TO UAE LEGAL AND REGULATORY REVIEW';

export const LEGAL_BANNER = banner;

export const LEGAL_DOCS: LegalDoc[] = [
  {
    slug: 'platform-terms',
    title: 'Platform Terms of Use',
    audience: 'Every visitor and registered user',
    points: [
      'Describe the Alpha environment as technology access, not a financing offer.',
      'State that Testnet balances and virtual walkthrough balances have no cash value.',
      'Limit liability for Testnet experiments, and prohibit unlawful use.',
      'Explain account roles, acceptable use, and suspension.',
    ],
  },
  {
    slug: 'investor-terms',
    title: 'Investor Terms',
    audience: 'Eligible capital providers',
    points: [
      'Participation is an economic record in a facility, not automatic ownership of a vehicle.',
      'No return, liquidity, or recovery is guaranteed.',
      'Eligibility, limits, and jurisdiction checks apply before any live subscription.',
      'Live participation waits on the regulatory gate and an approved agreement.',
    ],
  },
  {
    slug: 'sme-terms',
    title: 'SME Terms',
    audience: 'Applicant businesses',
    points: [
      'An application is a request for review, not an approval or a commitment to finance.',
      'The business supplies accurate company, asset, and financial information.',
      'Use of a financed asset follows the facility documents once those documents exist.',
      'The current company is a technology company, not a licensed lender.',
    ],
  },
  {
    slug: 'facility-agreement',
    title: 'Facility Agreement',
    audience: 'SME, financing party, and servicing party',
    points: [
      'Define amount, term, payment, fees, SME contribution, and conditions precedent.',
      'Define grace, late payment, default, and the lawful recovery process.',
      'Define insurance, permitted use, and restrictions on disposal.',
      'Final economics and security remain subject to counsel.',
    ],
  },
  {
    slug: 'participation-agreement',
    title: 'Participation Agreement',
    audience: 'Capital providers in a facility',
    points: [
      'Define a Participation Unit as an economic participation record.',
      'Do not describe units as sukuk, security tokens, or vehicle title.',
      'Set transfer limits: non-transferable or allowlist-restricted until classified.',
      'Set the information an investor receives and the risks they acknowledge.',
    ],
  },
  {
    slug: 'supplier-agreement',
    title: 'Supplier Agreement',
    audience: 'Approved dealers and suppliers',
    points: [
      'Require KYB and beneficiary verification before a payout address is used.',
      'Tie release to an invoice, asset identification, and the release checklist.',
      'State that Testnet addresses are not production payment instructions.',
    ],
  },
  {
    slug: 'asset-security',
    title: 'Asset Ownership and Security Terms',
    audience: 'Counsel, partners, and facility parties',
    points: [
      'List structures under evaluation: AssetCo, portfolio SPV, licensed partner, lease-to-own, SME ownership with a registered security interest, or a security agent.',
      'State that no structure is adopted until counsel and any required approval are complete.',
      'State that investors are not individual registered owners of each vehicle by default.',
    ],
  },
  {
    slug: 'servicing-policy',
    title: 'Servicing Policy',
    audience: 'Operations and facility parties',
    points: [
      'Describe payment application: principal, income, platform or servicing fee, and reserve where the facility allows it.',
      'Describe statements, reconciliation, and the difference between the application read model and Soroban execution.',
      'Name the servicing party only after the operating structure is chosen.',
    ],
  },
  {
    slug: 'collections-recovery',
    title: 'Collections and Recovery Policy',
    audience: 'Servicing and recovery partners',
    points: [
      'Follow due, missed, grace, late, remediation, restructuring review, default notice, default, recovery, realization, distribution, and close.',
      'Recovery is a lawful process under the agreement and UAE law. It is not a private seizure right.',
      'The waterfall is costs, then secured obligations, then eligible investor recovery, then residual handling. Full recovery is not promised.',
    ],
  },
  {
    slug: 'risk-disclosure',
    title: 'Risk Disclosure',
    audience: 'Investors and partners',
    points: [
      'Credit, asset, liquidity, insurance, operational, technology, and regulatory risks.',
      'Testnet assets can be reset by the network and have no cash value.',
      'Smart-contract and key-management failure can delay or impair a record.',
      'Past demonstration activity is not a forecast.',
    ],
  },
  {
    slug: 'privacy',
    title: 'Privacy Policy',
    audience: 'Users and site visitors',
    points: [
      'Identity documents, licences, and financial files stay off the ledger.',
      'On-chain data is limited to permission flags, addresses, and cryptographic fingerprints.',
      'Retention, access, and cross-border processing will follow the counsel-approved policy.',
    ],
  },
  {
    slug: 'kyc-notice',
    title: 'KYC, KYB, and AML Notice',
    audience: 'Investors, SMEs, and suppliers',
    points: [
      'Investor checks may include identity, sanctions, PEP, source of funds where required, eligibility, limits, and jurisdiction.',
      'SME checks may include trade licence, UBO, directors, authorized representative, sanctions, and credit assessment.',
      'Supplier checks cover KYB and payment-beneficiary verification.',
      'The Sumsub integration is technical preparation, not a claim that production screening is live.',
    ],
  },
  {
    slug: 'blockchain-disclosure',
    title: 'Blockchain and Wallet Disclosure',
    audience: 'Every user of a wallet or on-chain record',
    points: [
      'Stellar records are public. Personal data must not be placed in them.',
      'Embedded wallets are meant to hide seed phrases and network fees from ordinary users.',
      'Users should see cash, investments, payments, and distributions, not protocol controls.',
      'A lost production key-management design is a Mainnet gate, not a solved production control.',
    ],
  },
  {
    slug: 'testnet-disclaimer',
    title: 'Testnet Disclaimer',
    audience: 'Anyone using VTAED or a Testnet transaction',
    points: [
      'VTAED is a non-redeemable Stellar Testnet asset.',
      'It has no AED value, no redemption right, and no production monetary value.',
      'A Testnet transaction is not a regulated payment or an investment contract.',
    ],
  },
  {
    slug: 'complaints',
    title: 'Complaints Policy',
    audience: 'Future customers',
    points: [
      'A complaints path, timing, and escalation owner will be named before a live pilot.',
      'The Alpha environment should still give users a support contact once one is designated.',
      'This draft does not create a regulated complaints scheme.',
    ],
  },
  {
    slug: 'conflicts',
    title: 'Conflicts Policy',
    audience: 'The company, partners, and capital providers',
    points: [
      'Identify conflicts among origination, servicing, supplier relationships, and platform fees.',
      'Require disclosure where a party acts in more than one role.',
      'Final rules follow the licensed operating structure.',
    ],
  },
  {
    slug: 'continuity',
    title: 'Business Continuity Policy',
    audience: 'Operations and technical partners',
    points: [
      'Cover application data, key custody, indexer recovery, and a pause of new activity.',
      'A confirmed Soroban result remains the financial record if the journal or read model fails.',
      'Production continuity testing is a pre-Mainnet item, not a completed certification.',
    ],
  },
  {
    slug: 'wind-down',
    title: 'Wind-Down Policy',
    audience: 'Facility parties and future clients',
    points: [
      'Describe how open facilities would be serviced, transferred, or closed.',
      'Describe export of the application read model and references to on-chain records.',
      'No live client-money return process exists because no live client money is held.',
    ],
  },
];

export function legalDoc(slug: string) {
  return LEGAL_DOCS.find((doc) => doc.slug === slug);
}
