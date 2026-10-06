// Maps a Sumsub webhook event to a Vartola compliance state. Unknown events return null and change nothing.
export type ComplianceState = 'NOT_STARTED' | 'SESSION_CREATED' | 'PENDING' | 'IN_REVIEW' | 'NEEDS_REVIEW' | 'VERIFIED' | 'REJECTED';

export type SumsubEvent = {
  type?: string;
  reviewResult?: { reviewAnswer?: string; reviewRejectType?: string; moderationComment?: string };
};

export function mapSumsubEvent(event: SumsubEvent): ComplianceState | null {
  const answer = event.reviewResult?.reviewAnswer;
  if (answer === 'GREEN') return 'VERIFIED';
  if (answer === 'RED') return event.reviewResult?.reviewRejectType === 'RETRY' ? 'NEEDS_REVIEW' : 'REJECTED';
  switch (event.type) {
    case 'applicantCreated': return 'SESSION_CREATED';
    case 'applicantPending': return 'PENDING';
    case 'applicantOnHold':
    case 'applicantActionPending': return 'IN_REVIEW';
    default: return null;
  }
}

const FINAL: ComplianceState[] = ['VERIFIED', 'REJECTED'];

// A non-final event must never downgrade a final decision. Returns the state to store, or null to ignore the event.
export function nextComplianceState(current: string | null | undefined, incoming: ComplianceState | null): ComplianceState | null {
  if (!incoming) return null;
  if (current === incoming) return null;
  if (current && FINAL.includes(current as ComplianceState) && !FINAL.includes(incoming) && incoming !== 'NEEDS_REVIEW') return null;
  return incoming;
}
