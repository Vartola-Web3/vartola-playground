interface EmailParams {
  to: string;
  subject: string;
  body: string;
  html?: string;
}

export async function sendEmail(params: EmailParams): Promise<boolean> {
  const provider = process.env.EMAIL_PROVIDER || 'console';

  if (provider === 'console') {
    console.log('📧 Email (Console Mode):');
    console.log('  To:', params.to);
    console.log('  Subject:', params.subject);
    console.log('  Body:', params.body);
    return true;
  }

  console.warn('Email provider not configured. Using console mode.');
  return true;
}

export async function sendApplicationApprovedEmail(
  email: string,
  applicationNo: string,
  facilityNo: string
): Promise<boolean> {
  return sendEmail({
    to: email,
    subject: `Application ${applicationNo} Approved`,
    body: `Your financing application ${applicationNo} has been approved. Facility ${facilityNo} is now active.`,
  });
}

export async function sendApplicationRejectedEmail(
  email: string,
  applicationNo: string,
  reason: string
): Promise<boolean> {
  return sendEmail({
    to: email,
    subject: `Application ${applicationNo} Status Update`,
    body: `Your financing application ${applicationNo} has been reviewed. Reason: ${reason}`,
  });
}

export async function sendInvestmentConfirmationEmail(
  email: string,
  poolName: string,
  amount: number
): Promise<boolean> {
  return sendEmail({
    to: email,
    subject: `Investment Confirmation - ${poolName}`,
    body: `Your investment of AED ${amount.toLocaleString()} in ${poolName} has been confirmed.`,
  });
}
