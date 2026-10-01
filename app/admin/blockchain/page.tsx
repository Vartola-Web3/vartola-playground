'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import DashboardLayout from '@/components/layout/dashboard-layout';

interface BlockchainConfig {
  alchemyApiKey: string;
  stellarRpcUrl: string;
  stellarHorizonUrl: string;
  stellarSorobanRpcUrl: string;
  enableSorobanContracts: boolean;
}

export default function BlockchainSettingsPage() {
  const [config, setConfig] = useState<BlockchainConfig>({
    alchemyApiKey: '',
    stellarRpcUrl: '',
    stellarHorizonUrl: '',
    stellarSorobanRpcUrl: '',
    enableSorobanContracts: false,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const response = await fetch('/api/admin/blockchain/settings');
      const data = await response.json();
      if (data.success) {
        setConfig(data.config);
      }
    } catch (error) {
      console.error('Failed to load config:', error);
      setMessage('Failed to load configuration');
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async () => {
    setSaving(true);
    setMessage('');

    try {
      const response = await fetch('/api/admin/blockchain/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      const data = await response.json();
      if (data.success) {
        setMessage('✅ Settings saved successfully (LIVE config active)');
        setConfig(data.config);
      } else {
        setMessage(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      console.error('Failed to save config:', error);
      setMessage('❌ Failed to save configuration');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <DashboardLayout role="ADMIN">
        <div className="p-6">Loading...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role="ADMIN">
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Blockchain Settings</h1>
          <p className="text-gray-600 mt-2">
            Configure LIVE Stellar RPC and Alchemy settings (stored in database)
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Live Configuration</CardTitle>
            <CardDescription>
              These settings are stored in the database and used at runtime.
              Environment variables (.env.local) are only used as fallback if database values are empty.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">
                Alchemy API Key
              </label>
              <Input
                type="password"
                value={config.alchemyApiKey}
                onChange={(e) => setConfig({ ...config, alchemyApiKey: e.target.value })}
                placeholder="your_alchemy_api_key_here"
              />
              <p className="text-xs text-gray-500 mt-1">
                Get your API key from https://dashboard.alchemy.com/
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Stellar RPC URL (Alchemy)
              </label>
              <Input
                type="text"
                value={config.stellarRpcUrl}
                onChange={(e) => setConfig({ ...config, stellarRpcUrl: e.target.value })}
                placeholder="https://stellar-testnet.g.alchemy.com/v2/YOUR_KEY"
              />
              <p className="text-xs text-gray-500 mt-1">
                Primary RPC endpoint for Stellar operations
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Stellar Horizon URL (Fallback)
              </label>
              <Input
                type="text"
                value={config.stellarHorizonUrl}
                onChange={(e) => setConfig({ ...config, stellarHorizonUrl: e.target.value })}
                placeholder="https://horizon-testnet.stellar.org"
              />
              <p className="text-xs text-gray-500 mt-1">
                Public Horizon endpoint (fallback)
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">
                Soroban RPC URL (Fallback)
              </label>
              <Input
                type="text"
                value={config.stellarSorobanRpcUrl}
                onChange={(e) => setConfig({ ...config, stellarSorobanRpcUrl: e.target.value })}
                placeholder="https://soroban-testnet.stellar.org"
              />
              <p className="text-xs text-gray-500 mt-1">
                Public Soroban RPC endpoint (fallback)
              </p>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="enableSoroban"
                checked={config.enableSorobanContracts}
                onChange={(e) => setConfig({ ...config, enableSorobanContracts: e.target.checked })}
                className="rounded"
              />
              <label htmlFor="enableSoroban" className="text-sm font-medium">
                Enable Soroban Smart Contracts (⚠️ Requires deployed contracts)
              </label>
            </div>

            {message && (
              <div className={`p-3 rounded ${message.startsWith('✅') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'}`}>
                {message}
              </div>
            )}

            <div className="flex space-x-4">
              <Button onClick={saveConfig} disabled={saving}>
                {saving ? 'Saving...' : 'Save Settings'}
              </Button>
              <Button variant="outline" onClick={loadConfig} disabled={loading}>
                Reset to Current
              </Button>
            </div>

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded">
              <h3 className="font-semibold text-blue-900 mb-2">💡 Configuration Priority</h3>
              <ol className="text-sm text-blue-800 space-y-1 list-decimal list-inside">
                <li>Database (SystemSettings) - <strong>LIVE config</strong></li>
                <li>Environment variables (.env.local) - Fallback only</li>
              </ol>
              <p className="text-xs text-blue-700 mt-2">
                Changes take effect immediately. Stellar provider will be recreated with new settings.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>⚠️ Security Notice</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-700 space-y-2">
              <p>
                <strong>Prototype Mode:</strong> Configuration values are stored in plaintext in the database.
              </p>
              <p>
                <strong>For Production:</strong> Implement encryption for sensitive values (API keys, secrets).
              </p>
              <p>
                <strong>Testnet Only:</strong> These settings are for Stellar Testnet. No real money involved.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
