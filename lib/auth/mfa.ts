import { prisma } from '@/lib/db';
import { isAlphaMode } from '@/lib/config/app-mode';
import { encryptedSecretProvider } from '@/lib/security/encrypted-secrets';
import { generateTotpSecret, otpauthUri, verifyTotp } from '@/lib/auth/totp';

// Roles that must use a second factor in Alpha mode. Demo quick-login accounts are not affected unless
// APP_MODE=ALPHA. TREASURY and COMPLIANCE are listed for the role split that is being prepared.
export const MFA_ROLES = ['ADMIN', 'ADMIN_REVIEWER', 'TREASURY', 'COMPLIANCE', 'OPERATIONS'];

export const requiresMfa = (role: string | null | undefined) => isAlphaMode() && Boolean(role) && MFA_ROLES.includes(role as string);

export async function mfaState(userId: string) {
  const row = await prisma.userMfa.findUnique({ where: { userId } });
  return { enrolled: Boolean(row?.confirmedAt), pending: Boolean(row && !row.confirmedAt) };
}

// Starts enrolment. The secret is shown once and stored encrypted; it only counts after the first valid code.
export async function beginEnrollment(userId: string, account: string) {
  const existing = await prisma.userMfa.findUnique({ where: { userId } });
  if (existing?.confirmedAt) throw new Error('A second factor is already set up. Ask a platform owner to reset it.');
  const secret = generateTotpSecret();
  const sealed = encryptedSecretProvider.seal(secret);
  await prisma.userMfa.upsert({ where: { userId }, create: { userId, secretSealed: sealed }, update: { secretSealed: sealed, lastStep: 0 } });
  return { secret, uri: otpauthUri(secret, account) };
}

export async function confirmEnrollment(userId: string, code: string) {
  const row = await prisma.userMfa.findUnique({ where: { userId } });
  if (!row || row.confirmedAt) return false;
  const step = verifyTotp(encryptedSecretProvider.open(row.secretSealed), code, row.lastStep);
  if (step === null) return false;
  await prisma.userMfa.update({ where: { userId }, data: { confirmedAt: new Date(), lastStep: step } });
  await prisma.auditLog.create({ data: { userId, action: 'MFA_ENROLLED', entityType: 'User', entityId: userId, changes: '{}' } });
  return true;
}

// Checks a login code and records the step so the same code cannot be used again.
export async function verifyLoginCode(userId: string, code: string) {
  const row = await prisma.userMfa.findUnique({ where: { userId } });
  if (!row?.confirmedAt) return false;
  const step = verifyTotp(encryptedSecretProvider.open(row.secretSealed), code, row.lastStep);
  if (step === null) return false;
  await prisma.userMfa.update({ where: { userId }, data: { lastStep: step } });
  return true;
}

export async function resetMfa(targetUserId: string, actorId: string) {
  await prisma.userMfa.deleteMany({ where: { userId: targetUserId } });
  await prisma.auditLog.create({ data: { userId: actorId, action: 'MFA_RESET', entityType: 'User', entityId: targetUserId, changes: '{}' } });
}
