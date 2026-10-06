import assert from 'node:assert/strict';
import test from 'node:test';
import { mapSumsubEvent, nextComplianceState } from './sumsub-status';

test('only a GREEN review maps to VERIFIED', () => {
  assert.equal(mapSumsubEvent({ type: 'applicantReviewed', reviewResult: { reviewAnswer: 'GREEN' } }), 'VERIFIED');
  assert.equal(mapSumsubEvent({ type: 'applicantPending' }), 'PENDING');
  assert.equal(mapSumsubEvent({ type: 'applicantCreated' }), 'SESSION_CREATED');
});

test('a retryable rejection needs review and a final rejection is REJECTED', () => {
  assert.equal(mapSumsubEvent({ reviewResult: { reviewAnswer: 'RED', reviewRejectType: 'RETRY' } }), 'NEEDS_REVIEW');
  assert.equal(mapSumsubEvent({ reviewResult: { reviewAnswer: 'RED', reviewRejectType: 'FINAL' } }), 'REJECTED');
});

test('unknown events never approve anyone', () => {
  assert.equal(mapSumsubEvent({ type: 'somethingNew' }), null);
  assert.equal(mapSumsubEvent({}), null);
  assert.equal(nextComplianceState('PENDING', mapSumsubEvent({ type: 'somethingNew' })), null);
});

test('a duplicate event is ignored and a late pending event cannot downgrade a decision', () => {
  assert.equal(nextComplianceState('VERIFIED', 'VERIFIED'), null);
  assert.equal(nextComplianceState('VERIFIED', 'PENDING'), null);
  assert.equal(nextComplianceState('VERIFIED', 'IN_REVIEW'), null);
  assert.equal(nextComplianceState('VERIFIED', 'REJECTED'), 'REJECTED');
  assert.equal(nextComplianceState('PENDING', 'VERIFIED'), 'VERIFIED');
});
