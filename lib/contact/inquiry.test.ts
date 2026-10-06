import assert from 'node:assert/strict';
import test from 'node:test';
import { CONTACT_STATUSES, INQUIRY_TYPES, hashIp, looksLikeSpam, notificationText, validateInquiry } from './inquiry';

const good = { name: 'Aisha Khan', email: 'Aisha@Example.com', company: 'Gulf Logistics', role: 'COO', country: 'UAE', inquiryType: 'sme', sizeEstimate: '150k', message: 'We want to finance four vans for deliveries.', consent: true };

test('a valid enquiry is cleaned and accepted', () => {
  const result = validateInquiry(good);
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.equal(result.value.email, 'aisha@example.com');
    assert.equal(result.spam, false);
  }
});

test('missing fields, a bad email, an unknown type and no consent are refused with a clear message', () => {
  assert.equal(validateInquiry({ ...good, name: '' }).ok, false);
  assert.equal(validateInquiry({ ...good, email: 'not-an-email' }).ok, false);
  assert.equal(validateInquiry({ ...good, inquiryType: 'bank' }).ok, false);
  assert.equal(validateInquiry({ ...good, message: 'short' }).ok, false);
  const noConsent = validateInquiry({ ...good, consent: false });
  assert.equal(noConsent.ok, false);
  if (!noConsent.ok) assert.match(noConsent.error, /agree/i);
});

test('a filled honeypot or a too-fast submission is treated as a bot', () => {
  const trap = validateInquiry({ ...good, website: 'http://spam.example' });
  assert.equal(trap.ok, false);
  assert.equal(trap.spam, true);
  const now = Date.now();
  assert.equal(validateInquiry({ ...good, startedAt: now - 500 }, now).spam, true);
  assert.equal(validateInquiry({ ...good, startedAt: now - 10_000 }, now).ok, true);
});

test('link-heavy or spam-phrase messages are flagged, not silently trusted', () => {
  assert.equal(looksLikeSpam('see http://a.com http://b.com http://c.com'), true);
  assert.equal(looksLikeSpam('cheap SEO services and backlinks'), true);
  assert.equal(looksLikeSpam('We need financing for vans.'), false);
  const flagged = validateInquiry({ ...good, message: 'visit http://a.com http://b.com http://c.com now please' });
  assert.equal(flagged.ok && flagged.spam, true);
});

test('over-long input is truncated and control characters are removed', () => {
  const result = validateInquiry({ ...good, message: 'x'.repeat(9000) + '\u0007' });
  assert.equal(result.ok && result.value.message.length, 4000);
});

test('the IP is only ever stored as a salted hash, and the notification carries no personal message', () => {
  assert.notEqual(hashIp('203.0.113.9'), '203.0.113.9');
  assert.equal(hashIp('203.0.113.9'), hashIp('203.0.113.9'));
  assert.notEqual(hashIp('203.0.113.9', 'other'), hashIp('203.0.113.9'));
  const result = validateInquiry(good);
  assert.ok(result.ok);
  if (result.ok) {
    const text = notificationText(result.value);
    assert.equal(text.includes(result.value.email), false);
    assert.equal(text.includes(result.value.message), false);
  }
});

test('the six inquiry types and seven statuses required by the brief exist', () => {
  assert.equal(INQUIRY_TYPES.length, 6);
  assert.deepEqual([...CONTACT_STATUSES], ['NEW', 'CONTACTED', 'QUALIFIED', 'PARTNER_DISCUSSION', 'PILOT', 'CLOSED', 'SPAM']);
});
