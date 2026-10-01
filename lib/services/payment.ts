interface PaymentResult {
  success: boolean;
  transactionId: string;
  message: string;
}

export async function processPayment(
  amount: number,
  currency: string,
  description: string
): Promise<PaymentResult> {
  const provider = process.env.PAYMENT_PROVIDER || 'console';

  if (provider === 'console') {
    console.log('💳 Payment Processing (Stub):');
    console.log('  Amount:', amount, currency);
    console.log('  Description:', description);
    
    return {
      success: true,
      transactionId: `TXN-${Date.now()}`,
      message: 'Payment processed successfully (stub)',
    };
  }

  console.warn('Payment provider not configured. Using stub.');
  return {
    success: true,
    transactionId: `STUB-${Date.now()}`,
    message: 'Payment stub',
  };
}

export async function refundPayment(transactionId: string): Promise<PaymentResult> {
  console.log('♻️ Refund Processing (Stub):', transactionId);
  
  return {
    success: true,
    transactionId: `REF-${Date.now()}`,
    message: 'Refund processed (stub)',
  };
}
