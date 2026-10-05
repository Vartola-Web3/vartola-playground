'use client';

import Link from 'next/link';
import { useState } from 'react';

type Audience = 'business' | 'investor';

const content: Record<
  Audience,
  {
    title: string;
    body: string;
    steps: [string, string][];
    action: string;
    href: string;
    image: string;
    imageAlt: string;
    summaryTitle: string;
    rows: [string, string][];
    note: string;
    noteDetail?: string;
  }
> = {
  business: {
    title: 'Helping SMEs grow with productive assets.',
    body: 'Logistics today. Equipment next.',
    steps: [
      ['Apply for Assets', 'Choose the vehicles or equipment your business needs.'],
      ['Get Assessed', 'We review your business, cash flow, and the assets being financed.'],
      ['Get Funded', 'Approved assets are financed and purchased through the platform.'],
      ['Repay', 'Make scheduled payments. Any path to title follows the facility agreement.'],
    ],
    action: 'Apply for Financing',
    href: '/register',
    image: '/fleet/business-van.jpg',
    imageAlt: 'Cargo van in a warehouse at night',
    summaryTitle: 'Financing Summary',
    rows: [
      ['Asset Type', 'Cargo Van'],
      ['Financing Amount', 'AED 180,000'],
      ['Tenure', '48 months'],
      ['Monthly Payment', 'AED 4,200'],
    ],
    note: 'Illustrative example. Not a live offer.',
  },
  investor: {
    title: 'Invest in real productive assets.',
    body: 'Back UAE fleets and SMEs through structured asset finance.',
    steps: [
      ['Explore Opportunities', 'Browse facility opportunities tied to productive assets.'],
      ['Review the Risk', 'See the business, the asset, the risk view, and the term. Income is not guaranteed.'],
      ['Choose Your Investment', 'Select the opportunity and amount that fits your preference.'],
      ['Receive Distributions', 'Earn principal and lease income as businesses make payments.'],
    ],
    action: 'Explore Investments',
    href: '/marketplace',
    image: '/fleet/investor-fleet.jpg',
    imageAlt: 'Commercial fleet at night in front of the Dubai skyline',
    summaryTitle: 'Investment Snapshot',
    rows: [
      ['Asset Type', 'Mixed Fleet'],
      ['Illustrative income', 'Not a forecast'],
      ['Term', '28 months'],
      ['Minimum Investment', 'AED 25,000'],
    ],
    note: 'Illustrative example. Not a live offer or a promised distribution.',
  },
};

function BuildingIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M4 20V6.5A1.5 1.5 0 0 1 5.5 5h7A1.5 1.5 0 0 1 14 6.5V20" />
      <path d="M14 10h4.5A1.5 1.5 0 0 1 20 11.5V20" />
      <path d="M3 20h18M8 9h2M8 13h2M8 17h2" />
    </svg>
  );
}

function PeopleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <circle cx="9" cy="8" r="2.2" />
      <circle cx="16" cy="9" r="1.8" />
      <path d="M4.5 18.5c.6-2.4 2.4-3.7 4.5-3.7s3.9 1.3 4.5 3.7" />
      <path d="M14 14.9c1.5-.2 3 .6 3.8 2.6" />
    </svg>
  );
}

export function AudiencePanel() {
  const [audience, setAudience] = useState<Audience>('business');
  const panel = content[audience];

  return (
    <section className="overflow-hidden rounded-[28px] border border-[rgba(112,255,184,0.16)] bg-[#071a14] bg-[linear-gradient(rgba(53,244,154,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(53,244,154,0.05)_1px,transparent_1px)] bg-[size:42px_42px] p-4 sm:p-6 lg:p-8">
      <div className="grid items-stretch gap-8 lg:grid-cols-2">
        <div className="px-1 sm:px-3">
          <div className="inline-flex rounded-full border border-[rgba(112,255,184,0.18)] bg-[#091713]/80 p-1">
            {([
              ['business', 'For Businesses', <BuildingIcon key="b" />],
              ['investor', 'For Investors', <PeopleIcon key="i" />],
            ] as const).map(([id, label, icon]) => (
              <button
                key={id}
                type="button"
                aria-pressed={audience === id}
                onClick={() => setAudience(id)}
                className={`flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium ${audience === id ? 'border border-[#35F49A] text-[#35F49A] shadow-[0_0_16px_rgba(53,244,154,0.28)]' : 'border border-transparent text-[#9FB8AD]'}`}
              >
                {icon}
                {label}
              </button>
            ))}
          </div>

          <p className="mt-8 text-xs font-semibold uppercase tracking-[0.18em] text-[#70FFB8]">How Vartola works</p>
          <h2 className="mt-3 max-w-lg text-4xl font-semibold leading-[1.05] tracking-tight text-white sm:text-[2.7rem]">{panel.title}</h2>
          <p className="mt-3 text-[#C5D5CC]">{panel.body}</p>

          <ol className="relative mt-8 space-y-5">
            <span className="absolute bottom-2 left-[11px] top-2 w-px bg-[#35F49A]/70" aria-hidden="true" />
            {panel.steps.map(([title, body], index) => (
              <li key={title} className="relative flex gap-4">
                <span className="relative z-10 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#35F49A] text-xs font-semibold text-[#07120F]">
                  {index + 1}
                </span>
                <div>
                  <p className="font-semibold text-white">{title}</p>
                  <p className="mt-1 text-sm leading-6 text-[#9FB8AD]">{body}</p>
                </div>
              </li>
            ))}
          </ol>

          <Link href={panel.href} className="mt-8 inline-flex items-center gap-2 rounded-full bg-[#35F49A] px-5 py-3 text-sm font-semibold text-[#07120F]">
            {panel.action}
            <span aria-hidden="true">→</span>
          </Link>
        </div>

        <div className="relative min-h-[460px] overflow-hidden rounded-[22px] border border-[rgba(112,255,184,0.12)] lg:min-h-full">
          <img src={panel.image} alt={panel.imageAlt} className="absolute inset-0 h-full w-full object-cover" />
          <div className="absolute right-4 top-4 w-[min(100%-2rem,280px)] rounded-2xl border border-white/10 bg-[#0c1c16]/80 p-4 backdrop-blur-md">
            <p className="text-sm font-semibold text-white">{panel.summaryTitle}</p>
            <dl className="mt-3 space-y-2 text-sm">
              {panel.rows.map(([label, value]) => (
                <div key={label} className="flex items-center justify-between gap-4 border-b border-white/10 pb-2 last:border-b-0 last:pb-0">
                  <dt className="text-[#9FB8AD]">{label}</dt>
                  <dd className="font-medium text-white">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between gap-3 rounded-full border border-white/10 bg-[#0c1c16]/80 px-4 py-3 text-sm backdrop-blur-md">
            <p className="flex items-center gap-2 text-[#F6FFF9]">
              <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#35F49A]/15 text-[#35F49A]" aria-hidden="true">
                {audience === 'business' ? (
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.4"><path d="M5 12.5 9.5 17 19 7" /></svg>
                ) : (
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor"><rect x="4" y="12" width="3" height="7" rx="0.5" /><rect x="10.5" y="8" width="3" height="11" rx="0.5" /><rect x="17" y="5" width="3" height="14" rx="0.5" /></svg>
                )}
              </span>
              <span>
                {panel.note}
              </span>
            </p>
            {panel.noteDetail ? <span className="shrink-0 font-medium text-white">{panel.noteDetail} →</span> : null}
          </div>
        </div>
      </div>
    </section>
  );
}
