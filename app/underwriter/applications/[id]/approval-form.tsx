'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ApprovalFormProps {
  applicationId: string;
  underwriterId: string;
  riskTier: string;
  riskScores: {
    companyRiskScore: number;
    assetRiskScore: number;
    dealRiskScore: number;
  };
}

export function ApprovalForm({ applicationId, underwriterId, riskTier, riskScores }: ApprovalFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [comments, setComments] = useState('');
  const [conditions, setConditions] = useState('');

  const handleDecision = async (decision: string) => {
    setLoading(true);

    try {
      const response = await fetch('/api/underwriting/review', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId,
          underwriterId,
          decision,
          comments: comments || null,
          conditions: conditions || null,
          riskTier,
          riskScores,
        }),
      });

      if (response.ok) {
        router.push('/underwriter');
        router.refresh();
      } else {
        alert('Failed to submit review');
        setLoading(false);
      }
    } catch (error) {
      alert('An error occurred');
      setLoading(false);
    }
  };

  return (
    <Card className="border-2 border-blue-200">
      <CardHeader>
        <CardTitle>Underwriter Decision</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Comments</label>
          <textarea
            className="w-full min-h-[100px] p-3 border border-slate-200 rounded-md"
            placeholder="Add your review comments..."
            value={comments}
            onChange={(e) => setComments(e.target.value)}
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Conditions (if any)</label>
          <Input
            placeholder="e.g., Additional collateral required"
            value={conditions}
            onChange={(e) => setConditions(e.target.value)}
          />
        </div>

        <div className="flex gap-3 pt-4">
          <Button
            onClick={() => handleDecision('APPROVED')}
            disabled={loading}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            {loading ? 'Processing...' : 'Approve'}
          </Button>
          <Button
            onClick={() => handleDecision('CONDITIONALLY_APPROVED')}
            disabled={loading}
            variant="outline"
            className="flex-1"
          >
            {loading ? 'Processing...' : 'Conditional Approval'}
          </Button>
          <Button
            onClick={() => handleDecision('REJECTED')}
            disabled={loading}
            variant="destructive"
            className="flex-1"
          >
            {loading ? 'Processing...' : 'Reject'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
