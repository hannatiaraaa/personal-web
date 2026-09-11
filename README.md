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
bun run gate         # lint → typecheck → build → e2e
```

| Script              | What it checks                                                        |
| ------------------- | --------------------------------------------------------------------- |
| `bun run lint`      | `eslint` against `next/core-web-vitals` and `next/typescript`         |
| `bun run typecheck` | `tsc --noEmit`, strict, with `noUncheckedIndexedAccess`               |
| `bun run build`     | production build, including the OG image route                        |
| `bun run test:e2e`  | Playwright against the production build, desktop and mobile viewports |

The end-to-end suite asserts what a visitor or a crawler can observe, not what a component received. Two of its assertions are the reason it exists:

- **No superseded figure reaches the output.** The CV working folder carries two generations of numbers. `src/content/facts.ts` holds the current set and exports the older one so the suite can fail on it. A number pasted back in from an old draft breaks the build rather than shipping.
- **The public surface never self-applies "Senior".** A policy decision recorded in the CV folder, enforced here rather than remembered.

It also covers route status and metadata, redirects from the 2023 paths, case study structure, the absence of placeholder text, the confidentiality ceiling on employer work, and `@axe-core/playwright` per route in both themes.

What automation cannot certify stays manual, and is recorded per run in `docs/private/`: the confidentiality read of each case study, the keyboard tab-order pass, and the light/dark visual review.

## Layout

```
src/content/     facts, case studies, stack, CV — typed modules, single source of truth
src/app/         App Router routes
src/components/  shell, primitives, inline SVG icons, mechanism diagrams
src/lib/         fonts, image loader
src/styles/      design tokens and the type scale
e2e/             Playwright: content authority and accessibility
docs/            acceptance brief, refactor plan, run logs
.claude/skills/  repo-local skills: portfolio-run, portfolio-voice, portfolio-case-study
```

Content lives in typed modules rather than MDX so the structure can be enforced: a case study is missing a section at compile time, not at review time.

## Conventions

- **Every published figure comes from `src/content/facts.ts`.** Nothing else states a number.
- **Design tokens only.** Colours are CSS variables defined for light on bare `:root` and redefined twice for dark — once under `prefers-color-scheme`, once under `[data-theme]` — so the toggle wins in both directions and no colour has its only definition inside a media query.
- **No third-party runtime dependency for presentation.** Icons are inline SVG; the previous FontAwesome kit was a remote script keyed by an environment variable.
- **Existing paths keep working.** `/projects` and `/skills` were published in 2023 and now redirect.

## Deploy

Vercel, from whichever branch is promoted. Nothing in this repository pushes or deploys.
