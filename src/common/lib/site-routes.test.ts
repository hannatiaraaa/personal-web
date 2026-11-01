import { describe, expect, test } from 'bun:test';
import { isActiveRoute } from './site-routes';

describe('isActiveRoute', () => {
  test('marks the route itself', () => {
    expect(isActiveRoute('/work', '/work')).toBe(true);
  });

  test('marks a page inside the route', () => {
    expect(isActiveRoute('/work/release-gate-from-zero', '/work')).toBe(true);
  });

  test('does not mark a route that only shares a prefix', () => {
    expect(isActiveRoute('/workshop', '/work')).toBe(false);
  });

  test('does not mark another route', () => {
    expect(isActiveRoute('/', '/work')).toBe(false);
  });
});
