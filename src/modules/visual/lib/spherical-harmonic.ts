/**
 * Spherical harmonic surfaces, as point positions.
 *
 * A sphere is sampled evenly, then every sample is pushed along its own radius
 * by a harmonic function of the two angles:
 *
 *   r(θ, φ) = sin(m₀φ)^n₀ + cos(m₁φ)^n₁ + sin(m₂θ)^n₂ + cos(m₃θ)^n₃
 *
 * The eight integers are the whole shape. Change one and the surface gains or
 * loses a lobe — which is the reason this is worth showing rather than a
 * particle field: the picture is a function, and the function is legible.
 *
 * Pure. No three.js, no DOM, no React. Returns plain typed arrays that a
 * renderer can hand straight to the GPU.
 */

export type HarmonicCoefficients = {
  /** [m₀, m₁, m₂, m₃] — angular frequencies. */
  readonly m: readonly [number, number, number, number];
  /** [n₀, n₁, n₂, n₃] — exponents. */
  readonly n: readonly [number, number, number, number];
};

/** Four lobes in longitude, two in latitude. Reads as a shape, not as noise. */
export const DEFAULT_COEFFICIENTS: HarmonicCoefficients = {
  m: [4, 3, 2, 4],
  n: [2, 1, 2, 1],
};

export type HarmonicSurface = {
  /** Interleaved xyz, length `count * 3`. */
  readonly positions: Float32Array;
  /**
   * Radius of each point, normalised to 0..1 across the surface. The renderer
   * colours by this, so the gradient follows the geometry rather than the
   * screen.
   */
  readonly intensities: Float32Array;
  readonly count: number;
};

/**
 * The harmonic radius at one pair of angles.
 *
 * `theta` is polar (0..π), `phi` is azimuthal (0..2π). Odd exponents can make a
 * term negative, so the sum is offset to keep the radius positive — a negative
 * radius would turn the surface inside out through the origin.
 */
export function harmonicRadius(theta: number, phi: number, coefficients: HarmonicCoefficients): number {
  const { m, n } = coefficients;

  const radius =
    Math.pow(Math.sin(m[0] * phi), n[0]) +
    Math.pow(Math.cos(m[1] * phi), n[1]) +
    Math.pow(Math.sin(m[2] * theta), n[2]) +
    Math.pow(Math.cos(m[3] * theta), n[3]);

  return radius + 2;
}

const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));

/**
 * Evenly distributed directions on a sphere, by Fibonacci lattice.
 *
 * A naive `theta × phi` grid bunches points at the poles, which shows up as two
 * bright spots. This spaces them by the golden angle instead, so density is
 * even and the surface reads as a surface.
 */
export function buildHarmonicSurface(count: number, coefficients = DEFAULT_COEFFICIENTS): HarmonicSurface {
  const positions = new Float32Array(count * 3);
  const intensities = new Float32Array(count);

  let minRadius = Number.POSITIVE_INFINITY;
  let maxRadius = Number.NEGATIVE_INFINITY;

  for (let i = 0; i < count; i += 1) {
    // z from 1 to -1, so latitude bands carry equal area.
    const z = count === 1 ? 0 : 1 - (2 * i) / (count - 1);
    const theta = Math.acos(Math.min(1, Math.max(-1, z)));
    const phi = (i * GOLDEN_ANGLE) % (Math.PI * 2);

    const radius = harmonicRadius(theta, phi, coefficients);
    const sinTheta = Math.sin(theta);

    positions[i * 3] = radius * sinTheta * Math.cos(phi);
    positions[i * 3 + 1] = radius * Math.cos(theta);
    positions[i * 3 + 2] = radius * sinTheta * Math.sin(phi);

    intensities[i] = radius;
    if (radius < minRadius) minRadius = radius;
    if (radius > maxRadius) maxRadius = radius;
  }

  // Normalise after the fact, because the range depends on the coefficients.
  const span = maxRadius - minRadius || 1;
  for (let i = 0; i < count; i += 1) {
    intensities[i] = (intensities[i]! - minRadius) / span;
  }

  return { positions, intensities, count };
}

/** Largest distance from the origin, for framing the camera. */
export function surfaceExtent(surface: HarmonicSurface): number {
  let maxSquared = 0;

  for (let i = 0; i < surface.count; i += 1) {
    const x = surface.positions[i * 3]!;
    const y = surface.positions[i * 3 + 1]!;
    const z = surface.positions[i * 3 + 2]!;
    const squared = x * x + y * y + z * z;
    if (squared > maxSquared) maxSquared = squared;
  }

  return Math.sqrt(maxSquared);
}
