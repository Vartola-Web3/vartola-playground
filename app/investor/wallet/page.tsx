'use client';
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { formatCurrency } from '@/lib/formatters';

export default function WalletFaucetPage() {
  const { data: session } = useSession();
  const [walletAddress, setWalletAddress] = useState<string>('');
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [faucetCooldown, setFaucetCooldown] = useState(false);

  useEffect(() => {
    initializeWallet();
  }, []);

  const initializeWallet = async () => {
    try {
      const response = await fetch('/api/investor/wallet');
      if (response.ok) {
        const data = await response.json();
        setWalletAddress(data.publicKey || '');
        setBalance(data.balance || 0);
      }
    } catch (error) {
      console.error('Failed to load wallet:', error);
    }
  };

  const handleCreateWallet = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/investor/wallet/create', {
        method: 'POST',
      });
      if (response.ok) {
        const data = await response.json();
        setWalletAddress(data.publicKey);
        setBalance(0);
      }
    } catch (error) {
      console.error('Failed to create wallet:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFaucetRequest = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/investor/wallet/faucet', {
        method: 'POST',
      });
      if (response.ok) {
        const data = await response.json();
        setBalance(data.newBalance);
        setFaucetCooldown(true);
        setTimeout(() => setFaucetCooldown(false), 60000);
      }
    } catch (error) {
      console.error('Failed to request faucet:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!session) return <div className="p-8 text-[#708078]">Loading...</div>;

  return (
    <DashboardLayout role={session.user.role}>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-semibold">Wallet</h1>
        <p className="mt-1 text-[#708078]">Demo cash for trying investments. No real value.</p>

        <div className="mt-6 grid gap-4">
          <article className="flex flex-wrap items-center justify-between gap-4 rounded-3xl bg-white p-6 shadow-sm">
            <div>
              <p className="text-sm text-[#708078]">Available cash</p>
              <p className="mt-2 text-4xl font-semibold">{formatCurrency(balance)}</p>
            </div>
            {!walletAddress ? (
              <Button className="bg-[#15C77A]" onClick={handleCreateWallet} disabled={loading}>
                {loading ? 'Preparing...' : 'Set up wallet'}
              </Button>
            ) : (
              <Button className="bg-[#15C77A]" onClick={handleFaucetRequest} disabled={loading || faucetCooldown}>
                {loading ? 'Adding...' : faucetCooldown ? 'Please wait' : 'Add demo funds'}
              </Button>
            )}
          </article>
          {walletAddress && (
            <details className="rounded-3xl bg-white p-5 text-sm shadow-sm">
              <summary className="cursor-pointer text-[#708078]">Advanced details</summary>
              <p className="mt-3 break-all font-mono text-xs">{walletAddress}</p>
            </details>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
