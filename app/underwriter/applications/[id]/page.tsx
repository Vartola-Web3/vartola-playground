import { auth } from '@/lib/auth/auth';
import { redirect } from 'next/navigation';
import { prisma } from '@/lib/db';
import DashboardLayout from '@/components/layout/dashboard-layout';
import { formatAED, formatDate, formatPercentage, getRiskTierColor } from '@/lib/formatters';
import { calculateRisk } from '@/lib/risk-engine';
import { AssetType } from '@/lib/types';
import { ApprovalForm } from './approval-form';
import { Field, InfoCard, StatCard, StatusBadge } from '@/components/ui/design';
import { Tabs } from '@/components/ui/tabs';
import { TicketThread } from '@/components/applications/ticket-thread';
import { ArchiveButton } from '@/components/applications/archive-button';
import Link from 'next/link';

export default async function ApplicationReviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user || session.user.role !== 'UNDERWRITER') {
    redirect('/login');
  }

  const application = await prisma.application.findUnique({
    where: { id },
    include: {
      company: true,
      submitter: true,
      documents: true,
      reviews: {
        orderBy: { reviewedAt: 'asc' },
        include: { reviewer: true },
      },
    },
  });

  if (!application) {
    redirect('/underwriter');
  }

  const riskResult = calculateRisk({
    company: {
      establishedDate: application.company.establishedDate,
      monthlyRevenue: application.company.monthlyRevenue ? Number(application.company.monthlyRevenue) : null,
      monthlyExpenses: application.company.monthlyExpenses ? Number(application.company.monthlyExpenses) : null,
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
    application: { documents: application.documents },
  });

  const ltv = (Number(application.financeAmount) / Number(application.assetValue)) * 100;
  const latestReview = application.reviews[0];
  const showDocumentsReceivedBanner =
    application.status === 'UNDER_REVIEW' && latestReview?.decision === 'DOCUMENTS_RECEIVED';
  const canDecide = application.status === 'SUBMITTED' || application.status === 'UNDER_REVIEW';

  return (
    <DashboardLayout role={session.user.role}>
      <div className="space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Link href="/underwriter" className="text-sm text-[#475569]">
              Back to queue
            </Link>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight text-[#0B1F4D]">{application.applicationNo}</h1>
            <p className="mt-1 text-sm text-[#475569]">{application.company.legalName}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <StatusBadge tone="warning">{application.status.replace(/_/g, ' ')}</StatusBadge>
            <span className={`rounded-full border px-2.5 py-1 text-xs font-medium ${getRiskTierColor(riskResult.riskTier)}`}>
              {riskResult.riskTier.replace('_', ' ')}
            </span>
            <StatusBadge tone="demo">Testnet</StatusBadge>
            {!['APPROVED', 'FUNDED', 'ARCHIVED'].includes(application.status) && (
              <ArchiveButton applicationId={application.id} />
            )}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-4">
          <StatCard label="Company risk" value={String(riskResult.companyRiskScore)} helper="Operating profile / 100" />
          <StatCard label="Asset risk" value={String(riskResult.assetRiskScore)} helper="Collateral quality / 100" />
          <StatCard label="Deal risk" value={String(riskResult.dealRiskScore)} helper="Structure / 100" />
          <StatCard label="Recommended tier" value={riskResult.riskTier.replace('TIER_', 'Tier ')} helper="Policy band" />
        </div>

        <InfoCard title="Decision summary" description="Guidance from the current risk policy. The credit decision remains with the underwriter.">
          <ul className="space-y-2 text-sm text-[#0F172A]">
            {riskResult.recommendations.map((rec) => (
              <li key={rec}>{rec}</li>
            ))}
          </ul>
          <div className="mt-5 grid gap-4 text-sm md:grid-cols-4">
            <Field label="Max LTV" value={formatPercentage(riskResult.tierParameters.maxLTV * 100, 0)} />
            <Field label="Min contribution" value={formatPercentage(riskResult.tierParameters.minContribution * 100, 0)} />
            <Field label="Max term" value={`${riskResult.tierParameters.maxTerm} months`} />
            <Field
              label="Rate range"
              value={`${riskResult.tierParameters.indicativeRate.min}–${riskResult.tierParameters.indicativeRate.max}%`}
            />
          </div>
          {application.documents.length === 0 && (
            <p className="mt-4 text-sm text-amber-800">Documentation gap: no files are attached to this application.</p>
          )}
        </InfoCard>

        <Tabs
          tabs={[
            {
              id: 'overview',
              label: 'Overview',
              content: (
                <div className="grid gap-4 md:grid-cols-2">
                  <InfoCard title="Company information">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="Trade license" value={application.company.tradeLicenseNo} />
                      <Field label="Emirate" value={application.company.emirate} />
                      <Field label="Industry" value={application.company.industry} />
                      <Field label="Established" value={formatDate(application.company.establishedDate)} />
                    </div>
                  </InfoCard>
                  <InfoCard title="Asset details">
                    <div className="space-y-4">
                      <Field label="Type" value={application.assetType.replace(/_/g, ' ')} />
                      <Field label="Description" value={application.assetDescription} />
                      <Field label="Value" value={formatAED(Number(application.assetValue))} />
                    </div>
                  </InfoCard>
                </div>
              ),
            },
            {
              id: 'financials',
              label: 'Financials',
              content: (
                <div className="grid gap-4 md:grid-cols-2">
                  <InfoCard title="Financial snapshot">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field
                        label="Monthly revenue"
                        value={application.company.monthlyRevenue ? formatAED(Number(application.company.monthlyRevenue)) : 'N/A'}
                      />
                      <Field
                        label="Monthly expenses"
                        value={application.company.monthlyExpenses ? formatAED(Number(application.company.monthlyExpenses)) : 'N/A'}
                      />
                      <Field
                        label="Liabilities"
                        value={application.company.liabilities ? formatAED(Number(application.company.liabilities)) : 'N/A'}
                      />
                    </div>
                  </InfoCard>
                  <InfoCard title="Deal structure">
                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="SME contribution" value={formatAED(Number(application.smeContribution))} />
                      <Field label="Finance amount" value={formatAED(Number(application.financeAmount))} />
                      <Field label="LTV" value={formatPercentage(ltv)} />
                      <Field label="Term" value={`${application.requestedTerm} months`} />
                    </div>
                  </InfoCard>
                </div>
              ),
            },
            {
              id: 'documents',
              label: 'Documents',
              content: (
                <InfoCard title="Documents" description={`${application.documents.length} files on file`}>
                  {showDocumentsReceivedBanner && (
                    <p className="mb-4 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
                      New documents were uploaded and the file is ready for another review.
                    </p>
                  )}
                  {application.documents.length === 0 ? (
                    <p className="text-sm text-[#475569]">No documents uploaded.</p>
                  ) : (
                    <div className="divide-y divide-[#E2E8F0]">
                      {application.documents.map((doc) => (
                        <div key={doc.id} className="flex items-center justify-between gap-3 py-3">
                          <div>
                            <p className="text-sm font-medium">{doc.documentType.replace(/_/g, ' ')}</p>
                            <p className="text-xs text-[#475569]">{doc.fileName}</p>
                          </div>
                          <div className="flex items-center gap-3 text-sm">
                            <span className="text-xs text-[#475569]">{formatDate(doc.uploadedAt)}</span>
                            <a href={`/api/documents/${doc.id}`} target="_blank" rel="noreferrer" className="text-[#1D4ED8]">
                              Preview
                            </a>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </InfoCard>
              ),
            },
            {
              id: 'blockchain',
              label: 'Blockchain',
              content: (
                <InfoCard title="Stellar settlement" description="Testnet recording happens after approval and funding.">
                  <p className="text-sm leading-6 text-[#475569]">
                    This application has no on-ledger facility yet. Approval creates the financing record used by the simulated Stellar settlement layer.
                  </p>
                  <div className="mt-4">
                    <StatusBadge tone="demo">Unfunded · Testnet</StatusBadge>
                  </div>
                </InfoCard>
              ),
            },
            {
              id: 'notes',
              label: 'Notes',
              content: (
                <InfoCard title="Ticket">
                  <p className="text-sm text-[#475569]">The same conversation is open below, with its action status.</p>
                </InfoCard>
              ),
            },
          ]}
        />

        <TicketThread
          applicationId={application.id}
          canRequestFiles
          messages={application.reviews.map((review) => ({
            decision: review.decision,
            comments: review.comments,
            conditions: review.conditions,
            reviewedAt: review.reviewedAt.toISOString(),
            reviewer: { name: review.reviewer.name, role: review.reviewer.role },
          }))}
        />

        {canDecide ? (
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
          <InfoCard title="Decision closed">
            <p className="text-sm text-[#475569]">This application has already been reviewed.</p>
          </InfoCard>
        )}
      </div>
    </DashboardLayout>
  );
}
