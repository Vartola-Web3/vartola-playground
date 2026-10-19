import Link from 'next/link';
import { SiteFooter, SiteNav } from '@/components/marketing/site-shell';

export default function NotFound() {
  return (
    <div className="vartola-grid min-h-screen text-[#F6FFF9]">
      <SiteNav />
      <main className="vartola-frame flex min-h-[60vh] flex-col items-center justify-center py-20 text-center">
        <p className="text-xs uppercase tracking-[0.18em] text-[#70FFB8]">404 · Not found</p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight">This page does not exist</h1>
        <p className="mt-3 max-w-xl text-sm leading-7 text-[#9FB8AD]">
          The link may be old or mistyped. Explore the product, verify the Testnet proof, or try the interactive sandbox.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <Link href="/" className="rounded-full bg-[#35F49A] px-5 py-3 text-sm font-semibold text-[#07120F]">Back home</Link>
          <Link href="/sandbox" className="rounded-full border border-[rgba(112,255,184,0.3)] px-5 py-3 text-sm text-[#F6FFF9]">Try the sandbox</Link>
          <Link href="/proof" className="rounded-full border border-[rgba(112,255,184,0.3)] px-5 py-3 text-sm text-[#F6FFF9]">Proof Center</Link>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
