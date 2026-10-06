'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { BrandMark } from '@/components/brand/brand-mark';
import { PUBLIC_NAV } from '@/lib/docs/product';

const links = PUBLIC_NAV.map(([label, href]) => ({ href, label }));

function isActive(pathname: string, href: string) {
  return href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);
}

// One shared public header. Desktop shows the inline links; below the lg breakpoint a menu button opens a
// panel with the same links plus Login and Get Started. Only public routes are listed.
export function SiteNav() {
  const pathname = usePathname() || '/';
  // The menu is tied to the route it was opened on, so navigating anywhere closes it without an effect.
  const [openFor, setOpenFor] = useState<string | null>(null);
  const open = openFor === pathname;
  const setOpen = (value: boolean | ((current: boolean) => boolean)) => {
    const next = typeof value === 'function' ? value(open) : value;
    setOpenFor(next ? pathname : null);
  };
  const button = useRef<HTMLButtonElement>(null);

  // Lock background scroll while the menu is open and close on Escape or when the viewport grows to desktop.
  useEffect(() => {
    if (!open) return undefined;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setOpenFor(null);
        button.current?.focus();
      }
    };
    const onResize = () => {
      if (window.matchMedia('(min-width: 1024px)').matches) setOpenFor(null);
    };
    window.addEventListener('keydown', onKey);
    window.addEventListener('resize', onResize);
    return () => {
      document.body.style.overflow = previous;
      window.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onResize);
    };
  }, [open]);

  return (
    <>
    <header className="sticky top-0 z-30 border-b border-[rgba(112,255,184,0.14)] bg-[#07120F]/95 backdrop-blur">
      <div className="vartola-frame flex h-16 items-center justify-between gap-3">
        <BrandMark />
        <nav aria-label="Primary" className="hidden items-center gap-6 text-sm text-[#9FB8AD] lg:flex">
          {links.map((link) => {
            const active = isActive(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                aria-current={active ? 'page' : undefined}
                className={active ? 'text-[#F6FFF9]' : 'hover:text-[#F6FFF9]'}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
        <div className="flex items-center gap-2">
          <Link
            href="/login"
            className="hidden rounded-full bg-[#35F49A] px-4 py-2 text-sm font-semibold text-[#07120F] sm:inline-block"
          >
            Launch Demo
          </Link>
          <button
            ref={button}
            type="button"
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((value) => !value)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-[rgba(112,255,184,0.3)] text-[#F6FFF9] lg:hidden"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="none" aria-hidden="true">
              {open ? (
                <path d="M4 4l12 12M16 4L4 16" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              ) : (
                <path d="M3 6h14M3 10h14M3 14h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
              )}
            </svg>
          </button>
        </div>
      </div>
    </header>
      <div
        id="mobile-menu"
        hidden={!open}
        className="fixed inset-x-0 bottom-0 top-16 z-20 overflow-y-auto border-t border-[rgba(112,255,184,0.14)] bg-[#07120F] lg:hidden"
      >
        <nav aria-label="Mobile" className="vartola-frame flex flex-col py-4">
          {links.map((link) => {
            const active = isActive(pathname, link.href);
            return (
              <Link
                key={link.href}
                href={link.href}
                onClick={() => setOpen(false)}
                aria-current={active ? 'page' : undefined}
                className={`flex min-h-12 items-center justify-between border-b border-white/10 py-3 text-base ${active ? 'font-semibold text-[#35F49A]' : 'text-[#D7E7DF]'}`}
              >
                {link.label}
                {active ? <span aria-hidden="true" className="h-2 w-2 rounded-full bg-[#35F49A]" /> : null}
              </Link>
            );
          })}
          <div className="mt-6 grid gap-3 pb-6">
            <Link
              href="/register"
              onClick={() => setOpen(false)}
              className="flex min-h-12 items-center justify-center rounded-full bg-[#35F49A] px-5 text-sm font-semibold text-[#07120F]"
            >
              Get Started
            </Link>
            <Link
              href="/login"
              onClick={() => setOpen(false)}
              className="flex min-h-12 items-center justify-center rounded-full border border-[rgba(112,255,184,0.35)] px-5 text-sm font-medium text-[#F6FFF9]"
            >
              Login
            </Link>
          </div>
        </nav>
      </div>
    </>
  );
}
