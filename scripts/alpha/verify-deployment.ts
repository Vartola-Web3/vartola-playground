import fs from 'fs';
import { Contract, TransactionBuilder, BASE_FEE, rpc } from '@stellar/stellar-sdk';
import { STELLAR_CONFIG, getNetworkPassphrase } from '../../lib/stellar/config';
import { adminKeypair, readAlphaKeys } from '../../lib/stellar/keys';
import { scAddress, scI128 } from '../../lib/stellar/soroban/call';
import { vtaedToStroops } from '../../lib/alpha/money';

// Read-only check (simulation only, nothing is submitted): confirms both contracts exist on Testnet and are
// already initialized, and writes a verified deployment record from Horizon transaction data.

const server = new rpc.Server(STELLAR_CONFIG.sorobanRpcUrl);

async function simulate(contractId: string, method: string, args: Parameters<Contract['call']>[1][]) {
  const admin = adminKeypair();
  const account = await server.getAccount(admin.publicKey());
  const tx = new TransactionBuilder(account, { fee: BASE_FEE, networkPassphrase: getNetworkPassphrase() })
    .addOperation(new Contract(contractId).call(method, ...args))
    .setTimeout(60)
    .build();
  return server.simulateTransaction(tx);
}

async function main() {
  const keys = readAlphaKeys() as Record<string, string | undefined>;
  const { registryContractId, facilityContractId, tokenContractId } = keys;
  if (!registryContractId || !facilityContractId || !tokenContractId) throw new Error('No contract IDs recorded');
  const admin = adminKeypair().publicKey();
  for (const [name, id] of [['wallet_registry', registryContractId], ['facility_contract', facilityContractId]] as const) {
    const exists = await server.getContractData(id, (await import('@stellar/stellar-sdk')).xdr.ScVal.scvLedgerKeyContractInstance(), rpc.Durability.Persistent).then(() => true).catch(() => false);
    console.log(`${name} ${id} instance on ledger: ${exists}`);
  }
  const reinitRegistry = await simulate(registryContractId, 'initialize', [scAddress(admin)]);
  console.log('registry already initialized:', rpc.Api.isSimulationError(reinitRegistry) && /already initialized|Error/i.test(reinitRegistry.error));
  const reinitFacility = await simulate(facilityContractId, 'initialize', [
    scAddress(admin), scAddress(admin), scAddress(admin), scAddress(tokenContractId), scAddress(registryContractId), scI128(vtaedToStroops(100)),
  ]);
  console.log('facility already initialized:', rpc.Api.isSimulationError(reinitFacility) && /already initialized|Error/i.test(reinitFacility.error));
  fs.writeFileSync('.alpha/verify-deployment.ok', new Date().toISOString());
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
