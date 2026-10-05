'use client';

import { signOut, useSession } from 'next-auth/react';
import { usePathname, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';

interface DashboardLayoutProps {
  children: React.ReactNode;
  role: string;
}

export default function DashboardLayout({ children, role }: DashboardLayoutProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [financialMode, setFinancialMode] = useState<'SIMULATION' | 'STELLAR_TESTNET'>('SIMULATION');
  const [appLabel, setAppLabel] = useState('Demo / Test Data');
  const [query, setQuery] = useState('');
  useEffect(() => {
    fetch('/api/financial-mode').then((response) => response.json()).then((data) => {
      if (data.mode === 'STELLAR_TESTNET') setFinancialMode('STELLAR_TESTNET');
    }).catch(() => undefined);
    fetch('/api/app-mode').then((response) => response.json()).then((data) => {
      if (data.label) setAppLabel(data.label);
    }).catch(() => undefined);
  }, [pathname]);

  const navigation = getNavigationForRole(role);
  const home = navigation[0]?.href ?? '/';
  const name = session?.user?.name || 'Account';
  const initial = name.trim().charAt(0).toUpperCase() || 'V';
  const today = new Date().toLocaleDateString('en-AE', { day: 'numeric', month: 'short', year: 'numeric' });
  const matches = query.trim()
    ? navigation.filter((item) => item.label.toLowerCase().includes(query.trim().toLowerCase()))
    : [];

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0E6A45] text-[#13251E]">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-0 h-[70%] w-[55%] rounded-[40%] bg-[#35F49A]/25 blur-3xl" />
        <svg className="absolute inset-y-0 left-0 h-full w-[48%]" viewBox="0 0 600 900" preserveAspectRatio="none" aria-hidden="true">
          <path d="M0 0h360c-40 120-20 220 40 320s-20 180-70 280 40 180 20 300H0Z" fill="#147A4E" />
          <path d="M0 80c120 40 180 120 150 230S80 480 140 620s-40 180-20 280H0Z" fill="#1C8F5C" opacity="0.85" />
          <path d="M0 220c160 20 220 110 180 210S90 580 170 760H0Z" fill="#E9FFF4" opacity="0.16" />
        </svg>
      </div>

      <div className="relative flex min-h-screen flex-col p-3 sm:p-5 lg:p-6">
        <div className="flex min-h-[calc(100vh-1.5rem)] flex-1 overflow-hidden rounded-[28px] bg-[#F6F8F7] shadow-[0_24px_80px_rgba(0,0,0,0.18)] lg:ml-[7%]">
          <aside className="hidden w-56 shrink-0 flex-col border-r border-[#E6EEE9] bg-white/80 px-4 py-5 lg:flex">
            <Link href={home} className="flex items-center gap-2 px-2">
              <img src="/brand/vartola-logo.png" alt="" className="h-8 w-8 rounded-lg" />
              <span className="font-semibold text-[#0A4934]">Vartola</span>
            </Link>
            <nav className="mt-8 space-y-1 text-sm">
              {navigation.map((item) => {
                const isActive = pathname === item.href || (item.href !== home && pathname.startsWith(item.href));
                return (
                  <Link key={item.label} href={item.href} className={`flex items-center gap-2 rounded-xl px-3 py-2.5 ${isActive ? 'bg-[#E7F8EF] font-medium text-[#0A4934]' : 'text-[#708078] hover:bg-[#F3F8F5]'}`}>
                    <NavIcon name={item.label} />
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </aside>

          <div className="flex min-w-0 flex-1 flex-col">
            <header className="flex flex-wrap items-center gap-3 border-b border-[#E6EEE9] bg-white/70 px-4 py-3 sm:px-6">
              <div className="relative min-w-[180px] flex-1">
                <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#93A29B]">
                  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true"><circle cx="11" cy="11" r="6" /><path d="m16 16 4 4" /></svg>
                </span>
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' && matches[0]) router.push(matches[0].href);
                  }}
                  placeholder="Search your workspace"
                  className="h-10 w-full rounded-full border border-[#E5ECE8] bg-white pl-9 pr-3 text-sm outline-none focus:ring-2 focus:ring-[#15C77A]/30"
                />
                {query.trim() && (
                  <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-2xl border border-[#E5ECE8] bg-white shadow-lg">
                    {matches.length === 0 && <p className="px-3 py-2 text-sm text-[#708078]">No matching page</p>}
                    {matches.map((item) => (
                      <Link key={item.href} href={item.href} onClick={() => setQuery('')} className="block px-3 py-2 text-sm hover:bg-[#F3F8F5]">
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
              <p className="rounded-full bg-[#E7F8EF] px-3 py-1 text-xs text-[#0D7A52]">{appLabel}</p>
              <p className={`rounded-full px-3 py-1 text-xs ${financialMode === 'STELLAR_TESTNET' ? 'bg-sky-50 text-sky-900' : 'bg-amber-50 text-amber-900'}`}>
                {financialMode === 'STELLAR_TESTNET' ? 'Stellar Testnet' : 'Simulation'}
              </p>
              <p className="hidden text-sm text-[#708078] sm:block">{today}</p>
              <div className="flex items-center gap-2 rounded-full bg-white py-1 pl-1 pr-1 shadow-sm">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0E9F6E] text-sm font-semibold text-white">{initial}</span>
                <span className="hidden max-w-[8rem] truncate text-sm font-medium sm:inline">{name}</span>
                <button type="button" onClick={() => signOut({ callbackUrl: '/login' })} className="rounded-full bg-[#F3F8F5] px-3 py-1.5 text-xs font-semibold text-[#0A4934] hover:bg-[#E7F8EF]">
                  Sign out
                </button>
              </div>
            </header>
            <nav className="flex gap-2 overflow-auto border-b border-[#E6EEE9] bg-white/60 px-4 py-2 text-sm lg:hidden">
              {navigation.map((item) => (
                <Link key={item.label} href={item.href} className="shrink-0 rounded-full bg-[#E7F8EF] px-3 py-1 text-[#0A4934]">
                  {item.label}
                </Link>
              ))}
            </nav>
            <main className="min-w-0 flex-1 px-4 py-6 sm:px-6">{children}</main>
          </div>
        </div>
      </div>
    </div>
  );
}

function NavIcon({ name }: { name: string }) {
  const paths: Record<string, string> = {
    Overview: 'M4 10.5 12 4l8 6.5V20a1 1 0 0 1-1 1h-5v-6H10v6H5a1 1 0 0 1-1-1z',
    Invest: 'M4 7h16v10H4zM4 11h16',
    Portfolio: 'M5 19V9m5 10V5m5 14v-7m5 7V8',
    Wallet: 'M4 8h16v10H4zM4 11h16M15 14h2',
    Activity: 'M5 6h14M5 12h14M5 18h10',
    'My Fleet': 'M4 16h16l-1.5-5H6.5zM7 16v2m10-2v2',
    Payments: 'M6 7h12v10H6zM9 11h6',
    Applications: 'M7 4h7l4 4v12H7z',
    Documents: 'M7 4h10v16H7zM10 9h4M10 13h4',
    Reviews: 'M5 6h14v12H5zM8 10h8M8 14h5',
    Opportunities: 'M5 8h14v10H5zM8 8V6h8v2',
    Users: 'M8 11a3 3 0 1 0 0-6 3 3 0 0 0 0 6zm8 1a2.5 2.5 0 1 0 0-5M4 19a4 4 0 0 1 8 0m2 0a3.5 3.5 0 0 1 6 0',
    Simulation: 'M12 5v2m0 10v2M5 12H3m18 0h-2M7 7 5.5 5.5M18.5 18.5 17 17M17 7l1.5-1.5M5.5 18.5 7 17',
    Blockchain: 'M7 7h6v6H7zM11 11h6v6h-6zM5 15h4',
    Settings: 'M12 8a4 4 0 1 0 0 8 4 4 0 0 0 0-8z',
  };
  return (
    <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.7">
      <path d={paths[name] || paths.Overview} />
    </svg>
  );
}

function getNavigationForRole(role: string) {
  switch (role) {
    case 'SME':
      return [
        { label: 'Overview', href: '/sme' },
        { label: 'My Fleet', href: '/sme' },
        { label: 'Payments', href: '/sme/payments' },
        { label: 'Applications', href: '/sme/applications/new' },
        { label: 'Documents', href: '/documents' },
      ];
    case 'INVESTOR':
      return [
        { label: 'Overview', href: '/investor' },
        { label: 'Invest', href: '/marketplace' },
        { label: 'Portfolio', href: '/investor/portfolio' },
        { label: 'Wallet', href: '/investor/wallet' },
        { label: 'Activity', href: '/investor/activity' },
      ];
    case 'UNDERWRITER':
      return [
        { label: 'Overview', href: '/underwriter' },
        { label: 'Reviews', href: '/underwriter' },
      ];
    case 'ADMIN':
    case 'ADMIN_REVIEWER': {
      const items = [
        { label: 'Overview', href: '/admin' },
        { label: 'Applications', href: '/admin/applications' },
        { label: 'Opportunities', href: '/admin/pools' },
        { label: 'Users', href: '/admin/users' },
        { label: 'Simulation', href: '/admin/simulation' },
        { label: 'Blockchain', href: '/admin/blockchain' },
        { label: 'Settings', href: '/admin/setup' },
      ];
      return role === 'ADMIN' ? items : items.filter((item) => item.label !== 'Settings');
    }
    default:
      return [];
  }
}
