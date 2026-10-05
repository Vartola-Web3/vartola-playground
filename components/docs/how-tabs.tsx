'use client';

import Link from 'next/link';
import { useState } from 'react';

const tabs = [
  {
    id: 'sme',
    label: 'For SMEs',
    title: 'Finance the asset, operate it, and repay the facility.',
    action: 'Apply as a business',
    href: '/register',
    steps: [
      ['Apply', 'Describe the vehicles or equipment, the amount, and the term.'],
      ['Verify', 'Company checks cover the licence, the people who control the business, and the documents.'],
      ['Underwrite', 'The review scores the business, the asset, and the deal.'],
      ['Approve', 'An approval creates a facility. It is not yet an active financing.'],
      ['Fund', 'The approved facility opens for funding. Capital stays in escrow for that facility.'],
      ['Acquire the asset', 'After the checklist, payment goes to the approved supplier and the asset is delivered.'],
      ['Operate', 'The business uses the asset once delivery, registration, and insurance are confirmed.'],
      ['Repay', 'Scheduled payments are applied to principal, income, fees, and any agreed reserve.'],
      ['Complete', 'When the facility is complete, title follows the agreement. Ownership is not automatic.'],
    ],
  },
  {
    id: 'investor',
    label: 'For investors',
    title: 'Take a position in a facility. Track it without managing a chain.',
    action: 'Open the investor view',
    href: '/login',
    steps: [
      ['Verify', 'Create an account and complete verification. In Alpha mode an embedded Stellar wallet is created for you; no seed phrase to manage.'],
      ['Explore', 'Open opportunities tied to productive assets used by UAE SMEs.'],
      ['Assess', 'Review the business risk, the asset, the facility, the term, the economics, the protection, and the status. Returns are not guaranteed.'],
      ['Participate', 'A position is a number of Participation Units in that facility.'],
      ['Capital escrowed', 'Funds stay in the facility escrow until release conditions pass.'],
      ['Asset funded', 'The supplier is paid. The facility becomes active only after delivery evidence.'],
      ['Receive distributions', 'Each SME payment can return principal and income in proportion to units.'],
      ['Track the position', 'The screen shows cash, investments, payments, and distributions.'],
    ],
  },
  {
    id: 'partners',
    label: 'For partners',
    title: 'Suppliers, licensed firms, and recovery partners join a defined step.',
    action: 'Read the technical brief',
    href: '/technical',
    steps: [
      ['Suppliers and originators', 'Submit asset information, provide quotations, verify invoices, confirm delivery, and support asset lifecycle data.'],
      ['Get paid safely', 'Pass KYB, prove the payment beneficiary, and get paid only against a verified invoice and asset.'],
      ['Licensed partners', 'Can hold the regulated activity while Vartola runs the infrastructure. This assigns the function. It does not remove it.'],
      ['Insurers and recovery', 'Insurance is mandatory in the checklist. Realization follows the agreement and UAE law.'],
    ],
  },
] as const;

export function HowTabs() {
  const [active, setActive] = useState<(typeof tabs)[number]['id']>('sme');
  const current = tabs.find((tab) => tab.id === active) || tabs[0];

  return (
    <div>
      <div className="flex flex-wrap gap-2" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={tab.id === active}
            onClick={() => setActive(tab.id)}
            className={`rounded-full px-4 py-2 text-sm font-medium ${tab.id === active ? 'bg-[#35F49A] text-[#07120F]' : 'border border-[rgba(112,255,184,0.3)] text-[#F6FFF9]'}`}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="mt-6" role="tabpanel">
        <h2 className="text-2xl font-semibold">{current.title}</h2>
        <ol className="mt-6 space-y-4">
          {current.steps.map(([title, body], index) => (
            <li key={title} className="flex gap-3">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#35F49A] text-sm font-semibold text-[#07120F]">{index + 1}</span>
              <div>
                <p className="font-medium">{title}</p>
                <p className="text-sm leading-6 text-[#9FB8AD]">{body}</p>
              </div>
            </li>
          ))}
        </ol>
        <Link href={current.href} className="mt-6 inline-block rounded-full bg-[#35F49A] px-5 py-2.5 text-sm font-semibold text-[#07120F]">
          {current.action}
        </Link>
      </div>
    </div>
  );
}
