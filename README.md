# hannatiaraaa.vercel.app

Personal site and portfolio for Hanna Tiara Andarlia. Next.js 15 App Router, React 19, Tailwind v4, TypeScript strict, Bun.

The repository is part of the work sample, so it holds itself to the practice the case studies describe: one source of truth for every published claim, gates that run green, and documentation that ships with the change.

## Run it

```bash
bun install
bun run dev          # http://localhost:3000
```

No environment variables are required. Off-repo assets are optional — the image loader returns the path unchanged when `NEXT_PUBLIC_STORAGE_HOST_NAME` is unset, so a clean clone builds and renders complete pages. CI runs with nothing configured for exactly that reason.

## The gate

```bash
bun run gate         # format:check → lint → typecheck → build → check:budget → test:unit → test:e2e
```

| Script                 | What it checks                                                                                                                                            |
| ---------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `bun run format:check` | Prettier against `.prettierrc`, including Tailwind class order                                                                                            |
| `bun run lint`         | `eslint` against `next/core-web-vitals` and `next/typescript`                                                                                             |
| `bun run typecheck`    | `tsc --noEmit`, strict, with `noUncheckedIndexedAccess`                                                                                                   |
| `bun run build`        | production build, including the OG image route                                                                                                            |
| `bun run check:budget` | First Load JS: shared ≤ 110 kB, any route ≤ shared + 15 kB                                                                                                |
| `bun run test:unit`    | `bun test` over `lib/` — the pure logic, colocated beside each file                                                                                       |
| `bun run test:e2e`     | Playwright against the production build: Chromium at desktop and phone size, Firefox and WebKit at desktop size (mobile WebKit with `E2E_ALL_BROWSERS=1`) |

The end-to-end suite asserts what a visitor or a crawler can observe, not what a component received. Two of its assertions are the reason it exists:

- **No superseded figure reaches the output.** The CV working folder carries two generations of numbers. `src/content/facts.ts` holds the current set and exports the older one so the suite can fail on it. A number pasted back in from an old draft breaks the build rather than shipping.
- **The public surface never self-applies "Senior".** A policy decision recorded in the CV folder, enforced here rather than remembered.

It also covers route status and metadata, redirects from the 2023 paths, case study structure, the absence of placeholder text, the confidentiality ceiling on employer work, the scroll stories (the home intro and selected-work story, the about timeline, the stack story) at each beat and under reduced motion and without scripts, the interactives inside the case studies, and `@axe-core/playwright` per route in both themes.

Layout is guarded by geometry, not by eye: every page at eleven sizes from 320px up, every scroll scene against a literal table of approved sizes (pinned and scrubbed from 1024px wide at any height, played in flow below), and the mobile menu that replaces the nav links below 640px.

What automation cannot certify stays manual, and is recorded per run in `docs/private/`: the confidentiality read of each case study, the keyboard tab-order pass, and the light/dark visual review.

## Pages

- **Home** opens on a scroll scene, pinned and scrubbed on a large screen and played once by itself on a smaller one: the name over a WebGL flow field, then a report someone made, typed out, struck through and replaced by what it turned out to be. Below it, the selected-work story steps through the case studies beside an illustrated still of each. Each step ends on one call to action: a study with an interactive invites the thing it lets you do (“Try it — Route a requisition”), the rest read “Read the case study”.
- **Work** lists six case studies, each in four parts: what was reported, what it actually was, what shipped, and the evidence. Four carry an interactive model: the draft-sync simulator, the tax ladder, the release-gate run and the approval engine, which routes one requisition through two customers' ladders and shows what the old hard-coded approver missed. Each is server-rendered in its finished state and swaps in its live version as it nears the screen.
- **About** is the arc from 2015 to now as a scroll timeline, with the layers of the system owned at each era.
- **Stack** is a scroll story that builds the stack layer by layer, then the delivery practice around it. Each isometric slab carries its group's name, a line symbol and a tile per item, so the drawing names what the list beside it says.
- **CV** is the printable CV.

## Layout

```
src/app/         Routes. Metadata and composition only.
src/modules/     One folder per area: views/ components/ hooks/ lib/
src/content/     Data. Single source of truth. Server-only.
src/common/      Shared by two or more modules
src/styles/      Tokens and the type scale (globals.css), scroll stories (scrolly*.css,
                 hero-intro, stack-story, fun-fact) and interactives (draft-sync,
                 draft-sync-drawing, tax-ladder, gate-run, approval-engine)
e2e/             Playwright: what a visitor can observe
scripts/         check-budget.ts: the First Load JS budget, run after the build
docs/            Guidelines, acceptance brief, refactor plans, product/ (PRD, spec,
                 test plan), screenshots/, run logs
.claude/skills/  Repo-local skills: portfolio-run, portfolio-voice, portfolio-case-study
```

Every piece of code is exactly one of three things and lives in the folder named for it: `lib/` is pure logic with no React and no DOM, `hooks/` is React state with no JSX, `views/` and `components/` are markup with no rules. Dependencies point view → hook → lib.

Content lives in typed modules rather than MDX so the structure can be enforced: a case study is missing a section at compile time, not at review time.

Full rules in [`docs/guidelines.md`](docs/guidelines.md).

## Conventions

- **Every published figure comes from `src/content/facts.ts`.** Nothing else states a number.
- **Design tokens only.** Colours are CSS variables defined for light on bare `:root` and redefined twice for dark — once under `prefers-color-scheme`, once under `[data-theme]` — so the toggle wins in both directions and no colour has its only definition inside a media query.
- **No third-party runtime dependency for presentation.** Icons are inline SVG; the previous FontAwesome kit was a remote script keyed by an environment variable.
- **Existing paths keep working.** `/projects` and `/skills` were published in 2023 and now redirect.

## Deploy

Vercel, from whichever branch is promoted. Nothing in this repository pushes or deploys.
