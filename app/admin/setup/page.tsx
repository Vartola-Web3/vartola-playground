'use client';
export const dynamic = 'force-dynamic';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import DashboardLayout from '@/components/layout/dashboard-layout';

interface PlatformConfig {
  stellarNetwork: string;
  stellarHorizonUrl: string;
  firebaseProjectId: string;
  emailProvider: string;
  paymentProvider: string;
  identityProvider: string;
  rampProvider: string;
  settlementProvider: string;
  aecbApiUrl: string;
  storageType: string;
}

export default function AdminSetupPage() {
  const { data: session } = useSession();
  if (!session) return <div>Loading...</div>;
  const [config, setConfig] = useState<PlatformConfig>({
    stellarNetwork: 'testnet',
    stellarHorizonUrl: 'https://horizon-testnet.stellar.org',
    firebaseProjectId: '',
    emailProvider: 'console',
    paymentProvider: 'console',
    identityProvider: 'sumsub-sandbox',
    rampProvider: 'transak-sandbox',
    settlementProvider: 'circle-sandbox',
    aecbApiUrl: '',
    storageType: 'local',
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [testUser, setTestUser] = useState({ email: '', password: '' });
  const [creatingTest, setCreatingTest] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const response = await fetch('/api/admin/config');
      if (response.ok) {
        const data = await response.json();
        if (data.config) {
          setConfig((current) => ({ ...current, ...data.config }));
        }
      }
    } catch (error) {
      console.error('Failed to load config:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');

    try {
      const response = await fetch('/api/admin/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config),
      });

      if (response.ok) {
        setMessage('Configuration saved successfully!');
      } else {
        setMessage('Failed to save configuration');
      }
    } catch (error) {
      setMessage('Error saving configuration');
    } finally {
      setSaving(false);
    }
  };

  const handleCreateTestAdmin = async () => {
    setCreatingTest(true);
    try {
      const response = await fetch('/api/admin/setup/test-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: 'setup@assetfi.ae',
          password: 'setup123',
          name: 'Test Admin',
          role: 'ADMIN',
        }),
      });

      if (response.ok) {
        setTestUser({ email: 'setup@assetfi.ae', password: 'setup123' });
        setMessage('Test admin created successfully!');
      }
    } catch (error) {
      setMessage('Failed to create test admin');
    } finally {
      setCreatingTest(false);
    }
  };

  if (!session || session.user.role !== 'ADMIN') {
    return <div>Access denied</div>;
  }

  if (loading) return <div>Loading...</div>;

  return (
    <DashboardLayout role={session.user.role}>
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-2">Platform Configuration</h1>
        <p className="text-gray-600 mb-6">
          Configure system settings and integration keys. All secrets are encrypted at rest using AES-256-GCM.
        </p>

        {message && (
          <div className={`p-4 rounded mb-6 ${message.includes('success') ? 'bg-green-50 text-green-700' : 'bg-yellow-50 text-yellow-700'}`}>
            {message}
          </div>
        )}

        <div className="grid gap-6">
          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Stellar Network Configuration</h2>
            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Network</label>
                <select
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  value={config.stellarNetwork}
                  onChange={(e) => setConfig({ ...config, stellarNetwork: e.target.value })}
                >
                  <option value="testnet">Testnet (Default for Demo)</option>
                  <option value="mainnet" disabled>Mainnet (Production Only)</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  ⚠️ Stay on Testnet for grant/demo. Mainnet requires production compliance.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Horizon API URL</label>
                <Input
                  value={config.stellarHorizonUrl}
                  onChange={(e) => setConfig({ ...config, stellarHorizonUrl: e.target.value })}
                  placeholder="https://horizon-testnet.stellar.org"
                />
              </div>

              <h2 className="text-xl font-semibold mb-4 mt-6">Firebase Configuration</h2>
              <div>
                <label className="block text-sm font-medium mb-1">Firebase Project ID</label>
                <Input
                  value={config.firebaseProjectId}
                  onChange={(e) => setConfig({ ...config, firebaseProjectId: e.target.value })}
                  placeholder="your-project-id"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Find this in Firebase Console → Project Settings
                </p>
              </div>

              <h2 className="text-xl font-semibold mb-4 mt-6">Integration architecture</h2>

              <div className="grid gap-3 sm:grid-cols-2">
                {[
                  ['Identity & business verification', 'Sumsub Sandbox', 'KYC · KYB · AML · UBO'],
                  ['Fiat on/off-ramp', 'Transak Sandbox', 'AED quote · card/bank · USDC'],
                  ['Treasury settlement', 'Circle Sandbox', 'USDC on Stellar · payouts'],
                  ['Blockchain', 'Stellar Testnet', 'Transactions · fees · explorer'],
                ].map(([title, provider, detail]) => (
                  <div key={title} className="rounded-2xl border border-[#DCE6E1] bg-[#F8FBF9] p-4">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-semibold">{title}</p>
                      <span className="rounded-full bg-amber-100 px-2 py-1 text-[11px] font-semibold text-amber-900">Needs sandbox key</span>
                    </div>
                    <p className="mt-2 text-sm text-[#0D7A52]">{provider}</p>
                    <p className="mt-1 text-xs text-gray-500">{detail}</p>
                  </div>
                ))}
              </div>

              <div className="mt-5 grid gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-sm font-medium mb-1">KYC / KYB provider</label>
                  <select className="w-full rounded-md border border-gray-300 px-3 py-2" value={config.identityProvider} onChange={(e) => setConfig({ ...config, identityProvider: e.target.value })}>
                    <option value="simulation">Simulation</option>
                    <option value="sumsub-sandbox">Sumsub Sandbox</option>
                    <option value="veriff-sandbox">Veriff Sandbox</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">On/off-ramp provider</label>
                  <select className="w-full rounded-md border border-gray-300 px-3 py-2" value={config.rampProvider} onChange={(e) => setConfig({ ...config, rampProvider: e.target.value })}>
                    <option value="simulation">Simulation</option>
                    <option value="transak-sandbox">Transak Sandbox</option>
                    <option value="banxa-sandbox">Banxa Sandbox</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Settlement provider</label>
                  <select className="w-full rounded-md border border-gray-300 px-3 py-2" value={config.settlementProvider} onChange={(e) => setConfig({ ...config, settlementProvider: e.target.value })}>
                    <option value="simulation">Simulation</option>
                    <option value="circle-sandbox">Circle Sandbox</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-1">Email Provider</label>
                <select
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  value={config.emailProvider}
                  onChange={(e) => setConfig({ ...config, emailProvider: e.target.value })}
                >
                  <option value="console">Console (Dev - logs only)</option>
                  <option value="smtp">SMTP (Requires credentials)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">Payment Gateway</label>
                <select
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  value={config.paymentProvider}
                  onChange={(e) => setConfig({ ...config, paymentProvider: e.target.value })}
                >
                  <option value="console">Console (Dev - stub)</option>
                  <option value="stripe">Stripe (Requires API key)</option>
                  <option value="checkout">Checkout.com (Requires credentials)</option>
                  <option value="transak-sandbox">Transak Sandbox (fiat ↔ USDC)</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">AECB API URL (KYB/Credit Bureau)</label>
                <Input
                  value={config.aecbApiUrl}
                  onChange={(e) => setConfig({ ...config, aecbApiUrl: e.target.value })}
                  placeholder="https://api.aecb.ae/v1 (stub for now)"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Production requires AECB partnership and API credentials
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">File Storage</label>
                <select
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  value={config.storageType}
                  onChange={(e) => setConfig({ ...config, storageType: e.target.value })}
                >
                  <option value="local">Local Filesystem (Dev)</option>
                  <option value="s3">AWS S3 (Production)</option>
                  <option value="gcs">Google Cloud Storage</option>
                </select>
              </div>

              <Button type="submit" disabled={saving} className="w-full">
                {saving ? 'Saving...' : 'Save Configuration'}
              </Button>
            </form>
          </Card>

          <Card className="p-6 bg-blue-50">
            <h2 className="text-xl font-semibold mb-4">Quick Test Setup</h2>
            <p className="text-gray-700 mb-4">
              Create a test admin account for easy demo access:
            </p>
            
            {testUser.email ? (
              <div className="bg-white p-4 rounded border border-blue-200">
                <p className="font-semibold mb-2">Test Admin Credentials:</p>
                <p className="text-sm"><strong>Email:</strong> {testUser.email}</p>
                <p className="text-sm"><strong>Password:</strong> {testUser.password}</p>
              </div>
            ) : (
              <Button onClick={handleCreateTestAdmin} disabled={creatingTest}>
                {creatingTest ? 'Creating...' : 'Create Test Admin (setup@assetfi.ae / setup123)'}
              </Button>
            )}
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">What you need for real sandbox tests</h2>
            <div className="grid gap-4 text-sm sm:grid-cols-2">
              <div className="rounded-2xl bg-[#F8FBF9] p-4"><p className="font-semibold">Sumsub</p><p className="mt-2 text-gray-600">Sandbox account, app token, secret key, applicant level name, and webhook secret.</p></div>
              <div className="rounded-2xl bg-[#F8FBF9] p-4"><p className="font-semibold">Transak</p><p className="mt-2 text-gray-600">Partner sandbox account, API key, allowed domains, callback URL, and confirmation of the AED/USDC-Stellar pair.</p></div>
              <div className="rounded-2xl bg-[#F8FBF9] p-4"><p className="font-semibold">Circle</p><p className="mt-2 text-gray-600">Developer sandbox account, API key, webhook public key, and Stellar wallet configuration.</p></div>
              <div className="rounded-2xl bg-[#F8FBF9] p-4"><p className="font-semibold">Stellar</p><p className="mt-2 text-gray-600">Testnet keypairs funded with Friendbot. No real money or production account is needed.</p></div>
            </div>
            <p className="mt-4 text-xs text-gray-500">Secrets belong in server environment variables only. This screen stores provider selection, never API secrets.</p>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Configuration Guidelines</h2>
            <div className="space-y-3 text-sm text-gray-700">
              <div>
                <h3 className="font-semibold">Stellar Network:</h3>
                <p>• Use <strong>Testnet</strong> for development and grant demo</p>
                <p>• Mainnet requires production compliance, licensed partner, and full KYC/AML</p>
              </div>
              
              <div>
                <h3 className="font-semibold">Firebase:</h3>
                <p>• Create a Firebase project at <a href="https://console.firebase.google.com" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">console.firebase.google.com</a></p>
                <p>• Enable Firestore Database</p>
                <p>• Download service account JSON and add credentials to .env</p>
              </div>
              
              <div>
                <h3 className="font-semibold">Email Notifications:</h3>
                <p>• Console mode: logs email content to console (dev only)</p>
                <p>• SMTP: configure credentials in .env file</p>
              </div>
              
              <div>
                <h3 className="font-semibold">Payment Gateway:</h3>
                <p>• Console mode: stub implementation (logs only)</p>
                <p>• Production: requires licensed payment processor partnership</p>
              </div>
              
              <div>
                <h3 className="font-semibold">AECB Integration:</h3>
                <p>• Stub implementation for MVP</p>
                <p>• Production requires AECB partnership and API access</p>
                <p>• Used for company credit checks and KYB verification</p>
              </div>
              
              <div>
                <h3 className="font-semibold">File Storage:</h3>
                <p>• Local: files stored in ./uploads directory (dev only)</p>
                <p>• S3/GCS: production-grade object storage (requires credentials)</p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-yellow-50">
            <h3 className="font-semibold mb-2">🔒 Security Notes</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• All secrets are encrypted at rest using AES-256-GCM</li>
              <li>• Never commit real credentials to git</li>
              <li>• Use environment variables for sensitive data</li>
              <li>• Production deployment requires additional security hardening</li>
              <li>• This is a prototype - not production-ready for real funds</li>
            </ul>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
