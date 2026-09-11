# Guidelines

How this repository is built. Enforced by `bun run gate`; the parts a gate cannot check are review rules.

Two constraints sit above every rule here, and when a rule conflicts with one of them the constraint wins:

1. **It must stay light to deploy.** This is a six-page personal site. Shared First Load JS has a budget of **110 kB**, and any single route a budget of **+15 kB** over it. Anything heavier is loaded on demand or not at all.
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
    components/ hooks/ lib/ types/
  styles/                 Tokens and the type scale
e2e/                      Playwright: what a visitor can observe
```

A thing belongs in `common/` **once a second module needs it**, not in anticipation. Moving it then is a two-minute change; guessing wrong costs a folder nobody can justify.

### `app/*/page.tsx` composes, it does not render

A route file holds its `metadata`, its params, and a list of section views. No section markup, no copy, no class strings beyond page-level layout.

```tsx
// app/page.tsx
export const metadata: Metadata = { ... };

export default function HomePage() {
  return (
    <div className='space-y-20 sm:space-y-24'>
      <Masthead />
      <SelectedWork />
      <Practice />
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

Content is typed so that structure is a compile error rather than a review comment: a case study missing one of its four parts does not build. Prefer making an invalid state unrepresentable over validating it later.

## Testing

Two tiers, each answering something the other cannot.

**Unit — `bun run test:unit`, colocated `*.test.ts` beside the file.** For `lib/` only, because `lib/` is the only layer where a pure input maps to a pure output. Written first where the logic is non-obvious: the maths, the model step functions, the transforms. AAA structure, names that state the expected behaviour.

**End-to-end — `bun run test:e2e`.** For everything a visitor or a crawler can observe: rendered text, status codes, head contents, redirects, axe output, focus position, what is visible without scrolling. Never that a component received a prop, and never a markup snapshot — that would break on every legitimate design change and teach nothing.

Two assertions exist because their failure would be public and silent: no superseded figure reaches the output, and the public surface never self-applies "Senior". When one fires, the fix is the content, never the test.

## TypeScript

`strict`, with `noUncheckedIndexedAccess`, `noUnusedLocals` and `noUnusedParameters`. All on, none suppressed.

- No `any`. No `@ts-expect-error`. No `as` standing in for a type that could be exact.
- Content arrays are `readonly` and `as const`, so the type carries the literal values.
- Indexed access is checked, so `array[i]` is `T | undefined` — handle it or use `.at()`; do not assert it away.
- A type that can only be one of a few strings is a union, not `string`.

## Naming

| Kind           | Convention                      | Example                                         |
| -------------- | ------------------------------- | ----------------------------------------------- |
| Files          | kebab-case                      | `case-study-card.tsx`, `spherical-harmonics.ts` |
| Components     | PascalCase, named exports       | `export function CaseStudyCard()`               |
| Hooks          | `use` + camelCase               | `useInViewport`                                 |
| Pure functions | verb-first                      | `buildHarmonicPositions`, `stepContagion`       |
| Booleans       | `is` / `has` / `should`         | `isInViewport`, `hasReducedMotion`              |
| Constants      | SCREAMING_SNAKE at module scope | `MAX_DPR`, `AGENT_COUNT`                        |

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

## Style and formatting

`.prettierrc` is the house style — single quotes, single-quote JSX, one attribute per line, 120 columns, Tailwind class ordering. Run `bun run format`; the gate fails on drift. Formatting is never a review comment.

Design tokens only. Colours come from the CSS custom properties in `src/styles/globals.css`, never as a hex literal in a component. Light is defined on bare `:root`; dark is redefined under both `prefers-color-scheme` and `[data-theme]` so the toggle wins in both directions.

## Comments

Comments say **why**. The code already says what.

Write one when a reader would otherwise ask a question: why this threshold, why this looks wrong but is correct, what a constant means, why a `'use client'` boundary is where it is. Delete one that narrates the line beneath it.

No phase numbers, round numbers, ticket ids or plan references in code — those belong in `docs/private/`.

## Accessibility

Not a pass at the end; a condition of the component.

Every interactive element has a discernible name. Tab order matches visual order. Focus is visible everywhere, from one shared ring. A scrollable region is focusable, or a keyboard user cannot reach half of it. Status is never carried by colour alone. Canvas and SVG are `role="img"` with a text description that states the finding, not the shapes. Contrast holds in both themes, and axe runs per route in both.

## The gate

```bash
bun run gate   # format:check → lint → typecheck → build → test:unit → test:e2e
```

Green before every commit. Red is not a thing to explain in a message.

## Related

- `.claude/skills/portfolio-voice` — how the content is written: figure authority, title policy, product framing, cutting redundancy
- `.claude/skills/portfolio-case-study` — the four-part structure under `/work`
- `.claude/skills/portfolio-run` — running an unsupervised change on this repo
