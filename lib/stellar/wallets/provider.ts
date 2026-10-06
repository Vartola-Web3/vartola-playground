import { Keypair } from '@stellar/stellar-sdk';
import { prisma } from '@/lib/db';
import { openSecret, sealSecret } from '@/lib/crypto/wallet-secret';
import { ensureVtaedTrustline, fundWithFriendbot } from '@/lib/stellar/assets/vtaed';

export type WalletKind = 'EMBEDDED' | 'EXTERNAL' | 'MPC' | 'CUSTODY';

export async function ensureEmbeddedWallet(userId: string) {
  const existing = await prisma.userWallet.findUnique({
    where: { userId_provider: { userId, provider: 'EMBEDDED' } },
  });
  if (existing) return existing;

  const keypair = Keypair.random();
  await fundWithFriendbot(keypair.publicKey());
  await ensureVtaedTrustline(keypair);
  const sealed = sealSecret(keypair.secret());
  const wallet = await prisma.userWallet.create({
    data: {
      userId,
      publicKey: keypair.publicKey(),
      provider: 'EMBEDDED',
      status: 'ACTIVE',
      secret: { create: sealed },
    },
  });
  await prisma.user.update({
    where: { id: userId },
    data: { stellarPublicKey: keypair.publicKey() },
  });
  return wallet;
}

export async function linkExternalWallet(userId: string, publicKey: string) {
  Keypair.fromPublicKey(publicKey);
  return prisma.userWallet.upsert({
    where: { userId_provider: { userId, provider: 'EXTERNAL' } },
    create: { userId, publicKey, provider: 'EXTERNAL', status: 'LINKED' },
    update: { publicKey, status: 'LINKED' },
  });
}

export async function embeddedSigner(userId: string) {
  const wallet = await prisma.userWallet.findUnique({
    where: { userId_provider: { userId, provider: 'EMBEDDED' } },
    include: { secret: true },
  });
  if (!wallet?.secret) throw new Error('This account has no embedded Testnet wallet');
  return { wallet, keypair: Keypair.fromSecret(openSecret(wallet.secret)) };
}

export async function walletView(userId: string) {
  const wallets = await prisma.userWallet.findMany({
    where: { userId },
    select: { publicKey: true, provider: true, status: true },
  });
  return wallets;
}
