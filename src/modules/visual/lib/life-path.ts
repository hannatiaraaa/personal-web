/**
 * Geometry for the hero visualisation: one lattice of points that takes three
 * shapes, one per stage of the work.
 *
 * Everything positional is computed here, once, on the CPU, and uploaded as
 * static attributes. The shader only mixes between the shapes and applies the
 * two fields that genuinely depend on time — the travelling front and the
 * swell. Those two are duplicated in GLSL because a vertex shader cannot call
 * into TypeScript; the JS versions below are the tested ones, and the GLSL sits
 * directly beside them in `use-life-path-scene` so a change to one is visibly a
 * change to the other.
 *
 * Pure: no three.js, no DOM, no React.
 */

/** Side of the square lattice. 132² = 17,424 points, one draw call. */
export const LATTICE_SIDE = 132;
export const POINT_COUNT = LATTICE_SIDE * LATTICE_SIDE;

/** World size of the plane the front and the swell live on. */
const PLANE_SPAN = 9;
/** Radius of the helix, and its height. Exported so tests assert the source. */
export const HELIX_RADIUS = 1.7;
const HELIX_HEIGHT = 5.8;
const HELIX_TURNS = 2.4;
/** Fraction of the lattice given to each strand; the rest becomes base pairs. */
const STRAND_FRACTION = 0.42;
/**
 * Only every sixth row becomes a base pair. Every row would fill the space
 * between the strands solid, which reads as a tube; discrete rungs read as DNA.
 * Rows in between give their points back to the strands, which thickens them.
 */
export const RUNG_EVERY = 6;
/**
 * Each strand is given thickness by spreading its band of the lattice in phase
 * and radius. Without this every point in a row landed on the same coordinate,
 * because a strand position depends only on the row — so 98% of the points were
 * duplicates and the helix rendered as a sparse dotted outline.
 */
const STRAND_PHASE_SPREAD = 0.38;
const STRAND_RADIAL_SPREAD = 0.26;
const STRAND_AXIAL_SPREAD = 0.08;
/** One full sweep of the front, in seconds. */
export const FRONT_PERIOD = 7.2;

export const Role = {
  StrandA: 0,
  StrandB: 1,
  BasePair: 2,
} as const;

export type RoleValue = (typeof Role)[keyof typeof Role];

export type LifePathGeometry = {
  readonly count: number;
  /** Plane position, xz used by the front and the swell. Interleaved xyz. */
  readonly plane: Float32Array;
  /** Double helix position. Interleaved xyz. */
  readonly helix: Float32Array;
  /** Normalised distance from the plane centre, 0 at the middle, 1 at the rim. */
  readonly radius: Float32Array;
  /** Which part of the helix this point belongs to, as a `Role`. */
  readonly role: Float32Array;
};

function smoothstep(edge0: number, edge1: number, value: number): number {
  const t = Math.min(1, Math.max(0, (value - edge0) / (edge1 - edge0)));
  return t * t * (3 - 2 * t);
}

/**
 * Fisher–Kolmogorov front with a harvest term.
 *
 * `1 / (1 + exp(k(r - reach)))` is the travelling-wave profile the equation
 * settles into, with `reach` the position the front has got to. The harvest
 * term is the thing my thesis was about: it lowers the equilibrium the front
 * leaves behind, so the population settles at `1 - harvest` rather than at
 * carrying capacity, and a harvest at carrying capacity leaves nothing to
 * spread at all.
 *
 * Returns population density in `0 .. 1 - harvest`.
 */
export function fisherFront(radius: number, reach: number, harvest = 0.35, steepness = 7): number {
  const plateau = Math.max(0, 1 - harvest);
  if (plateau === 0) return 0;

  return plateau / (1 + Math.exp(steepness * (radius - reach)));
}

/** Where the animation is in one sweep, as 0..1. */
export function frontPhase(time: number, period = FRONT_PERIOD): number {
  const phase = (time % period) / period;
  return phase < 0 ? phase + 1 : phase;
}

/**
 * How far the front has travelled at a given phase. Starts just inside the
 * centre and finishes past the rim, so the sweep covers the whole plane.
 */
export function frontReach(phase: number): number {
  return phase * 1.5 - 0.12;
}

/**
 * Fades the sweep in and out at the wrap, so a repeating invasion does not snap
 * back to the centre. Without this the front is a hard cut every period.
 */
export function frontEnvelope(phase: number): number {
  return smoothstep(0, 0.1, phase) * (1 - smoothstep(0.82, 1, phase));
}

/** The front a point sees at a given time. The shader mirrors this exactly. */
export function frontAt(radius: number, time: number, harvest = 0.35): number {
  const phase = frontPhase(time);
  return fisherFront(radius, frontReach(phase), harvest) * frontEnvelope(phase);
}

/**
 * Ocean swell as a sum of three sinusoids at different headings.
 *
 * Real swell is a superposition of components, which is why a single sine reads
 * as a corrugated sheet and three read as water.
 */
export function swellHeight(x: number, z: number, time: number): number {
  return (
    0.62 * Math.sin(0.75 * x + 0.9 * time) +
    0.34 * Math.sin(0.52 * z - 1.18 * time + 1.7) +
    0.22 * Math.sin(0.41 * (x + z) + 0.64 * time + 3.1)
  );
}

/** Largest height the swell can reach, for framing and for normalising colour. */
export const SWELL_AMPLITUDE = 0.62 + 0.34 + 0.22;

/**
 * A point on one strand of the helix.
 *
 * `v` runs along the axis; `s` is where the point sits across its strand's band
 * of the lattice, 0..1, which is what gives the strand thickness.
 */
export function strandPoint(v: number, s: number, strand: 0 | 1): [number, number, number] {
  const offset = s - 0.5;
  const angle = v * HELIX_TURNS * Math.PI * 2 + strand * Math.PI + offset * STRAND_PHASE_SPREAD;
  const radius = HELIX_RADIUS + offset * STRAND_RADIAL_SPREAD;

  return [radius * Math.cos(angle), (v - 0.5) * HELIX_HEIGHT + offset * STRAND_AXIAL_SPREAD, radius * Math.sin(angle)];
}

function isRungRow(row: number): boolean {
  return row % RUNG_EVERY === 0;
}

function roleFor(u: number, row: number): RoleValue {
  if (isRungRow(row)) {
    if (u < STRAND_FRACTION) return Role.StrandA;
    if (u > 1 - STRAND_FRACTION) return Role.StrandB;
    return Role.BasePair;
  }
  // No rung on this row, so the whole lattice row goes to the two strands.
  return u < 0.5 ? Role.StrandA : Role.StrandB;
}

/**
 * Where a point sits across its own strand's band, 0..1.
 *
 * A rung row splits its lattice row three ways, so each strand owns a
 * `STRAND_FRACTION`-wide band. Every other row splits in half. Mapping the
 * band rather than clamping to it is what keeps each point distinct — clamping
 * collapsed the middle of every non-rung row onto two coordinates.
 */
function bandPosition(u: number, row: number, strand: 0 | 1): number {
  if (isRungRow(row)) {
    const start = strand === 0 ? 0 : 1 - STRAND_FRACTION;
    return (u - start) / STRAND_FRACTION;
  }

  const start = strand === 0 ? 0 : 0.5;
  return (u - start) / 0.5;
}

/**
 * Builds the lattice and both static shapes.
 *
 * Points are laid out on a square grid rather than a Fibonacci lattice because
 * two of the three shapes are surfaces over a plane, and a grid is what makes
 * the front read as a front.
 */
export function buildLifePathGeometry(side: number = LATTICE_SIDE): LifePathGeometry {
  const count = side * side;
  const plane = new Float32Array(count * 3);
  const helix = new Float32Array(count * 3);
  const radius = new Float32Array(count);
  const role = new Float32Array(count);

  const half = PLANE_SPAN / 2;
  const strandSpan = 1 - 2 * STRAND_FRACTION;

  for (let row = 0; row < side; row += 1) {
    for (let column = 0; column < side; column += 1) {
      const index = row * side + column;
      const u = side === 1 ? 0.5 : column / (side - 1);
      const v = side === 1 ? 0.5 : row / (side - 1);

      // Plane: a square centred on the origin.
      const x = (u - 0.5) * PLANE_SPAN;
      const z = (v - 0.5) * PLANE_SPAN;
      plane[index * 3] = x;
      plane[index * 3 + 1] = 0;
      plane[index * 3 + 2] = z;

      radius[index] = Math.min(1, Math.hypot(x, z) / half);

      // Helix: v runs along the axis, u decides strand or base pair.
      const pointRole = roleFor(u, row);
      role[index] = pointRole;

      let hx: number;
      let hy: number;
      let hz: number;

      if (pointRole === Role.BasePair) {
        // On the rung, between the centre of one strand and the centre of the
        // other.
        const along = strandSpan === 0 ? 0.5 : (u - STRAND_FRACTION) / strandSpan;
        const [ax, ay, az] = strandPoint(v, 0.5, 0);
        const [bx, , bz] = strandPoint(v, 0.5, 1);
        hx = ax + (bx - ax) * along;
        hy = ay;
        hz = az + (bz - az) * along;
      } else {
        const strand = pointRole === Role.StrandB ? 1 : 0;
        [hx, hy, hz] = strandPoint(v, bandPosition(u, row, strand), strand);
      }

      helix[index * 3] = hx;
      helix[index * 3 + 1] = hy;
      helix[index * 3 + 2] = hz;
    }
  }

  return { count, plane, helix, radius, role };
}

/**
 * Position along the story, as a continuous number.
 *
 * `0` is the front, `1` the helix, `2` the swell, and the fractional part is a
 * morph between the two it sits between. A stage holds still for a while and
 * then moves, because a shape that never rests is not a shape you can read.
 */
export function stageAtTime(time: number, hold = 4.2, transition = 2.1, stages = 3): number {
  const step = hold + transition;
  const cycle = step * stages;
  const local = ((time % cycle) + cycle) % cycle;

  const index = Math.floor(local / step);
  const withinStep = local - index * step;
  const progress = withinStep <= hold ? 0 : (withinStep - hold) / transition;

  return (index + progress) % stages;
}
