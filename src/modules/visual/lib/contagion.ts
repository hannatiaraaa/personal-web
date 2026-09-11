/**
 * Agent-based contagion with a recovery process — the model from one of my two
 * published papers, as pure functions.
 *
 * No React and no DOM here on purpose. The model is the part with rules, so it
 * is the part that gets unit tests; the canvas is only a way of looking at it.
 *
 * The population is held in parallel typed arrays and stepped in place. That is
 * a deliberate exception to the immutability default: this runs every animation
 * frame, and allocating five arrays per frame is the one thing that would make
 * it visible in a profile.
 */

export const State = {
  Susceptible: 0,
  Affected: 1,
  Recovering: 2,
  Recovered: 3,
} as const;

export type StateValue = (typeof State)[keyof typeof State];

export type Population = {
  readonly size: number;
  readonly x: Float32Array;
  readonly y: Float32Array;
  readonly vx: Float32Array;
  readonly vy: Float32Array;
  readonly state: Uint8Array;
  readonly age: Uint16Array;
};

export type ModelParams = {
  /** Probability of transmission per contact, per frame. */
  readonly beta: number;
  /** Distance within which two agents can transmit. */
  readonly contactRadius: number;
  /** Distance within which the contact network is drawn. */
  readonly linkRadius: number;
  /** Frames before an affected agent becomes recovering. */
  readonly recoveringAfter: number;
  /** Frames before a recovering agent becomes recovered. */
  readonly recoveredAfter: number;
  /**
   * Per-frame probability that a recovered agent relapses.
   *
   * A relapse returns the agent to **affected**, not to susceptible. That is
   * what relapse means in the recovery process the paper models — someone who
   * had recovered is affected again — and it is also the term that makes the
   * system endemic. Sending them back to susceptible instead cannot re-seed
   * anything, because only an affected agent transmits, so the model would
   * always burn out and the endemic claim would be false.
   */
  readonly relapse: number;
  /** Step length per frame, in normalised units. */
  readonly speed: number;
};

export type Tally = {
  susceptible: number;
  affected: number;
  recovering: number;
  recovered: number;
};

export const DEFAULT_PARAMS: ModelParams = {
  beta: 0.035,
  contactRadius: 0.062,
  linkRadius: 0.055,
  recoveringAfter: 150,
  recoveredAfter: 260,
  relapse: 0.00035,
  speed: 0.00085,
};

/** Flat pairs of agent indices that are close enough to draw an edge between. */
export type Edges = number[];

/**
 * Seeded generator, so the figure looks the same on every load and a test can
 * assert an exact outcome. Linear congruential — not good randomness, but
 * reproducible randomness, which is what both uses need.
 */
export function createRandom(seed: number): () => number {
  let state = seed >>> 0;

  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

export function createPopulation(size: number, random: () => number, initialAffected = 0.04): Population {
  const population: Population = {
    size,
    x: new Float32Array(size),
    y: new Float32Array(size),
    vx: new Float32Array(size),
    vy: new Float32Array(size),
    state: new Uint8Array(size),
    age: new Uint16Array(size),
  };

  for (let i = 0; i < size; i += 1) {
    population.x[i] = random();
    population.y[i] = random();

    const angle = random() * Math.PI * 2;
    population.vx[i] = Math.cos(angle);
    population.vy[i] = Math.sin(angle);
    population.state[i] = random() < initialAffected ? State.Affected : State.Susceptible;
  }

  return population;
}

/** Random walk with a reflecting boundary, so the box stays populated. */
function move(population: Population, params: ModelParams, random: () => number): void {
  const { x, y, vx, vy, size } = population;

  for (let i = 0; i < size; i += 1) {
    // Heading jitter, or the walk reads as linear drift.
    const jitterX = vx[i]! + (random() - 0.5) * 0.4;
    const jitterY = vy[i]! + (random() - 0.5) * 0.4;
    const length = Math.hypot(jitterX, jitterY) || 1;

    vx[i] = jitterX / length;
    vy[i] = jitterY / length;

    let nextX = x[i]! + vx[i]! * params.speed;
    let nextY = y[i]! + vy[i]! * params.speed;

    if (nextX < 0 || nextX > 1) {
      vx[i] = -vx[i]!;
      nextX = Math.min(1, Math.max(0, nextX));
    }
    if (nextY < 0 || nextY > 1) {
      vy[i] = -vy[i]!;
      nextY = Math.min(1, Math.max(0, nextY));
    }

    x[i] = nextX;
    y[i] = nextY;
  }
}

/** Affected → recovering → recovered, and recovered → affected on relapse. */
function advanceStates(population: Population, params: ModelParams, random: () => number): void {
  const { state, age, size } = population;

  for (let i = 0; i < size; i += 1) {
    if (state[i] === State.Affected || state[i] === State.Recovering) {
      age[i] = age[i]! + 1;

      if (age[i]! > params.recoveredAfter) {
        state[i] = State.Recovered;
        age[i] = 0;
      } else if (age[i]! > params.recoveringAfter) {
        state[i] = State.Recovering;
      }
    } else if (state[i] === State.Recovered && random() < params.relapse) {
      state[i] = State.Affected;
      age[i] = 0;
    }
  }
}

/**
 * One pass over the pairs, doing both jobs: transmit where a susceptible agent
 * is in contact with an affected one, and collect the edges close enough to
 * draw. One loop rather than two, because this is the hot path.
 */
function transmit(population: Population, params: ModelParams, random: () => number): Edges {
  const { x, y, state, age, size } = population;
  const contact = params.contactRadius * params.contactRadius;
  const link = params.linkRadius * params.linkRadius;
  const edges: Edges = [];

  // Widest of the two, so neither gate is silently capped by the other. They
  // are independent settings and a link radius above the contact radius is a
  // plausible tuning choice.
  const reach = Math.max(contact, link);

  for (let i = 0; i < size; i += 1) {
    for (let j = i + 1; j < size; j += 1) {
      const dx = x[i]! - x[j]!;
      const dy = y[i]! - y[j]!;
      const distance = dx * dx + dy * dy;
      if (distance > reach) continue;

      if (distance < link) edges.push(i, j);
      if (distance > contact) continue;

      const iInfectious = state[i] === State.Affected;
      const jInfectious = state[j] === State.Affected;
      if (iInfectious === jInfectious) continue;

      const target = iInfectious ? j : i;
      if (state[target] === State.Susceptible && random() < params.beta) {
        state[target] = State.Affected;
        age[target] = 0;
      }
    }
  }

  return edges;
}

/** Advance the population by one frame. Returns the edges to draw. */
export function stepPopulation(population: Population, params: ModelParams, random: () => number): Edges {
  move(population, params, random);
  advanceStates(population, params, random);
  return transmit(population, params, random);
}

export function tally(population: Population): Tally {
  const counts: Tally = { susceptible: 0, affected: 0, recovering: 0, recovered: 0 };

  for (let i = 0; i < population.size; i += 1) {
    switch (population.state[i]) {
      case State.Affected:
        counts.affected += 1;
        break;
      case State.Recovering:
        counts.recovering += 1;
        break;
      case State.Recovered:
        counts.recovered += 1;
        break;
      default:
        counts.susceptible += 1;
    }
  }

  return counts;
}
