/**
 * Turning a pointer into a position on the pool.
 *
 * Pure geometry, kept out of the hook so it can be tested without a WebGL
 * context: the hook unprojects the pointer through the camera, and these two
 * functions do the rest.
 */

export type Vector = { readonly x: number; readonly y: number; readonly z: number };
export type GroundHit = { readonly x: number; readonly z: number };

/**
 * Where a ray crosses the y = 0 plane, or `null` if it never does.
 *
 * Returns `null` for a ray running parallel to the plane, and for one pointing
 * away from it — a hit behind the camera is not a hit.
 */
export function intersectGroundPlane(origin: Vector, direction: Vector, epsilon = 1e-4): GroundHit | null {
  if (Math.abs(direction.y) < epsilon) return null;

  const t = -origin.y / direction.y;
  if (t <= 0) return null;

  return { x: origin.x + direction.x * t, z: origin.z + direction.z * t };
}

/**
 * Rotates a ground hit back out of the pool's spin, so a touch lands where the
 * visitor sees it rather than where the geometry started.
 */
export function unrotateY(hit: GroundHit, angle: number): GroundHit {
  const spin = -angle;
  const cos = Math.cos(spin);
  const sin = Math.sin(spin);

  return { x: hit.x * cos - hit.z * sin, z: hit.x * sin + hit.z * cos };
}
