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
  const [reserved, setReserved] = useState<number>(0);
  const [deployed, setDeployed] = useState<number>(0);
  const [topUpAmount, setTopUpAmount] = useState('100000');
  const [reference, setReference] = useState('Demo card payment');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState<Array<{ id: string; description: string; amount: number; at: string; reviewUrl?: string | null }>>([]);
  async function initializeWallet() {
    try {
      const response = await fetch('/api/investor/wallet');
      if (response.ok) {
        const data = await response.json();
        setWalletAddress(data.publicKey || '');
        setBalance(data.balance || 0);
        setReserved(data.reserved || 0);
        setDeployed(data.deployed || 0);
        setTransactions(data.transactions || []);
      }
    } catch (error) {
      console.error('Failed to load wallet:', error);
    }
  }

  useEffect(() => {
    initializeWallet();
  }, []);

  const handleFaucetRequest = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/investor/wallet/faucet', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: Number(topUpAmount), reference }),
      });
      const data = await response.json();
      if (response.ok) {
        setBalance(data.newBalance);
        setMessage(data.reviewUrl ? 'Top-up recorded on Stellar.' : 'Top-up saved. Stellar reference pending.');
      } else {
        setMessage(data.error || 'Top-up failed.');
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
      <div className="w-full">
        <h1 className="text-3xl font-semibold">Wallet</h1>
        <p className="mt-1 text-[#708078]">Add demo funds, reserve them in an opportunity, and track capital after deployment.</p>

        <div className="mt-6 grid gap-4">
          <article className="rounded-3xl border border-[#E5ECE8] bg-white p-6 shadow-sm">
            <div className="grid gap-4 sm:grid-cols-3">
              <div><p className="text-sm text-[#708078]">Available</p><p className="mt-2 text-3xl font-semibold">{formatCurrency(balance)}</p></div>
              <div><p className="text-sm text-[#708078]">Reserved</p><p className="mt-2 text-3xl font-semibold">{formatCurrency(reserved)}</p></div>
              <div><p className="text-sm text-[#708078]">Deployed</p><p className="mt-2 text-3xl font-semibold">{formatCurrency(deployed)}</p></div>
            </div>
          </article>
          <article className="rounded-3xl border border-[#E5ECE8] bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Add demo funds</h2>
            <p className="mt-1 text-sm text-[#708078]">Simulates a successful card or bank payment. No real money is charged.</p>
            <div className="mt-4 grid gap-3 sm:grid-cols-2">
              <input className="rounded-xl border border-[#DCE6E1] px-3 py-2" inputMode="decimal" value={topUpAmount} onChange={(event) => setTopUpAmount(event.target.value)} aria-label="Top-up amount" />
              <input className="rounded-xl border border-[#DCE6E1] px-3 py-2" value={reference} onChange={(event) => setReference(event.target.value)} aria-label="Payment reference" />
            </div>
            <div className="mt-4">
              <Button onClick={handleFaucetRequest} disabled={loading}>
                {loading ? 'Adding...' : 'Confirm demo top-up'}
              </Button>
            </div>
            {message && <p className="mt-3 text-sm text-[#0A4934]">{message}</p>}
          </article>
          <article className="rounded-3xl border border-[#E5ECE8] bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold">Wallet activity</h2>
            <div className="mt-3 space-y-2 text-sm">
              {transactions.map((entry) => (
                <div key={entry.id} className="flex flex-wrap items-center justify-between gap-2 rounded-2xl border border-[#E5ECE8] px-3 py-2">
                  <span>{entry.description} · {formatCurrency(entry.amount)}</span>
                  {entry.reviewUrl ? <a className="font-medium text-[#0A4934] underline" href={entry.reviewUrl} target="_blank" rel="noreferrer">Stellar reference</a> : <span className="text-[#708078]">Stellar reference pending</span>}
                </div>
              ))}
              {transactions.length === 0 && <p className="text-[#708078]">No wallet activity yet.</p>}
            </div>
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
