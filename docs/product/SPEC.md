# Technical Spec — hannatiaraaa.vercel.app

**Companion to** [`PRD.md`](PRD.md) · **Test plan** [`TEST-PLAN.md`](TEST-PLAN.md) · **Conventions** [`../guidelines.md`](../guidelines.md)
**Status** Implemented on `refactor/portfolio-rebuild`
**Written** 11 September 2026

---

## Problem Statement

From the developer's perspective, three things about this product resist the obvious implementation.

**The content is the product, and it makes claims that must not drift.** Every figure on the site traces to a document outside the repository, and those documents carry two generations of numbers. There is no runtime to validate against and no reviewer who will catch a stale figure on the fourth read. The correctness problem is in the content, so the type system and the test suite have to reach into it.

**The two interactive pieces are the most expensive thing on the site and the most load-bearing.** They carry the mathematics argument, which nothing else can. They also involve WebGL, a frame loop and 22,000 points — on a personal site with a 110 kB budget, for a reader who may be on a phone. Naive implementation either blows the budget or produces a screensaver.

**The repository is part of the deliverable.** It will be opened and read by the same people the site is addressed to. That rules out the shortcuts a six-page site would normally permit: a page component that fetches, transforms and renders; a hook that owns business rules; an `any` standing in for a type.

---

## Solution

### Layer architecture

One rule carries most of the design. Every file is exactly one of three things, and lives in the folder that names it:

| Layer | Folder                  | Contains                                                     | Never contains                            |
| ----- | ----------------------- | ------------------------------------------------------------ | ----------------------------------------- |
| Logic | `lib/`                  | Pure functions, maths, transforms, types                     | React, DOM, `window`, side effects, async |
| State | `hooks/`                | React state, effects, subscriptions, imperative browser APIs | JSX, business rules, maths                |
| View  | `views/`, `components/` | JSX, layout, tokens, composition                             | Maths, fetching, business rules           |

Dependencies point **view → hook → lib**, never back.

This is single responsibility applied where it pays rather than everywhere. It buys three specific things: the mathematics becomes unit-testable without a DOM; the hooks become reviewable as wiring; and a defect in a rule has exactly one place it can live.

### Module layout

```
src/
  app/                    Routes. Metadata and composition only.
  modules/<area>/
    views/                Server components, one section per file
    components/           Client components local to the area
    hooks/                React state for the area
    lib/                  Pure logic for the area
    index.ts              export * over the per-role barrels
  content/                Typed data. Single source of truth. Server-only.
  common/                 Used by two or more modules
  styles/                 Tokens and the type scale
e2e/                      Playwright: what a visitor can observe
```

Areas: `home`, `work`, `about`, `stack`, `cv`, `visual`. A thing moves into `common/` when a second module needs it, not in anticipation.

### Content as contract

Four typed modules own everything the site says.

**`facts`** is the single source for every published figure, plus identity, positioning and the title policy. Nothing else in the codebase states a number. It additionally exports the previous generation of figures as a list, so the test suite can assert none of them appear in the built output. The figures are not wrong — they are older, which is precisely what returns from a stale draft.

**`case-studies`** defines the four-part structure as required fields:

```ts
type CaseStudy = {
  readonly slug: string;
  readonly title: string; // names the mechanism, not the project
  readonly context: string; // names the module, never the platform
  readonly period: string;
  readonly summary: string; // also the meta description
  readonly reported: string; // in someone else's voice
  readonly actually: readonly string[];
  readonly shipped: readonly string[];
  readonly evidence: readonly { value: string; label: string }[];
  readonly evidenceNote?: string;
  readonly stack: readonly string[];
  readonly diagram?: DiagramKind;
};
```

A case study missing a part does not compile. `DiagramKind` is imported from the diagram dispatcher rather than restated, so adding a diagram kind is a compile error at the dispatcher until it is drawn — otherwise a new kind would silently render the wrong diagram under a real case study.

**`page-headers`** maps a route path to its masthead content, with a normalising accessor so a trailing slash or different casing cannot lose a header. Routes absent from the map get none, which is what the home page and the case studies want.

**`hero`**, **`stack`** and **`cv`** hold the remaining page copy.

### Rendering model

Server components by default. `'use client'` carries a stated reason in a comment. There are five client components on the site, and each earns it: the theme toggle (persistence and an event handler), the site header (`usePathname` for active state), the route header (`usePathname`, because a layout is never told which child rendered), and the two visualisations (WebGL and a frame loop).

The route header is worth noting as a deliberate trade. Hoisting it into the layout requires knowing the current route, which on the App Router means `usePathname` and therefore a client component. It costs no additional bytes — the site header already pulls that hook into the client bundle — and it still renders during SSR, so the `h1` is in the HTML a crawler receives.

### Visualisation design

Both pieces share three hooks in `common/hooks`: `useInViewport`, `usePageVisible`, `useReducedMotion`. Every animation is gated on all three. A loop that runs while nobody is looking is a defect, not a feature.

**Hero — the flow field.** A Vogel spiral of 22,000 points at `r = c√n, θ = n·137.5°`, with three motion fields composed in the vertex shader: ocean swell as a superposition of three sinusoids, the travelling front of a harvested Fisher–Kolmogorov invasion, and up to four decaying ripples placed by the pointer.

Geometry is computed once on the CPU and uploaded as static attributes. Per frame the CPU sends a clock and four `vec4` ripple records. One `Points` object, one buffer set, one draw call, no lights, no textures, no shadow pass, no post-processing.

The shader source is **generated from the same constants the unit tests assert against**. GLSL cannot call TypeScript, so the three fields exist twice; generating the source reduces the duplication to the shape of each formula, and means a tuning change cannot drift between the tested function and the shipped shader.

The front is the gradient of the sigmoid profile, `4σ(1−σ)`, scaled by `1 − harvest` — a heavier harvest dims the ring, and a harvest at carrying capacity extinguishes it, which is the thesis result rendered rather than described.

**About — the contagion model.** The agent-based model from one of her published papers, on a 2D canvas: 150 agents on a random walk, transmission on contact at probability β, affected → recovering → recovered, and relapse returning an agent to **affected**. That last detail is the correctness fix that matters: relapse to susceptible cannot re-seed anything, because only an affected agent transmits, so the model always burned out and the caption promising an endemic level was false.

The 2D context is chosen partly because it can be read back in a test, which is how the reduced-motion blank-canvas defect is now guarded.

### Seams

Four, and no more. Fewer would mean testing implementation; more would mean testing the framework.

1. **`lib/` function boundaries.** Pure input to pure output. The highest-value seam and the only one unit-tested: the model rules, the geometry, the pointer projection, the ripple queue, the header lookup, the slug.
2. **The rendered route.** A URL in, observable output out — text, status, head, focus, axe results, canvas pixels. Everything a visitor or crawler can see is asserted here and nowhere else.
3. **The production build.** Route manifest and First Load JS per route, which is where the performance budget is checked.
4. **The gate.** One command over all of the above, run identically in CI with no environment configured.

No seam is introduced at the component boundary. Asserting that a view received a prop would test the wiring the type system already checks, and would break on every legitimate design change.

---

## Implementation Decisions

### Framework

- Next.js 15 App Router, React 19, Tailwind v4, TypeScript strict with `noUncheckedIndexedAccess`, `noUnusedLocals` and `noUnusedParameters`. No `any`, no `@ts-expect-error`, no `as` standing in for an exact type.
- Bun as package manager and unit-test runner. Playwright for end-to-end.
- Static rendering for all routes; `generateStaticParams` over the case-study slugs.
- Previous documentation theme removed in full rather than retained behind the new routes.

### Module contracts

- Route files expose `metadata`, optionally `generateStaticParams` and `generateMetadata`, and a default component that composes section views. No section markup.
- Barrels are `export *`. A module with more than one role gets a barrel per role, which the module barrel stars, so an import path still names the layer. Two costs are accepted knowingly: a star re-exports whatever a file adds later, so module-internal helpers stay unexported; and a collision between two starred files is a build error, which typecheck runs early enough to catch.
- Content modules are `readonly` and `as const`, so the type carries literal values.
- `nextCaseStudy` guards two states the content can reach: a single case study has no next one, and an unknown slug returns `-1` from `findIndex`, which wrapping would have turned into the first entry.

### Visualisation contracts

- Scene construction and loop control are separate effects. The construction effect must not depend on visibility: rebuilding recompiles shaders, recomputes the pool and resets the clock, so the swell would jump backwards every time the tab regained focus, and the contagion model would reseed its epidemic — making the endemic claim unobservable.
- Both resize handlers repaint. `ResizeObserver` fires once on `observe()`, and assigning `canvas.width` or calling `renderer.setSize` clears the surface — so the initial callback wiped the frame just drawn, and nothing repainted. The contagion hook retains the last frame's edges so it has something to repaint with.
- A paused loop stops scheduling frames rather than running a no-op callback at 60fps.
- Palette is read from CSS custom properties on mount and re-read on both an explicit theme change and a system theme change.
- Device pixel ratio capped at 2 for canvas, 1.5 for WebGL. Point count drops on narrow viewports.
- `transmit` gates the link radius on its own threshold rather than inheriting the contact radius, so raising one above the other behaves as the parameters imply.

### Design system

- Colours are CSS custom properties only; no hex literal in a component. Light on bare `:root`, dark redefined under both `prefers-color-scheme` (guarded against an explicit light choice) and `[data-theme]`.
- The colour ramp inverts per theme inside the visualisation: additive blending over the dark ground, normal blending over the light one.
- Fluid type scale via `clamp()`; no responsive type classes.
- Scroll reveals animate `transform` only. Animating opacity leaves an element mid-range resting at partial opacity, and text at partial opacity is a contrast failure — measured at 1.83:1 before this changed.
- Ids derived from prose go through a slug helper. `aria-labelledby` parses its value as a space-separated list of ids, so an unslugified title silently resolved to nothing and the section had no accessible name.

### Accessibility contracts

- One `h1` per route. Case-study part legends are `h2`, not styled paragraphs — they were `<p>`, which left each page unreachable by heading navigation.
- Every interactive element has a discernible name; tab order matches visual order; focus uses one shared ring.
- A scrollable region is focusable, or half of it is unreachable by keyboard.
- Canvas and SVG are `role="img"` with a description that states the finding, not the shapes.
- Status is never carried by colour alone — the active nav item gets an underline as well as a colour.

### Compatibility

- `/projects` and `/skills` were published in 2023 and redirect permanently to `/work` and `/stack`. A CV sent two years ago still resolves.
- The site builds and renders complete pages with no environment variables. The image loader returns its input unchanged when no host is configured, rather than composing a URL containing `undefined`.

---

## Testing Decisions

### What a good test asserts

Observable behaviour only: rendered text, response status, head contents, redirect targets, focus position, axe output, viewport visibility, canvas pixels, and route bundle size. Not that a component received a prop. Never a markup snapshot.

### Module coverage

**Unit — `lib/` only, colocated `*.test.ts`.**

| Module                         | What is asserted                                                                                                                                                                                                                                                            |
| ------------------------------ | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `visual/lib/contagion`         | State conservation, boundary reflection, transmission at β=0 and high β, the recovery schedule, burn-out without relapse, endemicity with it, relapse returning to affected, edge index validity, seed reproducibility                                                      |
| `visual/lib/flow-field`        | Vogel radii follow √n and reach the rim, consecutive points one golden angle apart, uniform density, swell bounded by its component amplitudes, front peaking at its reach, harvest dimming and extinguishing it, envelope closing at both ends, ripple causality and decay |
| `visual/lib/pointer-plane`     | Ground-plane intersection, refusal of parallel and behind-camera rays, rotation round-trip, distance preservation                                                                                                                                                           |
| `visual/lib/ripple-queue`      | Slot ordering, oldest-slot recycling, deliberate presses always landing, drag spacing measured from the last placement                                                                                                                                                      |
| `work/lib/adjacent-case-study` | Next study, wrap, and the two guards — single study, unknown slug                                                                                                                                                                                                           |
| `common/lib/slug`              | No whitespace, punctuation collapsed, stability, distinctness across the real titles                                                                                                                                                                                        |
| `content/page-headers`         | Every documented route resolves, routes with their own header return null, trailing slash and casing normalised                                                                                                                                                             |

**End-to-end — three suites.**

`content.spec.ts` — factual authority (no superseded figure, no self-applied "Senior") across every route; absence of placeholder text; the confidentiality ceiling per case study; the four-part structure per slug; the stack page's exclusion list; route status, title and description per route; redirects; sitemap and robots; the share card; the CV as indexable text and a self-hosted PDF; no asset URL containing `undefined`; the hero above the fold; exactly one route header per route.

`accessibility.spec.ts` — axe per route in both themes, failing on serious and critical; the skip link as first tab stop; discernible names on every interactive element; the theme toggle's announced state; `aria-current` on the active nav item; exactly one `h1` per route.

`reduced-motion.spec.ts` — reads the 2D canvas back and asserts pixels were painted; asserts the still-frame notices. This suite exists because "the canvas is in the viewport" passes for a canvas that is in the viewport and blank, which is the defect that shipped.

### Prior art

There was none — this repository had no test when the work started, so the conventions above are the prior art for whatever comes next. The closest external reference is her own release gate at work: deterministic fixtures, disposable state, and assertions on output rather than on the request.

### What is not automated

- The confidentiality read of each case study.
- Keyboard tab-order sanity. axe confirms reachability, not sensible order.
- Light and dark visual review.

Each is recorded per run in `docs/private/` rather than claimed.

---

## Out of Scope

- Component-level tests. The seam is the rendered route.
- Visual regression on the visualisations. They are non-deterministic in time by design; the pixel-paint assertion is the useful part.
- Cross-browser beyond Chromium, and real-device testing. Noted as a follow-up; WebKit is the gap that matters.
- Performance budgets enforced in CI. Documented and checked by hand at the build output.
- Any backend, API, database or CMS.
- Internationalisation, analytics beyond the host's default, and a blog.
- Publishing, merging or deploying.

---

## Further Notes

The layer rule has already paid for itself in defects, which is the argument for keeping it. Moving the model rules and the hero geometry out of components and into `lib/` is what surfaced: a travelling front that saturated into a flat plane after four seconds; 98% of the helix points landing on duplicate coordinates; a clamp collapsing a band onto two positions; and a contagion model that could never reach the endemic state its own caption described. None of those were visible in the rendered page — three of them looked fine.

The duplication that remains, knowingly: the three motion fields exist in TypeScript and in GLSL. Generating the shader from the tested constants shrinks it to formula shape rather than values, which is the best available trade short of compiling one from the other.
