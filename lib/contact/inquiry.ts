import { createHash } from 'crypto';

// Public contact form rules. Pure and tested. The form collects only what is needed to reply: no financial
// credentials, no identity documents, no secrets.

export const INQUIRY_TYPES = [
  { value: 'sme', label: 'SME / Business', hint: 'I need financing for productive assets.' },
  { value: 'supplier', label: 'Supplier', hint: 'I want to join the supplier network.' },
  { value: 'capital', label: 'Capital / Investor', hint: 'I want to explore facility participation or capital partnerships.' },
  { value: 'institution', label: 'Finance / Institutional Partner', hint: 'I want to discuss financing infrastructure or regulated partnership.' },
  { value: 'technology', label: 'Technology / Stellar', hint: 'I want to discuss technical integration or ecosystem collaboration.' },
  { value: 'general', label: 'Media / General', hint: 'General enquiry.' },
] as const;
export type InquiryType = (typeof INQUIRY_TYPES)[number]['value'];

export const CONTACT_STATUSES = ['NEW', 'CONTACTED', 'QUALIFIED', 'PARTNER_DISCUSSION', 'PILOT', 'CLOSED', 'SPAM'] as const;
export type ContactStatus = (typeof CONTACT_STATUSES)[number];

export const LIMITS = { name: 120, email: 200, company: 160, role: 120, country: 80, size: 80, message: 4000 } as const;

export type InquiryInput = {
  name?: unknown; email?: unknown; company?: unknown; role?: unknown; country?: unknown;
  inquiryType?: unknown; sizeEstimate?: unknown; message?: unknown; consent?: unknown;
  website?: unknown; // honeypot: real people leave it empty
  startedAt?: unknown; // client timestamp when the form was shown
};

export type CleanInquiry = { name: string; email: string; company: string; role: string; country: string; inquiryType: InquiryType; sizeEstimate: string; message: string; consent: true };
export type Validation = { ok: true; value: CleanInquiry; spam: boolean } | { ok: false; error: string; spam: boolean };

const text = (value: unknown, max: number) => (typeof value === 'string' ? value.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, '').trim().slice(0, max) : '');
const EMAIL = /^[^\s@]{1,64}@[^\s@]+\.[^\s@]{2,}$/;

// Heuristics only. A flagged message is stored with status SPAM for review rather than silently dropped, except a
// filled honeypot, which is dropped without telling the sender anything useful.
export function looksLikeSpam(message: string) {
  const links = (message.match(/https?:\/\//gi) || []).length;
  return links > 2 || /\b(viagra|casino|crypto giveaway|seo services|backlinks)\b/i.test(message);
}

export function validateInquiry(input: InquiryInput, now = Date.now()): Validation {
  if (typeof input.website === 'string' && input.website.trim()) return { ok: false, error: 'Invalid submission.', spam: true };
  const started = Number(input.startedAt);
  if (Number.isFinite(started) && started > 0 && now - started < 2500) return { ok: false, error: 'Please take a moment to complete the form.', spam: true };
  const name = text(input.name, LIMITS.name);
  const email = text(input.email, LIMITS.email).toLowerCase();
  const message = text(input.message, LIMITS.message);
  const inquiryType = INQUIRY_TYPES.find((type) => type.value === input.inquiryType)?.value;
  if (!name) return { ok: false, error: 'Please enter your name.', spam: false };
  if (!EMAIL.test(email)) return { ok: false, error: 'Please enter a valid work email.', spam: false };
  if (!inquiryType) return { ok: false, error: 'Please choose an inquiry type.', spam: false };
  if (message.length < 10) return { ok: false, error: 'Please add a short message (at least 10 characters).', spam: false };
  if (input.consent !== true) return { ok: false, error: 'Please confirm you agree to be contacted.', spam: false };
  return {
    ok: true,
    spam: looksLikeSpam(message),
    value: { name, email, company: text(input.company, LIMITS.company), role: text(input.role, LIMITS.role), country: text(input.country, LIMITS.country), inquiryType, sizeEstimate: text(input.sizeEstimate, LIMITS.size), message, consent: true },
  };
}

// IPs are never stored raw. A salted hash is enough to spot repeated abuse.
export function hashIp(ip: string, salt = process.env.CONTACT_IP_SALT || 'vartola-contact') {
  return createHash('sha256').update(`${salt}:${ip}`).digest('hex').slice(0, 32);
}

export function notificationText(value: CleanInquiry) {
  return `New Vartola enquiry (${value.inquiryType}) from ${value.name}${value.company ? `, ${value.company}` : ''}. Open /admin/contacts to review. Message and contact details are in the admin area, not in this notification.`;
}
