/**
 * The hero surface: one pool of points, three layers of motion.
 *
 * The lattice is a Vogel spiral — every point at `r = c·√n, θ = n·φ` where φ is
 * the golden angle. Nothing else is placed, yet the visible spiral arms come in
 * consecutive Fibonacci counts; the structure emerges from one line of maths
 * instead of being drawn. Over it move a Fisher–Kolmogorov front (the thesis),
 * ocean swell (the work), and ripples where a visitor touches it.
 *
 * Everything positional is computed here once, on the CPU, and uploaded as
 * static attributes. The tuning constants are exported as data so that
 * `flow-field-shaders.ts` can generate the GLSL from the same numbers these
 * functions are tested against — the duplication is then the shape of each
 * formula, not its values.
 *
 * Pure: no three.js, no DOM, no React.
 */

/** The golden angle, 2π(1 − 1/φ) ≈ 137.5°. */
export const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

/** Points in the pool. Squared cost is fill, not vertices; this is cheap. */
export const POOL_POINTS = 22_000;
export const POOL_POINTS_MOBILE = 9_000;

/** World radius of the pool. */
export const POOL_RADIUS = 4.6;

/** The harvest term from the thesis: lowers what the front leaves behind. */
export const HARVEST = 0.35;

/** Front tuning. One source for the TypeScript and the generated GLSL. */
export const FRONT = {
  /** One outward sweep, in seconds. */
  period: 9,
  /** Sharpness of the sigmoid profile. */
  steepness: 9,
  /** Reach travels `slope·phase + offset`, so it starts inside and exits. */
  reachSlope: 1.5,
  reachOffset: -0.12,
  /** Phase at which the sweep has fully faded in, and begun fading out. */
  fadeIn: 0.12,
  fadeOut: 0.8,
} as const;

/** Kept as a named export: it reads better than `FRONT.period` in a test. */
export const FRONT_PERIOD = FRONT.period;

export type FlowPool = {
  readonly count: number;
  /** Interleaved xyz; y is 0, the shader displaces it. */
  readonly positions: Float32Array;
  /** Distance from centre, normalised 0..1. */
  readonly radius: Float32Array;
};

/**
 * Vogel's model of phyllotaxis. `r ∝ √n` keeps the area per point constant, so
 * the disc has uniform density; the golden angle is the irrational rotation
 * that never lets arms line up — which is exactly why Fibonacci arms appear.
 */
export function buildVogelPool(count: number = POOL_POINTS, poolRadius: number = POOL_RADIUS): FlowPool {
  const positions = new Float32Array(count * 3);
  const radius = new Float32Array(count);
  const scale = poolRadius / Math.sqrt(Math.max(1, count - 1));

  for (let i = 0; i < count; i += 1) {
    const r = scale * Math.sqrt(i);
    const theta = i * GOLDEN_ANGLE;

    positions[i * 3] = r * Math.cos(theta);
    positions[i * 3 + 1] = 0;
    positions[i * 3 + 2] = r * Math.sin(theta);
    radius[i] = r / poolRadius;
  }

  return { count, positions, radius };
}

/**
 * One component of the swell: `a·sin(kx·x + kz·z + ω·t + φ)`.
 *
 * Held as data rather than inlined so the vertex shader can be generated from
 * the same numbers these functions are tested against.
 */
export type SwellComponent = {
  readonly amplitude: number;
  readonly kx: number;
  readonly kz: number;
  readonly omega: number;
  readonly phase: number;
};

/**
 * Three headings, three periods. One sine reads as a corrugated sheet; a
 * superposition reads as water.
 */
export const SWELL_COMPONENTS: readonly SwellComponent[] = [
  { amplitude: 0.62, kx: 0.75, kz: 0, omega: 0.9, phase: 0 },
  { amplitude: 0.34, kx: 0, kz: 0.52, omega: -1.18, phase: 1.7 },
  { amplitude: 0.22, kx: 0.41, kz: 0.41, omega: 0.64, phase: 3.1 },
] as const;

export function swellHeight(x: number, z: number, time: number): number {
  let height = 0;

  for (const { amplitude, kx, kz, omega, phase } of SWELL_COMPONENTS) {
    height += amplitude * Math.sin(kx * x + kz * z + omega * time + phase);
  }

  return height;
}

/** Largest height the swell can reach; used for framing and colour. */
export const SWELL_AMPLITUDE = SWELL_COMPONENTS.reduce((total, c) => total + c.amplitude, 0);

function smoothstep(edge0: number, edge1: number, value: number): number {
  const t = Math.min(1, Math.max(0, (value - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

/** Where the sweep is in its cycle, 0..1. */
export function frontPhase(time: number, period: number = FRONT_PERIOD): number {
  const phase = (time % period) / period;
  return phase < 0 ? phase + 1 : phase;
}

/** How far the front has travelled: starts inside the centre, exits the rim. */
export function frontReach(phase: number): number {
  return phase * FRONT.reachSlope + FRONT.reachOffset;
}

/** Fades the sweep in and out at the wrap, so the loop never snaps. */
export function frontEnvelope(phase: number): number {
  return smoothstep(0, FRONT.fadeIn, phase) * (1 - smoothstep(FRONT.fadeOut, 1, phase));
}

/**
 * The moving edge of a harvested Fisher–Kolmogorov invasion.
 *
 * The solution profile is the sigmoid `σ = 1/(1 + exp(k(r − reach)))`; what
 * travels is its gradient, and `4σ(1−σ)` is that gradient normalised to peak at
 * 1 exactly where the front is. The harvest term scales it down: a harvested
 * population invades with a weaker front, and a harvest at carrying capacity
 * leaves nothing to invade at all — the thesis result, visible as a dimmer
 * ring.
 */
export function frontPulse(
  radius: number,
  time: number,
  harvest: number = HARVEST,
  steepness: number = FRONT.steepness,
): number {
  const plateau = Math.max(0, 1 - harvest);
  if (plateau === 0) return 0;

  const phase = frontPhase(time);
  const sigmoid = 1 / (1 + Math.exp(steepness * (radius - frontReach(phase))));

  return plateau * 4 * sigmoid * (1 - sigmoid) * frontEnvelope(phase);
}

/** Live ripple slots. The shader loops over a constant, so this is a GPU bound. */
export const MAX_RIPPLES = 4;

/** Metres a dragged pointer must travel before it earns another ripple. */
export const RIPPLE_SPACING = 1.1;

/** Ripple tuning. Exported so the shader constants trace to tested values. */
export const RIPPLE = {
  amplitude: 0.32,
  wavenumber: 5.5,
  frequency: 9,
  /** Metres the ring travels per second. */
  speed: 2.2,
  /** e-folding distance of the spatial decay. */
  reach: 1.4,
  /** e-folding time of the temporal decay. */
  life: 1.1,
  /** After this many seconds a ripple costs nothing and is recycled. */
  maxAge: 3.5,
} as const;

/**
 * A ripple from one touch: an expanding ring that decays in space and time,
 * gated so it cannot appear ahead of its own travel — water answers where you
 * touched it, then everywhere the ring has reached, then not at all.
 */
export function rippleHeight(distance: number, age: number): number {
  if (age <= 0 || age > RIPPLE.maxAge) return 0;

  const travel = age * RIPPLE.speed;
  const causal = 1 - smoothstep(travel, travel + 0.6, distance);

  return (
    RIPPLE.amplitude *
    Math.sin(RIPPLE.wavenumber * distance - RIPPLE.frequency * age) *
    Math.exp(-distance / RIPPLE.reach) *
    Math.exp(-age / RIPPLE.life) *
    causal
  );
}
