import { describe, expect, test } from 'bun:test';

import { getAngularDiff } from '../getAngularDiff';

describe('getAngularDiff', () => {
  const cases = [
    [0, 0.1, 0.1],
    [0, 0.6, -0.4],
    [0.3, 0.9, -0.4],
    [0.9, 0.2, 0.3],
    [0.9, 0.9, 0],
    [1.0, 0.4, 0.4]
  ];

  test.each(cases)(
    '%d to %d should be %d',
    (t1: number, t2: number, expected: number) => {
      expect(getAngularDiff(t1, t2)).toBeCloseTo(expected, 5);
    }
  );
});
