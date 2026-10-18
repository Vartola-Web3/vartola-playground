import { auth } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';
import DashboardLayout from '@/components/layout/dashboard-layout';

export const dynamic = 'force-dynamic';

type Group = { title: string; items: [string, string][] };

const SME_GROUPS: Group[] = [
  {
    title: 'Company documents',
    items: [
      ['Trade license', 'Valid UAE trade license (DED, ADGM, DIFC or free zone), showing the company name, license number, activities and expiry.'],
      ['Memorandum of association', 'Formation documents showing ownership, authorised signatories and share capital.'],
      ['Certificate of incorporation', 'Official registration certificate from the relevant authority.'],
    ],
  },
  {
    title: 'Financial documents',
    items: [
      ['Bank statements', 'Last six months of business account statements; all pages.'],
      ['Financial statements', 'Latest audited or management accounts: balance sheet, income statement and cash flow.'],
      ['Tax returns', 'VAT or corporate tax filings where the business is registered. Optional but strengthens the application.'],
    ],
  },
  {
    title: 'Owner and signatory documents',
    items: [
      ['Emirates ID', 'Both sides, clear and readable, for every owner and authorised signatory.'],
      ['Passport', 'Information page for every owner and signatory.'],
      ['Visa page', 'UAE residence visa for expatriate owners and signatories.'],
    ],
  },
  {
    title: 'Asset documents',
    items: [
      ['Supplier invoice or proforma', 'Asset details, price and specifications.'],
      ['Asset specifications', 'Brochure or photos; for vehicles, make, model, year and VIN if known.'],
      ['Usage justification', 'A short explanation of how the asset supports the business.'],
    ],
  },
];

const INVESTOR_GROUPS: Group[] = [
  {
    title: 'Individual investors',
    items: [
      ['Emirates ID', 'Both sides, for UAE nationals and residents.'],
      ['Passport and visa', 'Information page and UAE residence visa for expatriates.'],
      ['Proof of address', 'Utility bill, rental contract or bank statement from the last three months.'],
      ['Bank account details', 'UAE account in the investor’s name, with a bank letter or cancelled cheque.'],
      ['Accredited investor evidence', 'Net worth or income evidence, or a professional certification, where required.'],
    ],
  },
  {
    title: 'Institutional investors',
    items: [
      ['Company registration', 'Trade license, certificate of incorporation and memorandum of association.'],
      ['Board resolution', 'Authorises the investment and names the signatories.'],
      ['Signatory documents', 'Emirates ID, passport and authorisation letter for each signatory.'],
      ['Financial statements', 'Latest audited financials of the investing entity.'],
    ],
  },
  {
    title: 'Additional KYC and AML',
    items: [
      ['Source of funds', 'A declaration of where the invested funds come from.'],
      ['Beneficial ownership', 'Disclosure of ultimate beneficial owners for entities.'],
      ['Sanctions and PEP', 'Automatic sanctions screening and a politically exposed person declaration.'],
      ['Suitability', 'An investment suitability questionnaire and a risk disclosure acknowledgement.'],
    ],
  },
];

const UNDERWRITER_ITEMS: [string, string][] = [
  ['Professional qualifications', 'Background in banking, credit analysis or risk management; CFA, FRM or CPA preferred.'],
  ['UAE work authorisation', 'A valid work permit or visa allowing financial-services employment.'],
  ['Background verification', 'Criminal background and employment reference checks.'],
  ['Conflict of interest', 'Disclosure of financial interests or relationships that could create a conflict.'],
];

function DocumentGroup({ group }: { group: Group }) {
  return (
    <section className="rounded-3xl border border-[#E5ECE8] bg-white p-6 shadow-sm">
      <h2 className="text-xl font-semibold text-[#102019]">{group.title}</h2>
      <ul className="mt-4 space-y-3">
        {group.items.map(([title, body]) => (
          <li key={title} className="flex gap-3">
            <span className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-[#EAF9F1] text-xs text-[#0A4934]">✓</span>
            <div>
              <p className="font-medium text-[#102019]">{title}</p>
              <p className="text-sm leading-6 text-[#52635C]">{body}</p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default async function DocumentsPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');

  return (
    <DashboardLayout role={session.user.role}>
      <div className="w-full space-y-6">
        <div>
          <h1 className="text-3xl font-semibold">Required documents and KYC checklist</h1>
          <p className="mt-1 text-[#708078]">Documentation for SMEs, investors and underwriters. This is a working Alpha and does not accept real documents yet.</p>
        </div>

        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          <strong>Important:</strong> Vartola is a working Alpha from RIMAL TECH - FZCO. It is not licensed to take real applications, documents or investments. Do not upload real personal or business documents here.
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {SME_GROUPS.map((group) => <DocumentGroup key={group.title} group={group} />)}
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {INVESTOR_GROUPS.map((group) => <DocumentGroup key={group.title} group={group} />)}
        </div>

        <DocumentGroup group={{ title: 'Underwriters', items: UNDERWRITER_ITEMS }} />

        <section className="rounded-3xl border border-[#E5ECE8] bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-[#102019]">Document security and privacy</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2">
            <div className="rounded-2xl bg-[#F3F8F5] p-4">
              <p className="font-medium text-[#102019]">How documents are stored</p>
              <ul className="mt-2 space-y-1 text-sm text-[#52635C]">
                <li>• Encrypted storage (AES-256) with role-based access</li>
                <li>• An audit log of access</li>
                <li>• Secure deletion after the retention period</li>
              </ul>
            </div>
            <div className="rounded-2xl bg-[#F3F8F5] p-4">
              <p className="font-medium text-[#102019]">What goes on-chain</p>
              <ul className="mt-2 space-y-1 text-sm text-[#52635C]">
                <li>• A SHA-256 hash only</li>
                <li>• No raw documents, no personal data</li>
                <li>• No identifiable information</li>
              </ul>
            </div>
          </div>
          <p className="mt-4 text-sm leading-6 text-[#52635C]">
            Vartola never stores raw documents or personally identifiable information on the Stellar blockchain. Only cryptographic hashes are recorded for verification; all personal data stays in secure off-chain storage.
          </p>
        </section>

        <section className="rounded-3xl border border-[#E5ECE8] bg-white p-6 shadow-sm">
          <h2 className="text-xl font-semibold text-[#102019]">Verification process</h2>
          <ol className="mt-4 grid gap-3 md:grid-cols-2">
            {[
              ['Upload', 'Documents are uploaded through the secure portal, then scanned and validated for format and size.'],
              ['Hash', 'A SHA-256 hash is recorded in the database and, in Alpha mode, anchored on Stellar Testnet.'],
              ['Review', 'Operations check the document details against the application.'],
              ['Decision', 'An underwriter verifies or rejects each document; the status is written to the audit trail.'],
            ].map(([title, body]) => (
              <li key={title} className="rounded-2xl border border-[#E5ECE8] p-4">
                <p className="font-medium text-[#102019]">{title}</p>
                <p className="mt-1 text-sm leading-6 text-[#52635C]">{body}</p>
              </li>
            ))}
          </ol>
        </section>

        <p className="text-sm leading-6 text-[#708078]">
          This page is informational. Vartola is a working Alpha and is not accepting real documents or applications.
        </p>
      </div>
    </DashboardLayout>
  );
}
