import record from './testnet-record.generated.json';

type Tx = { hash: string; ledger: number };
export const TESTNET = record as unknown as {
  network: string;
  deployment: {
    asset: { code: string; issuer: string; contractId: string };
    registryContractId: string;
    facilityContractId: string;
    admin: string;
    pauser: string;
    roles?: Record<string, string>;
    contractVersion?: number;
    history?: { version: string; facilityContractId: string; registryContractId: string; note: string }[];
    treasury: string;
    transactions: Record<string, Tx>;
  };
  facilities: {
    facilityNo: string;
    financeAmount: number;
    term: number;
    status: string;
    chainStatus: string;
    participationUnits: number;
    events: { eventType: string; txHash: string; ledger: number }[];
  }[];
  exportedAt: string;
};

export const EXPLORER = 'https://stellar.expert/explorer/testnet';
export const txUrl = (hash: string) => EXPLORER + '/tx/' + hash;
export const contractUrl = (id: string) => EXPLORER + '/contract/' + id;
export const accountUrl = (id: string) => EXPLORER + '/account/' + id;
