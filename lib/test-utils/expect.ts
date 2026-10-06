import assert from 'node:assert/strict';

// Minimal jest-style assertions on top of node:assert, so every test file runs under the one node:test runner.
export function expect(actual: unknown) {
  return {
    toBe: (expected: unknown) => assert.strictEqual(actual, expected),
    toEqual: (expected: unknown) => assert.deepStrictEqual(actual, expected),
    toBeDefined: () => assert.notStrictEqual(actual, undefined),
    toBeTruthy: () => assert.ok(actual),
    toBeGreaterThan: (expected: number) => assert.ok((actual as number) > expected, `${actual} is not greater than ${expected}`),
    toBeLessThan: (expected: number) => assert.ok((actual as number) < expected, `${actual} is not less than ${expected}`),
    toMatch: (expected: RegExp | string) => assert.match(String(actual), expected instanceof RegExp ? expected : new RegExp(expected)),
    toContain: (expected: unknown) => assert.ok(Array.isArray(actual) ? actual.includes(expected) : String(actual).includes(String(expected))),
  };
}
