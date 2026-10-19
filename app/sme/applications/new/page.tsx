'use client';
export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import DashboardLayout from '@/components/layout/dashboard-layout';

const field = 'mt-1 w-full rounded-lg border border-[#DCE6E1] bg-white px-3 py-2 text-sm text-[#13251E] outline-none focus:ring-2 focus:ring-[#15C77A]/35';

export default function NewApplicationPage() {
  const router = useRouter();
  const { data: session, status: sessionStatus } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [rawForm, setFormData] = useState({
    assetType: 'CARGO_VAN',
    unitCount: '1',
    assetDescription: '',
    assetValue: '',
    smeContribution: '',
    financeAmount: '',
    requestedTerm: '36',
  });

  // The finance amount always follows asset value minus contribution, so it is derived rather than stored.
  const assetValueNumber = parseFloat(rawForm.assetValue) || 0;
  const contributionNumber = parseFloat(rawForm.smeContribution) || 0;
  const financeAmount = Math.max(assetValueNumber - contributionNumber, 0);
  const formData = assetValueNumber > 0 && contributionNumber >= 0
    ? { ...rawForm, financeAmount: String(financeAmount) }
    : rawForm;

  const issues = {
    units: Number(rawForm.unitCount) < 1 ? 'At least one unit is required.' : '',
    description: rawForm.assetDescription.trim().length < 5 ? 'Describe the asset briefly.' : '',
    assetValue: assetValueNumber <= 0 ? 'Enter the asset value.' : '',
    contribution:
      contributionNumber < 0 ? 'The contribution cannot be negative.'
        : contributionNumber > assetValueNumber && assetValueNumber > 0 ? 'The contribution cannot exceed the asset value.'
          : '',
  };
  const readyToSubmit = !issues.units && !issues.description && !issues.assetValue && !issues.contribution;

  const submitApplication = async (asDraft: boolean) => {
    setError('');
    setLoading(true);
    try {
      const submitData = new FormData();
      submitData.set('assetType', formData.assetType);
      submitData.set('unitCount', formData.unitCount);
      submitData.set('assetDescription', formData.assetDescription);
      submitData.set('assetValue', formData.assetValue);
      submitData.set('smeContribution', formData.smeContribution || '0');
      submitData.set('financeAmount', formData.financeAmount);
      submitData.set('requestedTerm', formData.requestedTerm);
      submitData.set('asDraft', String(asDraft));
      uploadedFiles.forEach((file) => submitData.append('files', file));

      const response = await fetch('/api/sme/applications', { method: 'POST', body: submitData });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || 'Failed to submit application');
      }

      const result = await response.json();
      router.push(`/sme/applications/${result.application.id}`);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  if (sessionStatus === 'loading') return <div className="p-6 text-[#708078]">Loading…</div>;
  if (!session) return <div className="p-6 text-[#708078]">Loading…</div>;

  return (
    <DashboardLayout role={session.user.role}>
      <div className="w-full space-y-4">
        <div>
          <h1 className="text-3xl font-semibold">New financing application</h1>
          <p className="mt-1 text-[#708078]">Describe the asset, the price and your contribution. The finance amount is calculated for you.</p>
        </div>

        <Card className="p-6">
          {error && (
            <div role="alert" className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
              {error}
            </div>
          )}

          <form
            className="space-y-6"
            onSubmit={(event) => {
              event.preventDefault();
              if (readyToSubmit) void submitApplication(false);
            }}
          >
            <section>
              <h2 className="mb-4 text-lg font-semibold text-[#102019]">Asset details</h2>
              <div className="space-y-4">
                <div>
                  <label htmlFor="asset-type" className="block text-sm font-medium text-[#102019]">Asset type *</label>
                  <select
                    id="asset-type"
                    className={field}
                    value={formData.assetType}
                    onChange={(event) => setFormData({ ...formData, assetType: event.target.value })}
                    required
                  >
                    <option value="DELIVERY_MOTORCYCLE">Delivery motorcycle</option>
                    <option value="CARGO_VAN">Cargo van</option>
                    <option value="PICKUP">Pickup</option>
                    <option value="SMALL_TRUCK">Small truck</option>
                    <option value="MEDIUM_TRUCK">Medium truck</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="unit-count" className="block text-sm font-medium text-[#102019]">Number of units *</label>
                  <Input
                    id="unit-count"
                    type="number"
                    required
                    min="1"
                    step="1"
                    inputMode="numeric"
                    aria-invalid={Boolean(issues.units)}
                    aria-describedby={issues.units ? 'unit-count-error' : undefined}
                    className="mt-1"
                    value={formData.unitCount}
                    onChange={(event) => setFormData({ ...formData, unitCount: event.target.value })}
                  />
                  {issues.units && <p id="unit-count-error" className="mt-1 text-xs text-red-700">{issues.units}</p>}
                </div>

                <div>
                  <label htmlFor="asset-description" className="block text-sm font-medium text-[#102019]">Asset description *</label>
                  <textarea
                    id="asset-description"
                    className={field}
                    rows={3}
                    required
                    aria-invalid={Boolean(issues.description)}
                    aria-describedby={issues.description ? 'asset-description-error' : undefined}
                    placeholder="E.g., Brand new Isuzu NPR 75P 16FT box truck, 2024 model"
                    value={formData.assetDescription}
                    onChange={(event) => setFormData({ ...formData, assetDescription: event.target.value })}
                  />
                  {issues.description && <p id="asset-description-error" className="mt-1 text-xs text-red-700">{issues.description}</p>}
                </div>

                <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                  <div>
                    <label htmlFor="asset-value" className="block text-sm font-medium text-[#102019]">Asset value (AED) *</label>
                    <Input
                      id="asset-value"
                      type="number"
                      required
                      min="0"
                      step="1000"
                      inputMode="decimal"
                      aria-invalid={Boolean(issues.assetValue)}
                      aria-describedby={issues.assetValue ? 'asset-value-error' : undefined}
                      className="mt-1"
                      value={formData.assetValue}
                      onChange={(event) => setFormData({ ...formData, assetValue: event.target.value })}
                    />
                    {issues.assetValue && <p id="asset-value-error" className="mt-1 text-xs text-red-700">{issues.assetValue}</p>}
                  </div>
                  <div>
                    <label htmlFor="sme-contribution" className="block text-sm font-medium text-[#102019]">Your contribution (AED) *</label>
                    <Input
                      id="sme-contribution"
                      type="number"
                      required
                      min="0"
                      step="1000"
                      inputMode="decimal"
                      aria-invalid={Boolean(issues.contribution)}
                      aria-describedby={issues.contribution ? 'sme-contribution-error' : undefined}
                      className="mt-1"
                      value={formData.smeContribution}
                      onChange={(event) => setFormData({ ...formData, smeContribution: event.target.value })}
                    />
                    {issues.contribution && <p id="sme-contribution-error" className="mt-1 text-xs text-red-700">{issues.contribution}</p>}
                  </div>
                </div>

                <div className="rounded-2xl border border-[#E5ECE8] bg-[#F8FBF9] p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <p className="text-sm text-[#708078]">Amount to finance</p>
                    <p className="text-2xl font-semibold text-[#102019]">{financeAmount.toLocaleString('en-AE')} AED</p>
                  </div>
                  <p className="mt-1 text-xs text-[#708078]">Calculated as asset value minus your contribution. The underwriter confirms the final terms.</p>
                </div>

                <div>
                  <label htmlFor="requested-term" className="block text-sm font-medium text-[#102019]">Requested term *</label>
                  <select
                    id="requested-term"
                    className={field}
                    value={formData.requestedTerm}
                    onChange={(event) => setFormData({ ...formData, requestedTerm: event.target.value })}
                  >
                    <option value="12">12 months</option>
                    <option value="24">24 months</option>
                    <option value="36">36 months</option>
                    <option value="48">48 months</option>
                  </select>
                </div>
              </div>
            </section>

            <section>
              <h2 className="mb-4 text-lg font-semibold text-[#102019]">Documents</h2>
              <div className="rounded-2xl border-2 border-dashed border-[#DCE6E1] p-6 text-center">
                <input
                  type="file"
                  multiple
                  accept=".pdf,.png,.jpg,.jpeg"
                  id="file-upload"
                  className="hidden"
                  onChange={(event) => setUploadedFiles(event.target.files ? Array.from(event.target.files) : [])}
                />
                <label htmlFor="file-upload" className="cursor-pointer font-medium text-[#0A4934] underline underline-offset-4">
                  Click to upload documents
                </label>
                <p className="mt-2 text-sm text-[#708078]">Trade license, bank statements, asset quote and any supporting files (PDF, JPG, PNG).</p>
                {uploadedFiles.length > 0 && (
                  <ul className="mt-4 list-disc space-y-1 pl-5 text-left text-sm text-[#52635C]">
                    {uploadedFiles.map((file) => (
                      <li key={`${file.name}-${file.size}`}>{file.name} ({Math.round(file.size / 1024)} KB)</li>
                    ))}
                  </ul>
                )}
              </div>
            </section>

            <div className="flex flex-wrap gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>Cancel</Button>
              <Button type="button" variant="outline" disabled={loading} onClick={() => void submitApplication(true)}>
                {loading ? 'Saving…' : 'Save draft'}
              </Button>
              <Button type="submit" disabled={loading || !readyToSubmit}>
                {loading ? 'Submitting…' : 'Submit application'}
              </Button>
            </div>
            {!readyToSubmit && <p className="text-xs text-[#708078]">Complete the required fields to submit. You can still save a draft.</p>}
          </form>
        </Card>
      </div>
    </DashboardLayout>
  );
}
