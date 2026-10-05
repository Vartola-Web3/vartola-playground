'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import DashboardLayout from '@/components/layout/dashboard-layout';

export default function AIAssistPage() {
  const { data: session } = useSession();
  if (!session) return <div>Loading...</div>;
  const [loading, setLoading] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);

  const runDemo = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/underwriting/ai-assist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId: 'demo',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setAnalysis(data);
      }
    } catch (error) {
      console.error('AI assist error:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!session || session.user.role !== 'UNDERWRITER') {
    return <div>Access denied</div>;
  }

  return (
    <DashboardLayout role={session.user.role}>
      <div className="w-full">
        <div className="mb-6">
          <h1 className="text-3xl font-bold">AI Underwriting Assistant</h1>
          <p className="text-gray-600 mt-2">
            Automated risk analysis and underwriting insights (Prototype Stub)
          </p>
        </div>

        <div className="grid gap-6">
          <Card className="p-6 bg-blue-50">
            <h2 className="text-xl font-semibold mb-4">🤖 AI Features (Phase 3 Stubs)</h2>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>✅ <strong>Document Extraction</strong> - OCR and data extraction from PDFs</li>
              <li>✅ <strong>Financial Risk Analysis</strong> - Automated cash flow and debt ratio checks</li>
              <li>✅ <strong>Fraud Detection</strong> - Pattern recognition in document uploads</li>
              <li>✅ <strong>Market Risk Analysis</strong> - Industry and asset type risk signals</li>
              <li>✅ <strong>Underwriting Insights</strong> - AI-generated recommendations</li>
              <li>✅ <strong>Application Summaries</strong> - Natural language summaries</li>
            </ul>
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">Demo AI Analysis</h2>
            <p className="text-gray-600 mb-4">
              Run a demo AI analysis to see how the system would analyze an application.
            </p>
            <Button onClick={runDemo} disabled={loading}>
              {loading ? 'Running AI Analysis...' : 'Run Demo Analysis'}
            </Button>

            {analysis && (
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <h3 className="font-semibold mb-2">Analysis Result:</h3>
                <pre className="text-xs overflow-auto">
                  {JSON.stringify(analysis, null, 2)}
                </pre>
              </div>
            )}
          </Card>

          <Card className="p-6">
            <h2 className="text-xl font-semibold mb-4">How It Works</h2>
            <div className="space-y-4 text-sm text-gray-700">
              <div>
                <h3 className="font-semibold">1. Document Extraction</h3>
                <p>AI extracts structured data from uploaded documents (trade licenses, financial statements, asset quotes) using OCR and NLP.</p>
              </div>
              <div>
                <h3 className="font-semibold">2. Risk Signal Analysis</h3>
                <p>Multiple AI models analyze financial ratios, detect anomalies, and assess market conditions to generate risk signals.</p>
              </div>
              <div>
                <h3 className="font-semibold">3. Fraud Detection</h3>
                <p>Pattern recognition identifies suspicious document patterns, inconsistencies, or unusual upload behavior.</p>
              </div>
              <div>
                <h3 className="font-semibold">4. Recommendation Engine</h3>
                <p>Combines all signals to generate actionable recommendations: Approve, Conditional Approval, or Reject.</p>
              </div>
              <div>
                <h3 className="font-semibold">5. Human-in-the-Loop</h3>
                <p className="font-semibold text-blue-600">
                  ⚠️ All AI outputs are advisory only. Final decisions always require human underwriter approval.
                </p>
              </div>
            </div>
          </Card>

          <Card className="p-6 bg-yellow-50">
            <h3 className="font-semibold mb-2">⚠️ Phase 3 Status: Prototype Stubs</h3>
            <ul className="text-sm text-gray-700 space-y-1">
              <li>• This is a <strong>stub implementation</strong> for grant demonstration</li>
              <li>• Real AI models would require: OpenAI/Claude API, custom ML training, labeled datasets</li>
              <li>• Production implementation: 6-12 months of model training and validation</li>
              <li>• Outputs are assistance inside the Alpha. They are not a credit decision</li>
              <li>• Testnet only - no real underwriting decisions</li>
            </ul>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
