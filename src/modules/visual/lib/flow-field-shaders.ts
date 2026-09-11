import { FRONT, HARVEST, MAX_RIPPLES, RIPPLE, SWELL_COMPONENTS } from './flow-field';

/**
 * The pool's vertex and fragment shaders, generated from the constants in
 * `flow-field.ts`.
 *
 * GLSL cannot call TypeScript, so the three motion fields exist twice. Building
 * the source from the same objects the unit tests assert against reduces the
 * duplication to the shape of each formula: every number has one home, and a
 * tuning change cannot drift between the tested function and the shader.
 *
 * Pure: returns strings. No three.js, no DOM.
 */

/** GLSL has no integer-to-float coercion, so every literal needs a decimal. */
function glsl(value: number): string {
  return Number.isInteger(value) ? `${value}.0` : `${value}`;
}

/** Display tuning: how the three fields are weighted into one surface. */
const SURFACE = {
  /** Swell is scaled down so the front still reads through it. */
  swellScale: 0.62,
  frontScale: 0.9,
  /** Swell eases off past this radius, so the rim feathers and does not shear. */
  rimEaseFrom: 0.55,
  rimEaseAmount: 0.45,
  /** Where the disc fades to nothing, so the pool has no hard edge. */
  edgeFadeFrom: 0.82,
  /** Colour ramp: a floor, then height, front and ripples add energy. */
  baseIntensity: 0.3,
  heightWeight: 0.6,
  frontWeight: 0.9,
  rippleWeight: 1.6,
  /** Far points recede this far, which is depth without a fog pass. */
  depthFadeTo: 0.55,
  depthNear: 6,
  depthRange: 12,
  /** Width of the causal shoulder ahead of a ripple's own travel. */
  rippleShoulder: 0.6,
  /** Radius of the soft dot, in point-coordinate space. */
  dotEdge: 0.5,
  dotCore: 0.06,
} as const;

function swellGlsl(): string {
  return SWELL_COMPONENTS.map(
    ({ amplitude, kx, kz, omega, phase }) =>
      `${glsl(amplitude)} * sin(${glsl(kx)} * p.x + ${glsl(kz)} * p.y + ${glsl(omega)} * time + ${glsl(phase)})`,
  ).join('\n         + ');
}

export function createVertexShader(): string {
  const plateau = Math.max(0, 1 - HARVEST);

  return /* glsl */ `
  attribute float aRadius;

  uniform float uTime;
  uniform float uSize;
  uniform float uPixelRatio;
  uniform vec4 uRipples[${MAX_RIPPLES}];

  varying float vIntensity;
  varying float vRadius;
  varying float vDepth;

  // Port of swellHeight(): a sum of sinusoids at different headings.
  float swellHeight(vec2 p, float time) {
    return ${swellGlsl()};
  }

  // Port of frontPulse(): the moving edge of a harvested Fisher-Kolmogorov
  // invasion. 4*sigma*(1-sigma) is the sigmoid's gradient, normalised to peak
  // exactly at the front; (1 - harvest) is what the harvest leaves it.
  float frontPulse(float radius, float time) {
    float phase = fract(time / ${glsl(FRONT.period)});
    float reach = phase * ${glsl(FRONT.reachSlope)} + ${glsl(FRONT.reachOffset)};
    float envelope = smoothstep(0.0, ${glsl(FRONT.fadeIn)}, phase)
                   * (1.0 - smoothstep(${glsl(FRONT.fadeOut)}, 1.0, phase));
    float sigmoid = 1.0 / (1.0 + exp(${glsl(FRONT.steepness)} * (radius - reach)));
    return ${glsl(plateau)} * 4.0 * sigmoid * (1.0 - sigmoid) * envelope;
  }

  // Port of rippleHeight(): an expanding ring decaying in space and time,
  // gated so it cannot appear ahead of its own travel.
  float rippleHeight(float dist, float age) {
    if (age <= 0.0 || age > ${glsl(RIPPLE.maxAge)}) return 0.0;

    float travel = age * ${glsl(RIPPLE.speed)};
    float causal = 1.0 - smoothstep(travel, travel + ${glsl(SURFACE.rippleShoulder)}, dist);

    return ${glsl(RIPPLE.amplitude)}
         * sin(${glsl(RIPPLE.wavenumber)} * dist - ${glsl(RIPPLE.frequency)} * age)
         * exp(-dist / ${glsl(RIPPLE.reach)})
         * exp(-age / ${glsl(RIPPLE.life)})
         * causal;
  }

  void main() {
    float swell = swellHeight(position.xz, uTime);
    float front = frontPulse(aRadius, uTime);

    float ripples = 0.0;
    for (int i = 0; i < ${MAX_RIPPLES}; i++) {
      vec4 drop = uRipples[i];
      if (drop.w < 0.5) continue;
      ripples += rippleHeight(distance(position.xz, drop.xy), uTime - drop.z);
    }

    float rim = 1.0 - smoothstep(${glsl(SURFACE.rimEaseFrom)}, 1.0, aRadius) * ${glsl(SURFACE.rimEaseAmount)};
    float height = swell * ${glsl(SURFACE.swellScale)} * rim + front * ${glsl(SURFACE.frontScale)} + ripples;

    vec4 viewPosition = modelViewMatrix * vec4(position.x, height, position.z, 1.0);
    gl_Position = projectionMatrix * viewPosition;

    float heightNorm = height * 0.5 + 0.5;
    vIntensity = clamp(
      ${glsl(SURFACE.baseIntensity)}
        + ${glsl(SURFACE.heightWeight)} * heightNorm
        + ${glsl(SURFACE.frontWeight)} * front
        + ${glsl(SURFACE.rippleWeight)} * abs(ripples),
      0.0,
      1.0
    );
    vRadius = aRadius;
    vDepth = clamp((-viewPosition.z - ${glsl(SURFACE.depthNear)}) / ${glsl(SURFACE.depthRange)}, 0.0, 1.0);

    gl_PointSize = uSize * uPixelRatio * (1.0 / -viewPosition.z);
  }
`;
}

export function createFragmentShader(): string {
  return /* glsl */ `
  uniform vec3 uColorDeep;
  uniform vec3 uColorBright;
  uniform float uOpacity;

  varying float vIntensity;
  varying float vRadius;
  varying float vDepth;

  void main() {
    // Soft round dot from the point's own coordinates — cheaper than a texture.
    float distanceToCentre = length(gl_PointCoord - vec2(0.5));
    if (distanceToCentre > ${glsl(SURFACE.dotEdge)}) discard;
    float falloff = smoothstep(${glsl(SURFACE.dotEdge)}, ${glsl(SURFACE.dotCore)}, distanceToCentre);

    vec3 colour = mix(uColorDeep, uColorBright, vIntensity);
    float edge = 1.0 - smoothstep(${glsl(SURFACE.edgeFadeFrom)}, 1.0, vRadius);
    float depthFade = mix(1.0, ${glsl(SURFACE.depthFadeTo)}, vDepth);

    gl_FragColor = vec4(colour, falloff * uOpacity * edge * depthFade);
  }
`;
}
