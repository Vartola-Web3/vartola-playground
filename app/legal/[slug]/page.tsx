import Link from 'next/link';
import { notFound } from 'next/navigation';
import { SiteFooter, SiteNav } from '@/components/marketing/site-shell';
import { LEGAL_BANNER, LEGAL_DOCS, legalDoc } from '@/lib/docs/legal';

export function generateStaticParams() {
  return LEGAL_DOCS.map((doc) => ({ slug: doc.slug }));
}

export default async function LegalDocPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const doc = legalDoc(slug);
  if (!doc) notFound();

  return (
    <div className="vartola-grid min-h-screen text-[#F6FFF9]">
      <SiteNav />
      <main className="vartola-frame py-14">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-amber-200">{LEGAL_BANNER}</p>
        <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">{doc.title}</h1>
        <p className="mt-3 text-sm text-[#9FB8AD]">Audience: {doc.audience}</p>
        <article className="mt-8 max-w-3xl rounded-[28px] bg-[#F7FAF8] p-7 text-[#102019] sm:p-10">
          <p className="text-sm leading-7 text-[#52635C]">This draft lists the points counsel must settle. It is not an executed contract, a regulatory approval, or an offer to finance or to invest.</p>
          <ul className="mt-6 list-disc space-y-3 pl-5 leading-7 text-[#3E524A]">
            {doc.points.map((point) => <li key={point}>{point}</li>)}
          </ul>
        </article>
        <Link href="/legal" className="mt-6 inline-block text-sm text-[#70FFB8]">All drafts</Link>
      </main>
      <SiteFooter />
    </div>
  );
}
