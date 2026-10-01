/**
 * ⚠️ CRITICAL SECURITY WARNING ⚠️
 * 
 * This module manages Stellar secret keys for server-side operations.
 * 
 * RULES:
 * 1. NEVER import this file in client-side code
 * 2. NEVER log secret keys to console or files
 * 3. NEVER commit .env files with real keys to git
 * 4. NEVER expose secret keys via API responses
 * 5. Only import in API routes and server-side functions
 * 
 * For client-side code, use the PUBLIC key environment variables instead.
 */

import { Keypair } from '@stellar/stellar-sdk';

/**
 * Load a Keypair from environment variable
 * Throws error if the variable is not set or invalid
 */
function loadKeypairFromEnv(envVarName: string, description: string): Keypair {
  const secret = process.env[envVarName];
  
  if (!secret) {
    throw new Error(
      `Missing ${envVarName} in environment. ` +
      `This key is required for ${description}. ` +
      `Please set it in .env.local (NEVER commit to git!)`
    );
  }

  if (secret.startsWith('SXXXXX') || secret === 'SXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX') {
    throw new Error(
      `${envVarName} is not configured. ` +
      `Please replace the placeholder with a real Stellar secret key. ` +
      `Generate one at https://laboratory.stellar.org/#account-creator?network=test`
    );
  }

  try {
    return Keypair.fromSecret(secret);
  } catch (error: any) {
    throw new Error(
      `Invalid secret key for ${envVarName}: ${error.message}. ` +
      `Secret keys must start with 'S' and be 56 characters long.`
    );
  }
}

/**
 * Get the Issuer keypair (issues tAED tokens)
 * 
 * The issuer account creates and issues the tAED asset.
 * Only used for initial token issuance and supply management.
 */
export function getIssuerKeypair(): Keypair {
  return loadKeypairFromEnv('STELLAR_ISSUER_SECRET', 'tAED token issuance');
}

/**
 * Get the Distributor keypair (holds and distributes tAED)
 * 
 * The distributor account holds tAED tokens and distributes them to users.
 * Used for: faucet requests, investor funding, facility funding.
 */
export function getDistributorKeypair(): Keypair {
  return loadKeypairFromEnv('STELLAR_DISTRIBUTOR_SECRET', 'tAED token distribution');
}

/**
 * Get the Admin keypair (manages contracts and operations)
 * 
 * The admin account invokes smart contracts and performs administrative operations.
 * Used for: facility creation, pool management, payment distribution.
 */
export function getAdminKeypair(): Keypair {
  return loadKeypairFromEnv('STELLAR_ADMIN_SECRET', 'smart contract and admin operations');
}

/**
 * Check if all required server wallets are configured
 * Returns array of missing wallet names, or empty array if all configured
 */
export function checkWalletConfiguration(): string[] {
  const missing: string[] = [];

  try {
    getIssuerKeypair();
  } catch {
    missing.push('Issuer');
  }

  try {
    getDistributorKeypair();
  } catch {
    missing.push('Distributor');
  }

  try {
    getAdminKeypair();
  } catch {
    missing.push('Admin');
  }

  return missing;
}

/**
 * Public keys (safe to expose)
 * These can be used in client-side code
 */
export const SERVER_WALLETS_PUBLIC = {
  issuer: process.env.NEXT_PUBLIC_STELLAR_ISSUER_PUBLIC || '',
  distributor: process.env.NEXT_PUBLIC_STELLAR_DISTRIBUTOR_PUBLIC || '',
  admin: process.env.NEXT_PUBLIC_STELLAR_ADMIN_PUBLIC || '',
} as const;

/**
 * Validate that public keys match secret keys
 * Should be called during server startup
 */
export function validateWalletConfiguration(): void {
  try {
    const issuer = getIssuerKeypair();
    const distributor = getDistributorKeypair();
    const admin = getAdminKeypair();

    const errors: string[] = [];

    if (SERVER_WALLETS_PUBLIC.issuer && issuer.publicKey() !== SERVER_WALLETS_PUBLIC.issuer) {
      errors.push(
        `Issuer public key mismatch: ` +
        `NEXT_PUBLIC_STELLAR_ISSUER_PUBLIC does not match STELLAR_ISSUER_SECRET`
      );
    }

    if (SERVER_WALLETS_PUBLIC.distributor && distributor.publicKey() !== SERVER_WALLETS_PUBLIC.distributor) {
      errors.push(
        `Distributor public key mismatch: ` +
        `NEXT_PUBLIC_STELLAR_DISTRIBUTOR_PUBLIC does not match STELLAR_DISTRIBUTOR_SECRET`
      );
    }

    if (SERVER_WALLETS_PUBLIC.admin && admin.publicKey() !== SERVER_WALLETS_PUBLIC.admin) {
      errors.push(
        `Admin public key mismatch: ` +
        `NEXT_PUBLIC_STELLAR_ADMIN_PUBLIC does not match STELLAR_ADMIN_SECRET`
      );
    }

    if (errors.length > 0) {
      throw new Error(`Wallet configuration errors:\n${errors.join('\n')}`);
    }

    console.log('✅ Server wallet configuration validated');
  } catch (error: any) {
    console.error('❌ Server wallet configuration validation failed:', error.message);
    throw error;
  }
}

// Log warning if this file is imported (helps catch client-side imports)
if (typeof window !== 'undefined') {
  console.error(
    '❌ CRITICAL SECURITY ERROR: server-wallets.ts imported on client side! ' +
    'This exposes secret keys. Remove this import immediately.'
  );
  throw new Error('server-wallets.ts must not be imported on client side');
}
