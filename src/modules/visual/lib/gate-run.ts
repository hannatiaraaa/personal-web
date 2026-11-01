import { createRandom } from './contagion';

/**
 * The release gate as a picture: an illustrative suite of cases grouped into
 * specs, a handful of them inherited debt quarantined by name, and a permission
 * matrix of profiles against routes. Sized for legibility, not to the published
 * figures — those are in `src/content/facts.ts` and are printed as text beside
 * the picture, never derived from it.
 */

/** Cases drawn. A picture of the scale, labelled illustrative on screen. */
export const GATE_CASE_COUNT = 1040;
export const GATE_SPEC_COUNT = 156;
/** The small suite that reported green before the gate existed. */
export const GATE_LEGACY_COUNT = 18;
export const GATE_PROFILE_COUNT = 12;
export const GATE_ROUTE_COUNT = 36;
const GATE_RUN_SEED = 20251104;

/**
 * Illustrative titles for inherited gaps, written the way a test is titled so
 * anyone can read them. Each is one quarantined case: listed, visible on every
 * run, and never reported as a pass. Deliberately ordinary defects — a picture
 * of the mechanism must not read as a list of a real product's flaws.
 */
export const GATE_DEBT_NAMES = [
  'Large export times out',
  'Date filter shifts across time zones',
  'Bulk edit slows past 500 rows',
  'PDF layout breaks on long names',
  'Offline photo upload retries twice',
  'Sorting ignores accented letters',
  'Chart skips an empty month',
  'Old print view is misaligned',
] as const;

const MIN_SPEC_SIZE = 3;
const MAX_SPEC_SIZE = 12;
/** A spec is first drawn at this size plus up to the spread, then nudged until the suite adds up. */
const SPEC_SIZE_BASE = 4;
const SPEC_SIZE_SPREAD = 6;
/**
 * Mixed into the seed for the matrix, so its random stream is not the suite's.
 * Any constant would do; this one is only memorable.
 */
const MATRIX_SEED_SALT = 0x5f3759df;
/** Share of denies a middle profile is granted anyway — the scoped exceptions a real matrix carries. */
const SCOPED_GRANT_RATE = 0.04;
/** The least privileged profile still reaches the most open routes. */
const LOWEST_PROFILE_LEVEL = 0.08;
const ROUTE_REQUIREMENT_FLOOR = 0.04;
const ROUTE_REQUIREMENT_SPAN = 0.92;

export type CaseStatus = 'pass' | 'quarantined';

export type GateCase = {
  readonly spec: number;
  /** Position in the run. Specs run one after another, cases in order within each. */
  readonly runOrder: number;
  readonly status: CaseStatus;
  /** Index into the debt names when quarantined, otherwise null. */
  readonly debt: number | null;
};

export type GateSpec = { readonly start: number; readonly size: number };

export type GateSuite = {
  readonly cases: readonly GateCase[];
  readonly specs: readonly GateSpec[];
  readonly debtNames: readonly string[];
  readonly legacyCount: number;
};

export type Decision = 'allow' | 'deny';

export type PermissionMatrix = {
  readonly profiles: number;
  readonly routes: number;
  /** Row-major: profile × routes + route. Profile 0 is the most privileged. */
  readonly decisions: readonly Decision[];
};

function specSizes(random: () => number): number[] {
  const sizes = Array.from({ length: GATE_SPEC_COUNT }, () => SPEC_SIZE_BASE + Math.floor(random() * SPEC_SIZE_SPREAD));
  let total = sizes.reduce((sum, size) => sum + size, 0);

  // Nudge random specs by one case until the suite is exactly the size drawn.
  while (total !== GATE_CASE_COUNT) {
    const index = Math.floor(random() * GATE_SPEC_COUNT);
    const size = sizes[index] ?? 0;
    if (total < GATE_CASE_COUNT && size < MAX_SPEC_SIZE) {
      sizes[index] = size + 1;
      total += 1;
    } else if (total > GATE_CASE_COUNT && size > MIN_SPEC_SIZE) {
      sizes[index] = size - 1;
      total -= 1;
    }
  }

  return sizes;
}

/**
 * The illustrative suite. Debt is spread through the run — one name per band
 * of specs — and kept out of the small suite that reported green, because that
 * suite passed: it was green by not looking, not by hiding failures.
 */
export function buildGateSuite(seed: number = GATE_RUN_SEED): GateSuite {
  const random = createRandom(seed);
  const sizes = specSizes(random);

  const specs: GateSpec[] = [];
  let start = 0;
  for (const size of sizes) {
    specs.push({ start, size });
    start += size;
  }

  const eligible = specs.map((spec, index) => ({ spec, index })).filter(({ spec }) => spec.start >= GATE_LEGACY_COUNT);
  const band = eligible.length / GATE_DEBT_NAMES.length;
  const debtAt = new Map<number, number>();
  GATE_DEBT_NAMES.forEach((_, debt) => {
    const pick = eligible[Math.floor(debt * band + random() * band)];
    if (!pick) return;
    debtAt.set(pick.spec.start + Math.floor(random() * pick.spec.size), debt);
  });

  const cases: GateCase[] = [];
  specs.forEach((spec, specIndex) => {
    for (let offset = 0; offset < spec.size; offset += 1) {
      const runOrder = spec.start + offset;
      const debt = debtAt.get(runOrder) ?? null;
      cases.push({ spec: specIndex, runOrder, status: debt === null ? 'pass' : 'quarantined', debt });
    }
  });

  return { cases, specs, debtNames: GATE_DEBT_NAMES, legacyCount: GATE_LEGACY_COUNT };
}

/**
 * The illustrative permission matrix. Profiles are ordered by privilege and
 * routes by what they require, so the rule reads as a staircase; a few scoped
 * grants break it, as they do in a real one — which is why every decision is
 * checked rather than inferred from the rule.
 */
export function buildPermissionMatrix(seed: number = GATE_RUN_SEED): PermissionMatrix {
  const random = createRandom(seed ^ MATRIX_SEED_SALT);
  const requirements = Array.from(
    { length: GATE_ROUTE_COUNT },
    () => ROUTE_REQUIREMENT_FLOOR + random() * ROUTE_REQUIREMENT_SPAN,
  ).sort((a, b) => a - b);

  const decisions: Decision[] = [];
  for (let profile = 0; profile < GATE_PROFILE_COUNT; profile += 1) {
    const level = 1 - (profile / (GATE_PROFILE_COUNT - 1)) * (1 - LOWEST_PROFILE_LEVEL);
    const isMiddle = profile > 0 && profile < GATE_PROFILE_COUNT - 1;

    for (const requirement of requirements) {
      const granted = isMiddle && random() < SCOPED_GRANT_RATE;
      decisions.push(level >= requirement || granted ? 'allow' : 'deny');
    }
  }

  return { profiles: GATE_PROFILE_COUNT, routes: GATE_ROUTE_COUNT, decisions };
}
