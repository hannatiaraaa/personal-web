---
name: portfolio-run
description: Close a goal on the portfolio site unsupervised — scope, build, gate, log. The autonomous-run contract, bound to this repo.
disable-model-invocation: true
---

A **run** on this repo takes one goal and closes it while she is away. The phase machinery, the standing contract and the ledger format are `autonomous-run`'s — read [`~/.claude/skills/autonomous-run/SKILL.md`](~/.claude/skills/autonomous-run/SKILL.md) and follow its five phases. This file is the repo entry that `REPOS.md` asks for, plus the three things that are genuinely different here.

## Repo facts

`/Users/user/Documents/hanna-personal-website` · remote `hannatiaraaa/personal-web` · deploys to `hannatiaraaa.vercel.app`

|                |                                                                                         |
| -------------- | --------------------------------------------------------------------------------------- |
| Stack          | Next.js 15 App Router · React 19 · Tailwind v4 · TypeScript strict · Bun                |
| Gates          | `bun run gate` — format:check, lint, typecheck, build, test:e2e                         |
| Dev            | `bun run dev` → http://localhost:3000                                                   |
| Content        | `src/content/` — facts, case studies, stack, timeline. Typed modules, not MDX.          |
| Ledger home    | `docs/private/`                                                                         |
| Plan of record | `docs/refactor-plan-portfolio-rebuild.md`, `docs/acceptance-brief-portfolio-rebuild.md` |
| Branch         | work off `dev`; never push, never merge to `main`, never deploy                         |

## What is different here

**The reader is a hiring manager, not a user.** A run that ships a working feature nobody would be impressed by has not advanced the goal. Every change answers: does this make the site read more like the engineer the CV describes? A refactor with no visible effect on that question is a follow-up, not a scope item.

**Copy is a gate, not a detail.** No page ships without `portfolio-voice` applied — the authority chain for every figure, the title policy, the confidentiality ceiling, the product framing, and the pass that deletes the second telling. A wrong number on a public page is the one failure here that cannot be quietly fixed later, because it will have been read. New or edited `/work` pages also run `portfolio-case-study`.

**Formatting is not a judgement call.** `.prettierrc` is the house style — single quotes, single-quote JSX, one attribute per line, 120 columns, Tailwind class ordering. Run `bun run format` before committing; `bun run gate` fails on drift.

**This repository is itself the work sample.** The case studies claim release-gate discipline, single-source-of-truth design and documentation that ships with the change. A reviewer will open the repo. So the gates run green, the content has one owner, comments state intent, and no commit lands a `TODO`, a placeholder, or an `any` standing in for a type.

## Gate additions

`autonomous-run` Phase 4 runs lint, typecheck, tests, runtime. On this repo the runtime walk also covers:

1. **Both themes, both breakpoints.** Every changed route at 390×844 and 1280×800, light and dark. No flash of wrong theme on load.
2. **Keyboard only.** Tab the route end to end — visible focus everywhere, order matching the visual order, no trap.
3. **No env vars.** Move `.env.local` aside and build. A clean clone must render complete pages; nothing resolves to a URL containing `undefined`.
4. **Grep the built output** for the superseded figures and for "Senior". Both assertions live in the e2e suite; run them, do not reason about them.

## Companion skills

`portfolio-voice` and `portfolio-case-study` are local to this repo and outrank global copy advice. `web-design-guidelines` and `accessibility` for review passes; `nextjs-app-router-patterns`, `react-patterns` and `typescript-advanced-types` for the code. `caveman:caveman-commit` writes the commits. Everything else routes through `autonomous-run`'s companion table.
