interface KYBResult {
  success: boolean;
  verified: boolean;
  score?: number;
  message: string;
}

export async function verifyCompany(
  tradeLicenseNo: string,
  companyName: string
): Promise<KYBResult> {
  const provider = process.env.KYB_PROVIDER || 'console';

  if (provider === 'console') {
    console.log('🔍 KYB Verification (Stub):');
    console.log('  Trade License:', tradeLicenseNo);
    console.log('  Company Name:', companyName);
    
    return {
      success: true,
      verified: true,
      score: 75,
      message: 'Company verified (stub implementation)',
    };
  }

  console.warn('KYB provider not configured. Using stub.');
  return {
    success: true,
    verified: true,
    message: 'KYB not configured',
  };
}

export async function checkAECBCredit(tradeLicenseNo: string): Promise<{
  score: number;
  status: string;
}> {
  console.log('💳 AECB Credit Check (Stub):', tradeLicenseNo);
  
  return {
    score: 72,
    status: 'GOOD',
  };
}
