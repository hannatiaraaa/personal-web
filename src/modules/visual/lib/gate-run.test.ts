import { describe, expect, test } from 'bun:test';
import {
  buildGateSuite,
  buildPermissionMatrix,
  GATE_CASE_COUNT,
  GATE_DEBT_NAMES,
  GATE_LEGACY_COUNT,
  GATE_PROFILE_COUNT,
  GATE_ROUTE_COUNT,
  GATE_SPEC_COUNT,
} from './gate-run';

describe('buildGateSuite', () => {
  test('lays every case into exactly one spec, specs back to back in run order', () => {
    const suite = buildGateSuite();

    expect(suite.cases).toHaveLength(GATE_CASE_COUNT);
    expect(suite.specs).toHaveLength(GATE_SPEC_COUNT);

    let next = 0;
    suite.specs.forEach((spec, index) => {
      expect(spec.start).toBe(next);
      expect(spec.size).toBeGreaterThan(0);
      for (let offset = 0; offset < spec.size; offset += 1) {
        expect(suite.cases[spec.start + offset]?.spec).toBe(index);
      }
      next += spec.size;
    });
    expect(next).toBe(GATE_CASE_COUNT);
  });

  test('runs cases in spec order, one after another', () => {
    const suite = buildGateSuite();

    suite.cases.forEach((gateCase, index) => expect(gateCase.runOrder).toBe(index));
  });

  test('quarantines exactly the named debt, one case per name, each in a different spec', () => {
    const suite = buildGateSuite();
    const quarantined = suite.cases.filter((gateCase) => gateCase.status === 'quarantined');

    expect(quarantined).toHaveLength(GATE_DEBT_NAMES.length);
    expect(quarantined.map((gateCase) => gateCase.debt).sort()).toEqual(GATE_DEBT_NAMES.map((_, index) => index));
    expect(new Set(quarantined.map((gateCase) => gateCase.spec)).size).toBe(GATE_DEBT_NAMES.length);
  });

  test('every case that is not named debt passes, and carries no debt', () => {
    const suite = buildGateSuite();

    for (const gateCase of suite.cases) {
      if (gateCase.status === 'pass') expect(gateCase.debt).toBeNull();
      else expect(gateCase.debt).not.toBeNull();
    }
  });

  test('keeps the debt out of the small suite that reported green', () => {
    const suite = buildGateSuite();

    suite.cases.slice(0, GATE_LEGACY_COUNT).forEach((gateCase) => expect(gateCase.status).toBe('pass'));
  });

  test('the same seed builds the same suite', () => {
    expect(buildGateSuite(7)).toEqual(buildGateSuite(7));
  });

  test('a different seed moves the debt', () => {
    const debtAt = (seed: number) =>
      buildGateSuite(seed)
        .cases.filter((gateCase) => gateCase.status === 'quarantined')
        .map((gateCase) => gateCase.runOrder);

    expect(debtAt(1)).not.toEqual(debtAt(2));
  });
});

describe('buildPermissionMatrix', () => {
  test('holds one decision per profile and route', () => {
    const matrix = buildPermissionMatrix();

    expect(matrix.profiles).toBe(GATE_PROFILE_COUNT);
    expect(matrix.routes).toBe(GATE_ROUTE_COUNT);
    expect(matrix.decisions).toHaveLength(GATE_PROFILE_COUNT * GATE_ROUTE_COUNT);
  });

  test('both allows and denies are decided — a matrix of one answer checks nothing', () => {
    const { decisions } = buildPermissionMatrix();

    expect(decisions).toContain('allow');
    expect(decisions).toContain('deny');
  });

  test('the most privileged profile reaches every route and the least reaches fewest', () => {
    const matrix = buildPermissionMatrix();
    const allowedFor = (profile: number) =>
      matrix.decisions
        .slice(profile * matrix.routes, (profile + 1) * matrix.routes)
        .filter((decision) => decision === 'allow').length;

    expect(allowedFor(0)).toBe(matrix.routes);
    for (let profile = 1; profile < matrix.profiles; profile += 1) {
      expect(allowedFor(profile)).toBeGreaterThanOrEqual(allowedFor(matrix.profiles - 1));
    }
  });

  test('the same seed decides the same matrix', () => {
    expect(buildPermissionMatrix(11)).toEqual(buildPermissionMatrix(11));
  });
});

describe('GATE_DEBT_NAMES', () => {
  test('read as plain test titles, not code slugs', () => {
    for (const name of GATE_DEBT_NAMES) {
      expect(name).toMatch(/^[A-Z][^-]* [^-]*$/);
      expect(name).not.toMatch(/^[a-z0-9]+(-[a-z0-9]+)+$/);
    }
  });

  test('name no security defect, so the picture never reads as a list of real vulnerabilities', () => {
    const securityTerms = /leak|token|session|acl|revoke|permission|access|auth|privilege|sees/i;
    for (const name of GATE_DEBT_NAMES) {
      expect(name).not.toMatch(securityTerms);
    }
  });
});
