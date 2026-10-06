import { prisma } from '../../lib/db';
import { SECRET_SETTING_KEYS, encryptedSecretProvider } from '../../lib/security/encrypted-secrets';

// One-time migration: encrypts any provider secret that is still stored in plaintext. Safe to run again.
async function main() {
  let migrated = 0;
  for (const key of SECRET_SETTING_KEYS) {
    const row = await prisma.systemSettings.findUnique({ where: { key } });
    if (!row || !row.value || encryptedSecretProvider.isSealed(row.value)) continue;
    await prisma.systemSettings.update({ where: { key }, data: { value: encryptedSecretProvider.seal(row.value) } });
    migrated += 1;
  }
  console.log(`Encrypted ${migrated} secret setting(s).`);
}
main().catch((error) => { console.error(error instanceof Error ? error.message : error); process.exit(1); }).finally(() => prisma.$disconnect());
