'use client';
export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import DashboardLayout from '@/components/layout/dashboard-layout';

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
  const formData = assetValueNumber > 0 && contributionNumber >= 0
    ? { ...rawForm, financeAmount: String(Math.max(assetValueNumber - contributionNumber, 0)) }
    : rawForm;

  const submitApplication = async (asDraft: boolean) => {
    setError('');
    setLoading(true);
    try {
      const submitData = new FormData();
      submitData.set('assetType', formData.assetType);
      submitData.set('unitCount', formData.unitCount);
      submitData.set('assetDescription', formData.assetDescription);
      submitData.set('assetValue', formData.assetValue);
      submitData.set('smeContribution', formData.smeContribution);
      submitData.set('financeAmount', formData.financeAmount);
      submitData.set('requestedTerm', formData.requestedTerm);
      submitData.set('asDraft', String(asDraft));
      uploadedFiles.forEach((file) => submitData.append('files', file));

      const response = await fetch('/api/sme/applications', {
        method: 'POST',
        body: submitData,
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to submit application');
      }

      const result = await response.json();
      router.push(`/sme/applications/${result.application.id}`);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to submit application');
    } finally {
      setLoading(false);
    }
  };

  if (sessionStatus === 'loading') return <div>Loading...</div>;
  if (!session) return <div>Loading...</div>;

  return (
    <DashboardLayout role={session.user.role}>
      <div className="w-full">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">New Financing Application</h1>
        <p className="text-gray-600 mb-6">Submit a new asset financing request</p>

        <Card className="p-6">
          {error && (
            <div className="mb-4 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form
            className="space-y-6"
            onSubmit={(e) => {
              e.preventDefault();
              void submitApplication(false);
            }}
          >
            <div>
              <h2 className="text-lg font-semibold mb-4">Asset Details</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Asset Type *</label>
                  <select
                    className="w-full rounded-md border px-3 py-2"
                    value={formData.assetType}
                    onChange={(e) => setFormData({ ...formData, assetType: e.target.value })}
                    required
                  >
                    <option value="DELIVERY_MOTORCYCLE">Delivery Motorcycle</option>
                    <option value="CARGO_VAN">Cargo Van</option>
                    <option value="PICKUP">Pickup</option>
                    <option value="SMALL_TRUCK">Small Truck</option>
                    <option value="MEDIUM_TRUCK">Medium Truck</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Number of units *</label>
                  <Input
                    type="number"
                    required
                    min="1"
                    step="1"
                    value={formData.unitCount}
                    onChange={(e) => setFormData({ ...formData, unitCount: e.target.value })}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Asset Description *</label>
                  <textarea
                    className="w-full rounded-md border px-3 py-2"
                    rows={3}
                    required
                    placeholder="E.g., Brand new Isuzu NPR 75P 16FT Box Truck, 2024 model"
                    value={formData.assetDescription}
                    onChange={(e) => setFormData({ ...formData, assetDescription: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Asset Value (AED) *</label>
                    <Input
                      type="number"
                      required
                      value={formData.assetValue}
                      onChange={(e) => setFormData({ ...formData, assetValue: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Your Contribution (AED) *</label>
                    <Input
                      type="number"
                      required
                      value={formData.smeContribution}
                      onChange={(e) => setFormData({ ...formData, smeContribution: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Finance Amount (AED)</label>
                    <Input value={formData.financeAmount} readOnly className="bg-gray-50" />
                    <p className="text-xs text-gray-500 mt-1">Calculated automatically</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Requested Term (Months) *</label>
                    <select
                      className="w-full rounded-md border px-3 py-2"
                      value={formData.requestedTerm}
                      onChange={(e) => setFormData({ ...formData, requestedTerm: e.target.value })}
                    >
                      <option value="12">12 months</option>
                      <option value="24">24 months</option>
                      <option value="36">36 months</option>
                      <option value="48">48 months</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-4">Documents</h2>
              <div className="border-2 border-dashed rounded-lg p-6 text-center">
                <input
                  type="file"
                  multiple
                  accept=".pdf,.png,.jpg,.jpeg"
                  id="file-upload"
                  className="hidden"
                  onChange={(e) => setUploadedFiles(e.target.files ? Array.from(e.target.files) : [])}
                />
                <label htmlFor="file-upload" className="cursor-pointer text-blue-600 font-medium">
                  Click to upload documents
                </label>
                <p className="text-sm text-gray-500 mt-2">
                  Upload trade license, bank statements, asset quote, etc.
                </p>
                {uploadedFiles.length > 0 && (
                  <ul className="mt-4 text-left text-sm text-gray-600 list-disc pl-5">
                    {uploadedFiles.map((file) => (
                      <li key={file.name}>
                        {file.name} ({Math.round(file.size / 1024)} KB)
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-3 pt-2">
              <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>
                Cancel
              </Button>
              <Button
                type="button"
                variant="outline"
                disabled={loading}
                onClick={() => void submitApplication(true)}
              >
                {loading ? 'Saving...' : 'Save Draft'}
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? 'Submitting...' : 'Submit Application'}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </DashboardLayout>
  );
}
