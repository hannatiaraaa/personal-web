---
name: portfolio-voice
description: Voice and factual authority for anything published under Hanna's name on this site. Use when writing or editing page copy, a case study, a meta description, an OG title, a CV line, or a README sentence — and when another skill needs the rule for a figure or a job title.
---

Two rules carry this whole site: **evidence immodest, voice modest**, and **every figure has an owner**.

The pairing is the point. Most engineers get one half — either a confident voice with vague claims, or honest modesty with nothing to show. The evidence does the bragging; the sentences stay flat.

## The authority chain

A figure on a public page traces to one place, in this order of precedence:

1. `src/content/facts.ts` — this repository's single source of truth. Read it; do not restate a number beside it.
2. `~/Documents/cv_hanna/2026/Cover_Letter_Master.md` — carries the current numbers and **wins any conflict** (it says so itself).
3. `~/Documents/cv_hanna/2026/LinkedIn_Profile_Pack.md` — the current public-surface phrasings.
4. `~/Documents/cv_hanna/2026/CV_Hanna_2026_Master.md` — the older, exact figures. **Loses** to the two above.

Current figures are the **rounded** set: 100+ vessels, three large customer organisations, 1,000+ merged pull requests, 500+ reviews, 1,000+ repeatable Playwright cases across 150+ specs, 2,000+ permission checks per run, 130+ protected routes against 20+ profiles, a ~1,100-file migration in under four weeks, an approval system rebuilt in under three weeks, 100+ escalations, 60% of pen-test findings closed, six years in production, five remote.

**The superseded set is the trap:** 539, 1144, 2760, 395, 191, 138, 899, "three fleets". Not wrong — _older_, which is exactly what gets pasted back in from an old draft. A test asserts against these literals in the built output. When one appears, the fix is to read `facts.ts`, never to update the test.

A figure you cannot trace does not go on the page. There is no rounding up, no "approximately", no estimating from a repository.

## Title policy

Set 9 September 2026 (r14) and it holds on every public surface:

- **Brand line:** `Full-Stack Engineer`. This is the searchable container.
- **Role, in experience context only:** `Founding Engineer`. Never in the headline slot — as a headline it reads "currently running my own thing" and gets her skipped for employed roles.
- **"Senior" never appears** describing her own title. A self-applied adjective is discounted in a second and tells a reviewer nothing. Seniority arrives instead as scope, standard-setting, dependency, decision rights and customer authority — which is what the case studies are for. "Senior" is mirrored only onto a tailored CV copy when a posting's own title says it.

## Writing the sentences

**The brand sentence**, unchanged: _"I started in frontend and learned my way to the end of the pipeline — idea, API, mobile, web, release — by watching how people actually use what I ship."_

Lead with the market's nouns, not the industry's: work orders, assets, inspections, scheduling, approvals, purchase orders, offline mobile for field crews, back-office web. **Maritime is the proof, not the frame** — vessels appear as evidence that the offline problem was real, not as the category she works in.

### Name the product, don't label it

The product is **planned maintenance, inventory and procurement for offshore fleets** — work orders, assets and components, inspections, defects, certificates, stock, purchase approvals and fleet analytics, shipped as an offline tablet app, a back-office web app and a vendor portal. `positioning.product` and `positioning.surfaces` in `src/content/facts.ts` hold the wording.

"Field-operations platform" is the market's keyword, not a description. It once appeared 13 times across the site, five of them as the identical prefix on five consecutive case-study cards, which made a broad product read as one narrow thing. So:

- **The market noun appears at most once per page**, and only where it earns keyword match — the layout's `keywords`, one CV highlight.
- **A case study's `context` names its own module**, never the platform: `Offline tablet app · work orders and job completion`, `Procure-to-pay · requisitions and ERP handoff`, `Release engineering · authorization across the product`. A reader scanning six cards should learn six things.
- **Where the product needs introducing, describe it** using `positioning.product` rather than reaching for the label again.

### Cut the second telling

Every claim gets said once, in the place it lands hardest. The recurring failures:

- **A section that restates its own headings.** The `/work` lead used to end "…how it arrived, what it really was, what shipped, and what the evidence is" — the four labels the reader is about to see anyway.
- **A summary that repeats its own hook.** A card shows `Reported: "…"` and then opened with "Reported as…". The summary starts at the divergence instead.
- **An `evidenceNote` that re-describes what shipped.** It exists to say the thing the figures cannot.
- **A qualifier that adds no case.** "in a specific way", "genuinely", "actually", "the thing that needed building was", "there is no slow connection to fall back on, there is no connection" — the second half of that last one is the whole sentence.
- **Two clauses for one idea.** "connectivity is genuinely absent rather than slow" → "there is no network to fall back on".

Read a finished paragraph and delete the sentence that would not change a reader's mind if it were gone.

Write the modest register:

- Say what the thing does and what it cost. Skip the adjective that rates it.
- First person, past tense, specific verb. "Shipped", "specified", "recovered", "froze" — not "spearheaded", "drove", "owned the vision for".
- No authority claims about how companies work. An earlier draft said "I turn how a company actually works into software that holds up offline, under money, and under audit" and it was cut for describing an authority she would not want to defend in an interview. That instinct governs here too.
- No "passionate", "innovative", "cutting-edge", "full time learner". The last one is a modesty claim sitting in the slot where evidence belongs.
- Let a number end a sentence. It is stronger than any clause you could add after it.

## Confidentiality ceiling

Altonaut is employer work at Wintermar Offshore Marine Group. The ceiling is **the abstraction level the CV already publishes**: architecture and rounded numbers.

Never on the page: a customer or fleet name, a vessel name, an approver or site name, a screenshot of the product, a schema or ERD, a table or column name, an internal ticket id, a repository name, a URL.

Always fine: the shape of a problem, the mechanism of a fix, a rounded figure from the chain above, a diagram of a mechanism drawn from scratch.

When a sentence needs a specific to land and the specific is confidential, **describe the class**: "a device that had been offline for days" rather than a named vessel; "a customer's purchasing hierarchy" rather than a customer.

## Checking a draft

A draft is ready when every one of these is yes:

- Every figure traces to `facts.ts`, and no superseded literal appears.
- No sentence calls her Senior, and no headline calls her Founding Engineer.
- The market noun appears at most once, and no two case studies share a `context` prefix.
- No sentence restates a heading, a hook, or the sentence before it.
- Every adjective rating her own work has been cut, or replaced by the thing that earns it.
- A reader who wanted to dispute a claim could find what to check.
- Nothing on the page names a customer, vessel, site, approver, schema or internal id.
