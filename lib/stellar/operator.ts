import { createHash } from 'crypto';
import { Keypair } from '@stellar/stellar-sdk';

export function getTestnetOperator() {
  const configured = process.env.STELLAR_OPERATOR_SECRET;
  if (configured) return Keypair.fromSecret(configured);
  const applicationSecret = process.env.NEXTAUTH_SECRET;
  if (!applicationSecret) throw new Error('NEXTAUTH_SECRET or STELLAR_OPERATOR_SECRET is required');
  const seed = createHash('sha256').update(`vartola:stellar-testnet:${applicationSecret}`).digest();
  return Keypair.fromRawEd25519Seed(seed);
}
