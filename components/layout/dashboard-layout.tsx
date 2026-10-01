'use client';

import { signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface DashboardLayoutProps {
  children: React.ReactNode;
  role: string;
}

export default function DashboardLayout({ children, role }: DashboardLayoutProps) {
  const pathname = usePathname();
  const navigation = getNavigationForRole(role);

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-yellow-500 text-yellow-900 px-4 py-2 text-center text-sm font-semibold">
        ⚠️ TESTNET DEMO ONLY - NO REAL VALUE - SIMULATED TRANSACTIONS
      </div>

      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-8">
              <Link href="/dashboard" className="text-xl font-bold text-blue-600">
                AssetFi UAE
              </Link>
              <nav className="hidden md:flex space-x-4">
                {navigation.map((item) => {
                  const isActive = pathname.startsWith(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                        isActive ? 'bg-blue-100 text-blue-700' : 'text-slate-600 hover:bg-slate-100'
                      }`}
                    >
                      {item.label}
                    </Link>
                  );
                })}
              </nav>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="text-xs text-slate-500">{role}</div>
              </div>
              <Button variant="outline" size="sm" onClick={() => signOut({ callbackUrl: '/login' })}>
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">{children}</main>

      <footer className="border-t border-slate-200 mt-12 py-6 text-center text-sm text-slate-500">
        AssetFi UAE - Institutional Asset Finance Platform | Testnet Demo
      </footer>
    </div>
  );
}

function getNavigationForRole(role: string) {
  switch (role) {
    case 'SME':
      return [
        { label: 'Dashboard', href: '/sme' },
        { label: 'New Application', href: '/sme/applications/new' },
      ];
    case 'INVESTOR':
      return [
        { label: 'Dashboard', href: '/investor' },
        { label: 'Pools', href: '/investor/pools' },
        { label: 'Wallet', href: '/investor/wallet' },
      ];
    case 'UNDERWRITER':
      return [
        { label: 'Dashboard', href: '/underwriter' },
      ];
    case 'ADMIN':
      return [
        { label: 'Dashboard', href: '/admin' },
        { label: 'Users', href: '/admin/users' },
        { label: 'Pools', href: '/admin/pools' },
        { label: 'Audit Log', href: '/admin/audit' },
        { label: 'Setup', href: '/admin/setup' },
      ];
    default:
      return [];
  }
}
