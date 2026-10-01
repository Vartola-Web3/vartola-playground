'use client';
nexport const dynamic = 'force-dynamic';



'use client';
nexport const dynamic = 'force-dynamic';


import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
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
}

export default function PoolsBrowsePage() {
  const { data: session } = useSession();
  const [pools, setPools] = useState<Pool[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadPools();
  }, []);

  const loadPools = async () => {
    try {
      const response = await fetch('/api/investor/pools');
      if (response.ok) {
        const data = await response.json();
        setPools(data.pools);
      }
    } catch (error) {
      console.error('Failed to load pools:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!session) return <div>Loading...</div>;

  return (
    <DashboardLayout role={session.user.role}>
      <div>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-3xl font-bold">Available Investment Pools</h1>
            <p className="text-gray-600 mt-1">Browse and subscribe to financing pools</p>
          </div>
          <Link href="/investor/wallet">
            <Button variant="outline">My Wallet & Faucet</Button>
          </Link>
        </div>

        {loading ? (
          <div>Loading pools...</div>
        ) : pools.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-gray-500 text-lg">No investment pools available at the moment</p>
          </Card>
        ) : (
          <div className="grid gap-6">
            {pools.map((pool) => (
              <Card key={pool.id} className="p-6 hover:shadow-lg transition-shadow">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h2 className="text-2xl font-bold">{pool.poolName}</h2>
                    <p className="text-gray-600">{pool.poolNo}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    pool.status === 'OPEN' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {pool.status}
                  </span>
                </div>

                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Progress</span>
                    <span>{formatCurrency(pool.raisedAmount)} / {formatCurrency(pool.targetAmount)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all"
                      style={{ width: `${Math.min((pool.raisedAmount / pool.targetAmount) * 100, 100)}%` }}
                    />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    {((pool.raisedAmount / pool.targetAmount) * 100).toFixed(1)}% funded
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-4">
                  <div>
                    <p className="text-sm text-gray-600">Target Return</p>
                    <p className="text-2xl font-bold text-green-600">{pool.targetReturn}%</p>
                    <p className="text-xs text-gray-500">Annual</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Min Investment</p>
                    <p className="text-xl font-semibold">{formatCurrency(pool.minInvestment)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Remaining</p>
                    <p className="text-xl font-semibold">
                      {formatCurrency(pool.targetAmount - pool.raisedAmount)}
                    </p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-1">Asset Focus</p>
                  <p className="text-gray-900">{pool.assetFocus}</p>
                </div>

                {pool.status === 'OPEN' && (
                  <Link href={`/investor/pools/${pool.id}`}>
                    <Button className="w-full">View Details & Subscribe</Button>
                  </Link>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
