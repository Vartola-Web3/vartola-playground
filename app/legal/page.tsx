import Link from 'next/link';
import { SiteFooter, SiteNav } from '@/components/marketing/site-shell';
import { LEGAL_BANNER, LEGAL_DOCS } from '@/lib/docs/legal';

export default function LegalIndexPage() {
  return (
    <div className="vartola-grid min-h-screen text-[#F6FFF9]">
      <SiteNav />
      <main className="vartola-frame py-14">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-200">{LEGAL_BANNER}</p>
        <h1 className="mt-3 max-w-3xl text-5xl font-semibold leading-[1.05] tracking-tight">Legal drafts for review.</h1>
        <p className="mt-4 max-w-2xl text-lg leading-8 text-[#9FB8AD]">Each page is an outline of what the agreement or policy must cover. None of them is a final UAE legal document, and none creates a financing offer.</p>
        <ul className="mt-10 grid gap-4 md:grid-cols-2">
          {LEGAL_DOCS.map((doc) => (
            <li key={doc.slug}>
              <Link href={`/legal/${doc.slug}`} className="block rounded-3xl border border-white/10 bg-[#0E211B] p-5 hover:border-[#70FFB8]/40">
                <h2 className="text-lg font-semibold">{doc.title}</h2>
                <p className="mt-2 text-sm text-[#9FB8AD]">{doc.audience}</p>
              </Link>
            </li>
          ))}
        </ul>
      </main>
      <SiteFooter />
    </div>
  );
}
