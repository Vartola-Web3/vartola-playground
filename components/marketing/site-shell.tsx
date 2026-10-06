import Link from 'next/link';
export { SiteNav } from '@/components/marketing/site-nav';

export function SiteFooter() {
  return (
    <footer className="border-t border-[rgba(112,255,184,0.14)] bg-[#091713]">
      <div className="vartola-frame flex flex-col gap-8 py-14 md:flex-row md:items-end md:justify-between">
        <div className="max-w-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#70FFB8]">Productive asset finance</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#F6FFF9]">Financing the assets that move UAE businesses forward.</h2>
          <p className="mt-3 text-sm leading-6 text-[#9FB8AD]">
            Built for growing SMEs—starting with logistics fleets and expanding into the equipment businesses need next.
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/login" className="rounded-full bg-[#35F49A] px-5 py-3 text-sm font-semibold text-[#07120F]">
            Launch Demo
          </Link>
          <Link href="/contact" className="rounded-full border border-[rgba(112,255,184,0.24)] px-5 py-3 text-sm font-medium text-[#F6FFF9]">
            Contact
          </Link>
          <Link href="/docs" className="rounded-full border border-[rgba(112,255,184,0.24)] px-5 py-3 text-sm font-medium text-[#F6FFF9]">
            Documentation
          </Link>
        </div>
      </div>
    </footer>
  );
}
