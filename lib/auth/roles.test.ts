import assert from 'node:assert/strict';
import test from 'node:test';
import { isAdminOperator, isPlatformOwner } from './roles';

test('only the admin roles are admin operators', () => {
  assert.equal(isAdminOperator('ADMIN'), true);
  assert.equal(isAdminOperator('ADMIN_REVIEWER'), true);
  assert.equal(isAdminOperator('UNDERWRITER'), false);
  assert.equal(isAdminOperator('OPERATIONS'), false);
  assert.equal(isAdminOperator('SME'), false);
  assert.equal(isAdminOperator('INVESTOR'), false);
  assert.equal(isAdminOperator(null), false);
  assert.equal(isAdminOperator(undefined), false);
});

test('only ADMIN is the platform owner', () => {
  assert.equal(isPlatformOwner('ADMIN'), true);
  assert.equal(isPlatformOwner('ADMIN_REVIEWER'), false);
  assert.equal(isPlatformOwner('OPERATIONS'), false);
  assert.equal(isPlatformOwner('SME'), false);
  assert.equal(isPlatformOwner(null), false);
});
