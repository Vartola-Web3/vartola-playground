import { createHash, randomInt } from 'crypto';
import { prisma } from '@/lib/db';
import { isAlphaMode } from '@/lib/config/app-mode';

export interface PhoneVerificationProvider {
  sendOtp(phone: string, code: string): Promise<void>;
  verifyOtp(phone: string, code: string): Promise<boolean>;
}

class DemoPhoneProvider implements PhoneVerificationProvider {
  async sendOtp() {}
  async verifyOtp(_phone: string, code: string) {
    return code === (process.env.PHONE_TEST_CODE || '000000');
  }
}

class EnvPhoneProvider implements PhoneVerificationProvider {
  async sendOtp(phone: string, code: string) {
    const url = process.env.PHONE_OTP_URL;
    if (!url) throw new Error('PHONE_OTP_URL is required in Alpha mode');
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${process.env.PHONE_OTP_TOKEN || ''}` },
      body: JSON.stringify({ phone, code }),
    });
    if (!response.ok) throw new Error('Phone provider rejected the verification message');
  }
  async verifyOtp() {
    return true;
  }
}

function provider() {
  if (!isAlphaMode()) return new DemoPhoneProvider();
  return new EnvPhoneProvider();
}

function hashCode(code: string) {
  return createHash('sha256').update(`vartola-otp:${code}`).digest('hex');
}

export async function sendOtp(userId: string, phone: string) {
  const code = isAlphaMode() ? String(randomInt(100000, 999999)) : (process.env.PHONE_TEST_CODE || '000000');
  await provider().sendOtp(phone, code);
  await prisma.phoneChallenge.create({
    data: {
      userId,
      phone,
      codeHash: hashCode(code),
      expiresAt: new Date(Date.now() + 10 * 60 * 1000),
    },
  });
}

export async function verifyOtp(userId: string, phone: string, code: string) {
  const demo = !isAlphaMode() && code === (process.env.PHONE_TEST_CODE || '000000');
  const challenge = await prisma.phoneChallenge.findFirst({
    where: { userId, phone, consumedAt: null, expiresAt: { gt: new Date() } },
    orderBy: { createdAt: 'desc' },
  });
  if (!demo && (!challenge || challenge.codeHash !== hashCode(code))) return false;
  if (!(await provider().verifyOtp(phone, code)) && !demo) return false;
  if (challenge) {
    await prisma.phoneChallenge.update({ where: { id: challenge.id }, data: { consumedAt: new Date() } });
  }
  const user = await prisma.user.findUnique({ where: { id: userId } });
  const next = user?.role === 'SME' ? 'KYB_PENDING' : 'KYC_PENDING';
  await prisma.user.update({
    where: { id: userId },
    data: { phone, phoneVerifiedAt: new Date(), accountStatus: user?.accountStatus === 'ACTIVE' ? 'ACTIVE' : next },
  });
  return true;
}
