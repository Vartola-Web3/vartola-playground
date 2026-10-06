// Servicing and collections lifecycle. Time periods are facility parameters, not hard-coded legal periods.
// Recovery language: lawful recovery under the applicable agreement and applicable law.

export const COLLECTION_STAGES = [
  'PAYMENT_DUE', 'REMINDER', 'GRACE', 'LATE', 'CURE', 'RESTRUCTURING_REVIEW', 'DEFAULT_NOTICE', 'DEFAULT', 'RECOVERY', 'ASSET_REALIZATION', 'RECOVERY_DISTRIBUTION', 'CLOSED',
] as const;
export type CollectionStage = (typeof COLLECTION_STAGES)[number];

export const ALLOWED_NEXT: Record<CollectionStage, CollectionStage[]> = {
  PAYMENT_DUE: ['REMINDER', 'CLOSED'],
  REMINDER: ['GRACE', 'CLOSED'],
  GRACE: ['LATE', 'CLOSED'],
  LATE: ['CURE', 'RESTRUCTURING_REVIEW', 'DEFAULT_NOTICE'],
  CURE: ['CLOSED', 'LATE'],
  RESTRUCTURING_REVIEW: ['CURE', 'DEFAULT_NOTICE'],
  DEFAULT_NOTICE: ['CURE', 'DEFAULT'],
  DEFAULT: ['RECOVERY'],
  RECOVERY: ['ASSET_REALIZATION'],
  ASSET_REALIZATION: ['RECOVERY_DISTRIBUTION'],
  RECOVERY_DISTRIBUTION: ['CLOSED'],
  CLOSED: [],
};

export const canMove = (from: CollectionStage, to: CollectionStage) => ALLOWED_NEXT[from]?.includes(to) ?? false;

export type CollectionParams = { reminderDays: number; graceDays: number; lateDays: number; defaultNoticeDays: number };
// Placeholders only. The legal periods come from the facility agreement and applicable law, set per facility.
export const DEFAULT_PARAMS: CollectionParams = { reminderDays: 1, graceDays: 5, lateDays: 15, defaultNoticeDays: 30 };

// Suggested stage from days past due. Only a suggestion: a person confirms every move and it is audit-logged.
export function suggestedStage(daysPastDue: number, params: CollectionParams = DEFAULT_PARAMS): CollectionStage {
  if (daysPastDue <= 0) return 'PAYMENT_DUE';
  if (daysPastDue <= params.reminderDays) return 'REMINDER';
  if (daysPastDue <= params.graceDays) return 'GRACE';
  if (daysPastDue <= params.lateDays) return 'LATE';
  if (daysPastDue <= params.defaultNoticeDays) return 'RESTRUCTURING_REVIEW';
  return 'DEFAULT_NOTICE';
}

export type CollectionCase = {
  facilityId: string;
  facilityNo: string;
  borrower: string;
  amountDue: number;
  daysPastDue: number;
  stage: CollectionStage;
  owner: string | null;
  latestContact: string | null;
  promiseToPay: { date: string; amount: number } | null;
  nextAction: string | null;
  notes: string[];
  restructuringReview: boolean;
  defaultStatus: 'NONE' | 'NOTICE_SENT' | 'DEFAULTED';
  recovery: {
    assetStatus: string;
    authorization: string | null;
    partner: string | null;
    expenses: number;
    valuation: number | null;
    offers: { amount: number; at: string }[];
    finalProceeds: number | null;
  };
};

export function applyStageChange(current: CollectionStage, next: CollectionStage) {
  if (!canMove(current, next)) throw new Error(`Cannot move a collections case from ${current} to ${next}`);
  return next;
}

export const RECOVERY_WORDING = 'Lawful recovery under the applicable agreement and applicable law.';
