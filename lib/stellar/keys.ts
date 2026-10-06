import fs from 'fs';
import path from 'path';
import { Keypair } from '@stellar/stellar-sdk';

export type AlphaKeyFile = {
  issuerSecret?: string;
  distributorSecret?: string;
  adminSecret?: string;
  pauserSecret?: string;
  underwriterSecret?: string;
  operationsSecret?: string;
  complianceSecret?: string;
  facilityContractId?: string;
  registryContractId?: string;
  assetCode?: string;
};

export function alphaKeyPath() {
  return path.join(process.cwd(), '.alpha', 'testnet-keys.json');
}

export function readAlphaKeys(): AlphaKeyFile {
  const file = alphaKeyPath();
  if (!fs.existsSync(file)) return {};
  return JSON.parse(fs.readFileSync(file, 'utf8')) as AlphaKeyFile;
}

export function writeAlphaKeys(patch: AlphaKeyFile) {
  const file = alphaKeyPath();
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const next = { ...readAlphaKeys(), ...patch };
  fs.writeFileSync(file, JSON.stringify(next, null, 2));
  return next;
}

function keypairFrom(secret: string | undefined, label: string) {
  if (!secret) throw new Error(`${label} is not configured. Run the Testnet issuance script first.`);
  return Keypair.fromSecret(secret);
}

export function issuerKeypair() {
  return keypairFrom(process.env.STELLAR_ISSUER_SECRET || readAlphaKeys().issuerSecret, 'VTAED issuer');
}

export function distributorKeypair() {
  return keypairFrom(process.env.STELLAR_DISTRIBUTOR_SECRET || readAlphaKeys().distributorSecret, 'VTAED distribution account');
}

export function adminKeypair() {
  return keypairFrom(process.env.STELLAR_ADMIN_SECRET || readAlphaKeys().adminSecret, 'Soroban admin');
}

export function facilityContractId() {
  return process.env.FACILITY_CONTRACT_ID || readAlphaKeys().facilityContractId || '';
}

export function registryContractId() {
  return process.env.WALLET_REGISTRY_CONTRACT_ID || readAlphaKeys().registryContractId || '';
}

export function requireContracts() {
  const facility = facilityContractId();
  const registry = registryContractId();
  if (!facility || !registry) {
    throw new Error('Soroban facility and wallet registry contract IDs are required in Alpha mode');
  }
  return { facility, registry };
}

// Privileged contract roles. Each role has its own wallet on Testnet when one is configured, either through
// STELLAR_<ROLE>_SECRET or the local keys file. A role without a wallet falls back to the administrator, the same
// way the contract does, so a single Testnet key still works.
export type ContractRole = 'ADMIN' | 'PAUSER' | 'TREASURY' | 'UNDERWRITER' | 'OPERATIONS' | 'COMPLIANCE';

export function roleKeypair(role: ContractRole): Keypair {
  const keys = readAlphaKeys();
  switch (role) {
    case 'ADMIN': return adminKeypair();
    case 'TREASURY': return distributorKeypair();
    case 'PAUSER': {
      const secret = process.env.STELLAR_PAUSER_SECRET || keys.pauserSecret;
      return secret ? Keypair.fromSecret(secret) : adminKeypair();
    }
    case 'UNDERWRITER': {
      const secret = process.env.STELLAR_UNDERWRITER_SECRET || keys.underwriterSecret;
      return secret ? Keypair.fromSecret(secret) : adminKeypair();
    }
    case 'OPERATIONS': {
      const secret = process.env.STELLAR_OPERATIONS_SECRET || keys.operationsSecret;
      return secret ? Keypair.fromSecret(secret) : adminKeypair();
    }
    case 'COMPLIANCE': {
      const secret = process.env.STELLAR_COMPLIANCE_SECRET || keys.complianceSecret;
      return secret ? Keypair.fromSecret(secret) : adminKeypair();
    }
  }
}
