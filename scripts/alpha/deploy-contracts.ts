import { spawnSync } from 'child_process';
import { readAlphaKeys, writeAlphaKeys } from '../../lib/stellar/keys';
import { setFacilityContractOnRegistry } from '../../lib/alpha/chain';

const keys = readAlphaKeys();
if (!keys.adminSecret) {
  console.error('Issue VTAED first so the admin account exists in .alpha/testnet-keys.json');
  process.exit(1);
}

const build = spawnSync('cargo', ['build', '--release', '--target', 'wasm32-unknown-unknown', '-p', 'wallet_registry', '-p', 'facility_contract'], {
  cwd: 'contracts/soroban',
  stdio: 'inherit',
  shell: true,
});
if (build.status !== 0) process.exit(build.status || 1);

function deploy(name: string, wasm: string) {
  const result = spawnSync('stellar', ['contract', 'deploy', '--wasm', wasm, '--source', keys.adminSecret!, '--network', 'testnet'], {
    cwd: 'contracts/soroban',
    encoding: 'utf8',
    shell: true,
  });
  if (result.status !== 0) {
    console.error(result.stderr || result.stdout);
    process.exit(result.status || 1);
  }
  const id = (result.stdout || '').trim().split(/\s+/).pop() || '';
  console.log(`${name} ${id}`);
  return id;
}

const registry = deploy('registry', 'target/wasm32-unknown-unknown/release/wallet_registry.wasm');
const facility = deploy('facility', 'target/wasm32-unknown-unknown/release/facility_contract.wasm');
writeAlphaKeys({ registryContractId: registry, facilityContractId: facility });
process.env.WALLET_REGISTRY_CONTRACT_ID = registry;
process.env.FACILITY_CONTRACT_ID = facility;

setFacilityContractOnRegistry(facility).then((result) => {
  console.log(`registry linked ${result.hash}`);
}).catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
