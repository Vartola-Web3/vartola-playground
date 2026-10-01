/**
 * Client-safe wallet utilities
 * Only exports public keys and safe functions
 * Can be imported in both client and server code
 */

/**
 * Public keys for system wallets (safe to expose)
 */
export const SYSTEM_WALLETS = {
  issuer: process.env.NEXT_PUBLIC_STELLAR_ISSUER_PUBLIC || '',
  distributor: process.env.NEXT_PUBLIC_STELLAR_DISTRIBUTOR_PUBLIC || '',
  admin: process.env.NEXT_PUBLIC_STELLAR_ADMIN_PUBLIC || '',
} as const;

/**
 * tAED token configuration (safe to expose)
 */
export const TAED_ASSET = {
  code: process.env.NEXT_PUBLIC_TAED_ASSET_CODE || 'tAED',
  issuer: process.env.NEXT_PUBLIC_TAED_ISSUER || '',
} as const;

/**
 * Check if system wallets are configured
 * Only checks public keys (safe for client)
 */
export function areWalletsConfigured(): boolean {
  return !!(
    SYSTEM_WALLETS.issuer &&
    SYSTEM_WALLETS.distributor &&
    SYSTEM_WALLETS.admin &&
    TAED_ASSET.issuer
  );
}

/**
 * Validate a Stellar public key format
 */
export function isValidPublicKey(key: string): boolean {
  return /^G[A-Z0-9]{55}$/.test(key);
}

/**
 * Mask a public key for display (show first 8 and last 4 characters)
 * Example: GABC...XYZ9
 */
export function maskPublicKey(key: string): string {
  if (!isValidPublicKey(key)) {
    return 'Invalid';
  }
  return `${key.slice(0, 8)}...${key.slice(-4)}`;
}
