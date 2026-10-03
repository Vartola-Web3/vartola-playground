export function transakConfigured() {
  return Boolean(process.env.TRANSAK_API_KEY);
}

export function createTransakWidgetUrl(input: {
  userId: string;
  email?: string | null;
  amount: number;
  walletAddress?: string | null;
  direction: 'BUY' | 'SELL';
  orderId: string;
}) {
  const apiKey = process.env.TRANSAK_API_KEY || '';
  if (!apiKey) throw new Error('Transak Sandbox API key is not configured');
  const query = new URLSearchParams({
    apiKey,
    environment: 'STAGING',
    defaultFiatCurrency: 'AED',
    defaultCryptoCurrency: 'USDC',
    network: 'stellar',
    productsAvailed: input.direction === 'BUY' ? 'BUY' : 'SELL',
    fiatAmount: String(input.amount),
    partnerCustomerId: input.userId,
    partnerOrderId: input.orderId,
  });
  if (input.email) query.set('email', input.email);
  if (input.walletAddress) query.set('walletAddress', input.walletAddress);
  return `https://global-stg.transak.com/?${query.toString()}`;
}
