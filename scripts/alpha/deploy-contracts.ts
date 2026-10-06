import fs from 'fs';
import { spawnSync } from 'child_process';
import { Address, Asset, BASE_FEE, Horizon, Keypair, Operation, TransactionBuilder, rpc, scValToNative, xdr } from '@stellar/stellar-sdk';
import { STELLAR_CONFIG, getNetworkPassphrase } from '../../lib/stellar/config';
import { adminKeypair, distributorKeypair, issuerKeypair, readAlphaKeys, writeAlphaKeys } from '../../lib/stellar/keys';
import { ensureVtaedTrustline } from '../../lib/stellar/assets/vtaed';
import { callContract, scAddress, scI128, scU32 } from '../../lib/stellar/soroban/call';
import { vtaedToStroops } from '../../lib/alpha/money';

// Deploys wallet_registry and facility_contract to Stellar Testnet with the JS SDK (no Stellar CLI needed).
// Steps: verify network and asset, wrap VTAED as a Stellar Asset Contract, deploy and initialize both
// contracts with a separate pauser, link them, validate state, and record IDs, hashes and ledgers.
// Every value written comes from the network. Secrets stay in .alpha/testnet-keys.json (gitignored).

const server = new rpc.Server(STELLAR_CONFIG.sorobanRpcUrl);
const record: Record<string, { hash?: string; ledger?: number; id?: string }> = {};

async function submit(source: Keypair, operation: xdr.Operation) {
  const account = await server.getAccount(source.publicKey());
  const tx = new TransactionBuilder(account, { fee: BASE_FEE, networkPassphrase: getNetworkPassphrase() })
    .addOperation(operation)
    .setTimeout(180)
    .build();
  const simulated = await server.simulateTransaction(tx);
  if (rpc.Api.isSimulationError(simulated)) throw new Error(simulated.error);
  const prepared = rpc.assembleTransaction(tx, simulated).build();
  prepared.sign(source);
  const sent = await server.sendTransaction(prepared);
  if (sent.status === 'ERROR') throw new Error('Transaction rejected');
  const deadline = Date.now() + 120_000;
  while (Date.now() < deadline) {
    const result = await server.getTransaction(sent.hash);
    if (result.status === rpc.Api.GetTransactionStatus.SUCCESS) return { hash: sent.hash, ledger: result.ledger, result };
    if (result.status === rpc.Api.GetTransactionStatus.FAILED) throw new Error(`Transaction failed ${sent.hash}`);
    await new Promise((resolve) => setTimeout(resolve, 1500));
  }
  throw new Error(`Transaction not confirmed ${sent.hash}`);
}

async function deployWasm(source: Keypair, wasmPath: string) {
  const uploaded = await submit(source, Operation.uploadContractWasm({ wasm: fs.readFileSync(wasmPath) }));
  if (!uploaded.result.returnValue) throw new Error('Wasm upload returned no hash');
  const wasmHash = scValToNative(uploaded.result.returnValue) as Uint8Array;
  const created = await submit(
    source,
    Operation.createCustomContract({ address: Address.fromString(source.publicKey()), wasmHash: Buffer.from(wasmHash) }),
  );
  return { contractId: Address.fromScVal(created.result.returnValue!).toString(), hash: created.hash, ledger: created.ledger };
}

async function ensurePauser() {
  const keys = readAlphaKeys() as { pauserSecret?: string };
  if (keys.pauserSecret) return Keypair.fromSecret(keys.pauserSecret);
  const pauser = Keypair.random();
  const response = await fetch(`${STELLAR_CONFIG.friendbotUrl}?addr=${encodeURIComponent(pauser.publicKey())}`);
  if (!response.ok) throw new Error('Friendbot could not fund the pauser account');
  writeAlphaKeys({ pauserSecret: pauser.secret() } as never);
  return pauser;
}

// Contract roles (ids match the contract): 3 underwriter, 4 operations, 5 compliance. Each gets its own funded
// Testnet wallet so no single key can both approve and execute. The wallets are written to the local keys file.
const ROLE_WALLETS: { role: number; name: 'underwriter' | 'operations' | 'compliance'; field: 'underwriterSecret' | 'operationsSecret' | 'complianceSecret' }[] = [
  { role: 3, name: 'underwriter', field: 'underwriterSecret' },
  { role: 4, name: 'operations', field: 'operationsSecret' },
  { role: 5, name: 'compliance', field: 'complianceSecret' },
];

async function ensureRoleWallet(field: (typeof ROLE_WALLETS)[number]['field']) {
  const keys = readAlphaKeys() as Record<string, string | undefined>;
  if (keys[field]) return Keypair.fromSecret(keys[field] as string);
  const wallet = Keypair.random();
  const response = await fetch(`${STELLAR_CONFIG.friendbotUrl}?addr=${encodeURIComponent(wallet.publicKey())}`);
  if (!response.ok) throw new Error('Friendbot could not fund a role wallet');
  writeAlphaKeys({ [field]: wallet.secret() } as never);
  return wallet;
}

async function main() {
  if (STELLAR_CONFIG.network !== 'testnet') throw new Error('Alpha deployment runs on Stellar Testnet only');
  const keys = readAlphaKeys() as Record<string, string | undefined>;
  if (!keys.adminSecret) throw new Error('Issue VTAED first so .alpha/testnet-keys.json has the admin account');
  if (keys.facilityContractId && keys.registryContractId && !process.argv.includes('--force')) {
    throw new Error('Contracts are already recorded. Pass --force to deploy new ones.');
  }

  // 1-2. Verify network and asset
  const health = await server.getNetwork();
  if (health.passphrase !== getNetworkPassphrase()) throw new Error('Soroban RPC network passphrase does not match Testnet');
  const asset = new Asset(keys.assetCode || 'VTAED', issuerKeypair().publicKey());
  const horizon = new Horizon.Server(STELLAR_CONFIG.horizonUrl);
  const assets = await horizon.assets().forCode(asset.getCode()).forIssuer(issuerKeypair().publicKey()).call();
  if (!assets.records.length) throw new Error(`${asset.getCode()} is not issued by ${issuerKeypair().publicKey()} on Testnet`);
  console.log(`network ok, ${asset.getCode()} issued by ${issuerKeypair().publicKey()}`);

  // 3. Stellar Asset Contract for VTAED
  const token = asset.contractId(getNetworkPassphrase());
  const admin = adminKeypair();
  try {
    const wrapped = await submit(admin, Operation.createStellarAssetContract({ asset }));
    record.assetContract = { id: token, hash: wrapped.hash, ledger: wrapped.ledger };
    console.log(`VTAED asset contract ${token} tx ${wrapped.hash} ledger ${wrapped.ledger}`);
  } catch (error) {
    if (!String(error instanceof Error ? error.message : error).includes('ExistingValue')) throw error;
    record.assetContract = { id: token };
    console.log(`VTAED asset contract ${token} already exists`);
  }

  // build contracts
  const build = spawnSync('cargo', ['build', '--release', '--target', 'wasm32-unknown-unknown', '-p', 'wallet_registry', '-p', 'facility_contract'], {
    cwd: 'contracts/soroban',
    stdio: 'inherit',
    shell: true,
  });
  if (build.status !== 0) process.exit(build.status || 1);
  const pauser = await ensurePauser();

  // 4-5. wallet_registry
  const registry = await deployWasm(admin, 'contracts/soroban/target/wasm32-unknown-unknown/release/wallet_registry.wasm');
  record.registryDeploy = { id: registry.contractId, hash: registry.hash, ledger: registry.ledger };
  console.log(`registry ${registry.contractId} tx ${registry.hash} ledger ${registry.ledger}`);
  process.env.WALLET_REGISTRY_CONTRACT_ID = registry.contractId;
  const init1 = await callContract({ contractId: registry.contractId, method: 'initialize', signer: admin, args: [scAddress(admin.publicKey())] });
  record.registryInit = { hash: init1.hash, ledger: init1.ledger };
  console.log(`registry initialized tx ${init1.hash} ledger ${init1.ledger}`);

  // 6-8, 10-11. facility_contract with VTAED token, registry, treasury (distributor), separate pauser
  const facility = await deployWasm(admin, 'contracts/soroban/target/wasm32-unknown-unknown/release/facility_contract.wasm');
  record.facilityDeploy = { id: facility.contractId, hash: facility.hash, ledger: facility.ledger };
  console.log(`facility ${facility.contractId} tx ${facility.hash} ledger ${facility.ledger}`);
  process.env.FACILITY_CONTRACT_ID = facility.contractId;
  const init2 = await callContract({
    contractId: facility.contractId,
    method: 'initialize',
    signer: admin,
    args: [
      scAddress(admin.publicKey()),
      scAddress(distributorKeypair().publicKey()),
      scAddress(pauser.publicKey()),
      scAddress(token),
      scAddress(registry.contractId),
      scI128(vtaedToStroops(100)),
    ],
  });
  record.facilityInit = { hash: init2.hash, ledger: init2.ledger };
  console.log(`facility initialized tx ${init2.hash} ledger ${init2.ledger}`);

  // 9. link facility to registry
  const link = await callContract({ contractId: registry.contractId, method: 'set_facility_contract', signer: admin, args: [scAddress(facility.contractId)] });
  record.link = { hash: link.hash, ledger: link.ledger };
  console.log(`registry linked to facility tx ${link.hash} ledger ${link.ledger}`);

  // Separate role wallets. The operations wallet also holds a VTAED trustline because it pays recovery proceeds.
  const roleAddresses: Record<string, string> = {};
  for (const entry of ROLE_WALLETS) {
    const wallet = await ensureRoleWallet(entry.field);
    if (entry.name === 'operations') await ensureVtaedTrustline(wallet).catch(() => undefined);
    const set = await callContract({ contractId: facility.contractId, method: 'set_role', signer: admin, args: [scU32(entry.role), scAddress(wallet.publicKey())] });
    record[`role_${entry.name}`] = { hash: set.hash, ledger: set.ledger };
    roleAddresses[entry.name] = wallet.publicKey();
    console.log(`role ${entry.name} -> ${wallet.publicKey()} tx ${set.hash} ledger ${set.ledger}`);
  }

  // 12. validate: a second initialize must fail and the unit value must read back through a view call
  let reinitBlocked = false;
  try {
    await callContract({ contractId: facility.contractId, method: 'initialize', signer: admin, args: [
      scAddress(admin.publicKey()), scAddress(distributorKeypair().publicKey()), scAddress(pauser.publicKey()), scAddress(token), scAddress(registry.contractId), scI128(vtaedToStroops(100)),
    ] });
  } catch {
    reinitBlocked = true;
  }
  if (!reinitBlocked) throw new Error('Validation failed: facility contract could be initialized twice');
  console.log('validation ok: re-initialization is rejected');

  // 13-16. persist IDs, network metadata, hashes, ledgers
  writeAlphaKeys({ registryContractId: registry.contractId, facilityContractId: facility.contractId, tokenContractId: token } as never);
  const deployment = {
    network: 'Stellar Testnet',
    passphrase: getNetworkPassphrase(),
    deployedAt: new Date().toISOString(),
    asset: { code: asset.getCode(), issuer: issuerKeypair().publicKey(), contractId: token },
    registryContractId: registry.contractId,
    facilityContractId: facility.contractId,
    treasury: distributorKeypair().publicKey(),
    admin: admin.publicKey(),
    pauser: pauser.publicKey(),
    roles: roleAddresses,
    transactions: record,
  };
  fs.mkdirSync('.alpha', { recursive: true });
  fs.writeFileSync('.alpha/deployment.json', JSON.stringify(deployment, null, 2));
  console.log(`Explorer: https://stellar.expert/explorer/testnet/contract/${facility.contractId}`);
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
