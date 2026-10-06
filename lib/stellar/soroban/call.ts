import {
  Address,
  BASE_FEE,
  Contract,
  Keypair,
  TransactionBuilder,
  nativeToScVal,
  rpc,
  scValToNative,
  xdr,
} from '@stellar/stellar-sdk';
import { STELLAR_CONFIG, getNetworkPassphrase } from '@/lib/stellar/config';

const server = new rpc.Server(STELLAR_CONFIG.sorobanRpcUrl);

export function scAddress(value: string) {
  return Address.fromString(value).toScVal();
}

export function scString(value: string) {
  return nativeToScVal(value, { type: 'string' });
}

export function scI128(value: bigint) {
  return nativeToScVal(value, { type: 'i128' });
}

export function scU32(value: number) {
  return nativeToScVal(value, { type: 'u32' });
}

export function scBool(value: boolean) {
  return nativeToScVal(value, { type: 'bool' });
}

export async function callContract(input: {
  contractId: string;
  method: string;
  args: xdr.ScVal[];
  signer: Keypair;
}) {
  if (STELLAR_CONFIG.network !== 'testnet') {
    throw new Error('Alpha contracts run on Stellar Testnet only');
  }
  const account = await server.getAccount(input.signer.publicKey());
  const tx = new TransactionBuilder(account, {
    fee: BASE_FEE,
    networkPassphrase: getNetworkPassphrase(),
  })
    .addOperation(new Contract(input.contractId).call(input.method, ...input.args))
    .setTimeout(120)
    .build();

  const simulated = await server.simulateTransaction(tx);
  if (rpc.Api.isSimulationError(simulated)) {
    throw new Error(simulated.error || 'Soroban simulation failed');
  }
  const prepared = rpc.assembleTransaction(tx, simulated).build();
  prepared.sign(input.signer);
  const sent = await server.sendTransaction(prepared);
  if (sent.status === 'ERROR') {
    throw new Error('Soroban rejected the transaction');
  }
  const hash = sent.hash;
  const deadline = Date.now() + 90_000;
  while (Date.now() < deadline) {
    const result = await server.getTransaction(hash);
    if (result.status === rpc.Api.GetTransactionStatus.SUCCESS) {
      const returnValue = result.returnValue ? scValToNative(result.returnValue) : null;
      return { hash, ledger: result.ledger, returnValue };
    }
    if (result.status === rpc.Api.GetTransactionStatus.FAILED) {
      throw new Error('Soroban transaction failed');
    }
    await new Promise((resolve) => setTimeout(resolve, 1500));
  }
  throw new Error('Soroban transaction was not confirmed');
}

export function sorobanServer() {
  return server;
}

// Read-only contract call: simulates the invocation and returns the decoded result. Nothing is submitted.
export async function viewContract(contractId: string, method: string, args: xdr.ScVal[], source?: Keypair) {
  const signer = source?.publicKey() || (await import('@/lib/stellar/keys')).adminKeypair().publicKey();
  const account = await server.getAccount(signer);
  const tx = new TransactionBuilder(account, { fee: BASE_FEE, networkPassphrase: getNetworkPassphrase() })
    .addOperation(new Contract(contractId).call(method, ...args))
    .setTimeout(60)
    .build();
  const simulated = await server.simulateTransaction(tx);
  if (rpc.Api.isSimulationError(simulated)) throw new Error(simulated.error || 'Soroban view failed');
  return simulated.result ? scValToNative(simulated.result.retval) : null;
}
