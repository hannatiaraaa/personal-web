---
name: portfolio-case-study
description: Turn a piece of shipped work into a case study for this site. Use when adding or editing anything under /work, when a CV bullet or work log needs to become a page, or when a case study reads like a project blurb.
---

A project blurb says what was built. A **case study** says what the problem turned out to be. That gap is the only scarce thing on this site — anyone can list a stack, and almost nobody can show the moment where the reported problem and the real problem came apart.

So every case study is one **divergence**, told in four parts.

## The four parts

The structure is fixed and the type system enforces it — a case study missing a part does not compile.

| Part         | What goes in it                                                                                                                      | Failure to avoid                                                                                                                                 |
| ------------ | ------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| **Reported** | The sentence someone actually said, in their words. "Records keep reverting." "Approvals are wrong." "Rounding errors."              | Restating the real cause here. If Reported already names the mechanism, there is no divergence and no case study.                                |
| **Actually** | What the cause turned out to be, and why the reported framing pointed the wrong way. This is the part a reader cannot get from a CV. | Naming a bug where the answer is a missing concept. "No ownership on offline drafts" is a concept; "an off-by-one in the sync loop" is a ticket. |
| **Shipped**  | What was built, at mechanism level — the guard, the ladder, the DTO, the migration. Enough that a reader can argue with the design.  | A stack list. "React Native, WatermelonDB, TypeScript" is not what shipped.                                                                      |
| **Evidence** | The figure, the scope, the thing that would be checkable if it were not behind a login. Pulled from `src/content/facts.ts`.          | An unsourced number. See `portfolio-voice` for the authority chain.                                                                              |

**Close the class, not the ticket.** The strongest case studies here end with the class of bug being gone — ownership guards mean stale writes cannot land at all; one arithmetic ladder means no level _can_ tax tax; a quarantined debt list means old gaps cannot be counted as a pass. When a case study ends at "and the bug was fixed", look again for the class.

## Which work earns a page

A case study needs a divergence, a mechanism, and a figure. Work that has only two of the three belongs in a one-line list, not a page.

Ranked by how sharply the reported and real problems diverge:

1. **Offline draft ownership** — "records keep reverting" was read as a sync-frequency problem; drafts had no ownership at all. The flagship.
2. **Tax arithmetic** — "rounding errors" was tax and discount living at several levels at once, so no single place was wrong.
3. **Release gate and permission matrix** — "all tests green" meant nothing because 171 gaps were inherited; fixing first would have blocked releases for months, so they were frozen by name instead.
4. **Configurable approval engine** — one hard-coded approver did not survive the second customer; the fix was configuration the business sets itself, not a branch per customer.
5. **Procure-to-pay migration** — a whole module moved from the offline app to the web app, AI-assisted, inside gates written first.
6. **Native to React Native** — 20+ native defects across two codebases unified onto one, plus the client-side encryption library.

Older client work (3D product site, banking interface, environmental platform) has the build but not the divergence. It goes in a short list under the case studies, honestly labelled as earlier client work.

## Drawing the mechanism

Screenshots of Altonaut cannot be published; mechanisms can be drawn. One inline SVG that shows _how the thing actually goes wrong_ does more for "I design systems" than any animation — two devices holding the same draft, one stale, and the guard that rejects the late write.

Draw it only when the mechanism is genuinely spatial or temporal. A decorative box diagram beside prose that already explains it is worse than no diagram. Both themes must stay legible: stroke and text from the same tokens the page uses, never a hardcoded colour.

## Before it ships

- Each of the four parts is present and says something the other three do not.
- Reported is in someone else's voice; Actually is the divergence; Shipped is a mechanism; Evidence traces to `facts.ts`.
- Nothing names a customer, vessel, site, approver, schema, column or internal id — see `portfolio-voice` for the full ceiling.
- The page would survive the subject of the work reading it.
