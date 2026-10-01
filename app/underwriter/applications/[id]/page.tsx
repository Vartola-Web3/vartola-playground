import { auth } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  formatAED,
  formatDate,
  formatPercentage,
  getRiskTierColor,
  getRiskScoreColor,
} from '@/lib/formatters';
import { calculateRisk } from '@/lib/risk-engine';
import { AssetType } from '@/lib/types';
import { ApprovalForm } from './approval-form';

export default async function ApplicationReviewPage({ params }: { params: { id: string } }) {
  const session = await auth();

  if (!session?.user || session.user.role !== 'UNDERWRITER') {
    redirect('/login');
  }

  const application = await prisma.application.findUnique({
    where: { id: params.id },
    include: {
      company: true,
      submitter: true,
      documents: true,
      reviews: {
        orderBy: { reviewedAt: 'desc' },
        include: {
          reviewer: true,
        },
      },
    },
  });

  if (!application) {
    redirect('/underwriter');
  }

  // Calculate risk scores
  const riskResult = calculateRisk({
    company: {
      establishedDate: application.company.establishedDate,
      monthlyRevenue: application.company.monthlyRevenue ? Number(application.company.monthlyRevenue) : null,
      monthlyExpenses: application.company.monthlyExpenses
        ? Number(application.company.monthlyExpenses)
        : null,
      liabilities: application.company.liabilities ? Number(application.company.liabilities) : null,
      industry: application.company.industry,
    },
    asset: {
      assetType: application.assetType as AssetType,
      assetDescription: application.assetDescription,
      assetValue: Number(application.assetValue),
    },
    deal: {
      financeAmount: Number(application.financeAmount),
      assetValue: Number(application.assetValue),
      requestedTerm: application.requestedTerm,
    },
    application: {
      documents: application.documents,
    },
  });

  const ltv = (Number(application.financeAmount) / Number(application.assetValue)) * 100;

  return (
    <DashboardLayout role={session.user.role}>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">{application.applicationNo}</h1>
          <p className="text-slate-600 mt-1">Application Review</p>
        </div>

        {/* Risk Assessment Summary */}
        <Card className="border-2 border-blue-200 bg-blue-50/30">
          <CardHeader>
            <CardTitle>Risk Assessment</CardTitle>
            <CardDescription>Automated risk scoring results</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
              <div className="text-center p-4 bg-white rounded-lg border border-slate-200">
                <div className="text-sm text-slate-600 mb-1">Company Risk</div>
                <div className={`text-3xl font-bold ${getRiskScoreColor(riskResult.companyRiskScore)}`}>
                  {riskResult.companyRiskScore}
                </div>
                <div className="text-xs text-slate-500">/100</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg border border-slate-200">
                <div className="text-sm text-slate-600 mb-1">Asset Risk</div>
                <div className={`text-3xl font-bold ${getRiskScoreColor(riskResult.assetRiskScore)}`}>
                  {riskResult.assetRiskScore}
                </div>
                <div className="text-xs text-slate-500">/100</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg border border-slate-200">
                <div className="text-sm text-slate-600 mb-1">Deal Risk</div>
                <div className={`text-3xl font-bold ${getRiskScoreColor(riskResult.dealRiskScore)}`}>
                  {riskResult.dealRiskScore}
                </div>
                <div className="text-xs text-slate-500">/100</div>
              </div>
              <div className="text-center p-4 bg-white rounded-lg border border-slate-200">
                <div className="text-sm text-slate-600 mb-1">Risk Tier</div>
                <div className="text-2xl font-bold">
                  <span className={`px-4 py-2 rounded border ${getRiskTierColor(riskResult.riskTier)}`}>
                    {riskResult.riskTier.replace('_', ' ')}
                  </span>
                </div>
              </div>
            </div>

            {/* Recommendations */}
            <div className="bg-white p-4 rounded-lg border border-slate-200">
              <div className="font-semibold mb-2">Recommendations:</div>
              <ul className="space-y-1">
                {riskResult.recommendations.map((rec, i) => (
                  <li key={i} className="text-sm text-slate-700">
                    {rec}
                  </li>
                ))}
              </ul>
            </div>

            {/* Tier Parameters */}
            <div className="mt-4 bg-white p-4 rounded-lg border border-slate-200">
              <div className="font-semibold mb-2">Tier {riskResult.riskTier.replace('TIER_', '')} Parameters:</div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="text-slate-600">Max LTV</div>
                  <div className="font-semibold">{formatPercentage(riskResult.tierParameters.maxLTV * 100, 0)}</div>
                </div>
                <div>
                  <div className="text-slate-600">Min Contribution</div>
                  <div className="font-semibold">
                    {formatPercentage(riskResult.tierParameters.minContribution * 100, 0)}
                  </div>
                </div>
                <div>
                  <div className="text-slate-600">Max Term</div>
                  <div className="font-semibold">{riskResult.tierParameters.maxTerm} months</div>
                </div>
                <div>
                  <div className="text-slate-600">Rate Range</div>
                  <div className="font-semibold">
                    {riskResult.tierParameters.indicativeRate.min}-{riskResult.tierParameters.indicativeRate.max}%
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Company Information */}
        <Card>
          <CardHeader>
            <CardTitle>Company Information</CardTitle>
            <CardDescription>{application.company.legalName}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
              <div>
                <div className="text-slate-600">Trade License</div>
                <div className="font-semibold">{application.company.tradeLicenseNo}</div>
              </div>
              <div>
                <div className="text-slate-600">Emirate</div>
                <div className="font-semibold">{application.company.emirate}</div>
              </div>
              <div>
                <div className="text-slate-600">Industry</div>
                <div className="font-semibold">{application.company.industry}</div>
              </div>
              <div>
                <div className="text-slate-600">Established</div>
                <div className="font-semibold">{formatDate(application.company.establishedDate)}</div>
              </div>
              <div>
                <div className="text-slate-600">Monthly Revenue</div>
                <div className="font-semibold">
                  {application.company.monthlyRevenue ? formatAED(Number(application.company.monthlyRevenue)) : 'N/A'}
                </div>
              </div>
              <div>
                <div className="text-slate-600">Liabilities</div>
                <div className="font-semibold">
                  {application.company.liabilities ? formatAED(Number(application.company.liabilities)) : 'N/A'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Asset & Deal Structure */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Asset Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <div className="text-slate-600">Asset Type</div>
                <div className="font-semibold">{application.assetType.replace(/_/g, ' ')}</div>
              </div>
              <div>
                <div className="text-slate-600">Description</div>
                <div className="font-semibold">{application.assetDescription}</div>
              </div>
              <div>
                <div className="text-slate-600">Asset Value</div>
                <div className="font-semibold text-lg">{formatAED(Number(application.assetValue))}</div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Deal Structure</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <div>
                <div className="text-slate-600">SME Contribution</div>
                <div className="font-semibold">{formatAED(Number(application.smeContribution))}</div>
              </div>
              <div>
                <div className="text-slate-600">Finance Amount</div>
                <div className="font-semibold text-lg">{formatAED(Number(application.financeAmount))}</div>
              </div>
              <div>
                <div className="text-slate-600">LTV Ratio</div>
                <div className="font-semibold">{formatPercentage(ltv)}</div>
              </div>
              <div>
                <div className="text-slate-600">Requested Term</div>
                <div className="font-semibold">{application.requestedTerm} months</div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Documents */}
        <Card>
          <CardHeader>
            <CardTitle>Documents</CardTitle>
            <CardDescription>{application.documents.length} documents uploaded</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {application.documents.map((doc) => (
                <div key={doc.id} className="flex items-center justify-between p-3 border border-slate-200 rounded">
                  <div>
                    <div className="font-medium text-sm">{doc.documentType.replace(/_/g, ' ')}</div>
                    <div className="text-xs text-slate-500">{doc.fileName}</div>
                  </div>
                  <div className="text-xs text-slate-500">{formatDate(doc.uploadedAt)}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Approval Form */}
        {application.status === 'SUBMITTED' || application.status === 'UNDER_REVIEW' ? (
          <ApprovalForm
            applicationId={application.id}
            underwriterId={session.user.id}
            riskTier={riskResult.riskTier}
            riskScores={{
              companyRiskScore: riskResult.companyRiskScore,
              assetRiskScore: riskResult.assetRiskScore,
              dealRiskScore: riskResult.dealRiskScore,
            }}
          />
        ) : (
          <Card className="bg-slate-50">
            <CardContent className="pt-6">
              <p className="text-center text-slate-600">
                This application has already been reviewed.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Review History */}
        {application.reviews.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Review History</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {application.reviews.map((review) => (
                  <div key={review.id} className="p-4 border border-slate-200 rounded-lg bg-slate-50">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="font-semibold">{review.reviewer.name}</div>
                        <div className="text-sm text-slate-600">{formatDate(review.reviewedAt)}</div>
                      </div>
                      <span className="px-3 py-1 rounded-full text-xs font-medium border bg-white">
                        {review.decision.replace(/_/g, ' ')}
                      </span>
                    </div>
                    {review.comments && (
                      <div className="text-sm text-slate-700 mt-2">
                        <strong>Comments:</strong> {review.comments}
                      </div>
                    )}
                    {review.conditions && (
                      <div className="text-sm text-slate-700 mt-1">
                        <strong>Conditions:</strong> {review.conditions}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
