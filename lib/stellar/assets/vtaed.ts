import { Asset, BASE_FEE, Horizon, Keypair, Operation, TransactionBuilder, xdr } from '@stellar/stellar-sdk';
import { STELLAR_CONFIG, getNetworkPassphrase } from '@/lib/stellar/config';
import { adminKeypair, distributorKeypair, issuerKeypair, writeAlphaKeys } from '@/lib/stellar/keys';
import { vtaedToStroops } from '@/lib/alpha/money';

export const VTAED_CODE = process.env.VTAED_ASSET_CODE || 'VTAED';

export function vtaedAsset() {
  return new Asset(VTAED_CODE, issuerKeypair().publicKey());
}

function horizon() {
  return new Horizon.Server(STELLAR_CONFIG.horizonUrl);
}

export async function fundWithFriendbot(publicKey: string) {
  const response = await fetch(`${STELLAR_CONFIG.friendbotUrl}?addr=${encodeURIComponent(publicKey)}`);
  if (response.ok) return;
  const body = await response.text();
  if (response.status === 400 && /createAccountAlreadyExist|already funded|op_already_exists/i.test(body)) return;
  throw new Error('Friendbot could not fund the Testnet account');
}

async function submit(source: Keypair, operations: xdr.Operation[]) {
  const account = await horizon().loadAccount(source.publicKey());
  const tx = new TransactionBuilder(account, { fee: BASE_FEE, networkPassphrase: getNetworkPassphrase() })
    .setTimeout(120);
  for (const operation of operations) tx.addOperation(operation);
  const built = tx.build();
  built.sign(source);
  return horizon().submitTransaction(built);
}

export async function ensureVtaedTrustline(account: Keypair) {
  await submit(account, [Operation.changeTrust({ asset: vtaedAsset() })]);
}

export async function payVtaed(destination: string, amount: number) {
  const distributor = distributorKeypair();
  const tx = await submit(distributor, [
    Operation.payment({
      destination,
      asset: vtaedAsset(),
      amount: amount.toFixed(7),
    }),
  ]);
  return tx.hash;
}

export async function vtaedBalance(publicKey: string) {
  try {
    const account = await horizon().loadAccount(publicKey);
    const asset = vtaedAsset();
    const line = account.balances.find((row) => (
      row.asset_type !== 'native'
      && 'asset_code' in row
      && row.asset_code === asset.getCode()
      && row.asset_issuer === asset.getIssuer()
    ));
    return line && 'balance' in line ? Number(line.balance) : 0;
  } catch {
    return 0;
  }
}

export async function issueVtaedSupply(amount = 100_000_000) {
  if (STELLAR_CONFIG.network !== 'testnet') throw new Error('VTAED can be issued on Testnet only');
  const issuer = issuerKeypair();
  const distributor = distributorKeypair();
  const admin = adminKeypair();
  await fundWithFriendbot(issuer.publicKey());
  await fundWithFriendbot(distributor.publicKey());
  await fundWithFriendbot(admin.publicKey());
  await ensureVtaedTrustline(distributor);
  await ensureVtaedTrustline(admin);
  const tx = await submit(issuer, [
    Operation.payment({ destination: distributor.publicKey(), asset: vtaedAsset(), amount: amount.toFixed(7) }),
  ]);
  writeAlphaKeys({
    issuerSecret: issuer.secret(),
    distributorSecret: distributor.secret(),
    adminSecret: admin.secret(),
    assetCode: VTAED_CODE,
  });
  return { hash: tx.hash, issuer: issuer.publicKey(), distributor: distributor.publicKey(), admin: admin.publicKey(), amount };
}

export function stroopsAmount(amount: number) {
  return vtaedToStroops(amount);
}
