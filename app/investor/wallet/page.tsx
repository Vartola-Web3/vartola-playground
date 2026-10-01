'use client';
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { formatCurrency } from '@/lib/formatters';

export default function WalletFaucetPage() {
  const { data: session } = useSession();
  if (!session) return <div>Loading...</div>;
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

  if (!session) return <div>Loading...</div>;

  return (
    <DashboardLayout role={session.user.role}>
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Test Wallet & Faucet</h1>

        <div className="grid gap-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Stellar Testnet Wallet</h2>
            
            {!walletAddress ? (
              <div>
                <p className="text-gray-600 mb-4">
                  You don't have a Stellar Testnet wallet yet. Create one to start investing.
                </p>
                <Button onClick={handleCreateWallet} disabled={loading}>
                  {loading ? 'Creating...' : 'Create Testnet Wallet'}
                </Button>
              </div>
            ) : (
              <div>
                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-1">Your Wallet Address</p>
                  <div className="bg-gray-50 p-3 rounded border border-gray-200">
                    <p className="font-mono text-sm break-all">{walletAddress}</p>
                  </div>
                </div>

                <div className="mb-4">
                  <p className="text-sm text-gray-600 mb-1">tAED Balance (Test AED)</p>
                  <p className="text-3xl font-bold text-green-600">
                    {formatCurrency(balance)}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Test tokens only - no real value
                  </p>
                </div>

                <a
                  href={`https://stellar.expert/explorer/testnet/account/${walletAddress}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-600 hover:underline text-sm"
                >
                  View on Stellar Explorer →
                </a>
              </div>
            )}
          </Card>

          {walletAddress && (
            <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50">
              <h2 className="text-xl font-semibold mb-4">tAED Faucet</h2>
              <p className="text-gray-700 mb-4">
                Get free test AED tokens to try out investments on Stellar Testnet.
                Each request gives you <strong>10,000 tAED</strong>.
              </p>
              
              <Button
                onClick={handleFaucetRequest}
                disabled={loading || faucetCooldown}
                className="bg-gradient-to-r from-blue-600 to-purple-600"
              >
                {loading ? 'Processing...' : faucetCooldown ? 'Wait 60s...' : 'Request 10,000 tAED'}
              </Button>

              {faucetCooldown && (
                <p className="text-sm text-gray-500 mt-2">
                  Faucet cooldown active. You can request again in 60 seconds.
                </p>
              )}
            </Card>
          )}

          <Card className="p-6 bg-yellow-50">
            <h3 className="font-semibold mb-2">⚠️ Important Notice</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• This is <strong>Stellar Testnet</strong> - no real money involved</li>
              <li>• tAED tokens have <strong>zero real value</strong></li>
              <li>• For demonstration and testing purposes only</li>
              <li>• Production deployment requires proper KYC/AML and regulatory compliance</li>
            </ul>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">How to Use</h2>
            <ol className="text-sm text-gray-700 space-y-2 list-decimal list-inside">
              <li>Create your Stellar Testnet wallet (one-time)</li>
              <li>Use the faucet to get test tAED tokens</li>
              <li>Browse available investment pools</li>
              <li>Subscribe to pools with your tAED balance</li>
              <li>Receive monthly distributions from facility payments</li>
            </ol>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
