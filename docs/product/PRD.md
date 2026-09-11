# PRD — hannatiaraaa.vercel.app

**Product** Personal site and portfolio for Hanna Tiara Andarlia

**Written** 11 September 2026

---

## Problem Statement

Hanna is a Full-Stack Engineer looking for full-remote work. Her CV, her LinkedIn profile and her cold emails all end with the same link, and that link is the only part of her application a hiring manager can explore on their own terms. It is therefore the highest-leverage surface she owns — and until this work, it was actively costing her.

The site she was linking to contradicted the documents that linked to it.

Her CV describes a founding engineer who took a field-operations platform from its first months to 100+ vessels: an offline-first app for crews with no signal, an approval engine three customer organisations configure themselves, and a release gate of 1,000+ repeatable cases built from nothing. Someone following that link arrived at a 2023 documentation theme whose Projects tab contained one card titled **"Test title"**, with the body **"Hello this is description of my project"**, linking to an empty file.

Concretely, on the site as it stood:

- It did not compile. `tsc --noEmit` reported seven errors.
- The meta description called her a "Frontend Developer", three years out of date.
- The footer credited the template it was built from, by name.
- The skills page listed 34 technologies including MATLAB, Maple and Microsoft 365 — terms her own brand notes say to keep off public surfaces because they attract the wrong roles.
- Nothing anywhere mentioned offline-first architecture, approvals, procure-to-pay, release automation, founding-engineer scope, or a single number.
- The CV was a Google Drive download link: not indexable, and broken the moment the file moves.

Three problems sit underneath the symptoms, and they are the ones this product solves.

**Her evidence is unpublishable in its natural form.** The work that makes her hireable is employer software behind a login. She has no screenshots she is free to publish, no public repository to point at, and no demo. A portfolio built on the usual currency — pictures of things — has nothing to show.

**Her public code history argues against her.** Her GitHub profile shows 33 public repositories, all from 2020–2023, with names like `OOP-Fundamental` and `React-todo-list-demo`. Everything since is in private company repositories: 816 contributions in the last twelve months, none of them visible. A reviewer who checks her code sees someone learning React in 2021.

**Her strongest signal is invisible on a CV.** What she is actually good at is the front half of the job — sitting with an operations or finance team, working out what the rule really is, and deciding what the software should do about it. A bullet list cannot carry that. It is a narrative shape, and it needs room.

---

## Solution

A six-page site that makes three arguments a CV cannot, and which is itself the fourth argument.

**1. The work is written up as reasoning, not shown as pictures.** Each piece of work becomes a case study in a fixed four-part structure — how it was reported, what it actually was, what shipped, and the evidence. The format turns the confidentiality constraint into an advantage: a reader cannot see the product, but they can watch her diagnose it, which is the thing being hired for. Where a mechanism is spatial or temporal, it is drawn from scratch as a diagram rather than screenshotted.

**2. The absence of public code is answered rather than hidden.** The footer says plainly that the public repositories stop in 2023 and everything since is private, which is why the case studies are written out instead of linked to a commit. An unexplained gap reads as a gap; an explained one reads as a reason.

**3. The mathematics is demonstrated, not claimed.** Two pieces of interactive work carry it. The hero is a pool of 22,000 points placed by the golden angle, moving as ocean swell, with the travelling front of the harvested Fisher–Kolmogorov invasion from her BSc thesis sweeping through it — three layers of her own path in one surface. On the About page, the agent-based contagion model from one of her published papers runs live, with a transmission parameter the reader can move. A citation says she published; a model you can move shows it.

**4. The repository is the work sample.** The site claims release-gate discipline, single-source-of-truth design and documentation that ships with the change. A reviewer will open the repository, so the repository holds itself to those claims: strict TypeScript with no suppressions, a three-layer module architecture, unit tests over every pure rule, end-to-end tests over everything a visitor can observe, accessibility assertions per route in both themes, and a CI gate that runs all of it with no environment variables configured.

The through line: **every claim on this site is either checkable by the reader, or traceable to a document that owns it.**

---

## User Stories

### The hiring manager, screening

1. As a hiring manager with forty seconds, I want to see the candidate's name, positioning and location without scrolling, so that I can decide whether to keep reading.
2. As a hiring manager, I want the headline figures visible immediately after the name, so that I can calibrate the scale of the work before I invest in the detail.
3. As a hiring manager, I want to know the candidate's timezone and remote constraint on the first screen, so that I do not waste a call on a role she cannot take.
4. As a hiring manager, I want the site to tell me what domain she works in using words my job posting also uses, so that I recognise the match.
5. As a hiring manager, I want no self-applied seniority adjectives, so that I can form my own judgement from the evidence.
6. As a hiring manager, I want to reach her email in one click from the first screen, so that acting on interest costs me nothing.
7. As a sceptical hiring manager, I want every number to be the kind of claim I could dispute in an interview, so that I can trust the ones I cannot check.

### The engineering interviewer, evaluating depth

8. As an engineering interviewer, I want to read how a problem was reported before I read what it was, so that I can judge the diagnosis rather than just the fix.
9. As an engineering interviewer, I want the actual cause described as a missing concept rather than a bug ticket, so that I can see whether she thinks in systems.
10. As an engineering interviewer, I want the shipped work described at mechanism level — the guard, the ladder, the migration — so that I have something concrete to interrogate.
11. As an engineering interviewer, I want a diagram of the failure mode where one exists, so that I can understand a distributed-state problem without a whiteboard.
12. As an engineering interviewer, I want to see which of her claims closed a class of bug rather than a single ticket, so that I can distinguish engineering from firefighting.
13. As an engineering interviewer, I want each case study to name its own module rather than repeat a platform label, so that six case studies teach me six things.
14. As an engineering interviewer, I want to see the technologies used per case study, so that I can map her experience onto my stack.
15. As an engineering interviewer, I want to open the repository behind the site and find it well-organised, so that I can see her standards rather than read about them.
16. As an engineering interviewer, I want the site's own tests to be visible and meaningful, so that her claim to release discipline is verifiable in the one codebase I can actually read.

### The reader assessing the mathematics

17. As a reader, I want the visualisation to be explained in one sentence, so that I know it is about her path and not decoration.
18. As a reader, I want the equations printed beside the piece, so that I can check the claim rather than take it.
19. As a curious reader, I want to interact with the hero, so that I discover the piece responds rather than loops.
20. As a mathematically literate reader, I want the Fibonacci structure to be emergent rather than drawn, so that the piece demonstrates understanding instead of decoration.
21. As a reader on the About page, I want to run the published contagion model and change its transmission rate, so that I can see the result the paper claims rather than read that it exists.
22. As a reader, I want the model to keep running rather than burn out, so that the endemic behaviour the caption describes is actually observable.

### The recruiter and the applicant-tracking system

23. As a recruiter searching, I want the site to be indexed with the job titles and technologies I search for, so that she appears in my results.
24. As a recruiter, I want a correct preview card when I paste the link into LinkedIn or Slack, so that the link is worth sharing.
25. As a recruiter, I want to download a PDF CV from the site itself, so that I can attach it to a submission without asking her for one.
26. As a recruiter, I want the CV to also exist as readable text on the page, so that I can copy details into a form without opening a PDF.
27. As a recruiter, I want the site's own description to state her current positioning, so that my shortlist note is accurate.

### The visitor with access needs

28. As a keyboard-only visitor, I want a skip link as the first tab stop, so that I can reach the content without traversing the navigation.
29. As a keyboard-only visitor, I want every interactive element to show a visible focus ring, so that I never lose my position.
30. As a keyboard-only visitor, I want a horizontally scrolling diagram to be focusable, so that I can reach the half of it that is off-screen.
31. As a screen-reader user, I want each canvas and diagram to carry a description of the finding rather than a list of shapes, so that the visual is not simply absent.
32. As a screen-reader user, I want each section of a case study to be a heading, so that I can navigate by structure rather than reading linearly.
33. As a visitor who has asked for reduced motion, I want the animated figures to stand still, so that the page does not move without my consent.
34. As a visitor who has asked for reduced motion, I want the still figures to be drawn rather than blank, so that I lose the motion and not the content.
35. As a visitor who has asked for reduced motion, I want to be told the figure is still and how to interact with it, so that I do not think it is broken.
36. As a low-vision visitor, I want body text to meet contrast requirements in both themes, so that I can read it in either.
37. As a visitor, I want status never to be carried by colour alone, so that the interface works if I cannot distinguish the accent.

### The visitor on a phone or a slow connection

38. As a visitor on a phone, I want the page to render its text before any visual arrives, so that I can start reading immediately.
39. As a visitor on a phone, I want the heavy 3D bundle to be deferred, so that the first load is not paying for something I may never scroll to.
40. As a visitor on a phone, I want the visualisation to use a smaller point count, so that my battery and frame rate survive it.
41. As a visitor on any device, I want animation to stop when I scroll away or switch tabs, so that the page is not working while I am not looking.
42. As a visitor, I want the page never to shift as assets load, so that I do not lose my place mid-sentence.

### Hanna, maintaining it

43. As the site's author, I want every published figure to come from one file, so that a number cannot drift between two pages.
44. As the site's author, I want the build to fail if a superseded figure reappears, so that pasting from an old draft is caught before it is read.
45. As the site's author, I want the build to fail if the public surface ever calls me Senior, so that a policy decision is enforced rather than remembered.
46. As the site's author, I want a case study missing one of its four parts to fail compilation, so that the structure is a guarantee rather than a convention.
47. As the site's author, I want the route header declared once, so that adding a page is not four edits.
48. As the site's author, I want formatting settled by a config, so that it is never a review comment.
49. As the site's author, I want to run one command that checks everything, so that I know the state of the branch without thinking about it.
50. As the site's author, I want the site to build with no environment variables, so that a clean clone works and CI is honest.
51. As the site's author, I want links from the old site to keep working, so that a CV sent in 2024 does not now 404.
52. As the site's author, I want a written record of what was decided and why, so that a future change does not relitigate a settled question.

---

## Implementation Decisions

### Framework and rendering

- **Next.js 15 App Router, React 19, Tailwind v4, TypeScript strict.** Chosen over remaining on the previous pages-router setup because the CV names this stack: a reviewer who opens devtools should find what the document claims. The previous documentation theme is removed rather than wrapped — it is pages-router-only and could not survive the upgrade.
- **Server components by default.** A `'use client'` directive requires a stated reason in a comment at the top of the file. The legitimate reasons are React state, a browser API, an event handler, or a library that touches the DOM. The boundary is pushed down: a section with one interactive control is a server view rendering one client component, not a client section.
- **No client-side data fetching.** All content is compiled in from typed modules. There is no API, no database and no CMS; six pages of content that changes a few times a year belongs in the repository.
- **Static rendering throughout,** with `generateStaticParams` for the case-study routes.

### Architecture

- **Three layers, three folders, enforced by review.** Every file is exactly one of: `lib/` (pure functions — no React, no DOM, no async), `hooks/` (React state and imperative browser APIs — no JSX), or `views/`/`components/` (markup — no maths, no rules). Dependencies point view → hook → lib and never back. This is what makes the mathematics unit-testable without a DOM, and it has already paid: extracting the model rules into `lib/` is what surfaced four defects the rendered page was hiding.
- **Route files compose, they do not render.** An `app/**/page.tsx` holds its metadata and a list of section views. Section markup lives in the module. A route diff then tells you what changed structurally, and a section diff tells you what changed inside a section.
- **One module per area of the site,** each with per-role subfolders and a barrel per role, which the module barrel re-exports with `export *`. The star must not flatten the layering: an import path still says which layer a symbol came from.

### Content model

- **Content is typed modules, not MDX.** The four-part case-study structure is required fields on a type, so a case study missing a part does not compile. MDX would make the structure a convention that review has to catch.
- **One source of truth for every published figure.** A single facts module owns every number. Nothing else states one. The module also exports the previous generation of figures, so the test suite can assert none of them reach the built output — those figures are not wrong, they are older, which is exactly what gets pasted back in from a stale draft.
- **The route header is declared once, keyed by path,** and rendered by the layout. Four pages were repeating the same component with the same prop shape, which made a layout concern into a page concern. Routes with no entry get no header, which is what the home page and the case studies want.

### The visualisations

- **One WebGL context on the site, in the hero.** A second would double the cost for a second idea; the contagion model uses a 2D canvas instead, which is cheap and can be read back in a test.
- **Geometry computed once on the CPU, uploaded as static buffers.** Per frame the CPU sends a clock and four ripple records; the swell, the front and every ripple are computed in the vertex shader. One `Points` object, one draw call, no lights, no textures, no post-processing — none of it is needed to draw a function, and all of it is what makes 3D expensive.
- **The shader source is generated from the same constants the unit tests assert against.** GLSL cannot call TypeScript, so the motion fields exist twice; generating the source means every number has one home and tuning cannot drift between the tested function and the shipped shader. The duplication left is the shape of each formula.
- **Relapse returns an agent to affected, not to susceptible.** This is both what relapse means in the recovery process the paper models, and the term that makes the system endemic — sending an agent back to susceptible cannot re-seed anything, because only an affected agent transmits, so the model always burned out and the caption claiming otherwise was false.
- **Every animation is gated on three conditions:** the element is in the viewport, the tab is foregrounded, and reduced motion is not requested. Scene construction is deliberately separated from loop control across two effects, so a visibility change starts and stops the loop without rebuilding the scene — rebuilding recompiles shaders, recomputes the pool and resets the clock.
- **Reduced motion is honoured by not running,** not by running slower. The hero renders one still frame; the contagion model runs forward off the commit and then draws the level it settles at.

### Design system

- **Design tokens only.** Colours are CSS custom properties. Light is defined on bare `:root`; dark is redefined twice, once under `prefers-color-scheme` and once under an explicit `[data-theme]`, so the toggle wins in both directions and no colour has its only definition inside a media query.
- **The palette is a bright noon sky** — azure and cyan against warm-neutral paper, inverting to navy at night. Not a brand blue: near the sun the sky goes white and cyan, overhead it saturates.
- **The colour ramp inverts per theme in the visualisation.** Energy must gain contrast against its ground: additive blending over the dark ground, normal blending over the light one, because added light on white only goes to white.
- **A fluid type scale via `clamp()`,** so no page needs a responsive type class.
- **Scroll-driven reveals animate transform only.** An element part-way through its scroll range rests at partial opacity, and text at partial opacity is a contrast failure rather than an effect — measured at 1.83:1 before this was changed.

### Performance budget

- **Shared First Load JS is capped at 110 kB**, and any single route at 15 kB over it. The current figures are 103 kB shared and 107 kB on the home route.
- **Anything heavy is deferred.** The 3D bundle is a dynamic import with SSR disabled; the server-rendered text paints first and the visual arrives after, so the home route never carries three.js in its first load.
- **Device pixel ratio is capped** at 2 for canvas and 1.5 for WebGL. Full DPR on a retina display quadruples fill cost for no perceptible gain.
- **No third-party runtime dependency for presentation.** Icons are inline SVG; fonts are self-hosted. The previous site loaded an icon kit from another origin, keyed by an environment variable, so every icon depended on a third party and a variable being set.

---

## Testing Decisions

### What makes a good test here

A test asserts what a visitor or a crawler can observe: rendered text, status codes, head contents, redirects, focus position, accessibility output, what is visible without scrolling, and — for a canvas — whether pixels were painted. It does not assert that a component received a prop, and it never snapshots markup, which would break on every legitimate design change while teaching nothing.

Two assertions exist specifically because their failure would be public and silent, and the fix when they fire is always the content, never the test:

- No superseded figure reaches the built output.
- The public surface never self-applies "Senior".

### The two tiers

**Unit tests** cover `lib/` only, because it is the only layer where a pure input maps to a pure output. They are written first where the logic is non-obvious — the model rules, the geometry, the transforms. This tier has earned its place: it found that the travelling front saturated into a flat plane after four seconds, that 98% of the helix points were duplicates, that a clamp was collapsing a band onto two coordinates, and that the contagion model could never reach the endemic state its caption promised.

**End-to-end tests** cover everything observable: route status and metadata per route, redirects from the previous site's paths, the four-part structure of every case study, the absence of placeholder text, the confidentiality ceiling on employer work, the stack page's exclusion list, the presence of exactly one header per route, and accessibility per route in both themes via axe.

A third small suite covers the reduced-motion path specifically, reading the 2D canvas back to assert it was painted. This exists because the previous assertion — that the canvas was in the viewport — could not catch a canvas that was in the viewport and blank, which is exactly the bug that shipped.

### What stays manual

Three things automation cannot certify, recorded per run rather than asserted:

- The confidentiality read of each case study.
- The keyboard tab-order sanity pass. axe can confirm every element is reachable; it cannot tell you the order makes sense.
- The light and dark visual review.

### The gate

One command runs format check, lint, typecheck, production build, unit tests and end-to-end tests. It must be green before every commit. CI runs the same gate with **no environment variables configured**, which is what makes the "builds from a clean clone" claim honest rather than assumed.

---

## Out of Scope

- **A blog or notes section.** Nothing is drafted, and an empty section reads worse than no section. Her own written artefacts — the ADR practice, the runbook format, the permission-matrix approach — are the obvious first three posts when she wants one.
- **Any AI-feature demonstration or "AI engineer" framing.** Her brand notes rule that lane out until mid-2027 on the grounds that no user-facing AI feature has shipped. Claiming it now would be the one unfalsifiable thing on the site.
- **Internationalisation.** `next-intl` is on her CV, but a portfolio in two languages is maintenance for no reader.
- **A CMS or any backend.** There is no content that changes often enough to justify either.
- **Analytics beyond what the host provides by default.**
- **Screenshots, schemas or customer detail from employer work.** The ceiling is the abstraction level her CV already publishes: architecture and rounded numbers.
- **Moving off-repository assets back into the repository.** That separation was a deliberate earlier decision; the build degrades gracefully without them instead.
- **Publishing, merging to `main`, or deploying.** This work stays on a branch until she has reviewed it.

---

## Further Notes

### The two judgement calls that are hers, not the build's

**Employer figures on a public page.** The numbers already circulate in her CV and her LinkedIn About text, so the information is not new — but a public page is broader than a CV sent to a named recruiter, and it is indexed. The build proceeds at the CV's own abstraction level. If the answer should be no, the facts module is the only file that needs editing, which is part of why the figures live in one place.

**The word "Senior".** She asked for a senior framing. Her own title policy, dated later than that request, rules it out on public surfaces: a self-applied adjective is discounted on sight and tells a reviewer nothing. The site carries seniority as scope, standard-setting and decision rights instead, which is what the case studies are for. This is enforced by a test, and reversing it is a one-line change.

### Known follow-ups

- **The GitHub profile is now the weakest surface in the funnel.** 816 private contributions in twelve months, zero public, and a repository list that opens with 2020-era learning projects. Three actions are hers to take: enable private contribution display, pin the four real repositories, and archive the learning-era ones. The site answers the gap in words; the profile still argues against her in pictures.
- The CV content exists in two places — this repository and the CV working folder — and will drift. Generating one from the other would remove the only real duplication left.
- Only Chromium is installed for testing. WebKit matters, because recruiters open links on phones.
- No performance budget is enforced in CI, only documented.
- The favicon is still the 2023 icon, and the only visual left from the previous site.
