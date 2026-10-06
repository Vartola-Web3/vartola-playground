import { Keypair } from '@stellar/stellar-sdk';
import { readAlphaKeys, writeAlphaKeys } from '../../lib/stellar/keys';
import { issueVtaedSupply } from '../../lib/stellar/assets/vtaed';

const existing = readAlphaKeys();
if (!process.env.STELLAR_ISSUER_SECRET && !existing.issuerSecret) {
  const issuer = Keypair.random();
  const distributor = Keypair.random();
  const admin = Keypair.random();
  writeAlphaKeys({
    issuerSecret: issuer.secret(),
    distributorSecret: distributor.secret(),
    adminSecret: admin.secret(),
    assetCode: 'VTAED',
  });
}

issueVtaedSupply().then((result) => {
  console.log(JSON.stringify({
    hash: result.hash,
    issuer: result.issuer,
    distributor: result.distributor,
    admin: result.admin,
    amount: result.amount,
    asset: 'VTAED',
    network: 'testnet',
  }, null, 2));
}).catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
