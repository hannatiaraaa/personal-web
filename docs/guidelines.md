# Guidelines

How this repository is built. Enforced by `bun run gate`; the parts a gate cannot check are review rules.

Two constraints sit above every rule here, and when a rule conflicts with one of them the constraint wins:

1. **It must stay light to deploy.** This is a six-page personal site. Shared First Load JS has a budget of **110 kB**, and any single route a budget of **+15 kB** over it — `bun run check:budget` fails the gate on either. Anything heavier is loaded on demand or not at all.
2. **It must stay easy to read.** Both the code and the content. A reviewer opening this repo is part of the audience, so a clever abstraction that costs a reader two minutes is a worse trade here than in a product codebase.

## Architecture

### Three layers, three folders, never mixed

The rule that does the most work. Every piece of code is exactly one of these, and it lives in the folder named for it:

| Layer     | Folder                  | May contain                                                                    | Must not contain                          |
| --------- | ----------------------- | ------------------------------------------------------------------------------ | ----------------------------------------- |
| **Logic** | `lib/`                  | Pure functions, maths, transforms, types. Deterministic in, deterministic out. | React, DOM, `window`, side effects, async |
| **State** | `hooks/`                | React state, effects, subscriptions, refs, imperative browser APIs             | JSX, business rules, maths                |
| **View**  | `views/`, `components/` | JSX, layout, tokens, composition                                               | Maths, fetching, business rules           |

A view that computes something calls into `lib/`. A view that needs state calls a hook. A hook that needs a calculation calls `lib/`. Dependencies point one way: **view → hook → lib**, never back.

This is single responsibility applied where it pays: it keeps the maths unit-testable without a DOM, the hooks testable without markup, and the views reviewable by reading them.

### Folder structure

```
src/
  app/                    Routes. Metadata and composition only.
  modules/                One folder per area of the site.
    <area>/
      views/              Server components, one section per file
      components/         Client components local to this area
      hooks/              React state for this area
      lib/                Pure logic for this area
      index.ts            The module's public surface
  content/                Data. Single source of truth. Server-only.
  common/                 Used by two or more modules
    components/ hooks/ lib/
  styles/                 Tokens and the type scale in globals.css; one
                          <name>.css per scroll story or interactive
scripts/                  check-budget.ts, run by the gate after the build
e2e/                      Playwright: what a visitor can observe
```

A thing belongs in `common/` **once a second module needs it**, not in anticipation. Moving it then is a two-minute change; guessing wrong costs a folder nobody can justify.

### `app/*/page.tsx` composes, it does not render

A route file holds its `metadata`, its params, and a list of section views. No section markup, no copy, no class strings beyond page-level layout.

```tsx
// app/page.tsx — the home page takes the site's default metadata from layout.tsx
export default function HomePage() {
  return (
    <div className='space-y-20 sm:space-y-24'>
      <Masthead />
      <Offer />
      <SelectedWork />
      <Practice />
      <Mathematics />
    </div>
  );
}
```

Each of those lives in `modules/home/views/`, one file each. The point is that a route diff tells you _what changed structurally_, and a section diff tells you _what changed in that section_ — you never read 300 lines to find out which.

### Server by default

Every component is a server component unless it provably cannot be. A `'use client'` directive is a decision that needs a reason, and the reason goes in a comment at the top of the file.

The only legitimate reasons here are: React state or effects, a browser API, an event handler, or a library that touches the DOM.

Push the boundary **down**, not up. A section with one interactive control is a server view that renders one client component — not a client section.

Content comes from `src/content/` at build time. There is no client-side fetching in this repo, and adding one would need a reason the budget accepts.

### Atomic files

One concern per file. A file that fetches, transforms and renders is three files.

Practical thresholds, not laws: a view over ~120 lines usually contains two sections; a `lib/` file with two unrelated exports is two files. Split when a reader would have to hold two ideas at once — not to hit a number.

## Domain language

Names in code match the names in the content and the CV. A case study, a figure, a stack group, an arc step — these are the domain objects, and they are called that in types, files and tests. When the content is renamed, the code is renamed with it.

Content is typed so that structure is a compile error rather than a review comment: a case study missing one of its four parts does not build. Prefer making an invalid state unrepresentable over validating it later. The stack is the pattern: each group has a `StackGroupId` (a union in `src/content/stack.ts`), and the page's explainer scenes are a `Record<StackGroupId, …>` (`views/scenes/stack-scene.tsx`), so a group added without a scene does not build.

## Testing

Two tiers, each answering something the other cannot.

**Unit — `bun run test:unit`, colocated `*.test.ts` beside the file.** For `lib/` only, because `lib/` is the only layer where a pure input maps to a pure output. Written first where the logic is non-obvious: the maths, the model step functions, the transforms. AAA structure, names that state the expected behaviour.

**End-to-end — `bun run test:e2e`.** For everything a visitor or a crawler can observe: rendered text, status codes, head contents, redirects, axe output, focus position, what is visible without scrolling. Never that a component received a prop, and never a markup snapshot — that would break on every legitimate design change and teach nothing.

It runs in three engines, because a visitor may be on any of them: Chromium at desktop and phone size, Firefox and WebKit at desktop size. Mobile WebKit (`iPhone 13`) is defined but runs only with `E2E_ALL_BROWSERS=1` — it adds a third of the run for what the other four already cover. Input goes through `e2e/support/input.ts`, so a test presses Tab the way a Safari reader does (Option+Tab reaches links) and scrolls by hand where there is no wheel. A test is skipped in an engine only when the behaviour is engine-specific by nature, with the reason in the skip; anything a visitor relies on passes in all of them.

Layout is asserted by geometry, not by eye: `e2e/responsive.spec.ts` walks every page at eleven sizes from 320px up, with `e2e/support/geometry.ts` measuring each text box against the viewport and against every ancestor that clips it — `overflow-x: clip` hides real overflow from `scrollWidth`, so the page width alone proves nothing — plus overlapping siblings, touching cards, heading order, 44px touch targets and visible focus. A new page joins its list.

Two assertions exist because their failure would be public and silent: no superseded figure reaches the output, and the public surface never self-applies "Senior". When one fires, the fix is the content, never the test.

## TypeScript

`strict`, with `noUncheckedIndexedAccess`, `noUnusedLocals` and `noUnusedParameters`. All on, none suppressed.

- No `any`. No `@ts-expect-error`. No `as` standing in for a type that could be exact.
- Content arrays are `readonly` and `as const`, so the type carries the literal values.
- Indexed access is checked, so `array[i]` is `T | undefined` — handle it or use `.at()`; do not assert it away.
- A type that can only be one of a few strings is a union, not `string`.

## Naming

| Kind           | Convention                      | Example                                       |
| -------------- | ------------------------------- | --------------------------------------------- |
| Files          | kebab-case                      | `case-study-card.tsx`, `flow-field-scroll.ts` |
| Components     | PascalCase, named exports       | `export function CaseStudyCard()`             |
| Hooks          | `use` + camelCase               | `useInViewport`                               |
| Pure functions | verb-first                      | `createPopulation`, `stepPopulation`          |
| Booleans       | `is` / `has` / `should`         | `isInViewport`, `hasReducedMotion`            |
| Constants      | SCREAMING_SNAKE at module scope | `MAX_DPR`, `AGENT_COUNT`                      |

No default exports except where a framework requires one (`app/**/page.tsx`, `layout.tsx`, `sitemap.ts`, `robots.ts`, the image loader). Named exports survive renames and grep.

### Barrels

A barrel is `export *`, never a list of names:

```ts
// modules/work/views/index.ts
export * from './case-study-header';
export * from './evidence';
```

Re-naming every symbol in the barrel is a second place to edit for every export added, and it goes stale without anything failing.

**The star must not flatten the layering.** A module with more than one role gets a barrel per role, which the module barrel then stars — so an import path still says which layer a symbol came from:

```
modules/work/index.ts          export * from './lib'; './components'; './views'
modules/work/views/index.ts    the views
modules/work/lib/index.ts      the pure logic
```

Two things `export *` costs, and how they are paid:

- It re-exports whatever a file adds later, including things meant to stay module-internal. Module-internal helpers stay unexported, or their file stays out of the barrel.
- A name collision between two starred files is a build error rather than a lint warning. `bun run typecheck` is what catches it, so it runs in the gate before anything else compiles.

Every magic number gets a name. `MAX_DPR = 2` says what 2 is; `2` does not.

## Performance rules

These are the ones that keep the budget.

- **Nothing heavy loads eagerly.** A visual library, a canvas, anything over a few kB: `next/dynamic` with `ssr: false`, mounted only when its container enters the viewport, with a static placeholder before it. The home route's First Load JS must not move when a visual is added.
- **Animation stops when it is not seen.** Every rAF loop is gated by an `IntersectionObserver` and by `document.visibilityState`. A loop running in a background tab is a bug.
- **`prefers-reduced-motion` is honoured by not running.** Not by running faster. Render one settled frame, or nothing.
- **Compositor only.** Transitions and animations use `transform` and `opacity`. Never animate layout. Never animate a property that can leave text at partial opacity — that is a contrast failure, not an effect.
- **Device pixel ratio is capped**, at 2 for canvas and 1.5 for WebGL. Retina at full DPR quadruples fill cost for no perceptible gain here.
- **No runtime dependency for presentation.** Icons are inline SVG. Fonts are self-hosted. A font, icon set or CSS file fetched from another origin is a third party in the critical path.

## Scroll stories

A scroll story is a visual that changes as text steps scroll past it. It is built from the platform — CSS, one `IntersectionObserver`, one passive scroll listener — never a scroll library.

- **It must run in Chrome, Safari and Firefox.** Firefox has no CSS `animation-timeline`, and Safari only from 26. So the choice of driver is a choice about what a Firefox reader sees:
  - **`ScrollScene`** for any effect the story depends on. It writes the scene's progress as `--progress` (0–1) and, given `beats`, the current beat as `data-beat` on its element, from a scroll listener attached only while the scene is within a viewport of the screen and the tab is visible — at most one measurement per frame, nothing re-rendered. `mode='pinned'` measures a tall section with a sticky child (0 as its top reaches the viewport top, 1 as its bottom reaches the viewport bottom); `mode='through'` an element in plain flow (enter at the bottom to leave at the top). Children are server components and read `var(--progress, 1)` and `[data-beat]` in CSS. A canvas follows the same scene without a listener of its own: it reads the scene's `--progress` inside the frame loop it already runs (the hero pool), or follows the scene's attributes through `useSceneAttribute`, a `MutationObserver` (the gate run). A live canvas laid over a still marks its mount `data-live-painted` once it has painted, and only then does the still step aside. A scene that pins only at the `pin` size passes `liveQuery={PIN_QUERY}`: outside it the scene is static, so it is measured once and never listened to, since every `--progress` write restyles the whole scene.
  - **CSS view and scroll timelines** only for a flourish that may sit static where unsupported — the reading rail, a counting figure — behind `@supports (animation-timeline: …)`.
- **The finished scene is the default.** `--progress` is registered with an initial value of 1, and `data-beat` renders as the last beat, so before hydration, without JavaScript and under reduced motion (forced in CSS, whatever the script wrote) a reader sees the end state. Style the end state as the default and earlier beats as the exception.
- **Beats inside a scene are CSS, not script.** A slice of the scene is `clamp(0, (var(--progress, 1) - <from>) / (<to> - <from>), 1)`, with `<from>` and `<to>` named as custom properties on the scene. A slice that starts with a beat reads its start from the beats list the script passes, rather than repeating the number. The same maths is `segmentProgress` and `beatAt` in `common/lib/scene-progress.ts`, for a script that needs it.

- **Mobile first: scrub only side by side, decided by width.** A story is scrubbed by scroll only when its visual pins _beside_ its steps. That is the `pin` variant: `(min-width: 64rem)` — width only, because phones and tablets come in standard widths while a desktop window's height moves with its toolbars and a docked DevTools. Every window from 1024 wide pins at any height, a landscape tablet at 1024×768 included. Height never switches the mode; the frame fits by scaling: each pinned frame is sized `max(var(--pin-frame-min), min(100svh - var(--sticky-offset) - <gaps>, <max>))`, its drawing scales through its `viewBox`, a long log scrolls in its own column, and a dense board tightens (the tax ladder, whose receipts scroll inside the board on a very short window). Below the `--pin-frame-min` floor (22rem) the scene still pins and scrubs and the page scroll reaches the rest of the frame. A script asks the same question with `PIN_QUERY` (or `fitsPin`) from `common/lib/media-queries.ts`; a unit test holds it equal to the variant. An e2e test never derives what to expect from either: which sizes pin is the approved table in `e2e/support/approved-modes.ts`, written out by hand, and `e2e/scene-fit.spec.ts` checks every scene against it — it changes only with Hanna's approval (width-only, approved 2026-11-01). The base CSS and the base logic serve the phone; pinning and scrubbing are the enhancement under `pin`. Below it, the default for every story:
  - the visual sits in flow, never sticky, and is never taller than the band under the sticky bars;
  - it plays once by itself as it comes into view, on one shared clock — `ScrollScene`'s `autoRun` span, or `useAutoRun` (`common/hooks`, maths in `common/lib/auto-run.ts`) for a piece with its own state — with Replay and Skip where the run is long enough to want them (an idle Skip is `aria-disabled`, not `disabled`, so a run ending under it keeps keyboard focus); the clock is one `requestAnimationFrame` loop that runs only while a run plays, and a run that leaves the screen lands on its end;
  - the steps read as a normal list or log, none of them marked current;
  - under reduced motion it shows the finished state, its controls still working; without scripts, the finished state.

  A scene that pins only at `pin` passes `liveQuery={PIN_QUERY}`, so below it there is no scroll listener and no `--progress` write.

- **Sticky things sit below `var(--sticky-offset)`.** It is the header (`--header-h`), plus the case-study part bar where that bar sits on top of the column; a pinned frame is sized `min(100svh - var(--sticky-offset) - <gaps>, <max>)` so it always fits the band, and a jump target's `scroll-margin-top` starts from it. Viewport heights are `svh` with a `min()` cap, never `vh`.
- **`ScrollyStage` takes server children.** `label`, a `visual` and a list of `steps`, all rendered on the server and passed through — only the wrapper and its observer ship as JS. It writes `data-active-step` on itself and, where it pins, `aria-current="step"` on the active step; keyboard focus entering a step activates it. Below `pin` the step reached only latches each card's own entrance, and no step is current. Visuals change state in CSS keyed off the attribute (`group-data-[active-step=1]/stage:`), so a step never re-renders the visual. Under reduced motion it sets `data-stage-state="final"` and nothing pins: a visual shows its final state off that attribute.
- **`CountUp` keeps the real value in the DOM.** The published figure is always the text — crawlers, screen readers and the superseded-figure assertion read it. The count is a decorative `aria-hidden` layer, CSS only. A figure that is not one integer, is a single digit, or is in the thousands renders as written — a count must never rest on a value that was not published.
- **Per-area styles** go in `src/styles/scrolly-<area>.css`, shared ones in `scrolly.css`; a scene or interactive with enough of its own gets `src/styles/<name>.css` (`hero-intro.css`, `stack-story.css`, `tax-ladder.css`). Every one of them is global, so a class names its area or its section (`story-quote`, not `quote`): two areas once both styled `.reported-quote`, and the home panel clipped the case-study quote to nothing.
- **Nothing that can be jumped to moves vertically on entrance.** A fragment jump is measured while the entrance is still running, so a translate makes the jump land short, under the sticky header.
- **Every client addition is measured.** `bun run check:budget` runs after the build; note First Load JS in the message of any commit that adds client code.

## Interactives

An interactive is a hands-on model inside a case study — the draft-sync simulator, the tax ladder, the gate run, the approval engine. Each is a scroll story or a board with controls, and everything above applies; these are the rules on top.

- **Copy lives in `src/content/interactives.ts`.** Labels, descriptions and notes — none of them a published figure.
- **Registered, not imported.** A case study opts in with its `interactive` field in `src/content/case-studies.ts`. The kind is a union in `modules/visual/components/interactives.tsx`, so a new one is a compile error until `CaseStudyInteractive` renders it and `INTERACTIVE_PLACEMENT` says where it sits (`replaces-diagram` at the column's width with the diagram as its fallback, or `after-diagram` in the prose column). Anything that lists interactives — the home page's selected-work story — reads the field, never a list of slugs.
- **Lazy, behind an identical placeholder.** The server renders the piece's own markup in its finished state, controls present but disabled. A mount component swaps the live one in from a split chunk once the slot is within a viewport — `useLatchedInViewport`, so it stays mounted once it has been seen (`LiveOnApproach` with a `React.lazy` piece when the placeholder is passed in, `next/dynamic` with `ssr: false` for a canvas laid over a still). Same markup, same box, so the swap never moves the page, and a route's First Load JS does not change when an interactive is added.
- **Shared parts, not copies.** A policy switch is `SegmentedToggle` (styled once as `.segmented` in `globals.css`); a live region that follows a slider is `useDebouncedAnnouncement`. The sentences a piece speaks are built in its `lib/` (`describeComparison`, `describeApprovalRoutes`) and tested there, never in a view.
- **The first frame does not replay.** The live piece takes over a placeholder already showing its state, so an entrance that would land the same thing twice is skipped until the state first changes.
- **Numbers are labelled illustrative.** A model runs on invented inputs, so it says so where it shows them — `Illustrative numbers`, `Illustrative simulation`, `Illustrative run` (`illustrativeLabels` in `src/content/interactive-labels.ts`, kept apart so a client import does not pull in every piece's copy) — visibly, beside the numbers it labels. A real figure on the same page still comes from `src/content/facts.ts`.
- **One scroll listener per scene.** The scene's `ScrollScene` is the only scroll subscription; a piece that needs its step follows the scene's `data-beat` through `useSceneAttribute` (a `MutationObserver`, not a second listener), and a canvas that draws per frame reads `--progress` in that frame. A replay the reader asks for runs on the shared clock (`useAutoRun`) and hands back to the scroll when they move on.

## Polish

The conventions the components already follow, so a new one matches without a review comment:

- **Press.** A button or a control-chip scales to `0.96` while held — `scale`, transitioned, so a release mid-press eases back. The shared rule in `globals.css` covers `.btn-primary`, `.btn-quiet`, `.icon-btn`, `a.chip`, `button.chip` and `.press` — a new control takes `.press` rather than its own rule; `data-press='static'` opts a control out.
- **Transitions.** Name the properties — never `transition: all` or `transition-all`. Hover and press are transitions, so they can be interrupted, and a CSS `:hover` sits inside `@media (hover: hover)` so a tap does not leave it stuck (Tailwind's `hover:` already does); keyframes are for sequences that run once. Tailwind's `transition-*` utilities default to 150ms ease-out here, and a control's own CSS transition reads the same `--default-transition-duration`. A hover lift is `translate`, not `transform`, because `.reveal` holds `transform` on the same element.
- **Surfaces.** Elevation is a shadow token (`--shadow-border`, `--shadow-border-hover`, `--shadow-lift`, `--shadow-float` for a card over moving ground, `--shadow-raise` for a small control, `--shadow-glow` for the primary button; each with a dark value); a full round is `--radius-pill`; a border is for structure — dividers, rules, a selected state. Nested corners are concentric: the outer radius is the inner radius plus the padding between them (`calc(var(--radius-sm) + <padding>)`).
- **Text.** Headings balance and running text is `pretty` from the base layer. Any number that changes on screen is `.tnum`. Smoothing is set once, on `html`.
- **Targets.** `--target-min` (44px) on a coarse pointer — the `pointer-coarse:` variant or a `(pointer: coarse)` block, extending with a pseudo-element where the layout cannot grow, and never into a neighbour's hit area.
- **Theme.** Which theme icon shows is decided in CSS, so it is right before hydration. A switch is one View Transition cross-fade where supported and motion is allowed, and instant otherwise; per-element transitions are off for its duration (`data-theme-switching`).

## Style and formatting

`.prettierrc` is the house style — single quotes, single-quote JSX, one attribute per line, 120 columns, Tailwind class ordering. Run `bun run format`; the gate fails on drift. Both format scripts also read `.prettierignore.local`, for working folders a checkout keeps out of the formatter. Formatting is never a review comment.

Design tokens only. Colours come from the CSS custom properties in `src/styles/globals.css`, never as a hex literal in a component — status included: `--pass`, `--caution`, `--caution-wash`, `--caution-bright`. Easing is a token too (`--ease-out-soft`, `--ease-snap`), not a `cubic-bezier` repeated in place. Light is defined on bare `:root`; dark is redefined under both `prefers-color-scheme` and `[data-theme]` so the toggle wins in both directions.

## Comments

Comments say **why**. The code already says what.

Write one when a reader would otherwise ask a question: why this threshold, why this looks wrong but is correct, what a constant means, why a `'use client'` boundary is where it is. Delete one that narrates the line beneath it.

No phase numbers, round numbers, ticket ids or plan references in code — those belong in `docs/private/`.

## Accessibility

Not a pass at the end; a condition of the component.

Every interactive element has a discernible name. Tab order matches visual order. Focus is visible everywhere, from one shared ring. A scrollable region is focusable, or a keyboard user cannot reach half of it. Status is never carried by colour alone. Canvas and SVG are `role="img"` with a text description that states the finding, not the shapes. Contrast holds in both themes, and axe runs per route in both.

## The gate

```bash
bun run gate   # format:check → lint → typecheck → build → check:budget → test:unit → test:e2e
```

Green before every commit. Red is not a thing to explain in a message. CI runs the same `bun run gate`, budget included, with Chromium, Firefox and WebKit installed.

Two things about running it locally: after a CSS change, clear `.next` before building, or the build can serve the old stylesheet; and never build in a folder where `next dev` is running — both write `.next`. Build from a separate worktree instead.

## Related

- `.claude/skills/portfolio-voice` — how the content is written: figure authority, title policy, product framing, cutting redundancy
- `.claude/skills/portfolio-case-study` — the four-part structure under `/work`
- `.claude/skills/portfolio-run` — running an unsupervised change on this repo
