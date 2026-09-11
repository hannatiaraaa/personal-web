# Test Plan — hannatiaraaa.vercel.app

**Companion to** [`PRD.md`](PRD.md) and [`SPEC.md`](SPEC.md)
**Status** Executed, green · **Last run** 11 September 2026

---

## 1. Purpose and strategy

This site makes claims about an engineer's standards to an audience that will check them. So the test suite has an unusual second job: alongside catching defects, it is itself evidence. A reviewer who opens the repository should find tests that assert things worth asserting.

That shapes three rules.

**Test what a visitor or a crawler can observe.** Rendered text, response status, head contents, redirect targets, focus position, accessibility output, what is visible without scrolling, whether a canvas has pixels in it, and how large a route's bundle is. Not that a component received a prop — the type system already checks that, and such a test would break on every legitimate design change while teaching nothing.

**Unit-test the layer where a pure input maps to a pure output.** That is `lib/`, and only `lib/`. The value of the three-layer architecture is that it makes the rules extractable; the value of extracting them is that they can then be tested exhaustively without a DOM. This has already paid — see §7.

**Two assertions exist because their failure would be public and silent.** A stale figure or a self-applied "Senior" on a live page would be read before anyone noticed. Those are the first things the suite checks, and when one fires the fix is always the content, never the test.

### Test pyramid

| Tier | Count | Runner | Scope |
| --- | --- | --- | --- |
| Unit | 58 across 7 files | `bun test` | Pure logic in `lib/` and `content/` |
| End-to-end | 198 across 3 files | Playwright | Every route, desktop 1280×800 and Pixel 7 |
| Accessibility | included above | `@axe-core/playwright` | Every route × both themes |
| Manual | 3 checks | Human | Confidentiality, tab order, visual review |

### Entry and exit criteria

**Entry** — `bun install` succeeds; `bun run build` produces a production build; Chromium installed.

**Exit** — `bun run gate` green end to end, all three manual checks recorded, and no untriaged defect at severity high.

---

## 2. Environments

| | |
| --- | --- |
| Local | Bun 1.3, Node 24, macOS. `bun run dev` on :3000 |
| Test | Playwright against the **production build** on :3210, not the dev server — the thing that ships is the thing asserted |
| CI | GitHub Actions, Ubuntu, Chromium only, **no environment variables set** |

CI running with nothing configured is deliberate. It is what makes "builds from a clean clone" an assertion rather than an assumption, and it is what would catch an asset URL composed from an unset variable.

**Known environment gaps**, accepted and recorded: Chromium only (WebKit is the gap that matters — recruiters open links on phones); no real-device testing; no performance budget enforced in CI, only checked by hand at the build output.

---

## 3. The gate

```bash
bun run gate
```

Six stages, ordered so the cheapest failure surfaces first:

| # | Stage | Command | Catches |
| --- | --- | --- | --- |
| 1 | Format | `prettier --check .` | Style drift, before anything compiles |
| 2 | Lint | `eslint .` | Unused code, React rules, unsafe patterns |
| 3 | Typecheck | `tsc --noEmit` | Type errors, and barrel name collisions |
| 4 | Build | `next build` | Compilation, route manifest, bundle sizes |
| 5 | Unit | `bun test src` | Every pure rule |
| 6 | End-to-end | `playwright test` | Everything observable |

Typecheck sits before build deliberately: `export *` barrels turn a name collision into a build error rather than a lint warning, and stage 3 is where that surfaces cheaply.

---

## 4. Unit test coverage

58 assertions across 7 files, all colocated beside the module they cover.

### `visual/lib/contagion` — 15 tests

The agent-based model from the published paper.

| Behaviour asserted | Why it matters |
| --- | --- |
| Same seed produces the same sequence | The figure must be reproducible on every load |
| Values stay in the unit interval | Guards the generator |
| Every agent starts inside the unit square | Guards placement |
| At least one agent starts affected; none when the fraction is zero | The model can start, and can be told not to |
| Agents stay in the box under a reflecting boundary | Even at 20× speed |
| Population conserved across all four states | No agent lost or duplicated |
| No transmission at β = 0 | The parameter does what it claims |
| Transmission at high β exceeds transmission at zero | Same |
| Affected → recovering → recovered on schedule | The recovery process is real |
| Burns out without relapse | Establishes the baseline |
| **Stays endemic with relapse** | The claim the caption makes |
| **Relapse returns an agent to affected, not susceptible** | The defect this replaced |
| Edges are pairs of valid indices | Guards the render contract |
| Reproducible for a given seed | Same figure every visit |

### `visual/lib/flow-field` — 13 tests

The hero's three motion fields and the Vogel lattice.

| Behaviour asserted |
| --- |
| One xyz triple per point, flat on the plane |
| Radii follow √n; the last point sits exactly on the rim |
| Consecutive points are one golden angle apart |
| Density is uniform — half the radius holds a quarter of the points |
| Swell stays inside the sum of its component amplitudes |
| Swell moves with time and is not a single sine |
| The front peaks exactly at its reach, so the ring travels with it |
| A heavier harvest dims the front; full harvest extinguishes it |
| The envelope closes at both ends, so the loop never snaps |
| The front repeats once per period and stays in 0..1 |
| A ripple is silent before its touch and after it dies |
| A ripple cannot appear ahead of its own travel |
| A ripple stays inside its amplitude and fades with age |

### `visual/lib/pointer-plane` — 8 tests

Ground-plane intersection; refusal of parallel rays and of hits behind the camera; rotation round-trip; distance preservation; a quarter turn mapping the x axis onto z.

### `visual/lib/ripple-queue` — 7 tests

Slot ordering; oldest-slot recycling; position carried through; a deliberate press always landing however close; a drag ignored until it has travelled the spacing; spacing measured from the last placement rather than the first; the first drag landing because there is nothing to measure against.

### `work/lib/adjacent-case-study` — 5 tests

The next study; the wrap from last to first; **null for a single study** rather than linking a page to itself; **null for an unknown slug** rather than silently pointing at the first entry; null for an empty list.

### `common/lib/slug` — 4 tests

No whitespace in output; punctuation collapsed rather than emitted; stability; distinct ids across the real stack-group titles.

### `content/page-headers` — 6 tests

Every documented route resolves; routes that supply their own header return null; unknown route returns null; trailing slash and casing normalised; the root path is not stripped to empty; every header carries a legend and a title.

---

## 5. End-to-end coverage

198 assertions across 3 suites, run at two viewports.

### `content.spec.ts` — factual authority and structure

| Group | Assertion |
| --- | --- |
| **Factual authority** | No superseded figure appears in the built output, on any route |
| | The public surface never self-applies "Senior", on any route |
| **Placeholder** | No route contains "test title", "hello this is description", "lorem ipsum", "todo:", "coming soon" or "nextra" |
| | Every route renders more than 400 characters |
| **Confidentiality** | No case study contains a schema term, an ERD reference or raw SQL |
| **Case study structure** | Each slug renders all four legends; the blockquote matches the reported line; the h1 matches the title |
| **Stack page** | MATLAB, Maple, Mathematica, Microsoft 365, AntDesign, OneSignal and Android SDK are absent |
| | WatermelonDB, Expo, NestJS, Playwright, Bun and Next.js 15 are present |
| **Routes and metadata** | Every route returns 200 with its own title and a description over 60 characters |
| | `/projects` and `/skills` resolve to `/work` and `/stack` rather than 404 |
| | Sitemap lists every route; robots exposes the sitemap |
| | The share card renders as a PNG |
| | The CV renders over 3,000 characters of text; the PDF returns 200 as `application/pdf` |
| | No asset URL contains "undefined" |
| **Hero** | The brand line and the canvas are visible without scrolling |
| | The layers are named — "golden angle", "thesis", "Fibonacci" appear |
| | The canvas aria-label states what it is and that it can be touched |
| | The name, the claim and the figures are present on the page |
| | None of the 2023 gimmicks survive |
| **Route header** | Each of the four documented routes gets exactly one h1, with its own title |
| | Home keeps its own masthead and gains no second header |
| | A case study keeps its own header and does not inherit the work index title |

### `accessibility.spec.ts` — WCAG and keyboard

| Assertion |
| --- |
| Zero serious or critical axe violations, per route, **in both themes** |
| The skip link is the first tab stop and reaches `#main` |
| Every link and button has a discernible accessible name |
| The theme toggle announces what it will do, and does it |
| The current page is marked with `aria-current`, not by colour alone |
| Exactly one `h1` per route |

Tags: `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa`.

### `reduced-motion.spec.ts` — the path that broke

Runs with `reducedMotion: 'reduce'`.

| Assertion | Why |
| --- | --- |
| **The contagion canvas has painted pixels** — read back from the 2D context, more than 100 non-transparent | "The canvas is in the viewport" passes for a canvas that is in the viewport and blank, which is exactly what shipped |
| Every state is reported, and the still-frame notice appears | The reader is told why it is not moving |
| The hero states it is still and that a touch is the motion on offer | Same |

---

## 6. Manual checks

Three things automation cannot certify. Each is recorded per run in `docs/private/`, not claimed.

**Confidentiality read** — every case study, read in full against the ceiling: no customer, fleet, vessel, site or approver name; no screenshot of the product; no schema, table or column name; no internal ticket id or repository name. *Result: pass. The published abstraction level is architecture and rounded numbers throughout.*

**Keyboard tab-order sanity** — tab each route end to end. axe confirms every element is reachable; only a person can confirm the order makes sense. Checked: visible focus everywhere, order matching visual order, no trap, and the scrollable diagram focusable so its off-screen half is reachable. *Result: pass.*

**Light and dark visual review** — every route at 390×844 and 1280×800, in both themes. *Result: pass. Screenshots in `docs/private/screens/`.*

---

## 7. Defects found, by the tier that found them

The record of what each tier actually caught. This is the argument for the architecture, not a theory about it.

### Found by unit tests

| Defect | Severity | Note |
| --- | --- | --- |
| The contagion model could never reach the endemic state its caption described — relapse returned agents to susceptible, but only an affected agent transmits, so the chain always broke | High | The site was stating something false about its own model |
| The hero's travelling front saturated after four seconds and became a flat plane | High | The thing the figure existed to show became invisible |
| 98% of helix points landed on duplicate coordinates — position depended only on the row | High | Rendered as a sparse dotted outline |
| A clamp collapsed the middle band of every non-rung row onto two coordinates | Medium | Masked by the clamp; found by an index-distinctness assertion |

### Found by accessibility tests

| Defect | Severity |
| --- | --- |
| `--ink-faint` failed WCAG AA in both themes — 4.39:1 on paper, 4.30:1 in dark | High |
| The scroll-reveal animation left text resting at 1.83:1 mid-range | High |
| The horizontally scrollable diagram had no keyboard access | Medium |

### Found by the reduced-motion suite

| Defect | Severity |
| --- | --- |
| Both canvases rendered blank under reduced motion — `ResizeObserver` fires on `observe()`, which cleared the frame just drawn, and nothing repainted | High |

### Found by code review

| Defect | Severity |
| --- | --- |
| Both scenes tore down and rebuilt on every visibility change, resetting the clock and reseeding the epidemic | Medium |
| A paused loop kept scheduling frames at 60fps | Medium |
| `aria-labelledby` took an unslugified title, so the section had no accessible name at all | Medium |
| Case-study part legends were paragraphs, leaving each page unreachable by heading navigation | Low |
| The link radius was silently capped by the contact radius | Low |
| `DiagramKind` was duplicated rather than imported — a third kind would have drawn the wrong diagram under a real case study | Low |
| The "Next" card could link to the page you were on | Low |
| React keys derived from the first 40 characters of prose, in six places | Low |
| The footer's year was evaluated at build time on a static page | Low |

### Found by manual review

| Defect | Severity |
| --- | --- |
| The hero clipped top and bottom; additive blending washed out on the light ground | Medium |
| Mobile header overflowed at 412px, clipping the theme toggle | Medium |
| Every case-study card showed the reported quote and then restated it | Low |
| "Field-operations platform" appeared 13 times, five as an identical prefix on consecutive cards | Low |

**Total: 24 defects, all resolved.** Eight were high severity, and seven of those eight were invisible in the rendered page — three of them looked correct.

---

## 8. Traceability

Every acceptance criterion maps to the tier that verifies it.

| # | Criterion | Verified by | Status |
| --- | --- | --- | --- |
| AC-01 | Repository typechecks and lints clean, with no suppressions | Gate stages 2–3 | Pass |
| AC-02 | Every public figure resolves to one source; no superseded figure ships | `content.spec` factual authority | Pass |
| AC-03 | The public surface never self-applies "Senior" | `content.spec` factual authority | Pass |
| AC-04 | The hero states the offer above the fold | `content.spec` hero + screenshot review | Pass |
| AC-05 | Every case study carries four non-empty parts, within the confidentiality ceiling | `content.spec` structure + manual read | Pass |
| AC-06 | No placeholder content survives | `content.spec` placeholder crawl | Pass |
| AC-07 | The stack page reflects current work and excludes the flagged terms | `content.spec` stack | Pass |
| AC-08 | The CV is indexable text with a self-hosted PDF | `content.spec` routes | Pass |
| AC-09 | The site builds and renders with no environment variables | CI, unconfigured | Pass |
| AC-10 | Keyboard and screen-reader access hold on every route | `accessibility.spec` + manual tab pass | Pass |
| AC-11 | Previously published links do not break | `content.spec` redirects | Pass |
| AC-12 | Social and search previews are correct | `content.spec` metadata, sitemap, OG | Pass |
| AC-13 | Contrast holds in both themes | `accessibility.spec` × 2 themes + screenshot review | Pass |
| AC-14 | Reduced motion is honoured without losing content | `reduced-motion.spec` pixel readback | Pass |
| AC-15 | Each route gets exactly one header, from the layout | `content.spec` route header | Pass |
| AC-16 | Shared First Load JS stays within budget | Gate stage 4, checked by hand | Pass — 103 kB shared, 107 kB home, budget 110 kB |

---

## 9. Last run

```
bun run gate

format:check   clean
lint           clean
typecheck      clean
build          ✓ Compiled successfully — 11 routes
test:unit      58 pass, 0 fail (7 files)
test:e2e       198 passed
```

Bundle: **103 kB shared First Load JS**; home 107 kB; heaviest route `/about` at 110 kB. The 3D bundle is 82 kB gzipped and deferred, so it is not in any route's first load.

**One incident during this run, worth recording:** the production server returned 500 on every route with `Cannot find module './vendor-chunks/next.js'`. This was a corrupted build artifact rather than a source defect — `rm -rf .next` and a rebuild cleared it, and the suite then passed. Worth knowing because the symptom looks like a code failure and is not one.

---

## 10. Residual risk

| Risk | Likelihood | Impact | Mitigation |
| --- | --- | --- | --- |
| WebKit-specific rendering or layout bug | Medium | Medium | Untested. Recruiters open links on phones, so this is the first gap to close |
| CV content drifts between this repository and the CV working folder | High | Medium | Two sources today. Generating one from the other is the fix |
| A performance regression lands unnoticed | Low | Medium | Budget documented and checked by hand; not enforced in CI |
| A figure changes in the source documents and not in the facts module | Medium | High | The superseded-figure assertion catches a reappearance, not a new divergence. Manual check on any CV revision |
| The GitHub profile continues to argue against the site | High | High | Outside this repository. Three actions are the owner's: enable private contribution display, pin the four real repositories, archive the learning-era ones |
