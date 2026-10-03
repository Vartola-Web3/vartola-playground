import Link from 'next/link';
import { BrandMark } from '@/components/brand/brand-mark';

const links = [
  { href: '/', label: 'Home' },
  { href: '/how-it-works', label: 'How It Works' },
  { href: '/whitepaper', label: 'Whitepaper' },
  { href: '/pitch', label: 'Pitch Deck' },
  { href: '/paperwork', label: 'Paperwork' },
  { href: '/about', label: 'About' },
];

export function SiteNav() {
  return (
    <header className="sticky top-0 z-20 border-b border-[rgba(112,255,184,0.14)] bg-[#07120F]/90 backdrop-blur">
      <div className="vartola-frame flex h-16 items-center justify-between">
        <BrandMark />
        <nav className="hidden items-center gap-6 text-sm text-[#9FB8AD] lg:flex">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-[#F6FFF9]">
              {link.label}
            </Link>
          ))}
        </nav>
        <Link
          href="/login"
          className="rounded-full bg-[#35F49A] px-4 py-2 text-sm font-semibold text-[#07120F]"
        >
          Launch Demo
        </Link>
      </div>
    </header>
  );
}

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
          <Link href="/about" className="rounded-full border border-[rgba(112,255,184,0.24)] px-5 py-3 text-sm font-medium text-[#F6FFF9]">
            About
          </Link>
        </div>
      </div>
    </footer>
  );
}
