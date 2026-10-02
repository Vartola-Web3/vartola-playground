'use client';
export const dynamic = 'force-dynamic';

import { use, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { TicketThread, TicketMessage } from '@/components/applications/ticket-thread';
import { formatCurrency } from '@/lib/formatters';

interface Application {
  id: string;
  applicationNo: string;
  assetType: string;
  assetDescription: string;
  assetValue: number;
  smeContribution: number;
  financeAmount: number;
  requestedTerm: number;
  status: string;
  companyRiskScore: number | null;
  assetRiskScore: number | null;
  dealRiskScore: number | null;
  riskTier: string | null;
  createdAt: string;
  updatedAt: string;
  documents: Array<{
    id: string;
    documentType: string;
    fileName: string;
    uploadedAt: string;
  }>;
  reviews: TicketMessage[];
}

const EDITABLE = ['DRAFT', 'SUBMITTED', 'UNDER_REVIEW', 'CONDITIONALLY_APPROVED'];

export default function ApplicationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [editing, setEditing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [form, setForm] = useState({
    assetType: '',
    assetDescription: '',
    assetValue: '',
    smeContribution: '',
    financeAmount: '',
    requestedTerm: '36',
  });

  const loadApplication = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/sme/applications/${id}`);
      if (!response.ok) {
        const body = await response.json().catch(() => ({}));
        throw new Error(body.error || 'Failed to load application');
      }
      const data = await response.json();
      setApplication(data.application);
      setForm({
        assetType: data.application.assetType || 'TRUCK',
        assetDescription: data.application.assetDescription || '',
        assetValue: String(data.application.assetValue ?? ''),
        smeContribution: String(data.application.smeContribution ?? ''),
        financeAmount: String(data.application.financeAmount ?? ''),
        requestedTerm: String(data.application.requestedTerm ?? '36'),
      });
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load application');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (sessionStatus === 'authenticated' && id) loadApplication();
  }, [id, sessionStatus]);

  useEffect(() => {
    const assetValue = parseFloat(form.assetValue) || 0;
    const contribution = parseFloat(form.smeContribution) || 0;
    if (assetValue > 0 && contribution >= 0) {
      setForm((prev) => ({ ...prev, financeAmount: String(Math.max(assetValue - contribution, 0)) }));
    }
  }, [form.assetValue, form.smeContribution]);

  const patch = async (body: Record<string, unknown>) => {
    setBusy(true);
    setError('');
    try {
      const res = await fetch(`/api/sme/applications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Update failed');
      setApplication(data.application);
      setEditing(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Update failed');
    } finally {
      setBusy(false);
    }
  };

  const saveEdits = () =>
    patch({
      assetType: form.assetType,
      assetDescription: form.assetDescription,
      assetValue: parseFloat(form.assetValue),
      smeContribution: parseFloat(form.smeContribution),
      financeAmount: parseFloat(form.financeAmount),
      requestedTerm: parseInt(form.requestedTerm, 10),
    });

  const saveDraft = () =>
    patch({
      assetType: form.assetType,
      assetDescription: form.assetDescription,
      assetValue: parseFloat(form.assetValue),
      smeContribution: parseFloat(form.smeContribution),
      financeAmount: parseFloat(form.financeAmount),
      requestedTerm: parseInt(form.requestedTerm, 10),
      status: 'DRAFT',
    });

  const submitDraft = () =>
    patch({
      assetType: form.assetType,
      assetDescription: form.assetDescription,
      assetValue: parseFloat(form.assetValue),
      smeContribution: parseFloat(form.smeContribution),
      financeAmount: parseFloat(form.financeAmount),
      requestedTerm: parseInt(form.requestedTerm, 10),
      status: 'SUBMITTED',
    });

  const requestRemoval = () => {
    if (!confirm('Ask the underwriter to remove this application? It stays on file until they archive it.')) return;
    void patch({ status: 'DELETION_REQUESTED' });
  };

  const uploadDocs = async (files: File[]) => {
    if (files.length === 0) return;
    setUploading(true);
    setError('');
    try {
      const documents = new FormData();
      files.forEach((file) => documents.append('files', file));
      const res = await fetch(`/api/sme/applications/${id}/documents`, {
        method: 'POST',
        body: documents,
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      setApplication(data.application);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  if (sessionStatus === 'loading' || !session) return <div>Loading...</div>;
  if (loading) return <div>Loading application...</div>;
  if (error && !application) return <div>{error}</div>;
  if (!application) return <div>Application not found</div>;

  const canEdit = EDITABLE.includes(application.status);

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      DRAFT: 'bg-gray-100 text-gray-800',
      SUBMITTED: 'bg-blue-100 text-blue-800',
      UNDER_REVIEW: 'bg-yellow-100 text-yellow-800',
      CONDITIONALLY_APPROVED: 'bg-amber-100 text-amber-900',
      APPROVED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
      ARCHIVED: 'bg-slate-200 text-slate-700',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <DashboardLayout role={session.user.role}>
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-wrap justify-between items-start gap-4 mb-6">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Application {application.applicationNo}
            </h1>
            <p className="text-gray-600 mt-1">
              Submitted {new Date(application.createdAt).toLocaleDateString()}
            </p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(application.status)}`}>
            {application.status.replace(/_/g, ' ')}
          </span>
        </div>

        {error && (
          <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="flex flex-wrap gap-2 mb-6">
          {canEdit && !editing && (
            <Button variant="outline" onClick={() => setEditing(true)} disabled={busy}>
              Edit
            </Button>
          )}
          {editing && (
            <>
              <Button onClick={saveEdits} disabled={busy}>Save changes</Button>
              <Button variant="outline" onClick={saveDraft} disabled={busy}>Save as Draft</Button>
              <Button variant="ghost" onClick={() => setEditing(false)} disabled={busy}>Cancel</Button>
            </>
          )}
          {canEdit && !editing && (
            <Button variant="outline" onClick={saveDraft} disabled={busy}>Save as Draft</Button>
          )}
          {application.status === 'DRAFT' && (
            <Button onClick={submitDraft} disabled={busy}>Submit</Button>
          )}
          {!['APPROVED', 'FUNDED', 'DELETION_REQUESTED'].includes(application.status) && (
            <Button variant="outline" onClick={requestRemoval} disabled={busy}>
              Request removal
            </Button>
          )}
          <Button variant="outline" onClick={() => router.push('/sme')}>Back</Button>
        </div>

        <div className="grid gap-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Asset Details</h2>
            {editing ? (
              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <label className="text-sm text-gray-600">Asset Type</label>
                  <select
                    className="mt-1 w-full rounded-md border px-3 py-2"
                    value={form.assetType}
                    onChange={(e) => setForm({ ...form, assetType: e.target.value })}
                  >
                    <option value="TRUCK">Truck</option>
                    <option value="DELIVERY_VAN">Delivery Van</option>
                    <option value="EQUIPMENT">Equipment</option>
                  </select>
                </div>
                <div>
                  <label className="text-sm text-gray-600">Term (months)</label>
                  <Input
                    value={form.requestedTerm}
                    onChange={(e) => setForm({ ...form, requestedTerm: e.target.value })}
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="text-sm text-gray-600">Description</label>
                  <textarea
                    className="mt-1 w-full rounded-md border px-3 py-2"
                    rows={3}
                    value={form.assetDescription}
                    onChange={(e) => setForm({ ...form, assetDescription: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600">Asset Value</label>
                  <Input
                    value={form.assetValue}
                    onChange={(e) => setForm({ ...form, assetValue: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600">Your Contribution</label>
                  <Input
                    value={form.smeContribution}
                    onChange={(e) => setForm({ ...form, smeContribution: e.target.value })}
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600">Finance Amount</label>
                  <Input value={form.financeAmount} readOnly />
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Asset Type</p>
                  <p className="font-medium">{application.assetType}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Asset Value</p>
                  <p className="font-medium">{formatCurrency(application.assetValue)}</p>
                </div>
                <div className="col-span-2">
                  <p className="text-sm text-gray-600">Description</p>
                  <p className="font-medium">{application.assetDescription}</p>
                </div>
              </div>
            )}
          </Card>

          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Financing Structure</h2>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-sm text-gray-600">Your Contribution</p>
                <p className="font-medium text-lg">{formatCurrency(application.smeContribution)}</p>
                <p className="text-xs text-gray-500">
                  {((application.smeContribution / application.assetValue) * 100).toFixed(1)}%
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Finance Amount</p>
                <p className="font-medium text-lg">{formatCurrency(application.financeAmount)}</p>
                <p className="text-xs text-gray-500">
                  {((application.financeAmount / application.assetValue) * 100).toFixed(1)}% LTV
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Requested Term</p>
                <p className="font-medium text-lg">{application.requestedTerm} months</p>
              </div>
            </div>
          </Card>

          {application.riskTier && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Risk Assessment</h2>
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Company Risk</p>
                  <p className="text-2xl font-bold text-green-600">{application.companyRiskScore}/100</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Asset Risk</p>
                  <p className="text-2xl font-bold text-green-600">{application.assetRiskScore}/100</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Risk Tier</p>
                  <p className="text-2xl font-bold">{application.riskTier}</p>
                </div>
              </div>
            </Card>
          )}

          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Documents</h2>
            {application.documents.length > 0 ? (
              <ul className="space-y-2">
                {application.documents.map((doc) => (
                  <li key={doc.id} className="flex justify-between items-center py-2 border-b gap-3">
                    <div>
                      <p className="font-medium">{doc.fileName}</p>
                      <p className="text-sm text-gray-500">
                        {doc.documentType.replace(/_/g, ' ')} — Uploaded{' '}
                        {new Date(doc.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                    <a
                      href={`/api/documents/${doc.id}`}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-md border px-2 py-1 text-sm text-blue-700 hover:bg-blue-50 shrink-0"
                    >
                      Preview
                    </a>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No documents uploaded yet</p>
            )}
            {canEdit && application.reviews.some((review) => review.decision === 'DOCUMENT_REQUEST') && (
              <p className="mt-4 text-sm text-amber-800">The underwriter asked for files. Use Browse files to upload them into this ticket.</p>
            )}
            {canEdit && (
              <div className="mt-4 border-t pt-4">
                <label className="inline-flex cursor-pointer items-center rounded-xl bg-[#1D4ED8] px-4 py-2 text-sm font-medium text-white">
                  {uploading ? 'Uploading...' : 'Browse files'}
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.png,.jpg,.jpeg"
                    className="hidden"
                    disabled={uploading}
                    onChange={(e) => {
                      const files = e.target.files ? Array.from(e.target.files) : [];
                      e.target.value = '';
                      void uploadDocs(files);
                    }}
                  />
                </label>
                <p className="mt-2 text-xs text-[#475569]">Choose a PDF or image. Upload starts as soon as you confirm the files.</p>
              </div>
            )}
          </Card>

          <TicketThread
            applicationId={application.id}
            messages={application.reviews}
            onPosted={(reviews) => setApplication({ ...application, reviews })}
          />
        </div>
      </div>
    </DashboardLayout>
  );
}
