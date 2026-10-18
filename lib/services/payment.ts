interface PaymentResult {
  success: boolean;
  transactionId: string;
  message: string;
}

// Card and bank payment adapters are not implemented. They must never return a fake transaction id or
// report success. Installment settlement runs through the platform ledger and, in Alpha, Soroban; this
// adapter is reserved for a future regulated payment provider.
export async function processPayment(
  amount: number,
  currency: string,
  description: string
): Promise<PaymentResult> {
  const provider = process.env.PAYMENT_PROVIDER || 'console';
  console.log('Payment was not taken:', amount, currency, description, provider === 'console' ? '(no provider configured)' : `(provider "${provider}" has no adapter)`);
  return {
    success: false,
    transactionId: '',
    message: 'Payment provider is not configured. No payment was taken.',
  };
}

export async function refundPayment(transactionId: string): Promise<PaymentResult> {
  console.log('Refund was not issued for', transactionId, '(no provider configured)');
  return {
    success: false,
    transactionId: '',
    message: 'Refund provider is not configured. No refund was issued.',
  };
}
