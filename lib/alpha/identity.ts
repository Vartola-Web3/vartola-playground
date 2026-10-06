import { createHash } from 'crypto';

export function userIdHash(userId: string) {
  return createHash('sha256').update(`vartola:user:${userId}`).digest('hex');
}

export function entityHash(entityType: string, entityId: string) {
  return createHash('sha256').update(`vartola:${entityType}:${entityId}`).digest('hex');
}

export function jurisdictionCode(country?: string | null) {
  const value = (country || '').trim().toUpperCase();
  if (value === 'AE' || value === 'UAE' || value === 'ARE' || value === 'UNITED ARAB EMIRATES') return 784;
  const numeric = Number(value);
  return Number.isInteger(numeric) && numeric > 0 ? numeric : 0;
}
