'use client';
nexport const dynamic = 'force-dynamic';



'use client';
nexport const dynamic = 'force-dynamic';


import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { formatCurrency } from '@/lib/formatters';

interface Pool {
  id: string;
  poolNo: string;
  poolName: string;
  targetAmount: number;
  raisedAmount: number;
  minInvestment: number;
  targetReturn: number;
  status: string;
  assetFocus: string;
  stellarPoolId: string | null;
}

export default function PoolDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data: session } = useSession();
  const [pool, setPool] = useState<Pool | null>(null);
  const [loading, setLoading] = useState(true);
  const [subscribing, setSubscribing] = useState(false);
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    loadPool();
  }, [params.id]);

  const loadPool = async () => {
    try {
      const response = await fetch(`/api/investor/pools/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setPool(data.pool);
      }
    } catch (error) {
      console.error('Failed to load pool:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    const investmentAmount = parseFloat(amount);
    if (!pool || !investmentAmount || investmentAmount < pool.minInvestment) {
      setError(`Minimum investment is ${formatCurrency(pool?.minInvestment || 0)}`);
      return;
    }

    setSubscribing(true);
    try {
      const response = await fetch('/api/investor/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          poolId: pool.id,
          amount: investmentAmount,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Subscription failed');
      }

      router.push('/investor');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Subscription failed');
    } finally {
      setSubscribing(false);
    }
  };

  if (!session) return <div>Loading...</div>;
  if (loading) return <div>Loading pool...</div>;
  if (!pool) return <div>Pool not found</div>;

  return (
    <DashboardLayout role={session.user.role}>
      <div className="max-w-4xl mx-auto">
        <Button variant="outline" onClick={() => router.back()} className="mb-6">
          ← Back to Pools
        </Button>

        <Card className="p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h1 className="text-3xl font-bold">{pool.poolName}</h1>
              <p className="text-gray-600">{pool.poolNo}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              pool.status === 'OPEN' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
            }`}>
              {pool.status}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-8">
            <div>
              <p className="text-sm text-gray-600 mb-1">Target Amount</p>
              <p className="text-2xl font-bold">{formatCurrency(pool.targetAmount)}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Amount Raised</p>
              <p className="text-2xl font-bold text-blue-600">{formatCurrency(pool.raisedAmount)}</p>
              <p className="text-sm text-gray-500">
                {((pool.raisedAmount / pool.targetAmount) * 100).toFixed(1)}% funded
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Target Return</p>
              <p className="text-2xl font-bold text-green-600">{pool.targetReturn}%</p>
              <p className="text-sm text-gray-500">Annual</p>
            </div>
            <div>
              <p className="text-sm text-gray-600 mb-1">Minimum Investment</p>
              <p className="text-2xl font-bold">{formatCurrency(pool.minInvestment)}</p>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-xl font-semibold mb-2">Asset Focus</h2>
            <p className="text-gray-700">{pool.assetFocus}</p>
          </div>

          {pool.stellarPoolId && (
            <div className="mb-8 p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-gray-600 mb-1">Stellar Pool ID</p>
              <p className="font-mono text-sm break-all">{pool.stellarPoolId}</p>
            </div>
          )}

          {pool.status === 'OPEN' && (
            <form onSubmit={handleSubscribe} className="border-t pt-6">
              <h2 className="text-xl font-semibold mb-4">Subscribe to this Pool</h2>
              
              {error && (
                <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                  {error}
                </div>
              )}

              <div className="mb-4">
                <label className="block text-sm font-medium mb-1">
                  Investment Amount (AED)
                </label>
                <Input
                  type="number"
                  min={pool.minInvestment}
                  step="1000"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder={pool.minInvestment.toString()}
                  required
                />
                <p className="text-sm text-gray-500 mt-1">
                  Minimum: {formatCurrency(pool.minInvestment)}
                </p>
              </div>

              <Button type="submit" disabled={subscribing} className="w-full">
                {subscribing ? 'Processing...' : 'Subscribe Now'}
              </Button>

              <p className="text-xs text-gray-500 mt-4 text-center">
                By subscribing, you confirm you have sufficient tAED tokens in your wallet.
                <br />
                This is a Stellar Testnet demo with no real funds.
              </p>
            </form>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
