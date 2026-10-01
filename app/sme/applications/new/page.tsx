'use client';
nexport const dynamic = 'force-dynamic';



'use client';
nexport const dynamic = 'force-dynamic';


import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import DashboardLayout from '@/components/layout/dashboard-layout';

export default function NewApplicationPage() {
  const router = useRouter();
  const { data: session } = useSession();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const [formData, setFormData] = useState({
    assetType: 'TRUCK',
    assetDescription: '',
    assetValue: '',
    smeContribution: '',
    financeAmount: '',
    requestedTerm: '36',
  });

  useEffect(() => {
    const assetValue = parseFloat(formData.assetValue) || 0;
    const contribution = parseFloat(formData.smeContribution) || 0;
    if (assetValue > 0 && contribution > 0) {
      const financeAmount = assetValue - contribution;
      setFormData((prev) => ({
        ...prev,
        financeAmount: financeAmount.toString(),
      }));
    }
  }, [formData.assetValue, formData.smeContribution]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setUploadedFiles(Array.from(e.target.files));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const submitData = {
        ...formData,
        assetValue: parseFloat(formData.assetValue),
        smeContribution: parseFloat(formData.smeContribution),
        financeAmount: parseFloat(formData.financeAmount),
        requestedTerm: parseInt(formData.requestedTerm),
        documents: uploadedFiles.map((f) => ({
          fileName: f.name,
          fileSize: f.size,
          documentType: 'OTHER',
        })),
      };

      const response = await fetch('/api/sme/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submitData),
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

  if (!session) {
    return <div>Loading...</div>;
  }

  return (
    <DashboardLayout role={session.user.role}>
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-gray-900">New Financing Application</h1>
          <p className="text-gray-600 mt-2">
            Submit a new asset financing request
          </p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <Card className="p-6">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <h2 className="text-lg font-semibold mb-4">Asset Details</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Asset Type *
                  </label>
                  <select
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    value={formData.assetType}
                    onChange={(e) => setFormData({ ...formData, assetType: e.target.value })}
                    required
                  >
                    <option value="TRUCK">Commercial Truck</option>
                    <option value="DELIVERY_VAN">Delivery Van</option>
                    <option value="REFRIGERATED_VEHICLE">Refrigerated Vehicle</option>
                    <option value="TRAILER">Trailer</option>
                    <option value="FORKLIFT">Forklift</option>
                    <option value="OTHER">Other Equipment</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Asset Description *
                  </label>
                  <textarea
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                    rows={3}
                    value={formData.assetDescription}
                    onChange={(e) => setFormData({ ...formData, assetDescription: e.target.value })}
                    placeholder="E.g., Brand new Isuzu NPR 75P 16FT Box Truck, 2024 model"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Asset Value (AED) *
                    </label>
                    <Input
                      type="number"
                      min="50000"
                      step="1000"
                      value={formData.assetValue}
                      onChange={(e) => setFormData({ ...formData, assetValue: e.target.value })}
                      placeholder="300000"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Your Contribution (AED) *
                    </label>
                    <Input
                      type="number"
                      min="0"
                      step="1000"
                      value={formData.smeContribution}
                      onChange={(e) => setFormData({ ...formData, smeContribution: e.target.value })}
                      placeholder="75000"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Finance Amount (AED)
                    </label>
                    <Input
                      type="number"
                      value={formData.financeAmount}
                      disabled
                      className="bg-gray-50"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Calculated automatically
                    </p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Requested Term (Months) *
                    </label>
                    <select
                      className="w-full border border-gray-300 rounded-md px-3 py-2"
                      value={formData.requestedTerm}
                      onChange={(e) => setFormData({ ...formData, requestedTerm: e.target.value })}
                      required
                    >
                      <option value="24">24 months</option>
                      <option value="36">36 months</option>
                      <option value="48">48 months</option>
                      <option value="60">60 months</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-lg font-semibold mb-4">Documents</h2>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                  accept=".pdf,.jpg,.jpeg,.png"
                />
                <label
                  htmlFor="file-upload"
                  className="cursor-pointer text-blue-600 hover:text-blue-700"
                >
                  Click to upload documents
                </label>
                <p className="text-sm text-gray-500 mt-2">
                  Upload trade license, bank statements, asset quote, etc.
                </p>
                {uploadedFiles.length > 0 && (
                  <div className="mt-4 text-left">
                    <p className="text-sm font-medium">Selected files:</p>
                    <ul className="text-sm text-gray-600">
                      {uploadedFiles.map((file, idx) => (
                        <li key={idx}>
                          {file.name} ({Math.round(file.size / 1024)} KB)
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-4 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={loading}
              >
                Cancel
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
