'use client';

import { signOut } from 'next-auth/react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { StatusBadge } from '@/components/ui/design';

interface DashboardLayoutProps {
  children: React.ReactNode;
  role: string;
}

export default function DashboardLayout({ children, role }: DashboardLayoutProps) {
  const pathname = usePathname();
  const navigation = getNavigationForRole(role);

  return (
    <div className="min-h-screen bg-[#F7F9FC] text-[#0F172A]">
      <div className="border-b border-amber-200 bg-amber-50 px-4 py-2 text-center text-xs font-medium text-amber-900">
        Testnet demo only. No real value. Transactions are simulated.
      </div>

      <header className="border-b border-[#E2E8F0] bg-white">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
          <div className="flex items-center gap-8">
            <Link href="/dashboard" className="text-sm font-semibold tracking-tight text-[#0B1F4D]">
              AssetFi UAE
            </Link>
            <nav className="hidden items-center gap-1 md:flex">
              {navigation.map((item) => {
                const isActive = pathname.startsWith(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`rounded-lg px-3 py-2 text-sm ${
                      isActive ? 'bg-[#F7F9FC] font-medium text-[#0B1F4D]' : 'text-[#475569] hover:bg-[#F7F9FC]'
                    }`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
          </div>
          <div className="flex items-center gap-3">
            <StatusBadge tone="demo">{role}</StatusBadge>
            <button
              type="button"
              onClick={() => signOut({ callbackUrl: '/login' })}
              className="rounded-xl border border-[#E2E8F0] px-3 py-1.5 text-sm text-[#0F172A]"
            >
              Sign Out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6">{children}</main>
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
        { label: 'AI Assistant', href: '/underwriter/ai-assist' },
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
