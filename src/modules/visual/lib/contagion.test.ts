import { describe, expect, test } from 'bun:test';
import { createPopulation, createRandom, DEFAULT_PARAMS, stepPopulation, tally, type ModelParams } from './contagion';

const SEED = 20260911;

function params(overrides: Partial<ModelParams> = {}): ModelParams {
  return { ...DEFAULT_PARAMS, ...overrides };
}

function run(frames: number, modelParams: ModelParams, size = 120, initialAffected = 0.1) {
  const random = createRandom(SEED);
  const population = createPopulation(size, random, initialAffected);

  for (let frame = 0; frame < frames; frame += 1) {
    stepPopulation(population, modelParams, random);
  }

  return population;
}

describe('createRandom', () => {
  test('the same seed produces the same sequence', () => {
    const a = createRandom(SEED);
    const b = createRandom(SEED);

    expect([a(), a(), a()]).toEqual([b(), b(), b()]);
  });

  test('values stay inside the unit interval', () => {
    const random = createRandom(7);

    for (let i = 0; i < 500; i += 1) {
      const value = random();
      expect(value).toBeGreaterThanOrEqual(0);
      expect(value).toBeLessThan(1);
    }
  });
});

describe('createPopulation', () => {
  test('places every agent inside the unit square', () => {
    const population = createPopulation(200, createRandom(SEED));

    for (let i = 0; i < population.size; i += 1) {
      expect(population.x[i]).toBeGreaterThanOrEqual(0);
      expect(population.x[i]).toBeLessThanOrEqual(1);
      expect(population.y[i]).toBeGreaterThanOrEqual(0);
      expect(population.y[i]).toBeLessThanOrEqual(1);
    }
  });

  test('seeds at least one affected agent so the model can start', () => {
    const population = createPopulation(200, createRandom(SEED), 0.1);

    expect(tally(population).affected).toBeGreaterThan(0);
  });

  test('seeds nobody when the initial fraction is zero', () => {
    const population = createPopulation(200, createRandom(SEED), 0);

    expect(tally(population).affected).toBe(0);
  });
});

describe('stepPopulation', () => {
  test('keeps every agent inside the box, because the boundary reflects', () => {
    const population = run(400, params({ speed: 0.02 }));

    for (let i = 0; i < population.size; i += 1) {
      expect(population.x[i]).toBeGreaterThanOrEqual(0);
      expect(population.x[i]).toBeLessThanOrEqual(1);
      expect(population.y[i]).toBeGreaterThanOrEqual(0);
      expect(population.y[i]).toBeLessThanOrEqual(1);
    }
  });

  test('conserves the population across every state', () => {
    const population = run(300, params());
    const counts = tally(population);

    expect(counts.susceptible + counts.affected + counts.recovering + counts.recovered).toBe(population.size);
  });

  test('never transmits when beta is zero', () => {
    const initial = tally(createPopulation(120, createRandom(SEED), 0.1)).affected;
    const counts = tally(run(200, params({ beta: 0, relapse: 0 })));

    // Nobody new is infected, so every affected agent is one of the originals,
    // whichever stage of recovery they have reached.
    expect(counts.affected + counts.recovering + counts.recovered).toBe(initial);
  });

  test('transmits when beta is high and agents are in contact', () => {
    const withSpread = tally(run(200, params({ beta: 0.9, contactRadius: 0.3, relapse: 0 })));
    const withoutSpread = tally(run(200, params({ beta: 0, relapse: 0 })));

    const infectedWith = withSpread.affected + withSpread.recovering + withSpread.recovered;
    const infectedWithout = withoutSpread.affected + withoutSpread.recovering + withoutSpread.recovered;

    expect(infectedWith).toBeGreaterThan(infectedWithout);
  });

  test('moves an affected agent through recovering to recovered on schedule', () => {
    const counts = tally(run(400, params({ beta: 0, relapse: 0, recoveringAfter: 10, recoveredAfter: 20 })));

    expect(counts.affected).toBe(0);
    expect(counts.recovering).toBe(0);
    expect(counts.recovered).toBeGreaterThan(0);
  });

  test('burns out without relapse, because only an affected agent transmits', () => {
    const counts = tally(run(900, params({ relapse: 0, recoveringAfter: 40, recoveredAfter: 80 })));

    expect(counts.affected).toBe(0);
    expect(counts.recovering).toBe(0);
  });

  test('stays endemic with relapse, which is the point of the paper', () => {
    // Identical to the burn-out case apart from relapse, so relapse is the only
    // thing that can account for the difference.
    const endemic = tally(run(900, params({ relapse: 0.02, recoveringAfter: 40, recoveredAfter: 80 })));

    expect(endemic.affected + endemic.recovering).toBeGreaterThan(0);
  });

  test('relapse returns an agent to affected, not to susceptible', () => {
    // With no transmission at all, the only route back into an infectious state
    // is relapse. If relapse went to susceptible, this would be zero forever.
    const counts = tally(run(600, params({ beta: 0, relapse: 0.05, recoveringAfter: 20, recoveredAfter: 40 })));

    expect(counts.affected + counts.recovering).toBeGreaterThan(0);
  });

  test('returns edges as pairs of valid agent indices', () => {
    const random = createRandom(SEED);
    const population = createPopulation(120, random, 0.1);
    const edges = stepPopulation(population, params({ linkRadius: 0.4 }), random);

    expect(edges.length % 2).toBe(0);
    expect(edges.length).toBeGreaterThan(0);

    for (const index of edges) {
      expect(index).toBeGreaterThanOrEqual(0);
      expect(index).toBeLessThan(population.size);
    }
  });

  test('is reproducible for a given seed', () => {
    const first = tally(run(250, params()));
    const second = tally(run(250, params()));

    expect(first).toEqual(second);
  });
});
