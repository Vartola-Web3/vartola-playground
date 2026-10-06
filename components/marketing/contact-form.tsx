'use client';

import { useState } from 'react';
import { INQUIRY_TYPES } from '@/lib/contact/inquiry';

const field = 'mt-1 h-11 w-full rounded-xl border border-white/15 bg-[#07120F] px-3 text-sm text-[#F6FFF9] placeholder:text-[#6F857B] focus:border-[#70FFB8] focus:outline-none';

// Public contact form. It never asks for credentials, identity documents or bank details.
export function ContactForm({ initialType }: { initialType?: string }) {
  const [startedAt] = useState(() => Date.now());
  const [type, setType] = useState(INQUIRY_TYPES.some((item) => item.value === initialType) ? String(initialType) : '');
  const [state, setState] = useState<'idle' | 'sending' | 'done' | 'error'>('idle');
  const [message, setMessage] = useState('');

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setState('sending');
    setMessage('');
    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({
          name: form.get('name'), email: form.get('email'), company: form.get('company'), role: form.get('role'), country: form.get('country'),
          inquiryType: type, sizeEstimate: form.get('sizeEstimate'), message: form.get('message'), consent: form.get('consent') === 'on',
          website: form.get('website'), startedAt,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (response.ok) setState('done');
      else {
        setState('error');
        setMessage(data.error || 'Something went wrong. Please try again.');
      }
    } catch {
      setState('error');
      setMessage('Network error. Please try again.');
    }
  }

  if (state === 'done') {
    return (
      <div role="status" className="rounded-[28px] border border-[rgba(112,255,184,0.3)] bg-[#0E211B] p-8">
        <h2 className="text-2xl font-semibold">Thank you. Your message was received.</h2>
        <p className="mt-3 text-sm leading-7 text-[#9FB8AD]">We will reply to the work email you provided. Vartola is a working Testnet platform: no real money is involved at this stage.</p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-5 rounded-[28px] border border-[rgba(112,255,184,0.14)] bg-[#0E211B] p-6 sm:p-8" noValidate>
      <fieldset>
        <legend className="text-sm font-medium">What is this about?</legend>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          {INQUIRY_TYPES.map((item) => (
            <label key={item.value} className={`cursor-pointer rounded-2xl border p-3 text-sm ${type === item.value ? 'border-[#70FFB8] bg-[#091713]' : 'border-white/10'}`}>
              <input type="radio" name="inquiryType" value={item.value} checked={type === item.value} onChange={() => setType(item.value)} className="sr-only" />
              <span className="font-medium">{item.label}</span>
              <span className="mt-1 block text-xs text-[#9FB8AD]">{item.hint}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="text-sm">Name<input name="name" required maxLength={120} autoComplete="name" className={field} /></label>
        <label className="text-sm">Work email<input name="email" type="email" required maxLength={200} autoComplete="email" className={field} /></label>
        <label className="text-sm">Company<input name="company" maxLength={160} autoComplete="organization" className={field} /></label>
        <label className="text-sm">Role<input name="role" maxLength={120} autoComplete="organization-title" className={field} /></label>
        <label className="text-sm">Country<input name="country" maxLength={80} autoComplete="country-name" className={field} /></label>
        <label className="text-sm">Estimated facility / partnership size (optional)<input name="sizeEstimate" maxLength={80} className={field} /></label>
      </div>
      <label className="block text-sm">Message
        <textarea name="message" required minLength={10} maxLength={4000} rows={5} className="mt-1 w-full rounded-xl border border-white/15 bg-[#07120F] p-3 text-sm text-[#F6FFF9] focus:border-[#70FFB8] focus:outline-none" />
      </label>
      <div aria-hidden className="absolute left-[-9999px] h-0 w-0 overflow-hidden"><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
      <label className="flex items-start gap-3 text-sm text-[#C3D1CB]">
        <input name="consent" type="checkbox" required className="mt-1 h-4 w-4" />
        <span>I agree that Vartola may contact me about this enquiry. Please do not send passwords, identity documents or bank details through this form.</span>
      </label>
      {state === 'error' ? <p role="alert" className="text-sm text-red-300">{message}</p> : null}
      <button type="submit" disabled={state === 'sending' || !type} className="rounded-full bg-[#35F49A] px-6 py-3 text-sm font-semibold text-[#07120F] disabled:opacity-50">{state === 'sending' ? 'Sending…' : 'Send message'}</button>
    </form>
  );
}
