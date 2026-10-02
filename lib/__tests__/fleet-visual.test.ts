import assert from 'node:assert/strict';
import test from 'node:test';
import { getFleetVisualType } from '../fleet-visual';

test('motorcycles and vans select the combined visual', () => {
  assert.equal(getFleetVisualType({ motorcycles: 12, vans: 6 }), 'MOTORCYCLE_VAN');
});

test('all vehicle kinds select the full fleet visual', () => {
  assert.equal(getFleetVisualType({ motorcycles: 2, vans: 2, pickups: 2, smallTrucks: 2 }), 'FULL_MIXED_FLEET');
});
