import { createHash, randomInt } from 'crypto';
import { prisma } from '@/lib/db';
import { isAlphaMode } from '@/lib/config/app-mode';

function hashCode(code: string) {
  return createHash('sha256').update(`vartola-email:${code}`).digest('hex');
}

export async function sendEmailCode(userId: string) {
  const code = isAlphaMode() ? String(randomInt(100000, 999999)) : (process.env.EMAIL_TEST_CODE || '000000');
  if (isAlphaMode() && process.env.EMAIL_OTP_URL) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    await fetch(process.env.EMAIL_OTP_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: user?.email, code }),
    });
  }
  await prisma.emailChallenge.create({
    data: { userId, codeHash: hashCode(code), expiresAt: new Date(Date.now() + 30 * 60 * 1000) },
  });
  return isAlphaMode() ? null : code;
}

export async function verifyEmailCode(userId: string, code: string) {
  const demo = !isAlphaMode() && code === (process.env.EMAIL_TEST_CODE || '000000');
  const challenge = await prisma.emailChallenge.findFirst({
    where: { userId, consumedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: 'desc' },
  });
  if (!demo && (!challenge || challenge.codeHash !== hashCode(code))) return false;
  if (challenge) await prisma.emailChallenge.update({ where: { id: challenge.id }, data: { consumedAt: new Date() } });
  const user = await prisma.user.findUnique({ where: { id: userId } });
  await prisma.user.update({
    where: { id: userId },
    data: {
      emailVerifiedAt: new Date(),
      accountStatus: user?.accountStatus === 'ACTIVE' ? 'ACTIVE' : 'PHONE_PENDING',
    },
  });
  return true;
}
