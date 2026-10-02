import Link from 'next/link';

const links = [
  { href: '/', label: 'Home' },
  { href: '/how-it-works', label: 'How It Works' },
  { href: '/whitepaper', label: 'Whitepaper' },
  { href: '/pitch', label: 'Pitch Deck' },
  { href: '/documents', label: 'Documents' },
  { href: '/about', label: 'About' },
];

export function SiteNav() {
  return (
    <header className="sticky top-0 z-20 border-b border-[#E2E8F0] bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="text-sm font-semibold tracking-tight text-[#0B1F4D]">
          AssetFi UAE
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-[#475569] lg:flex">
          {links.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-[#0F172A]">
              {link.label}
            </Link>
          ))}
        </nav>
        <Link
          href="/login"
          className="rounded-xl bg-[#1D4ED8] px-4 py-2 text-sm font-medium text-white hover:bg-[#1e40af]"
        >
          Login
        </Link>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="border-t border-[#E2E8F0] bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-14 sm:px-6 md:flex-row md:items-end md:justify-between">
        <div className="max-w-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#1D4ED8]">Testnet demo</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#0B1F4D]">Open the institutional demo.</h2>
          <p className="mt-3 text-sm leading-6 text-[#475569]">
            Walk through SME origination, underwriting, and investor funding with simulated Stellar settlement.
          </p>
        </div>
        <div className="flex gap-3">
          <Link href="/login" className="rounded-xl bg-[#0B1F4D] px-5 py-3 text-sm font-medium text-white">
            Open Demo
          </Link>
          <Link href="/about" className="rounded-xl border border-[#E2E8F0] px-5 py-3 text-sm font-medium text-[#0F172A]">
            Request Access
          </Link>
        </div>
      </div>
    </footer>
  );
}
