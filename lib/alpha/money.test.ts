import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  distributeByUnits,
  incomeComponent,
  netAmount,
  participationUnits,
  platformFee,
  principalComponent,
  reserveAmount,
  settlementAmount,
  vtaedToStroops,
} from './money';

const n = (value: string | number) => BigInt(value);

describe('VTAED units', () => {
  it('turns 25,000 VTAED into 250 participation units', () => {
    assert.equal(participationUnits(25000), 250);
    assert.equal(vtaedToStroops(100), n(1000000000));
  });

  it('splits an installment the same way as the Soroban math', () => {
    const gross = n('7000000000');
    const net = netAmount(gross, 100, 50);
    assert.equal(platformFee(gross, 100), n(70000000));
    assert.equal(reserveAmount(gross, 50), n(35000000));
    const principal = principalComponent(n('150000000000'), 24, 1, n('150000000000'), net);
    assert.equal(principal, n('6250000000'));
    assert.ok(incomeComponent(net, principal) > n(0));
  });

  it('gives the remainder to the last investor', () => {
    const shares = distributeByUnits([{ units: n(1) }, { units: n(1) }, { units: n(1) }], n(10), n(0));
    assert.deepEqual(shares.map((row) => row.principal), [n(3), n(3), n(4)]);
  });

  it('quotes early settlement from principal, income, fee, and rebate', () => {
    assert.equal(settlementAmount(n(1000), n(200), n(50), n(20)), n(1230));
  });
});