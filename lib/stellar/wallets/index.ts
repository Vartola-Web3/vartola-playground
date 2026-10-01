/**
 * Wallet Management
 * 
 * Server-side: Import server-wallets.ts (secret keys)
 * Client-side: Import client-wallets.ts (public keys only)
 */

// Re-export client-safe utilities (can be used anywhere)
export * from './client-wallets';

// DO NOT re-export server-wallets here
// Server code must explicitly import './server-wallets' to get secret keys
// This prevents accidental client-side imports
