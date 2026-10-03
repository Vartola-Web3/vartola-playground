'use client';

import { signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useEffect, useState } from 'react';
interface DashboardLayoutProps {
  children: React.ReactNode;
  role: string;
}

export default function DashboardLayout({ children, role }: DashboardLayoutProps) {
  const pathname = usePathname();
  const [financialMode, setFinancialMode] = useState<'SIMULATION' | 'STELLAR_TESTNET'>('SIMULATION');
  useEffect(() => {
    fetch('/api/financial-mode').then((response) => response.json()).then((data) => {
      if (data.mode === 'STELLAR_TESTNET') setFinancialMode('STELLAR_TESTNET');
    }).catch(() => undefined);
  }, [pathname]);
  const navigation = getNavigationForRole(role);

  const home = navigation[0]?.href ?? '/';

  return (
    <div className="min-h-screen bg-[#F7FAF8] text-[#13251E]">
      <div className={`border-b px-4 py-2 text-center text-xs ${financialMode === 'STELLAR_TESTNET' ? 'border-sky-200 bg-sky-50 text-sky-900' : 'border-amber-200 bg-amber-50 text-amber-900'}`}>
        {financialMode === 'STELLAR_TESTNET' ? 'Stellar Testnet mode · Real blockchain transactions · No real monetary value.' : 'Simulation mode · Virtual tAED · No blockchain transactions.'}
      </div>
      <div className="lg:grid lg:grid-cols-[220px_1fr]">
        <aside className="border-b border-[#E5ECE8] bg-white px-4 py-5 lg:min-h-screen lg:border-b-0 lg:border-r">
          <Link href={home} className="text-sm font-semibold text-[#0A4934]">Vartola</Link>
          <nav className="mt-6 flex gap-2 overflow-auto text-sm lg:block lg:space-y-1">
            {navigation.map((item) => {
              const isActive = pathname === item.href || (item.href !== home && pathname.startsWith(item.href));
              return (
                <Link key={item.label} href={item.href} className={`flex items-center gap-2 rounded-xl px-3 py-2 ${isActive ? 'bg-[#EAF9F1] font-medium text-[#0A4934]' : 'text-[#708078]'}`}>
                  <NavIcon name={item.label} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
          <button type="button" onClick={() => signOut({ callbackUrl: '/login' })} className="mt-6 text-sm text-[#708078]">Sign out</button>
        </aside>
        <main className="px-4 py-6 sm:px-8">{children}</main>
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
        { label: 'Applications', href: '/admin/users' },
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
