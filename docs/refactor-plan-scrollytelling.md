> **Status:** Implemented; superseded by [`guidelines.md`](guidelines.md) where it differs. The build diverged from this plan in places — the hero pool follows its scene's `--progress` rather than having no scroll input, new canvases were added for the interactives, pinning keys off the `pin` variant (width and height) rather than `lg`, and scroll scenes are driven by `ScrollScene` in every browser rather than Safari view timelines.

# Refactor: tell the site as a scroll story, without spending the budget

> Written to be filed as a GitHub issue on `hannatiaraaa/personal-web`. Run it yourself once you have read it:
>
> ```
> gh issue create --repo hannatiaraaa/personal-web \
>   --title "Refactor: tell the site as a scroll story, without spending the budget" \
>   --body-file docs/refactor-plan-scrollytelling.md
> ```

## Problem Statement

The site argues well but reads flat. Every page is a column of cards that slide up 14px as they enter — the same `.reveal` everywhere — so a visitor scrolling the home page, the about page and a case study gets the same rhythm three times. The content already has a narrative shape that the layout does not use:

- **About** has a real story: four eras from 2021 to 2026, each one following the problem into the next layer. It is rendered as a list of four identical cards. The arc data also lives inside the view file rather than in `src/content/`, against the rule that content comes from `src/content/`.
- **Case studies** are each one divergence told in four parts — how it was reported, what it actually was, what shipped, the evidence. That is a reveal by construction, and it is laid out as four stacked sections with nothing tying them together or showing where the reader is.
- **Home** leads with a WebGL flow field that ignores the scroll entirely, then four headline figures that are simply there, then four case-study cards whose hook — the gap between the reported sentence and the real cause — is visible only if you read every card.
- The contagion model on `/about` is the most interactive thing on the site, and nothing guides a visitor through what it shows; it waits for someone to find the slider.

I want the site to be more fun, more interactive and more memorable — scrollytelling: a pinned visual that changes as text steps scroll past it — while staying inside the two constraints that sit above every other rule in `docs/guidelines.md`: **light to deploy** (shared First Load JS ≤ 110 kB, currently ~103 kB; any route ≤ +15 kB) and **easy to read**.

## Solution

Scrollytelling on three surfaces — home, about (as a timeline story) and every case study — built from the platform rather than a library.

**Engine: three tiers, cheapest first, no new runtime dependency.**

1. **CSS scroll-driven animations** (`animation-timeline: view()` / `scroll()`), already in use for `.reveal`. Zero JS, runs on the compositor. Used for: the reading-progress rail, the timeline spine drawing itself, parallax layers, figure count-ups, staggered entrances. Where unsupported, the element is simply static — the same progressive-enhancement contract `.reveal` already has.
2. **One step hook** — an `IntersectionObserver` that reports which step of a story is in the reading band. A small client `ScrollyStage` wraps server-rendered steps and a server-rendered visual, and writes the active step as a data attribute and `aria-current="step"`. The visual changes state through CSS keyed off that attribute. One observer per stage, no scroll listener, about 1–2 kB.
3. **Scroll progress for the existing WebGL hero only.** A passive, rAF-throttled progress value, gated by `useInViewport` and page visibility, fed into the flow field's uniforms. It rides in the hero's already-deferred chunk, so the home route's First Load JS does not move.

GSAP ScrollTrigger, Motion and Scrollama were considered and rejected: the first two cost 30–45 kB each against ~7 kB of headroom, and everything they would do here the platform does; Scrollama is a dependency for what one hook does. Smooth-scroll libraries (Lenis and similar) are rejected outright — they replace native scrolling, which breaks find-in-page, anchor links, keyboard scrolling and reduced-motion expectations.

**Home — "what was reported vs. what it was".**

- The hero flow field responds to scroll: calm at rest, a disturbance as the visitor scrolls into the page, settling as the hero leaves. The headline and caption get a subtle parallax at a different rate from the field.
- The four headline figures count up as they enter, landing on the exact published value.
- Selected work becomes a pinned story: the reported sentence ("Records keep reverting.") holds on one side while steps scroll past it, and each step turns it into what it actually was, linking through to the case study. On narrow screens it degrades to the existing card grid with richer entrances — no pinning on a phone.
- Practice gets a staggered entrance rather than three identical reveals.
- A thin reading-progress rail under the sticky header, CSS only.

**About — a timeline story.**

- The arc data moves to `src/content/` as a typed list of eras.
- The arc becomes a pinned timeline: a vertical spine that draws as you scroll, a large year marker that advances era by era, and a sticky scene that changes per era — two diverging apps merging into one codebase (2021–23), a vessel out of signal range (2024), an approval ladder lighting tier by tier (2025), the release gate ticking through its cases (2026). Scenes are inline SVG with theme tokens, not images and not canvas.
- The contagion model gets a guided walk: three short steps beside it ("at low beta", "raise beta", "the relapse term") that set the model's parameters as they become active. The moment the visitor touches the slider or a button, the walk hands over control and stops steering.

**Case studies — the four parts as a story.**

- A sticky part indicator (Reported → Actually → Shipped → Evidence) that marks where the reader is, built on the step hook.
- The reported quote gets a full-width entrance; "what it actually was" reads as the turn.
- The two mechanism diagrams (draft ownership, tax ladder) build up in stages as their paragraphs scroll past, rather than appearing whole.
- Evidence figures count up, the same component as home.

**Things that need updating anyway, folded in because they are on the path:**

- Arc content moves into `src/content/` (above).
- A **bundle-budget check** joins the gate. The 110 kB budget is currently enforced only by someone reading the build output; a change whose whole point is motion should not rely on that.
- The reduced-motion e2e spec grows to cover every new stage, since reduced motion is the path that broke last time.

## Commits

Each commit leaves the gate green. Measure First Load JS on every commit that adds client code and note it in the message.

**Foundation**

1. Record the current First Load JS per route (shared and each route) as the baseline in the private run log.
2. Add a budget check script that reads the build output and fails if shared First Load JS exceeds 110 kB or any route exceeds shared + 15 kB. Wire it into the gate after build. No behaviour change.
3. Add the pure step-selection function: given each step's position relative to a reading band, return the active step index (ties resolve to the later step; nothing in band keeps the previous one). Unit tests first.
4. Add the pure figure-parsing function: split a published figure string ("100+", "1,000+", "6 years", "3") into prefix, integer and suffix, and return `null` for anything that does not have exactly one integer. Unit tests first, including that every figure in `src/content/facts.ts` parses or is explicitly static.
5. Add the pure scroll-progress mapping: clamp a raw progress to 0–1 and map it to a named easing curve. Unit tests first.
6. Add the `useActiveStep` hook on top of the step-selection function, using one `IntersectionObserver`. Not yet used.
7. Add the `useScrollProgress` hook: passive scroll, one rAF per frame at most, inert when off screen, when the page is hidden, or under reduced motion. Not yet used.

**Shared components**

8. Add the `ScrollyStage` client component: renders server children (a visual slot and a list of steps), sets the active step as a data attribute on the stage and `aria-current="step"` on the active step. Under reduced motion it renders the steps as a plain list with the visual in its final state, not pinned. Not yet used.
9. Add the CSS for stages: sticky visual offset below the site header, a reading band, step states, and the lg breakpoint below which nothing pins. Tokens only.
10. Add the `CountUp` figure: the real value is in the DOM as text for crawlers, screen readers and the superseded-figure assertion; the counting is a CSS `@property` integer counter on an `aria-hidden` layer, driven by a view timeline. No JS. Where `@property` or view timelines are unsupported, the static value shows.
11. Add the reading-progress rail under the site header, CSS `scroll()` timeline only.

**About — timeline story**

12. Move the arc into `src/content/` as a typed list of eras (period, title, body, scene). The view reads from it. Rendered output unchanged; the content e2e stays green.
13. Wrap the arc in a `ScrollyStage` with a plain sticky year marker. Steps are the existing era cards.
14. Add the timeline spine that draws with scroll (a `scaleY` transform on a view timeline, not `stroke-dashoffset`, so it stays on the compositor).
15. Add the scene for 2021–2023 (two apps converging into one).
16. Add the scene for 2024 (vessel leaving signal range).
17. Add the scene for 2025 (approval ladder lighting tier by tier).
18. Add the scene for 2026 (release gate ticking through cases).
19. Narrow and short screens: below `pin`, each era carries its own scene inside its step, so no band ever covers the text being read.
20. Contagion guided walk, logic: a pure function mapping a walk step to model parameters. Unit tests first.
21. Contagion guided walk, wiring: steps beside the model set parameters while active; any user input on the model ends the walk for the rest of the visit.

**Home**

22. Swap the headline figures in the offer section to `CountUp`.
23. Feed scroll progress into the flow field's uniforms (the mapping lives in the visual module's `lib/`, tested). Under reduced motion the field still draws its one settled frame and the existing "still — touch to ripple" caption stays.
24. Add the hero text parallax, CSS only.
25. Rebuild selected work as a `ScrollyStage`: the pinned reported sentence on the left, steps on the right, each step a turn to what it actually was with a link to the case study. Below lg it is the existing card grid.
26. Staggered entrance for practice, CSS only.

**Case studies**

27. Add the sticky part indicator to the case-study page, driven by the four existing part sections as steps.
28. Full-width entrance for the reported quote.
29. Stage the draft-ownership diagram: its groups appear in step with its paragraphs.
30. Stage the tax-ladder diagram the same way.
31. Swap evidence figures to `CountUp`.

**Close-out**

32. Extend the reduced-motion e2e spec to every new stage: nothing pinned, every step visible, every visual in its final state, every figure at its published value.
33. Add the scrollytelling e2e: scroll each stage step by step and assert the active step (`aria-current="step"`) follows, and that keyboard tabbing into a step activates it.
34. Axe in both themes for home, about and one case study at mid-story scroll position, not only at the top.
35. Refresh the screenshot set in `docs/screenshots/` and record final First Load JS against the baseline.

## Decision Document

- **No new runtime dependency.** CSS scroll-driven animations, one `IntersectionObserver` step hook, and a scroll-progress hook used only by the already-deferred WebGL hero. Rejected: GSAP ScrollTrigger, Motion, Scrollama, any smooth-scroll library.
- **Layering holds.** Step selection, figure parsing, progress easing, the contagion walk mapping and the flow-field scroll mapping are pure `lib/` functions. `useActiveStep` and `useScrollProgress` are hooks. `ScrollyStage`, `CountUp` and the scenes are components; sections remain server views in each module's `views/`. Route files still only compose.
- **Client boundary pushed down.** Only `ScrollyStage` (and the contagion walk) is client. Steps and visuals are server children passed through it, so their markup never ships as JS.
- **Visual state is CSS, not React.** The stage writes one data attribute; scenes and diagrams switch state in CSS keyed off it. No re-render of the visual per step.
- **Shared code goes to `common/` only when a second module uses it.** `ScrollyStage`, `useActiveStep` and `CountUp` are used by home, about and work, so they live in `common/`. Scenes live in `about`; staged diagrams stay in `visual`.
- **Content.** The arc moves to `src/content/` as a typed era list; each era names its scene as a union, so a new era without a drawn scene is a compile error — the same pattern as diagram kinds. No figure is stated outside `src/content/`. No new copy claims anything the CV does not.
- **Figures.** `CountUp` keeps the exact published string as real DOM text. The counting layer is decorative and `aria-hidden`, so intermediate values never reach text, crawlers or assistive tech, and the superseded-figure assertion keeps reading the true value. A figure that does not parse to one integer renders static.
- **Motion rules.** Transform only on text. Opacity is allowed on non-text graphics only. Timeline spine uses `scaleY`. DPR caps unchanged. Every rAF loop stays gated by viewport and page visibility.
- **Reduced motion is honoured by not running.** Stages render as plain ordered content with visuals in their final state; no pinning, no counting, no scroll-driven uniforms.
- **No JS / unsupported browsers.** Every stage is server-rendered in reading order and fully readable; the visual shows its first state (or final state for diagrams). Browsers without view timelines get static elements.
- **Pinning only under the `pin` variant** — at least 64rem wide, at any height (width only: phones and tablets have standard widths, a desktop window's height does not; every pinned frame scales to the band under the header, down to a 22rem floor), so a phone, a landscape phone or a portrait tablet reads in plain flow. Below it the about timeline carries each era's scene inside its own step rather than in a sticky band: at 360×640 a band of 32svh would cover the first era's text, and at 844×390 there is no room for one.
- **Accessibility.** Steps are the content and stay in DOM order; the active step carries `aria-current="step"`. Scenes are `role="img"` with a description stating the finding of that era, not the shapes. No `aria-live` announcements on step change. Keyboard focus moving into a step activates it through the same observer.
- **Contagion walk yields to the visitor.** Any interaction with the model ends the walk for the visit; scroll never fights a user's chosen parameters.
- **Budget is enforced, not remembered.** A gate step fails on shared First Load JS over 110 kB or a route over shared + 15 kB.

## Testing Decisions

- A good test asserts what a visitor, a crawler or an assistive technology can observe — the active step, visible text, the published figure, what is pinned, axe output — never that a component received a prop, and never a markup snapshot.
- **Unit (`bun test`, colocated, `lib/` only, written first):** step selection, figure parsing (including every figure in the content), progress clamp and easing, contagion walk mapping, flow-field scroll mapping. Prior art: `src/modules/visual/lib/contagion.test.ts`, `ripple-queue.test.ts`, `src/common/lib/slug.test.ts`.
- **E2E (Playwright):** active step follows scroll on each stage; keyboard tabbing into a step activates it; reduced motion renders everything static, unpinned and complete; figures read their published value at every scroll position; axe clean in both themes mid-story. Prior art: `e2e/reduced-motion.spec.ts` (asserts something is actually painted, not just present), `e2e/accessibility.spec.ts`, `e2e/content.spec.ts` (superseded figures, no "Senior").
- **Budget:** the new gate step on every commit; First Load JS recorded in commit messages that add client code.
- Existing coverage of these areas is thin for behaviour that does not exist yet (there is no scroll behaviour to test today), so the e2e additions in commits 32–34 are part of the scope, not optional.

## Out of Scope

- `/stack` and `/cv` — they keep the existing `.reveal`. A CV is read to be scanned, not told.
- The `/work` index page beyond what `CountUp` and existing reveals give it.
- Any new case study, new copy beyond step captions drawn from existing content, or any change to published figures.
- New WebGL or canvas scenes. About scenes are SVG; the only canvas/WebGL work is wiring scroll into the existing flow field and contagion model.
- Sound, cursor effects, page transitions, horizontal-scroll sections, scroll snapping, smooth-scroll libraries.
- Changing the theme, the type scale or the colour tokens.
- Deploying, pushing or merging — per `CLAUDE.md`.

## Further Notes

- Browser support for view timelines: Chromium and Safari ship them; Firefox does not by default. That is acceptable because the fallback is the current site, not a broken one — the step hook and pinned layout still work everywhere, only the scroll-scrubbed flourishes go static.
- Headroom is ~7 kB of shared JS. The plan's client code (stage, two hooks, walk wiring) is expected at 2–4 kB; the budget gate makes any overrun a red build rather than a surprise.
- Each about scene should be reviewable on its own commit, so a scene that does not land can be cut without touching the timeline.
