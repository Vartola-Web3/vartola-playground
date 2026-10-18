interface KYBResult {
  success: boolean;
  verified: boolean;
  score?: number;
  message: string;
}

// KYB and credit-bureau adapters are not implemented. They must never report a verification or a score
// that was not actually produced by a provider. When a real adapter is added, it returns the provider
// result here; until then the caller gets an explicit "not performed" answer.
export async function verifyCompany(
  tradeLicenseNo: string,
  companyName: string
): Promise<KYBResult> {
  const provider = process.env.KYB_PROVIDER || 'console';
  console.log('KYB verification was not performed for', companyName, provider === 'console' ? '(no provider configured)' : `(provider "${provider}" has no adapter)`);
  return {
    success: false,
    verified: false,
    message: 'KYB provider is not configured. No verification was performed.',
  };
}

export async function checkAECBCredit(tradeLicenseNo: string): Promise<{
  score: number;
  status: string;
}> {
  console.log('AECB credit check was not performed for', tradeLicenseNo, '(no provider configured)');
  return {
    score: 0,
    status: 'NOT_CONFIGURED',
  };
}
