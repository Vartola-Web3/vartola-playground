import { isAlphaMode } from '@/lib/config/app-mode';

// Email and SMS provider abstractions.
// DEMO uses a console provider that only logs, and says so. ALPHA needs a configured provider and refuses to
// pretend that a console line is a delivered message.

export type Message = { to: string; subject?: string; body: string; template: TemplateName };

export type TemplateName =
  | 'KYC_STATUS'
  | 'FACILITY_FUNDED'
  | 'RELEASE_EXECUTED'
  | 'PAYMENT_DUE'
  | 'LATE_PAYMENT'
  | 'DISTRIBUTION'
  | 'DEFAULT_NOTICE'
  | 'OPERATIONS_ALERT';

export interface EmailProvider {
  readonly kind: 'CONSOLE' | 'WEBHOOK';
  send(message: Message): Promise<{ delivered: boolean; reference?: string }>;
}

export interface SmsProvider {
  readonly kind: 'CONSOLE' | 'WEBHOOK';
  send(message: Omit<Message, 'subject'>): Promise<{ delivered: boolean; reference?: string }>;
}

class ConsoleProvider implements EmailProvider, SmsProvider {
  readonly kind = 'CONSOLE' as const;
  async send(message: Message) {
    console.log(`[demo notification: not delivered] ${message.template} -> ${message.to}`);
    return { delivered: false };
  }
}

class WebhookProvider implements EmailProvider, SmsProvider {
  readonly kind = 'WEBHOOK' as const;
  constructor(private readonly url: string, private readonly token: string) {}
  async send(message: Message) {
    const response = await fetch(this.url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${this.token}` },
      body: JSON.stringify(message),
    });
    if (!response.ok) throw new Error(`Notification provider rejected the message (${response.status})`);
    return { delivered: true, reference: response.headers.get('x-message-id') || undefined };
  }
}

export function emailProvider(): EmailProvider {
  const url = process.env.EMAIL_PROVIDER_URL;
  if (url) return new WebhookProvider(url, process.env.EMAIL_PROVIDER_TOKEN || '');
  if (isAlphaMode()) throw new Error('EMAIL_PROVIDER_URL is required in Alpha mode');
  return new ConsoleProvider();
}

export function smsProvider(): SmsProvider {
  const url = process.env.SMS_PROVIDER_URL;
  if (url) return new WebhookProvider(url, process.env.SMS_PROVIDER_TOKEN || '');
  if (isAlphaMode()) throw new Error('SMS_PROVIDER_URL is required in Alpha mode');
  return new ConsoleProvider();
}

export const TEMPLATES: Record<TemplateName, { subject: string; body: (facility: string) => string }> = {
  KYC_STATUS: { subject: 'Your verification status changed', body: () => 'Your Vartola verification status has changed. Sign in to see the result.' },
  FACILITY_FUNDED: { subject: 'A facility you joined is fully funded', body: (facility) => `${facility} reached its funding target. Funds stay in escrow until release conditions are met.` },
  RELEASE_EXECUTED: { subject: 'Supplier payment released', body: (facility) => `Escrow for ${facility} was released to the approved supplier.` },
  PAYMENT_DUE: { subject: 'A payment is due', body: (facility) => `An installment for ${facility} is due soon.` },
  LATE_PAYMENT: { subject: 'A payment is late', body: (facility) => `An installment for ${facility} is late. Please contact us if you need help.` },
  DISTRIBUTION: { subject: 'A distribution was made', body: (facility) => `A distribution from ${facility} was recorded. Testnet values have no monetary value.` },
  DEFAULT_NOTICE: { subject: 'Notice regarding your facility', body: (facility) => `Notice regarding ${facility}.` },
  OPERATIONS_ALERT: { subject: 'Vartola operations alert', body: (detail) => detail },
};

// A default notice is a legal act. It is never sent automatically; it needs explicit counsel approval, set by an
// operator, and the caller must pass the approval flag for the specific notice.
export class LegalApprovalRequired extends Error {}

export async function sendNotification(channel: 'email' | 'sms', to: string, template: TemplateName, facility: string, options: { legalApproved?: boolean } = {}) {
  if (template === 'DEFAULT_NOTICE' && !(options.legalApproved && process.env.DEFAULT_NOTICES_APPROVED_BY_COUNSEL === 'true')) {
    throw new LegalApprovalRequired('Default notices are legal documents and need counsel approval before they are sent');
  }
  const content = TEMPLATES[template];
  const message: Message = { to, subject: content.subject, body: content.body(facility), template };
  return channel === 'email' ? emailProvider().send(message) : smsProvider().send({ to, body: message.body, template });
}
