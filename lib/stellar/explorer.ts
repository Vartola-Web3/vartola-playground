export function stellarReviewUrl(txHash?: string | null) {
  if (!txHash || !/^[a-f0-9]{64}$/i.test(txHash)) return null;
  return `https://stellar.expert/explorer/testnet/tx/${txHash}`;
}
