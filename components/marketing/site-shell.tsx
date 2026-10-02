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
    <header className="sticky top-0 z-20 border-b border-[rgba(112,255,184,0.14)] bg-[#07120F]/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <Link href="/" className="text-sm font-semibold tracking-tight text-[#70FFB8]">
          AssetFi UAE
        </Link>
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
      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-14 sm:px-6 md:flex-row md:items-end md:justify-between">
        <div className="max-w-xl">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#70FFB8]">Fleet finance</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-[#F6FFF9]">Financing the movement of a stronger UAE.</h2>
          <p className="mt-3 text-sm leading-6 text-[#9FB8AD]">
            Tokenized lease-to-own finance for delivery and transport fleets, settled on Stellar testnet.
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
