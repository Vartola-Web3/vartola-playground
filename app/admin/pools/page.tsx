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
  facilities?: Array<{
    id: string;
    facilityNo: string;
    financeAmount: number;
    application: { applicationNo: string; assetDescription: string; status: string };
  }>;
}

export default function PoolsManagementPage() {
  const { data: session, status } = useSession();
  const [pools, setPools] = useState<Pool[]>([]);
  const [available, setAvailable] = useState<Array<{ id: string; facilityNo: string; financeAmount: number; application: { applicationNo: string; assetDescription: string } }>>([]);
  const [picked, setPicked] = useState<Record<string, string>>({});
  const [loadError, setLoadError] = useState('');
  const [loading, setLoading] = useState(true);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [selectedAssets, setSelectedAssets] = useState<string[]>([]);
  const [formData, setFormData] = useState({
    poolName: '',
    minInvestment: '',
    targetReturn: '',
    assetFocus: '',
  });

  const loadPools = async () => {
    try {
      const response = await fetch('/api/admin/pools');
      const data = await response.json().catch(() => ({}));
      if (!response.ok) {
        setLoadError(data.error || 'Could not load approved assets');
        return;
      }
      setLoadError('');
      setPools(data.pools || []);
      setAvailable(data.availableFacilities || []);
    } catch (error) {
      console.error('Failed to load pools:', error);
      setLoadError('Could not load approved assets');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'authenticated') loadPools();
  }, [status]);

  const handleCreatePool = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/admin/pools', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          minInvestment: parseFloat(formData.minInvestment),
          targetReturn: parseFloat(formData.targetReturn),
          facilityIds: selectedAssets,
        }),
      });

      if (response.ok) {
        setShowCreateForm(false);
        setSelectedAssets([]);
        setFormData({
          poolName: '',
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
          <h1 className="text-3xl font-semibold">Investment opportunities</h1>
          <Button onClick={() => setShowCreateForm(!showCreateForm)}>
            {showCreateForm ? 'Cancel' : 'New opportunity'}
          </Button>
        </div>

        {showCreateForm && (
          <Card className="p-6 mb-6">
            <h2 className="text-xl font-semibold mb-4">New opportunity</h2>
            <form onSubmit={handleCreatePool} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Opportunity name</label>
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
              <div className="grid grid-cols-2 gap-4">
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
              <div>
                <p className="text-sm font-medium mb-2">Assets in this pool</p>
                {available.length === 0 ? (
                  <p className="text-sm text-gray-500">No approved asset is waiting. You can add assets after the pool exists.</p>
                ) : (
                  <ul className="space-y-2">
                    {available.map((facility) => (
                      <li key={facility.id}>
                        <label className="flex items-center gap-2 text-sm">
                          <input
                            type="checkbox"
                            checked={selectedAssets.includes(facility.id)}
                            onChange={(e) =>
                              setSelectedAssets((current) =>
                                e.target.checked
                                  ? [...current, facility.id]
                                  : current.filter((id) => id !== facility.id)
                              )
                            }
                          />
                          <span>
                            {facility.application.applicationNo} · {facility.application.assetDescription} · {formatCurrency(facility.financeAmount)}
                          </span>
                        </label>
                      </li>
                    ))}
                  </ul>
                )}
                <p className="mt-3 text-sm text-gray-700">
                  Investment size: {formatCurrency(available.filter((facility) => selectedAssets.includes(facility.id)).reduce((sum, facility) => sum + facility.financeAmount, 0))}
                </p>
              </div>
              <Button type="submit">Publish opportunity</Button>
            </form>
          </Card>
        )}

        <Card className="p-6">
          <h2 className="text-lg font-semibold">Approved assets not in a pool</h2>
          <p className="mt-1 text-sm text-gray-600">
            These financed assets are approved and can be added to an open pool. Create the pool first, then choose it here.
          </p>
          {loadError && <p className="mt-4 text-sm text-rose-700">{loadError}</p>}
          {available.length === 0 ? (
            <p className="mt-4 text-sm text-gray-500">No approved asset is waiting outside a pool.</p>
          ) : (
            <ul className="mt-4 space-y-3">
              {available.map((facility) => (
                <li key={facility.id} className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-[#E2E8F0] px-4 py-3">
                  <div>
                    <p className="font-medium">{facility.application.applicationNo}</p>
                    <p className="text-sm text-gray-600">
                      {facility.facilityNo} · {facility.application.assetDescription} · {formatCurrency(facility.financeAmount)}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <select
                      className="rounded-xl border border-[#E2E8F0] px-3 py-2 text-sm"
                      value={picked[facility.id] || ''}
                      onChange={(e) => setPicked({ ...picked, [facility.id]: e.target.value })}
                    >
                      <option value="">Choose pool</option>
                      {pools.map((pool) => (
                        <option key={pool.id} value={pool.id}>{pool.poolName}</option>
                      ))}
                    </select>
                    <Button
                      type="button"
                      disabled={!picked[facility.id]}
                      onClick={async () => {
                        const res = await fetch(`/api/admin/pools/${picked[facility.id]}`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ facilityId: facility.id }),
                        });
                        if (res.ok) loadPools();
                      }}
                    >
                      Add to pool
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>

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
                <div className="grid grid-cols-3 gap-4 mt-4">
                  <div>
                    <p className="text-sm text-gray-600">Investment size</p>
                    <p className="font-semibold">{formatCurrency(pool.raisedAmount)}</p>
                    <p className="text-xs text-gray-500">Sum of linked assets</p>
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
                <div className="mt-4">
                  <p className="text-sm text-gray-600">Linked projects</p>
                  {pool.facilities && pool.facilities.length > 0 ? (
                    <ul className="mt-1 space-y-1 text-sm">
                      {pool.facilities.map((facility) => (
                        <li key={facility.id}>
                          {facility.facilityNo} · {facility.application.applicationNo} · {facility.application.assetDescription} · {formatCurrency(facility.financeAmount)}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-gray-500">No financed project is linked yet.</p>
                  )}
                  <div className="mt-3 flex flex-wrap items-center gap-2">
                    <select
                      className="rounded-xl border border-[#E2E8F0] px-3 py-2 text-sm"
                      value={picked[pool.id] || ''}
                      onChange={(e) => setPicked({ ...picked, [pool.id]: e.target.value })}
                    >
                      <option value="">Add an asset</option>
                      {available.map((facility) => (
                        <option key={facility.id} value={facility.id}>
                          {facility.facilityNo} · {facility.application.assetDescription} · {formatCurrency(facility.financeAmount)}
                        </option>
                      ))}
                    </select>
                    <Button
                      type="button"
                      disabled={!picked[pool.id]}
                      onClick={async () => {
                        const res = await fetch(`/api/admin/pools/${pool.id}`, {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ facilityId: picked[pool.id] }),
                        });
                        if (res.ok) {
                          setPicked({ ...picked, [pool.id]: '' });
                          loadPools();
                        }
                      }}
                    >
                      Add asset
                    </Button>
                  </div>
                  <button
                    type="button"
                    className="mt-3 text-sm text-rose-700"
                    onClick={async () => {
                      if (!confirm('Delete this pool? Linked projects stay, but they are no longer in this pool.')) return;
                      const res = await fetch(`/api/admin/pools/${pool.id}`, { method: 'DELETE' });
                      if (res.ok) loadPools();
                    }}
                  >
                    Delete pool
                  </button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
