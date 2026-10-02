'use client';
export const dynamic = 'force-dynamic';

import { use, useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import DashboardLayout from '@/components/layout/dashboard-layout';
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
  reviews: Array<{
    decision: string;
    comments: string;
    reviewedAt: string;
    reviewer: { name: string };
  }>;
}

export default function ApplicationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: session } = useSession();
  if (!session) return <div>Loading...</div>;
  const [application, setApplication] = useState<Application | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadApplication();
  }, [id]);

  const loadApplication = async () => {
    try {
      const response = await fetch(`/api/sme/applications/${id}`);
      if (!response.ok) throw new Error('Failed to load application');
      const data = await response.json();
      setApplication(data.application);
    } catch (err) {
      setError('Failed to load application');
    } finally {
      setLoading(false);
    }
  };

  if (!session) return <div>Loading...</div>;
  if (loading) return <div>Loading application...</div>;
  if (error || !application) return <div>{error || 'Application not found'}</div>;

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      DRAFT: 'bg-gray-100 text-gray-800',
      SUBMITTED: 'bg-blue-100 text-blue-800',
      UNDER_REVIEW: 'bg-yellow-100 text-yellow-800',
      APPROVED: 'bg-green-100 text-green-800',
      REJECTED: 'bg-red-100 text-red-800',
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  return (
    <DashboardLayout role={session.user.role}>
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-6">
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

        <div className="grid gap-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold mb-4">Asset Details</h2>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-600">Asset Type</p>
                <p className="font-medium">{application.assetType.replace(/_/g, ' ')}</p>
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
                  <p className="text-2xl font-bold text-green-600">
                    {application.companyRiskScore}/100
                  </p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Asset Risk</p>
                  <p className="text-2xl font-bold text-green-600">
                    {application.assetRiskScore}/100
                  </p>
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
                  <li key={doc.id} className="flex justify-between items-center py-2 border-b">
                    <div>
                      <p className="font-medium">{doc.fileName}</p>
                      <p className="text-sm text-gray-500">
                        {doc.documentType.replace(/_/g, ' ')} • Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No documents uploaded yet</p>
            )}
          </Card>

          {application.reviews.length > 0 && (
            <Card className="p-6">
              <h2 className="text-lg font-semibold mb-4">Review History</h2>
              <div className="space-y-4">
                {application.reviews.map((review, idx) => (
                  <div key={idx} className="border-l-4 border-blue-500 pl-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <p className="font-medium">{review.decision}</p>
                        <p className="text-sm text-gray-600">by {review.reviewer.name}</p>
                      </div>
                      <p className="text-sm text-gray-500">
                        {new Date(review.reviewedAt).toLocaleDateString()}
                      </p>
                    </div>
                    {review.comments && (
                      <p className="mt-2 text-gray-700">{review.comments}</p>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
