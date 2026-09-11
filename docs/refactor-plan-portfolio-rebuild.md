# Refactor: rebuild the portfolio so the site matches the CV it links from

> Written to be filed as a GitHub issue on `hannatiaraaa/personal-web`. Filing was blocked in this
> session because it publishes to a public repository. Run it yourself once you have read it:
>
> ```
> gh issue create --repo hannatiaraaa/personal-web \
>   --title "Refactor: rebuild the portfolio so the site matches the CV it links from" \
>   --body-file docs/refactor-plan-portfolio-rebuild.md
> ```

## Problem Statement

The site contradicts the CV that links to it.

The CV and LinkedIn describe a founding engineer who took a field-operations SaaS from its first months to 100+ vessels: offline-first mobile for crews with no signal, an approval engine three customer organisations configure themselves, a release gate of 1,000+ repeatable cases built from nothing. A recruiter who follows the link from that CV lands on a Nextra documentation theme from 2023 whose Projects tab contains one card titled **"Test title"** with the body **"Hello this is description of my project"**, linking to an empty file.

Concretely, as of `dev` @ `26a2b9b`:

- **It does not typecheck.** `npx tsc --noEmit` → 7 errors, all in `src/features/projects/ProjectCard.tsx`: `type Props = {}` destructured for five properties, two callbacks implicitly `any`.
- `/projects` is a placeholder. `src/pages/projects/foodie.mdx` is a zero-byte file with a nav entry pointing at it.
- The meta description still reads _"Software Engineer / Frontend Developer using React Native, Next JS, Tailwind CSS in TypeScript"_ — the 2023 positioning.
- The footer credits the Nextra template by name.
- `/skills` lists 34 technologies including MATLAB, Maple, Wolfram Mathematica, AntDesign, OneSignal and Microsoft 365. My own brand notes say to keep those off public surfaces because they pull the wrong recruiters.
- Nothing anywhere mentions offline-first, approvals, procure-to-pay, release automation, founding-engineer scope, or a single number.
- The CV download is a Google Drive item id — not indexable, and it dies if the item moves.
- FontAwesome is a remote kit script keyed by an env var, so every icon depends on a third party and a variable being set. With no `.env.local`, images resolve to `https://undefinedundefined/...`.
- No tests, no CI, no sitemap, no robots, no OG image.

The theme is the root problem, not the content. `nextra-theme-docs` is a **documentation** chrome — sidebar, docs layout, a disabled search box still placeheld "Search projects...". It reads as a template because it is one, and a reviewer who opens devtools sees Next 13 and a docs theme while the CV claims Next 15, App Router, RSC, Tailwind v4.

## Solution

Rebuild on the stack the CV actually claims, and let the site's own repository be the work sample.

**Next.js 15 App Router + React 19 + Tailwind v4 + strict TypeScript.** Nextra comes out rather than gets wrapped — Nextra 2 is pages-router only, so it cannot survive the migration. This is the change that does the most work: it removes the template signal, and it makes the claimed stack checkable in one devtools glance.

**One typed source of truth for every public number.** `src/content/facts.ts`. A figure cannot drift between the home page and a case study because neither owns it. This matters more than it sounds: my own documents carry two generations of figures — the exact set (539 PRs, 1,144 cases, 2,760 decisions) and the current rounded set (1,000+ PRs, 1,000+ cases, 2,000+ checks), and `Cover_Letter_Master.md` says it "wins any conflict". A public page with a superseded number is worse than a page with none, so the superseded set gets an automated assertion against it.

**Case studies, not a project grid.** The differentiator in the CV is problem framing, and the CV already has the format: _Selected problems solved_ — reported → what it actually was → what shipped. That structure becomes `/work/<slug>`: how it was reported, what it actually was, what shipped, and the evidence. Six of them, of which five are the substantive ones. A grid of thumbnails would work against the one thing that is scarce here.

**A release gate on this repo.** The case studies claim release-quality discipline; the repo currently has no test and does not compile. Lint, typecheck, Playwright smoke, axe assertions, CI.

**Public title policy holds.** Per the r14 decision in `Brand_and_Headlines.md`, the public surface does not self-apply "Senior" — seniority is carried by scope, standard-setting and decision rights, which is what the case studies are for. Brand line is `Full-Stack Engineer`; `Founding Engineer` sits in the experience context, not the headline.

## Commits

Each leaves the branch runnable. Branch: `refactor/portfolio-rebuild` off `dev`.

1. **Fix the typecheck errors on the existing code.** Give `ProjectCard` a real `Props` type and annotate the two callbacks. Nothing else changes. The branch now compiles before it is touched further, so every later commit has a green baseline to regress against.
2. **Delete the dead placeholder.** Remove the empty `projects/foodie.mdx` and its `_meta.json` entry. `/projects` keeps the one card; the nav no longer points at nothing.
3. **Choose one package manager.** Keep `bun.lock`, delete `package-lock.json` and `yarn.lock`, add the `packageManager` field. CI is now deterministic.
4. **Add the gate scripts before there is anything to gate.** `typecheck`, `lint`, `test:e2e`. They pass on the current code. Adding them first means every subsequent commit is measured.
5. **Upgrade Next, React and TypeScript** with Nextra still in place, pages router untouched. Verify the old site still boots. This isolates dependency breakage from architectural change.
6. **Introduce Tailwind v4** alongside the v3 config: `@tailwindcss/postcss`, the colour tokens moved into an `@theme` block in `globals.css`. Old pages render unchanged.
7. **Add the design tokens and the type scale.** Instrument Sans for text, IBM Plex Mono for figures and labels. Slate ink on paper, one signal accent. Light and dark defined as token sets, with the dark set guarded so an explicit toggle wins in both directions. Nothing consumes them yet.
8. **Stand up the App Router shell at a temporary path** — root layout, header, footer, theme toggle, skip link — served from a route the old site does not own. Both routers coexist; the live pages are untouched.
9. **Write `src/content/facts.ts`** with the canonical figures and their authority note, plus the assertion test that fails if a superseded figure appears in the output. The test passes trivially now and becomes load-bearing as pages land.
10. **Build the home page** on the App Router shell, still at the temporary path: masthead, brand sentence, evidence row from the facts module, problem teasers, availability. Reviewable side by side with the old home page.
11. **Write the case study layout** and the first case study — offline draft ownership, the one where the reported problem and the real problem diverge most sharply. One page proves the format before five more are poured into it.
12. **Write the remaining case studies,** one commit each: the configurable approval engine; the release gate and permission matrix; the procure-to-pay migration; the native-to-React-Native rebuild and the encryption library; the 3D product site. Each is independently reviewable and independently revertable — which matters, because each is also a confidentiality judgement.
13. **Build `/work`** as the case study index, reading from the same content module the detail pages use.
14. **Build `/stack`.** Grouped by what is actually reached for versus what has been used. MATLAB, Maple, Mathematica, Microsoft 365, AntDesign, OneSignal and Android SDK leave the current groups.
15. **Build `/about`** — the frontend-to-end-of-pipeline arc, the mathematics background, the two publications.
16. **Build `/cv`** as rendered HTML with a self-hosted PDF, and cut the Google Drive dependency.
17. **Cut over.** Delete Nextra, `theme.config.tsx` and the whole pages router; move the App Router from the temporary path to the root; add 308 redirects from `/projects` and `/skills` so existing links survive. This is the only commit where the live surface changes, and it changes all at once rather than half-migrated.
18. **Replace the FontAwesome kit** with inline SVG icons, and make the remote image loader degrade instead of emitting `undefined` URLs. The site now builds and renders with no environment variables at all.
19. **Metadata, sitemap, robots, OG image, `Person` JSON-LD.**
20. **Accessibility pass** — axe assertions per route, focus visibility, tab order, discernible names, contrast on both token sets.
21. **CI workflow** running the full gate on push.
22. **README** describing what this repository is and how to run it, replacing the `create-next-app` boilerplate.

## Decision Document

- **Framework:** App Router over staying on pages router. The CV names App Router, RSC and Server Actions; the site should be built in the stack it claims. Nextra is removed rather than retained behind the new routes — two routers and a docs theme is more surface than a six-page portfolio can justify.
- **Content model:** case studies as typed content modules, not MDX files. The structure is fixed and repeated (reported / actual / shipped / evidence), so the type system can enforce that no case study is missing a section — which is AC-005. MDX would make that a convention rather than a guarantee. Prose within a section stays rich where it needs to.
- **Facts module over inline figures:** so that the number authority chain is enforced by the compiler and one test, rather than by remembering which document won the conflict.
- **Superseded figures are asserted against, not merely avoided.** The exact set is not wrong, it is _older_, which makes it exactly the kind of thing that gets pasted back in later.
- **Visual direction:** an instrument-panel read — dense, left-aligned, monospace figures, high information density, no decorative hero. The subject is operations software; the page should look like it was built by someone who ships it. Instrument Sans and IBM Plex Mono over Inter, because Inter is the most defaulted typeface on the web and the brief is to not read as a template. A signal accent rather than the current baby-blue palette, which reads junior against the content it now has to carry.
- **Typewriter, tilting profile card and "A full time learner" are cut.** The typewriter cycles the word "Recruiter" at the visitor, which announces that the page is a job application rather than a body of work. "Full time learner" is a modesty claim in the slot where the evidence should be — and the brand note is explicit that the voice stays modest while the _evidence_ stays immodest, not the reverse.
- **Diagrams over screenshots.** Altonaut screenshots cannot be published; the mechanisms can be drawn. An inline SVG of the draft-ownership conflict does more for the claim "I design systems" than any animation, and it carries no confidential surface.
- **No "Senior" on the public site,** per the r14 title policy, even though the request asked for a senior framing. The policy is hers, it is dated later than the request's framing, and its reasoning is that a self-applied adjective is discounted on sight. The framing is delivered by evidence instead. Flagged for her call — reversing it is a one-line change in the facts module.
- **Existing routes are redirected, not dropped,** because the current site has been live and linked since 2023.
- **Off-repo assets stay off-repo** (commit `4e1f451` moved them out deliberately), but the loader must degrade to something renderable when the env vars are absent, so a clean clone builds.
- **No blog section.** Nothing is drafted, and an empty section reads worse than no section.

## Testing Decisions

There is currently no test in this repository, so there is no prior art to inherit; the convention is set here.

A good test asserts what a visitor or a crawler can observe — rendered text, response status, head contents, axe output, focus position. Not that a component received a prop, and not a snapshot of markup, which would break on every legitimate design change and teach nothing.

Playwright, matching the harness she already works in daily, against the production build rather than the dev server.

What gets tested:

- **The facts module** — the superseded-figure assertion, and the "Senior" assertion. These are the two failures that would be publicly embarrassing and silently easy, so they are the two that get automated first.
- **Every route** — 200, correct title and description, no placeholder string anywhere in the body.
- **Case study structure** — all four sections present and non-empty for every slug, enforced by type and asserted at render.
- **Redirects** — `/projects` and `/skills` return 308, not 404.
- **Accessibility** — `@axe-core/playwright` per route, failing on serious and critical violations.
- **The env-free build** — `bun run build` with the env file moved aside, asserting no rendered URL contains "undefined".

What stays manual, because automation cannot certify it: the confidentiality read of each case study, the keyboard tab-order sanity pass, and the light/dark visual review.

## Out of Scope

- A blog, notes or writing section.
- Any AI-feature demo or "AI engineer" framing — the brand file rules that lane out until mid-2027 on the grounds that no user-facing AI feature has shipped.
- Internationalisation. `next-intl` is on the CV, but a portfolio in two languages is maintenance for no reader.
- A CMS. Six pages of content that changes a few times a year belongs in the repository.
- Analytics beyond whatever Vercel provides by default.
- Pushing, merging to `main`, or deploying. The branch stays local.
- Moving assets back into the repository, or touching `.env.local` values.
- Any content about Altonaut beyond the abstraction level the CV already publishes.

## Further Notes

The confidentiality question is the one thing in here that is a judgement rather than an engineering call. The figures already circulate in the CV and the LinkedIn About text, so the information is not new — but a public page is broader than a CV sent to a named recruiter, and it is indexed. The build proceeds at the CV's own abstraction level: architecture and rounded numbers, no customer, vessel or approver names, no screenshots, no schema. If the public site should carry the qualitative case studies without the figures, `src/content/facts.ts` is the only file that needs editing, which is part of why the facts live in one place.

Full acceptance criteria, with verification method and priority per criterion, are in `docs/acceptance-brief-portfolio-rebuild.md` on the branch.
