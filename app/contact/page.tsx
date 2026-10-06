import type { Metadata } from 'next';
import { SiteFooter, SiteNav } from '@/components/marketing/site-shell';
import { ContactForm } from '@/components/marketing/contact-form';
import { DISCLAIMER, ENTITY, SEO } from '@/lib/docs/product';

export const metadata: Metadata = { title: SEO.contact.title, description: SEO.contact.description };

export default async function ContactPage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  const { type } = await searchParams;
  return (
    <div className="vartola-grid min-h-screen text-[#F6FFF9]">
      <SiteNav />
      <main className="vartola-frame py-14">
        <p className="text-xs uppercase tracking-[0.18em] text-[#70FFB8]">Contact</p>
        <h1 className="mt-3 max-w-3xl text-5xl font-semibold leading-[1.05] tracking-tight">Talk to Vartola</h1>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-[#9FB8AD]">For SME pilots, suppliers, capital partners, financial institutions, ecosystem partners and technical collaboration.</p>
        <div className="mt-8 max-w-3xl"><ContactForm initialType={type} /></div>
        <p className="mt-6 max-w-3xl text-xs leading-6 text-[#9FB8AD]">{ENTITY.statement} Vartola currently runs on Stellar Testnet with a test asset that has no monetary value.</p>
        <p className="mt-4 text-sm leading-7 text-[#9FB8AD]">{DISCLAIMER}</p>
      </main>
      <SiteFooter />
    </div>
  );
}
