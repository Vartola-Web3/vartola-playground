'use client';
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
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
  createdAt: string;
}

export default function PoolsManagementPage() {
  const { data: session } = useSession();
  const [pools, setPools] = useState<Pool[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [formData, setFormData] = useState({
    poolName: '',
    targetAmount: '',
    minInvestment: '',
    targetReturn: '',
    assetFocus: '',
  });

  useEffect(() => {
    loadPools();
  }, []);

  const loadPools = async () => {
    try {
      const response = await fetch('/api/admin/pools');
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

  const handleCreatePool = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/admin/pools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          targetAmount: parseFloat(formData.targetAmount),
          minInvestment: parseFloat(formData.minInvestment),
          targetReturn: parseFloat(formData.targetReturn),
        }),
      });

      if (response.ok) {
        setShowCreateForm(false);
        setFormData({
          poolName: '',
          targetAmount: '',
          minInvestment: '',
          targetReturn: '',
          assetFocus: '',
        });
        loadPools();
      }
    } catch (error) {
      console.error('Failed to create pool:', error);
    }
  };

  if (!session || session.user.role !== 'ADMIN') {
    return <div>Access denied</div>;
  }

  return (
    <DashboardLayout role={session.user.role}>
      <div>
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-3xl font-bold">Investment Pools Management</h1>
          <Button onClick={() => setShowCreateForm(!showCreateForm)}>
            {showCreateForm ? 'Cancel' : 'Create New Pool'}
          </Button>
        </div>

        {showCreateForm && (
          <Card className="p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">Create New Pool</h2>
            <form onSubmit={handleCreatePool} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Pool Name</label>
                  <Input
                    required
                    value={formData.poolName}
                    onChange={(e) => setFormData({ ...formData, poolName: e.target.value })}
                    placeholder="Logistics Pool 001"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Asset Focus</label>
                  <Input
                    required
                    value={formData.assetFocus}
                    onChange={(e) => setFormData({ ...formData, assetFocus: e.target.value })}
                    placeholder="UAE Commercial Trucks & Vans"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Target Amount (AED)</label>
                  <Input
                    type="number"
                    required
                    min="100000"
                    step="10000"
                    value={formData.targetAmount}
                    onChange={(e) => setFormData({ ...formData, targetAmount: e.target.value })}
                    placeholder="500000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Min Investment (AED)</label>
                  <Input
                    type="number"
                    required
                    min="10000"
                    step="5000"
                    value={formData.minInvestment}
                    onChange={(e) => setFormData({ ...formData, minInvestment: e.target.value })}
                    placeholder="25000"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Target Return (%)</label>
                  <Input
                    type="number"
                    required
                    min="5"
                    max="20"
                    step="0.5"
                    value={formData.targetReturn}
                    onChange={(e) => setFormData({ ...formData, targetReturn: e.target.value })}
                    placeholder="9.5"
                  />
                </div>
              </div>
              <Button type="submit">Create Pool</Button>
            </form>
          </Card>
        )}

        {loading ? (
          <div>Loading pools...</div>
        ) : (
          <div className="grid gap-4">
            {pools.map((pool) => (
              <Card key={pool.id} className="p-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-xl font-semibold">{pool.poolName}</h3>
                    <p className="text-gray-600">{pool.poolNo}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    pool.status === 'OPEN' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                  }`}>
                    {pool.status}
                  </span>
                </div>
                <div className="grid grid-cols-4 gap-4 mt-4">
                  <div>
                    <p className="text-sm text-gray-600">Target Amount</p>
                    <p className="font-semibold">{formatCurrency(pool.targetAmount)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Raised</p>
                    <p className="font-semibold">{formatCurrency(pool.raisedAmount)}</p>
                    <p className="text-xs text-gray-500">
                      {((pool.raisedAmount / pool.targetAmount) * 100).toFixed(1)}%
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Target Return</p>
                    <p className="font-semibold">{pool.targetReturn}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Min Investment</p>
                    <p className="font-semibold">{formatCurrency(pool.minInvestment)}</p>
                  </div>
                </div>
                <div className="mt-4">
                  <p className="text-sm text-gray-600">Asset Focus</p>
                  <p className="text-gray-900">{pool.assetFocus}</p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
