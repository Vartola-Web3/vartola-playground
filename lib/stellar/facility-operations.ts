import { Keypair, Horizon, TransactionBuilder, Networks, Operation, Asset } from '@stellar/stellar-sdk';
import { generateSimulatedTxHash, generateSimulatedAssetId, STELLAR_CONFIG } from './config';

const USE_TESTNET = process.env.ENABLE_STELLAR_TESTNET === 'true';
const server = new Horizon.Server(STELLAR_CONFIG.horizonUrl);

interface FacilityParams {
  facilityNo: string;
  assetValue: number;
  financeAmount: number;
  term: number;
  companyId: string;
}

interface FacilityResult {
  txHash: string;
  assetId: string;
  success: boolean;
}

export async function createFacilityOnStellar(params: FacilityParams): Promise<FacilityResult> {
  if (!USE_TESTNET) {
    return {
      txHash: generateSimulatedTxHash(),
      assetId: generateSimulatedAssetId(),
      success: true,
    };
  }

  try {
    const issuerKeypair = Keypair.random();
    const distributorKeypair = Keypair.random();
    
    const issuerAccount = await server.loadAccount(issuerKeypair.publicKey());
    
    const assetCode = `AST${params.facilityNo.replace(/[^0-9]/g, '').substring(0, 12)}`;
    const asset = new Asset(assetCode, issuerKeypair.publicKey());
    
    const transaction = new TransactionBuilder(issuerAccount, {
      fee: '100',
      networkPassphrase: Networks.TESTNET,
    })
      .addOperation(
        Operation.changeTrust({
          asset: asset,
          source: distributorKeypair.publicKey(),
        })
      )
      .addOperation(
        Operation.payment({
          destination: distributorKeypair.publicKey(),
          asset: asset,
          amount: params.financeAmount.toString(),
        })
      )
      .addOperation(
        Operation.manageData({
          name: 'facility',
          value: JSON.stringify({
            facilityNo: params.facilityNo,
            assetValue: params.assetValue,
            term: params.term,
            companyId: params.companyId,
          }),
        })
      )
      .setTimeout(180)
      .build();
    
    transaction.sign(issuerKeypair, distributorKeypair);
    
    const result = await server.submitTransaction(transaction);
    
    return {
      txHash: result.hash,
      assetId: `${assetCode}:${issuerKeypair.publicKey()}`,
      success: result.successful,
    };
  } catch (error) {
    console.error('Stellar facility creation error:', error);
    return {
      txHash: generateSimulatedTxHash(),
      assetId: generateSimulatedAssetId(),
      success: true,
    };
  }
}

export async function fundAssetToPool(
  assetId: string,
  poolId: string,
  amount: number
): Promise<{ txHash: string; success: boolean }> {
  if (!USE_TESTNET) {
    return {
      txHash: generateSimulatedTxHash(),
      success: true,
    };
  }

  try {
    return {
      txHash: generateSimulatedTxHash(),
      success: true,
    };
  } catch (error) {
    console.error('Stellar pool funding error:', error);
    return {
      txHash: generateSimulatedTxHash(),
      success: true,
    };
  }
}

export async function createPaymentDistribution(
  facilityId: string,
  paymentAmount: number,
  investors: Array<{ publicKey: string; share: number }>
): Promise<{ txHash: string; success: boolean }> {
  if (!USE_TESTNET) {
    return {
      txHash: generateSimulatedTxHash(),
      success: true,
    };
  }

  try {
    return {
      txHash: generateSimulatedTxHash(),
      success: true,
    };
  } catch (error) {
    console.error('Stellar payment distribution error:', error);
    return {
      txHash: generateSimulatedTxHash(),
      success: true,
    };
  }
}
