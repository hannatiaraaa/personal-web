import { figures } from './facts';

/**
 * Every case study is one divergence, told in four parts: how it was reported,
 * what it actually was, what shipped, and the evidence. All four are required
 * fields, so a case study missing a part does not compile.
 *
 * Confidentiality ceiling is the abstraction level the CV already publishes:
 * architecture and rounded numbers. No customer, vessel, site or approver
 * names; no screenshots; no schema.
 */
export type CaseStudy = {
  readonly slug: string;
  /** Names the mechanism, not the project. */
  readonly title: string;
  readonly context: string;
  readonly period: string;
  /** One sentence. Doubles as the index entry and the meta description. */
  readonly summary: string;
  /** The sentence someone actually said, in their words. */
  readonly reported: string;
  /** What the cause turned out to be, and why the report pointed elsewhere. */
  readonly actually: readonly string[];
  /** What was built, at mechanism level. */
  readonly shipped: readonly string[];
  readonly evidence: readonly { readonly value: string; readonly label: string }[];
  readonly evidenceNote?: string;
  readonly stack: readonly string[];
  readonly diagram?: 'draft-ownership' | 'tax-ladder';
};

export const caseStudies: readonly CaseStudy[] = [
  {
    slug: 'offline-draft-ownership',
    title: 'Offline drafts had no owner, so the newest work lost',
    context: 'Field-operations platform · offline-first Android app for vessel crews',
    period: '2024–2026',
    summary:
      'Reported as records reverting. It was not sync frequency — offline drafts had no ownership, so a device that had been away could land stale state on top of newer work.',
    reported: 'Records keep reverting.',
    actually: [
      'The obvious reading was sync frequency: devices at sea go days without a connection, so of course they fall behind. Syncing more often would have made the window smaller and the class of bug identical.',
      'The real fault was that a draft carried no statement about who owned it or when it stopped being valid. Two people could hold the same record on two devices, and whichever reconnected last won — not whichever had the newer work. A device that had been offline for days could complete its upload and quietly overwrite state that had moved on without it.',
      'That is why it presented as reverting rather than as a conflict. Nothing errored. The write succeeded. The model had no concept that would have let it fail.',
    ],
    shipped: [
      'Generic draft-sync DTOs, so every module inherited one ownership contract instead of each one inventing a sync shape and drifting from the others.',
      'A late-draft-sync guard: a draft arriving after the job it belongs to has completed is rejected rather than applied, because by then it is provably describing a state that no longer exists.',
      'Soft delete with cascade cleanup, so a removal propagates instead of leaving orphans that resurface on the next sync as though they were new.',
      'A versioned local-database migration for the draft tables, plus resume-on-open in the completion flow — a half-finished job is still there when the app comes back, which is the behaviour the crew actually needed and the reason drafts existed at all.',
      'Then the recovery work: scripts that cleaned up duplicated work orders, and — after a cleanup cost records it should not have — scripts that restored and backfilled them. Separately, a run of crashes, never-ending loads and local-database misuse in the jobs module after completion events, and batch-write and list-caching optimisation on device.',
    ],
    evidence: [
      { value: figures.vessels, label: 'vessels running the platform' },
      { value: figures.customerOrgs, label: 'customer organisations in production' },
    ],
    evidenceNote:
      'The class is closed rather than the ticket: a stale write cannot land at all now, instead of landing less often.',
    stack: ['React Native', 'Expo', 'WatermelonDB', 'SQLite', 'TypeScript', 'NestJS'],
    diagram: 'draft-ownership',
  },
  {
    slug: 'one-arithmetic-ladder',
    title: 'Every level could tax an already-taxed amount',
    context: 'Field-operations platform · procure-to-pay, ERP integration',
    period: '2025–2026',
    summary:
      'Reported as rounding errors. Tax and discount lived at several levels at once, so every level was individually defensible and the total was still wrong.',
    reported: 'There are rounding errors on the requisition totals.',
    actually: [
      'Rounding was a reasonable first guess, because the discrepancies were small and the arithmetic at each level looked right when you checked it.',
      'Tax and discount were being applied at more than one level of the same document — the item line, the service scope, and the document itself. Each level was individually correct. Composed, a level could tax an amount that a level below it had already taxed. There was no single wrong place to find, which is precisely why it read as rounding rather than as a defect.',
      'Money makes this expensive in a specific way: the output feeds a customer purchase order and an ERP handoff, so a wrong total is not a display bug, it is a number someone approves.',
    ],
    shipped: [
      'One arithmetic ladder, replacing per-level arithmetic. Tax cannot be applied to a taxed amount because the ladder has one rung where tax happens and the structure has no second one.',
      'The ladder holds across every grain the document actually has: item lines, service scopes with their own pricing and commercial terms, and split-line multi-vendor sourcing costed at the grain it is genuinely sourced rather than averaged up to the line.',
      'Component-first requisition creation with server-resolved cost codes derived from purpose, so the mapping to a customer chart of accounts is configuration rather than a field someone types.',
      'Multi-currency throughout, and the whole thing delivered inside the ERP requisition revamp rather than bolted beside it.',
    ],
    evidence: [
      { value: figures.repositories, label: 'repositories the change had to land across' },
      { value: figures.sapDeliveryWeeks, label: 'to deliver the ERP integration' },
    ],
    evidenceNote:
      'Collapsing the rule into one ladder is what makes it checkable. A rule per level is a rule per level to test.',
    stack: ['NestJS', 'MySQL', 'Sequelize', 'TypeScript', 'Next.js', 'SAP integration'],
    diagram: 'tax-ladder',
  },
  {
    slug: 'release-gate-from-zero',
    title: '"All tests green" meant nothing, so I froze the debt by name',
    context: 'Field-operations platform · release quality and authorization',
    period: '2025–2026',
    summary:
      'Inherited authorization gaps meant a passing suite proved nothing. Fixing them first would have blocked every release for months, so they were quarantined by name instead.',
    reported: 'All tests are green — we should be fine to release.',
    actually: [
      'The suite was green because it was not looking. There was no deterministic gate, and authorization in particular had a large set of pre-existing gaps that predated me.',
      'The two obvious options were both wrong. Fixing every inherited gap before releasing again would have stopped delivery for months. Releasing while the gaps counted as passes meant a genuinely new regression would be invisible inside the noise of old debt.',
      'The thing that needed building was not more tests. It was a gate that could tell inherited debt apart from a new regression, and say so out loud on every run.',
    ],
    shipped: [
      `A permission matrix: ${figures.guardedRoutes} guarded routes evaluated against ${figures.permissionProfiles} reviewed permission profiles, producing ${figures.permissionChecks} exact pre-handler authorization decisions per run. The inherited gaps are quarantined individually, by name — so old debt cannot be reported as green, and a new regression shows up the day it lands.`,
      `The wider gate around it: ${figures.releaseCases} repeatable Playwright cases across ${figures.releaseSpecs} specs, covering the API, the web app, mobile web, cross-surface propagation and visual regression.`,
      'Disposable database schemas with synthetic fixtures, per-case snapshot restore and credential masking — so a release is certified without touching customer data at all.',
      'Earlier, the breaking change that introduced permission handling across every feature, and the supervisor role that scopes record visibility by department.',
    ],
    evidence: [
      { value: figures.releaseCases, label: 'repeatable release cases' },
      { value: figures.permissionChecks, label: 'authorization decisions per run' },
      { value: figures.reviewsGiven, label: "reviews on teammates' pull requests" },
    ],
    evidenceNote:
      'No production data is required to certify a release. That is the property the gate was built for, and the one that makes it usable by anyone.',
    stack: ['Playwright', 'MySQL', 'TypeScript', 'NestJS', 'Next.js', 'CI'],
  },
  {
    slug: 'configurable-approval-engine',
    title: 'One hard-coded approver did not survive the second customer',
    context: 'Field-operations platform · approvals, specification to rollout',
    period: '2025–2026',
    summary:
      'The obvious fix was a branch per customer. Instead the business configures its own ladders, spending authority and price guards — and a new customer costs no code.',
    reported: 'Approvals are wrong for this customer.',
    actually: [
      'The first customer had one approver, hard-coded. The second customer had a hierarchy, and the request arrived as a bug about their approvals being wrong.',
      'Branching per customer is the move that works today and compounds forever: each fleet adds a branch, no branch can safely be removed, and the second-order cost is that nobody can answer "what are this customer\'s rules" without reading code.',
      'The rule underneath was not a rule about approvals at all. It was that a customer\'s approval hierarchy, spending authority and chart of accounts are *their* operating procedure — they change without asking us, and they belong in configuration, not in a release.',
      'Getting that right meant sitting with operations, purchasing and finance staff and working out what the rule really was before specifying anything.',
    ],
    shipped: [
      'An approval engine the business configures itself: sequential and non-sequential ladders, per-approver spending authority, mandatory price checks, price guards above a budget owner\'s limit, and super-approver auto-approval.',
      'Bypass states rendered honestly in the interface. When a ladder is short-circuited the screen says so, because an approval trail that hides its own exceptions is worse than no trail.',
      'The specification and the architecture decision records first, then the implementation across shared contracts, the API, the web dashboard and the mobile app — one change landing coherently across four surfaces rather than four surfaces drifting.',
    ],
    evidence: [
      { value: figures.customerOrgs, label: 'customer organisations on their own hierarchies' },
      { value: figures.designQuestionsResolved, label: 'open design questions resolved' },
      { value: figures.approvalRebuildWeeks, label: 'to rebuild it' },
      { value: figures.escalations, label: 'escalations handled directly' },
    ],
    evidenceNote:
      'Named decision owner on the architecture decision records. Every customer since has configured their own hierarchy without a code change.',
    stack: ['NestJS', 'Next.js', 'React Native', 'MySQL', 'TypeScript', 'shared contracts'],
  },
  {
    slug: 'procure-to-pay-migration',
    title: 'Moving a module off the offline app, with no specification to work from',
    context: 'Field-operations platform · offline mobile to online back-office',
    period: '2026',
    summary:
      'A whole procure-to-pay module moved from the offline app to the web dashboard, AI-assisted, inside gates that already existed — with divergences recorded rather than discovered later.',
    reported: 'Procurement should live in the web app, not on the vessel.',
    actually: [
      'Nothing was written down. The specification was the existing flows, and the existing flows had been shaped by an offline device — draft-first, one user at a time, sync-aware.',
      'Office staff working online do not have those constraints, and they do have ones the mobile flows never handled: several people in the same document, and real concurrency. A faithful port would have carried the offline assumptions into a place where they are wrong, and reproduced the collisions rather than removing them.',
      'So the work was not a migration in the mechanical sense. It was re-deciding what the flows should be, at the pace of a migration.',
    ],
    shipped: [
      `${figures.migrationFiles} files across the web app and the API, in ${figures.migrationWeeks}, as an explicitly AI-assisted workstream — then hardened by an audit-and-refactor pass across both surfaces.`,
      'Workflows redesigned for online multi-user use rather than ported, with every deliberate divergence from the mobile behaviour recorded in an architecture decision record, so a later reader can tell a decision from an accident.',
      'Production data operations for the cutover run as executable runbooks: dry-run defaulting to true, numbered stop conditions, idempotent upserts, explicit one-way markers, and a written result artifact per run — so a migration against a live customer database is reviewable and repeatable instead of a one-off manual session.',
    ],
    evidence: [
      { value: figures.migrationFiles, label: 'files across web and API' },
      { value: figures.migrationWeeks, label: 'elapsed' },
    ],
    evidenceNote:
      'The release gate, the permission matrix and the documentation contract all existed before any agent ran through them. The work was fast because the acceptance criteria were written first.',
    stack: ['Next.js', 'NestJS', 'TypeScript', 'Playwright', 'agent runbooks'],
  },
  {
    slug: 'native-to-react-native',
    title: 'Two platforms, two bug lists, one missing shared layer',
    context: 'Clinical mobile app · Kotlin and Swift to React Native',
    period: '2021–2023',
    summary:
      'The defect list looked like two sets of platform bugs. It was one product implemented twice and drifting — so the platforms were unified onto a single codebase.',
    reported: 'Android and iOS each have their own list of bugs.',
    actually: [
      'Read as two platform problems, it is two backlogs and two engineers. Read as one product implemented twice, it is a drift problem — and drift keeps producing new defects no matter how many you close.',
      'The same clinical feature existed in Kotlin and in Swift, maintained separately, diverging quietly. A fix on one side was not a fix, it was half a fix, and nothing in the process noticed.',
      'This was 2021. There was no coding assistant involved — the cross-platform architecture, the migration plan and the encryption library were designed and written by hand.',
    ],
    shipped: [
      `The Personal Health Manager app migrated onto one React Native codebase, resolving ${figures.nativeDefectsResolved} native defects and unifying both platforms.`,
      'The mobile UI architecture and API integration for the core clinical features — DNA test reports and the survey instruments — plus web-to-mobile account linking, multi-account support, infinite scroll over large clinical datasets, and charting.',
      'The client-side encryption library protecting patient data at rest, written after a vulnerability assessment and penetration test.',
      'A refactor during a design revamp that cut code complexity roughly in half and improved responsiveness by about a third.',
    ],
    evidence: [
      { value: figures.nativeDefectsResolved, label: 'native defects resolved' },
      { value: figures.pentestFindingsClosed, label: 'of penetration-test findings closed' },
      { value: figures.bugReportReduction, label: 'fewer post-launch bug reports' },
      { value: figures.bothAppsReleasedWithin, label: 'to release both patient and physician apps' },
    ],
    evidenceNote:
      'Delivered remotely from Indonesia to a Singapore team, coordinating an outsourced engineering group and running the knowledge transfer.',
    stack: ['React Native', 'TypeScript', 'Redux', 'Redux Saga', 'Kotlin', 'Swift'],
  },
] as const;

export function getCaseStudy(slug: string): CaseStudy | undefined {
  return caseStudies.find((study) => study.slug === slug);
}

/**
 * Earlier client work. Real builds, but no divergence between the reported and
 * the actual problem — so they are listed honestly rather than written up as
 * case studies they cannot support.
 */
export const earlierWork = [
  {
    title: 'Interactive 3D product-solutions site',
    detail: 'Product configurator and scroll-driven 3D scenes for a client web product.',
    stack: ['three.js', 'GSAP', 'Next.js'],
  },
  {
    title: 'Banking-sector interface',
    detail: 'Customer-facing interface work for a regional bank.',
    stack: ['React', 'TypeScript'],
  },
  {
    title: 'Environmental-platform mobile app',
    detail: 'Mobile client for an environmental data platform.',
    stack: ['React Native', 'TypeScript'],
  },
] as const;
