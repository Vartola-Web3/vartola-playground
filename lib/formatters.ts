export function formatAED(amount: number): string {
  return new Intl.NumberFormat('en-AE', {
    style: 'currency',
    currency: 'AED',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

export const formatCurrency = formatAED;

export function formatAEDWithDecimals(amount: number): string {
  return new Intl.NumberFormat('en-AE', {
    style: 'currency',
    currency: 'AED',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function formatPercentage(value: number, decimals: number = 1): string {
  return `${value.toFixed(decimals)}%`;
}

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-AE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(d);
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('en-AE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
}

export function getRiskTierColor(tier: string): string {
  switch (tier) {
    case 'TIER_A':
      return 'text-green-600 bg-green-50 border-green-200';
    case 'TIER_B':
      return 'text-blue-600 bg-blue-50 border-blue-200';
    case 'TIER_C':
      return 'text-orange-600 bg-orange-50 border-orange-200';
    case 'TIER_D':
      return 'text-red-600 bg-red-50 border-red-200';
    default:
      return 'text-gray-600 bg-gray-50 border-gray-200';
  }
}

export function getRiskScoreColor(score: number): string {
  if (score >= 81) return 'text-green-600';
  if (score >= 61) return 'text-blue-600';
  if (score >= 41) return 'text-orange-600';
  return 'text-red-600';
}

export function getStatusColor(status: string): string {
  const statusColors: Record<string, string> = {
    DRAFT: 'text-gray-600 bg-gray-50 border-gray-200',
    SUBMITTED: 'text-blue-600 bg-blue-50 border-blue-200',
    UNDER_REVIEW: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    APPROVED: 'text-green-600 bg-green-50 border-green-200',
    REJECTED: 'text-red-600 bg-red-50 border-red-200',
    FUNDED: 'text-green-600 bg-green-50 border-green-200',
    ACTIVE: 'text-green-600 bg-green-50 border-green-200',
    CURRENT: 'text-green-600 bg-green-50 border-green-200',
    PAID: 'text-green-600 bg-green-50 border-green-200',
    SCHEDULED: 'text-blue-600 bg-blue-50 border-blue-200',
    PENDING: 'text-yellow-600 bg-yellow-50 border-yellow-200',
    LATE: 'text-red-600 bg-red-50 border-red-200',
    OPEN: 'text-green-600 bg-green-50 border-green-200',
    CLOSED: 'text-gray-600 bg-gray-50 border-gray-200',
  };
  return statusColors[status] || 'text-gray-600 bg-gray-50 border-gray-200';
}
