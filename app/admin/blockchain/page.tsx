'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { TestnetAddress } from '@/components/stellar/testnet-address';
import { useSession } from 'next-auth/react';

interface BlockchainConfig {
  alchemyApiKey: string;
  stellarRpcUrl: string;
  stellarHorizonUrl: string;
  stellarSorobanRpcUrl: string;
  enableSorobanContracts: boolean;
}

interface ModeState {
  mode: 'SIMULATION' | 'STELLAR_TESTNET';
  readiness: { ready: boolean; problems: string[]; publicKey: string | null };
}

interface SyncState { total: number; synced: number; }
interface ChainTransaction { id: string; type: string; entityType: string; entityId: string; status: string; txHash: string | null; error: string | null; attempts: number; createdAt: string; confirmedAt: string | null; firebase?: boolean; }

export default function BlockchainSettingsPage() {
  const { data: session } = useSession();
  const canConfigure = session?.user?.role === 'ADMIN';
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
  const [modeState, setModeState] = useState<ModeState | null>(null);
  const [switching, setSwitching] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncState, setSyncState] = useState<SyncState | null>(null);
  const [transactions, setTransactions] = useState<ChainTransaction[]>([]);
  const [alpha, setAlpha] = useState<{
    mode: string;
    network: string;
    asset?: { label?: string; issuer?: string | null; distributor?: string | null };
    contracts?: { registry?: string | null; facility?: string | null };
    facilities?: { id: string; facilityNo: string; status: string; chainStatus: string | null; participationUnits: number; stellarTxHash: string | null }[];
    events?: { id: string; eventType: string; txHash: string; ledger: number }[];
    attestations?: { id: string; documentType: string; documentHash: string }[];
  } | null>(null);

  const loadMode = async () => {
    const response = await fetch('/api/admin/financial-mode');
    const data = await response.json();
    if (response.ok) setModeState(data);
  };

  const loadSync = async () => {
    const response = await fetch('/api/admin/blockchain/sync');
    if (response.ok) setSyncState(await response.json());
  };

  const loadTransactions = async () => {
    const response = await fetch('/api/admin/blockchain/transactions');
    if (response.ok) setTransactions((await response.json()).transactions || []);
  };

  useEffect(() => {
    if (!syncing) return;
    const timer = window.setInterval(() => { loadSync(); loadTransactions(); }, 2000);
    return () => window.clearInterval(timer);
  }, [syncing]);

  const syncToTestnet = async () => {
    setSyncing(true);
    setMessage('Synchronizing canonical demo records to Stellar Testnet…');
    const response = await fetch('/api/admin/blockchain/sync', { method: 'POST' });
    const data = await response.json().catch(() => ({}));
    setMessage(response.ok
      ? `✅ Testnet sync complete: ${data.synced}/${data.total} records confirmed`
      : `❌ ${data.error || `Sync incomplete: ${data.synced || 0}/${data.total || 0}`}`);
    await loadSync();
    await loadTransactions();
    setSyncing(false);
  };

  const switchMode = async (mode: ModeState['mode']) => {
    setSwitching(true);
    setMessage('');
    const response = await fetch('/api/admin/financial-mode', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ mode }),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok) setMessage(`❌ ${data.error}: ${(data.readiness?.problems || []).join(', ')}`);
    else setMessage(`✅ Financial mode changed to ${mode === 'SIMULATION' ? 'Simulation' : 'Stellar Testnet'}`);
    await loadMode();
    setSwitching(false);
  };

  const provisionTestnet = async () => {
    setSwitching(true);
    setMessage('');
    const response = await fetch('/api/admin/financial-mode', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'provision' }),
    });
    const data = await response.json().catch(() => ({}));
    setMessage(response.ok ? '✅ Stellar Testnet operator created and funded' : `❌ ${data.error || 'Could not fund Testnet operator'}`);
    await loadMode();
    setSwitching(false);
  };

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

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- load the admin snapshot once on mount
    loadConfig();
    loadMode();
    loadSync();
    loadTransactions();
    fetch('/api/admin/blockchain/alpha').then((response) => response.ok ? response.json() : null).then(setAlpha).catch(() => undefined);
  }, []);

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
      <DashboardLayout role={session?.user?.role || 'ADMIN'}>
        <div className="p-6">Loading...</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout role={session?.user?.role || 'ADMIN'}>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Blockchain Settings</h1>
          <p className="text-gray-600 mt-2">
            Control the financial test mode and configure Stellar Testnet connectivity.
          </p>
          {!canConfigure && <p className="mt-3 inline-flex rounded-full bg-sky-50 px-3 py-1 text-xs font-semibold text-sky-800">Operations Admin · blockchain configuration and sync are read-only</p>}
        </div>

        {alpha && (
          <Card className="border-2 border-[#DCE6E1]">
            <CardHeader>
              <CardTitle>Alpha Testnet</CardTitle>
              <CardDescription>{alpha.mode} · {alpha.network} · {alpha.asset?.label}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p>VTAED issuer: {alpha.asset?.issuer || 'not issued'}</p>
              <p>Distribution account: {alpha.asset?.distributor || 'not issued'}</p>
              <p className="break-all">Wallet registry: {alpha.contracts?.registry ? <a className="text-[#0D7A52] underline" href={`https://stellar.expert/explorer/testnet/contract/${alpha.contracts.registry}`} target="_blank" rel="noreferrer">{alpha.contracts.registry}</a> : 'not deployed'}</p>
              <p className="break-all">Facility contract: {alpha.contracts?.facility ? <a className="text-[#0D7A52] underline" href={`https://stellar.expert/explorer/testnet/contract/${alpha.contracts.facility}`} target="_blank" rel="noreferrer">{alpha.contracts.facility}</a> : 'not deployed'}</p>
              <p><a className="text-[#0D7A52] underline" href="/admin/reconciliation">Reconciliation status</a></p>
              {alpha.asset?.issuer && <a className="inline-flex text-[#0D7A52] underline" href={`https://stellar.expert/explorer/testnet/account/${alpha.asset.issuer}`} target="_blank" rel="noreferrer">Issuer on Stellar Expert</a>}
              <div className="grid gap-2">
                {(alpha.facilities || []).map((facility) => (
                  <p key={facility.id}>{facility.facilityNo} · {facility.status} · {facility.chainStatus} · {facility.participationUnits} units {facility.stellarTxHash ? `· ${facility.stellarTxHash.slice(0, 10)}` : ''}</p>
                ))}
                {(alpha.events || []).slice(0, 6).map((event: { id: string; eventType: string; txHash: string; ledger: number }) => (
                  <p key={event.id}><a className="text-[#0D7A52] underline" href={`https://stellar.expert/explorer/testnet/tx/${event.txHash}`} target="_blank" rel="noreferrer">{event.eventType}</a> · ledger {event.ledger}</p>
                ))}
                {(alpha.attestations || []).map((row: { id: string; documentType: string; documentHash: string }) => (
                  <p key={row.id}>{row.documentType} · {row.documentHash.slice(0, 16)}</p>
                ))}
              </div>
              {canConfigure && <Button variant="outline" onClick={() => fetch('/api/admin/blockchain/index', { method: 'POST' }).then(() => fetch('/api/admin/blockchain/alpha').then((response) => response.json()).then(setAlpha))}>Index Soroban events</Button>}
              {canConfigure && <Button variant="outline" onClick={() => fetch('/api/admin/blockchain/alpha', { method: 'POST' }).then(() => fetch('/api/admin/blockchain/alpha').then((response) => response.json()).then(setAlpha))}>Prepare governance roles</Button>}
            </CardContent>
          </Card>
        )}

        <Card className="border-2 border-[#DCE6E1]">
          <CardHeader>
            <CardTitle>Financial execution mode</CardTitle>
            <CardDescription>Switch the whole platform between the internal simulation ledger and transactions recorded on Stellar Testnet.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              <button type="button" disabled={switching || !canConfigure} onClick={() => switchMode('SIMULATION')} className={`rounded-2xl border p-5 text-left disabled:cursor-not-allowed disabled:opacity-60 ${modeState?.mode === 'SIMULATION' ? 'border-[#0D7A52] bg-[#EAF9F1]' : 'border-[#E2E8F0] bg-white'}`}>
                <p className="font-semibold">Simulation</p><p className="mt-1 text-sm text-gray-600">Virtual tAED, instant demo settlement, no blockchain hashes.</p>
              </button>
              <button type="button" disabled={switching || !canConfigure || !modeState?.readiness.ready} onClick={() => switchMode('STELLAR_TESTNET')} className={`rounded-2xl border p-5 text-left disabled:cursor-not-allowed disabled:opacity-60 ${modeState?.mode === 'STELLAR_TESTNET' ? 'border-[#0D7A52] bg-[#EAF9F1]' : 'border-[#E2E8F0] bg-white'}`}>
                <p className="font-semibold">Stellar Testnet</p><p className="mt-1 text-sm text-gray-600">Real Testnet transactions and hashes. Still no real monetary value.</p>
              </button>
            </div>
            <div className={`mt-4 rounded-xl p-3 text-sm ${modeState?.readiness.ready ? 'bg-green-50 text-green-800' : 'bg-amber-50 text-amber-900'}`}>
              {modeState?.readiness.ready ? `Ready · operator ${modeState.readiness.publicKey?.slice(0, 8)}…${modeState.readiness.publicKey?.slice(-6)}` : `Not ready · ${modeState?.readiness.problems.join(' · ') || 'Checking configuration'}`}
            </div>
            {modeState?.readiness.publicKey && (
              <a className="mt-3 inline-flex break-all font-mono text-xs font-medium text-[#0D7A52] underline underline-offset-4" href={`https://stellar.expert/explorer/testnet/account/${modeState.readiness.publicKey}`} target="_blank" rel="noreferrer">
                {modeState.readiness.publicKey}
              </a>
            )}
            {canConfigure && !modeState?.readiness.ready && modeState?.readiness.problems.some((problem) => problem.includes('not funded')) && (
              <Button className="mt-3" variant="outline" disabled={switching} onClick={provisionTestnet}>Create and fund Testnet operator</Button>
            )}
          </CardContent>
        </Card>

        <Card className="border-[#B9E8D2]">
          <CardHeader>
            <CardTitle>Demo data synchronization</CardTitle>
            <CardDescription>Create one tamper-evident Stellar Testnet snapshot for each current facility, investment, paid installment, and wallet. Personal data is not written on-chain.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-2xl font-semibold text-[#13251E]">{syncState?.synced ?? 0} / {syncState?.total ?? 0}</p>
                <p className="text-sm text-gray-600">canonical records confirmed on Testnet</p>
              </div>
              <Button disabled={syncing || !canConfigure || modeState?.mode !== 'STELLAR_TESTNET' || !modeState?.readiness.ready} onClick={syncToTestnet}>
                {syncing ? 'Synchronizing…' : syncState && syncState.synced === syncState.total && syncState.total > 0 ? 'Already synchronized' : 'Sync demo data to Testnet'}
              </Button>
            </div>
            <div className="mt-4 h-2 overflow-hidden rounded-full bg-[#E5EEE9]">
              <div className="h-full rounded-full bg-[#0D9B68] transition-all duration-500" style={{ width: `${syncState?.total ? Math.round((syncState.synced / syncState.total) * 100) : 0}%` }} />
            </div>
            {modeState?.mode !== 'STELLAR_TESTNET' && <p className="mt-3 text-xs text-amber-700">Select Stellar Testnet above to enable synchronization.</p>}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Stellar transaction log</CardTitle>
            <CardDescription>Every submitted Testnet proof with its linked platform record and public explorer result.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[720px] text-left text-sm">
                <thead><tr className="border-b text-xs uppercase tracking-wide text-gray-500"><th className="py-3 pr-4">Operation</th><th className="py-3 pr-4">Record</th><th className="py-3 pr-4">Status</th><th className="py-3 pr-4">Confirmed</th><th className="py-3 text-right">Testnet address</th></tr></thead>
                <tbody className="divide-y">
                  {transactions.map((tx) => <tr key={tx.id}>
                    <td className="py-3 pr-4 font-medium text-[#13251E]">{tx.type.replaceAll('_', ' ')}{tx.firebase ? <span className="ml-2 rounded-full bg-[#FFF4E5] px-2 py-0.5 text-[10px] font-semibold text-[#C2410C]">Firebase</span> : null}</td>
                    <td className="py-3 pr-4"><span className="block text-gray-700">{tx.entityType}</span><span className="font-mono text-xs text-gray-400">{tx.entityId.slice(0, 12)}…</span></td>
                    <td className="py-3 pr-4"><span className={`rounded-full px-2.5 py-1 text-xs font-medium ${tx.status === 'CONFIRMED' ? 'bg-green-50 text-green-700' : tx.status === 'FAILED' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'}`}>{tx.status}</span></td>
                    <td className="py-3 pr-4 text-gray-600">{tx.confirmedAt ? new Date(tx.confirmedAt).toLocaleString() : '—'}</td>
                    <td className="py-3 text-right"><TestnetAddress hash={tx.txHash} /></td>
                  </tr>)}
                  {!transactions.length && <tr><td colSpan={5} className="py-8 text-center text-gray-500">No Stellar transactions yet.</td></tr>}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        {canConfigure && <Card>
          <CardHeader>
            <CardTitle>Runtime Testnet Configuration</CardTitle>
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
        </Card>}

        <Card className="border-amber-200 bg-amber-50">
          <CardHeader>
            <CardTitle>Security and production boundary</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm text-gray-700 space-y-2">
              <p>
                <strong>Alpha:</strong> Configuration values are stored in plaintext in the database.
              </p>
              <p>
                <strong>Production:</strong> Use a managed secrets vault, controlled signer, regulated settlement partners, and formal release approval.
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
