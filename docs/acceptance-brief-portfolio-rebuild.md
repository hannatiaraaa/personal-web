# Acceptance Brief: Portfolio rebuild — make the site match the engineer

**Status:** Draft
**Revision:** 1
**Prepared for:** Hanna Tiara Andarlia (review while away)
**Approval required before risky work:** No — no production data, no secrets, no external writes. One judgement call flagged in Blocking Decisions for review before merge to `main`.

## Revision Log

| Rev | Date | Changed criteria | Reason |
| --- | --- | --- | --- |
| 1 | 2026-09-11 | — | Initial draft |

## Goal

A visitor who arrives from the CV, the LinkedIn headline, or a recruiter's shortlist reads the same engineer on the site as in those documents — end-to-end ownership of field-operations software, evidenced by numbers, with the site's own codebase standing as a work sample.

## Scope

**In scope**

- Replace the Nextra docs theme with Next.js 15 App Router + React 19 + Tailwind v4 + strict TypeScript — the stack the CV claims.
- A canonical facts module: every public number lives in one typed file, so no two pages can disagree.
- Case studies in the CV's own `reported → what it actually was → what shipped → evidence` structure.
- Honest, current stack page replacing the 2023 skills inventory.
- An indexable CV page plus a PDF, replacing the Google Drive download link.
- A release gate on this repo: lint, typecheck, Playwright smoke, axe accessibility assertions, CI.
- Metadata, OG image, sitemap, robots.

**Out of scope**

- A blog or notes section. Nothing is drafted; an empty section reads worse than no section.
- Any AI-feature demo. The brand file rules the AI/ML lane out until mid-2027 ("no shipped AI feature").
- Pushing to `origin`, merging to `main`, or deploying. Work stays on a feature branch off `dev`.
- Rotating or changing the `.env.local` values, or moving assets back into the repo — the off-repo asset decision from commit `4e1f451` is respected.
- Screenshots of Altonaut, customer names, schema diagrams, or anything not already public in the CV.

## Context

**Discovered facts** (verified in this repository and the CV working folder)

- `dev` does not typecheck. `npx tsc --noEmit` returns 7 errors, all in `src/features/projects/ProjectCard.tsx`: `type Props = {}` is destructured for five properties, and two callback parameters are implicitly `any`.
- `/projects` renders one placeholder card titled "Test title" with the body "Hello this is description of my project", linking to `src/pages/projects/foodie.mdx`, which is an empty file. This is the current state of the published site's Projects tab.
- The site is Next 13.4.19 + `nextra` 2.12 + `nextra-theme-docs` — a documentation theme, with sidebar, docs layout and a disabled search box whose placeholder still reads "Search projects...".
- `theme.config.tsx` describes her as "Software Engineer / Frontend Developer using React Native, Next JS, Tailwind CSS in TypeScript" — the 2023 positioning, three years stale.
- The footer credits the Nextra template by name.
- `/skills` lists 34 technologies including MATLAB, Maple, Wolfram Mathematica, AntDesign, OneSignal, Android SDK and Microsoft 365. `Brand_and_Headlines.md` §5 explicitly says to leave MATLAB and its neighbours off public surfaces because "they pull the wrong recruiters".
- Nothing on the site mentions offline-first architecture, approvals, procure-to-pay, release automation, founding-engineer scope, or a single number.
- The CV is served as `https://drive.google.com/uc?export=download&id=<id>` — not indexable, and it breaks if the Drive item moves.
- FontAwesome loads as a remote kit script keyed by `NEXT_PUBLIC_FONTAWESOME_ID`; every icon on the site depends on a third-party script and an env var.
- Images route through a custom loader to an external storage host via four env vars. With no `.env.local` the image URLs resolve to `https://undefinedundefined/...`.
- Toolchain present: Node 24.13.1, Bun 1.3.14. Repo has both `package-lock.json` and `yarn.lock`. `gh` is authenticated against `hannatiaraaa/personal-web`.
- No tests, no CI, no sitemap, no robots, no OG image.

**Product/business constraints** (from her own authored artifacts, not inferred from code)

- **Title policy, `Brand_and_Headlines.md` r14, 9 Sep 2026:** the public surface must not self-apply "Senior". Seniority is carried by scope, standard-setting, dependency, decision rights and customer authority. The public LinkedIn headline is `Full-Stack Engineer`; "Senior" is mirrored only from a posting's own title on a tailored copy, and kept in private Open-to-work preferences.
- **Number authority chain:** `Cover_Letter_Master.md` states it "carries the current numbers and wins any conflict". Canonical current figures are the rounded ones — 100+ vessels, three customer organisations, 1,000+ merged pull requests, 500+ reviews, 1,000+ repeatable Playwright cases across 150+ specs, 2,000+ permission checks per run, 130+ protected routes against 20+ profiles, ~1,100-file procurement migration in under four weeks, approval system rebuilt in under three weeks, 100+ escalations, 60% of pen-test findings closed, six years in production software, five remote. The exact figures in `CV_Hanna_2026_Master.md` (539 PRs, 1,144 cases, 2,760 decisions, three fleets) are the older set and lose the conflict.
- **Voice, `Brand_and_Headlines.md` r11:** "Keep the evidence immodest and the voice modest." No founder-voice authority claims. Every clause checkable.
- **Brand sentence:** "I started in frontend and learned my way to the end of the pipeline — idea, API, mobile, web, release — by watching how people actually use what I ship."
- **Market framing:** lead with field-operations nouns (work orders, assets, inspections, approvals, purchase orders, offline mobile for field crews); keep maritime as the proof rather than the frame.
- Employment is at Wintermar Offshore Marine Group; Altonaut work is employer IP. The abstraction level the CV already uses publicly — architecture and numbers, no customer names, no screenshots, no schema — is the ceiling for the site.

**Assumptions** (to confirm)

- Publishing the CV's Altonaut numbers on a public web page is acceptable, given the same numbers already circulate in the CV and LinkedIn About. Flagged below.
- `hannatiaraaa.vercel.app` remains the deploy target; Vercel picks up whichever branch she merges.
- The external asset host stays. The build must not require it.

**Dependencies and constraints**

- Tailwind v4 needs `@tailwindcss/postcss`; the v3 `tailwind.config.ts` colour tokens move into a CSS `@theme` block.
- Nextra 2 is pages-router only. It cannot coexist with the App Router migration, so it is removed rather than wrapped.
- Two lockfiles present; one is chosen and the other deleted so CI is deterministic.

## Risk Review

| Risk area | Applies? | Required handling |
| --- | --- | --- |
| Security/privacy | Yes | No secrets in committed files. `.env.local` stays git-ignored and unread beyond key names. No customer, vessel, approver or site names anywhere in content. |
| Persistent data/migration | No | Static site, no database, no user data. |
| External effects/cost | No | No push, no deploy, no paid calls. Branch work only. |
| Compatibility/API | Yes | Existing published URLs `/`, `/projects`, `/skills` must not 404 for anyone holding a link — redirect or keep. |
| UX/accessibility | Yes | axe assertions in Playwright plus a manual keyboard and contrast pass; automation alone cannot certify the visual result. |
| Reputational | Yes | A wrong number on a public page is worse than no number. Every figure traces to the authority chain above, enforced by one typed source. |

## Acceptance Criteria

### AC-001: The repository typechecks and lints clean
- **Scenario:** feature branch at any commit
- **Action:** `bun run typecheck` then `bun run lint`
- **Expected:** both exit 0, zero errors
- **Must not:** suppress an error with `any`, `@ts-expect-error`, or an eslint-disable comment
- **Verification:** automated, quoted into the run log
- **Priority:** Required

### AC-002: Every public number resolves to one source
- **Scenario:** the site renders any claim carrying a figure
- **Action:** grep the rendered content for digits
- **Expected:** each figure originates in `src/content/facts.ts`; no numeric claim is hardcoded in a page or component
- **Must not:** state any figure from the superseded set (539, 1144, 2760, 395, 191, 138, 899)
- **Verification:** automated test asserting no literal from the superseded set appears in the built output, plus a grep review
- **Priority:** Required

### AC-003: The public surface never self-applies "Senior"
- **Scenario:** any page, meta description, OG tag, or JSON-LD on the site
- **Action:** grep the built output for "Senior"
- **Expected:** zero occurrences describing her own title; role reads `Founding Engineer` in the experience context and `Full-Stack Engineer` as the brand line
- **Must not:** put "Founding Engineer" in the headline slot as the brand claim — the brand file rules it reads as "currently running my own thing"
- **Verification:** automated assertion on the built output
- **Priority:** Required

### AC-004: The home page states the offer above the fold
- **Scenario:** first-time visitor at 1280×800 and at 390×844, no scrolling
- **Action:** load `/`
- **Expected:** visible without scroll — her name, the brand sentence, the domain she works in, the remote constraint, and at least three evidence figures
- **Must not:** show a typewriter cycling "Recruiter", the phrase "full time learner", or a decorative hero image carrying no information
- **Verification:** Playwright viewport assertions plus manual review of both screenshots
- **Priority:** Required

### AC-005: Every case study resolves a real problem, not a project blurb
- **Scenario:** a visitor opens any `/work/<slug>`
- **Action:** read the page
- **Expected:** four labelled parts — how it was reported, what it actually was, what shipped, and the evidence — each with concrete content; at least five case studies exist
- **Must not:** contain a customer name, vessel name, approver name, site name, screenshot of Altonaut, or a schema diagram
- **Verification:** automated structural test per slug (all four sections present, non-empty) plus manual confidentiality read of each page
- **Priority:** Required

### AC-006: No placeholder content survives
- **Scenario:** the built site
- **Action:** crawl every route
- **Expected:** zero occurrences of "Test title", "Hello this is description", "lorem", "TODO", "Nextra" template credit, or an empty MDX page
- **Must not:** leave a nav entry pointing at a page with no content
- **Verification:** automated crawl assertion
- **Priority:** Required

### AC-007: The stack page reflects what she actually reaches for
- **Scenario:** visitor opens `/stack`
- **Action:** read it
- **Expected:** grouped by how current the skill is; contains the CV's current stack (React Native/Expo, WatermelonDB, Next 15, NestJS, Playwright, Drizzle, Bun, agent tooling)
- **Must not:** list MATLAB, Maple, Wolfram Mathematica, Microsoft 365, AntDesign, OneSignal, or Android SDK as current skills
- **Verification:** automated assertion on the excluded list, manual read of the groupings
- **Priority:** Required

### AC-008: The CV is indexable and self-hosted
- **Scenario:** visitor wants the CV; a search engine crawls the site
- **Action:** load `/cv`; request the PDF
- **Expected:** the CV renders as HTML text in the page, and the PDF is served from this origin
- **Must not:** depend on a Google Drive item id or any third-party host for the primary path
- **Verification:** Playwright asserts CV body text is in the DOM and the PDF route returns 200 with `application/pdf`
- **Priority:** Important

### AC-009: The site builds with no environment variables set
- **Scenario:** clean checkout, no `.env.local`
- **Action:** `bun run build`
- **Expected:** build succeeds; no image resolves to a URL containing "undefined"; no render-blocking third-party script
- **Must not:** require `NEXT_PUBLIC_FONTAWESOME_ID`, `NEXT_PUBLIC_STORAGE_HOST_NAME`, or `NEXT_PUBLIC_RESUME_ID` to render a complete page
- **Verification:** build run with the env file temporarily moved aside, output quoted
- **Priority:** Required

### AC-010: Keyboard and screen-reader access hold on every page
- **Scenario:** visitor navigating by keyboard only, and by screen reader
- **Action:** tab through each route; run axe
- **Expected:** zero axe violations at serious or critical severity; visible focus on every interactive element; tab order matches visual order; every control has a discernible name; theme toggle announces its state
- **Must not:** trap focus, or rely on colour alone to convey status
- **Verification:** `@axe-core/playwright` per route (automated) plus a manual keyboard pass (human judgement — automation cannot certify tab-order sanity)
- **Priority:** Required

### AC-011: Existing published links do not break
- **Scenario:** someone holds a link to `/projects` or `/skills` from the current site
- **Action:** request those paths
- **Expected:** a 200 or a 308 to the replacement route — never a 404
- **Verification:** Playwright request assertions on both paths
- **Priority:** Important

### AC-012: Social and search previews are correct
- **Scenario:** the site is shared on LinkedIn or indexed
- **Action:** inspect `<head>`, `/sitemap.xml`, `/robots.txt`, and the OG image route
- **Expected:** per-page title and description, a working OG image, canonical URL, `Person` JSON-LD, sitemap listing every route
- **Must not:** carry the 2023 description string, or a title template that renders "Hanna's Home"
- **Verification:** automated head assertions per route
- **Priority:** Important

### AC-013: Contrast and theme behaviour hold in both modes
- **Scenario:** light mode and dark mode, and system-preference default
- **Action:** load every route in each
- **Expected:** body text meets WCAG AA 4.5:1 and large text 3:1 in both; no flash of wrong theme on load
- **Verification:** automated contrast check on token pairs plus manual screenshot review of both modes
- **Priority:** Required

### AC-014: The run leaves a ledger a cold reader can act on
- **Scenario:** she opens the repo having read none of this session
- **Action:** read `docs/private/portfolio-rebuild-run-log.md`
- **Expected:** every scope item present with status done, deferred, blocked or skipped; decisions with reasoning; quoted gate output; a handoff naming branch, head, whether it boots, and the single next action
- **Must not:** omit a scope item that appeared in this brief
- **Verification:** item count in the ledger equals the scope item count in the filed issue
- **Priority:** Required

## Blocking Decisions

None block the work. One judgement call is recorded for her review **before merge to `main`**:

- [ ] **Publishing employer-derived figures on a public page.** The Altonaut numbers already appear in the CV and the LinkedIn About text, so the information is not new — but a public website is a broader surface than a CV sent to a named recruiter, and it is indexed. The build proceeds at the CV's abstraction level (architecture and rounded numbers; no customer, vessel or approver names; no screenshots; no schema). If she would rather the public site carry the qualitative case studies without the figures, the facts module is the only file that needs editing.

## Verification Plan

| Criterion | Verification evidence | Status |
| --- | --- | --- |
| AC-001 | `bun run typecheck`, `bun run lint` | Pending |
| AC-002 | superseded-figure assertion + grep review | Pending |
| AC-003 | "Senior" assertion on built output | Pending |
| AC-004 | Playwright viewport assertions + 2 screenshots reviewed | Pending |
| AC-005 | structural test per slug + manual confidentiality read | Pending |
| AC-006 | placeholder-string crawl assertion | Pending |
| AC-007 | excluded-skill assertion + manual read | Pending |
| AC-008 | DOM text assertion + PDF route 200 | Pending |
| AC-009 | `bun run build` with env moved aside | Pending |
| AC-010 | `@axe-core/playwright` per route + manual keyboard pass | Pending |
| AC-011 | request assertions on `/projects`, `/skills` | Pending |
| AC-012 | head/sitemap/robots/OG assertions | Pending |
| AC-013 | token contrast check + both-mode screenshots | Pending |
| AC-014 | ledger item count vs issue scope count | Pending |
