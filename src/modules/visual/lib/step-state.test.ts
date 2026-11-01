import { describe, expect, test } from 'bun:test';
import { stepState } from './step-state';

describe('stepState', () => {
  test('a step before the current one is past', () => {
    expect(stepState(0, 2)).toBe('past');
  });

  test('the step on screen is current', () => {
    expect(stepState(2, 2)).toBe('current');
  });

  test('a step not yet reached is future', () => {
    expect(stepState(3, 2)).toBe('future');
  });
});
