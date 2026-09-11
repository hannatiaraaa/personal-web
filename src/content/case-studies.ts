import type { DiagramKind } from '@/modules/visual/components/diagrams';
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
  readonly diagram?: DiagramKind;
};

export const caseStudies: readonly CaseStudy[] = [
  {
    slug: 'offline-draft-ownership',
    title: 'Offline drafts had no owner, so the newest work lost',
    context: 'Offline tablet app · work orders and job completion',
    period: '2024–2026',
    summary:
      'Not sync frequency. Offline drafts had no ownership, so a device that had been away could land stale state on top of newer work — and nothing in the model could make that write fail.',
    reported: 'Records keep reverting.',
    actually: [
      'The obvious reading was sync frequency — devices at sea go days without a connection. Syncing more often would have shrunk the window and left the class of bug intact.',
      'The real fault was that a draft said nothing about who owned it or when it stopped being valid. Two devices could hold the same record, and whichever reconnected last won — not whichever held the newer work.',
      'So it presented as reverting rather than as a conflict. Nothing errored, the write succeeded, and the model had no concept that would have let it fail.',
    ],
    shipped: [
      'Generic draft-sync DTOs, so every module inherits one ownership contract instead of inventing its own and drifting.',
      'A late-draft-sync guard: a draft arriving after its job has completed is rejected, because by then it provably describes a state that no longer exists.',
      'Soft delete with cascade cleanup, so a removal propagates instead of leaving orphans that resurface on the next sync as new.',
      'A versioned migration for the draft tables, plus resume-on-open — a half-finished job is still there when the app comes back, which is what the crew needed and why drafts existed.',
      'Then the recovery: scripts that cleared duplicated work orders and, after a cleanup cost records it should not have, restored and backfilled them. Separately, the crashes, endless loads and local-database misuse after completion events, and batch-write and list-caching work on device.',
    ],
    evidence: [
      { value: figures.vessels, label: 'vessels running the platform' },
      { value: figures.customerOrgs, label: 'customer organisations in production' },
    ],
    evidenceNote:
      'The class is closed rather than the ticket. A stale write cannot land at all now, rather than landing less often.',
    stack: ['React Native', 'Expo', 'WatermelonDB', 'SQLite', 'TypeScript', 'NestJS'],
    diagram: 'draft-ownership',
  },
  {
    slug: 'one-arithmetic-ladder',
    title: 'Every level could tax an already-taxed amount',
    context: 'Procure-to-pay · requisitions and ERP handoff',
    period: '2025–2026',
    summary:
      'Not rounding. Tax and discount lived at several levels at once, so every level was individually defensible and the total was still wrong — collapsed into one ladder with no second rung.',
    reported: 'There are rounding errors on the requisition totals.',
    actually: [
      'Rounding was a fair first guess: the discrepancies were small and each level checked out on its own.',
      'Tax and discount were applied at three levels of the same document — item line, service scope, and document. Each was correct alone. Composed, a level could tax an amount a level below it had already taxed. There was no single wrong place to find, which is why it read as rounding.',
      'The output feeds a purchase order and an ERP handoff, so a wrong total is not a display bug — it is a number someone approves.',
    ],
    shipped: [
      'One arithmetic ladder. Tax cannot land on taxed money because the ladder has a single rung where tax happens and no second one exists.',
      'It holds across every grain the document has: item lines, service scopes with their own pricing and terms, and split-line multi-vendor sourcing costed where it is actually sourced rather than averaged up.',
      'Component-first requisitions with server-resolved cost codes derived from purpose, so mapping to a chart of accounts is configuration rather than a typed field.',
      'Multi-currency throughout, delivered inside the ERP revamp rather than bolted beside it.',
    ],
    evidence: [
      { value: figures.repositories, label: 'repositories the change had to land across' },
      { value: figures.sapDeliveryWeeks, label: 'to deliver the ERP integration' },
    ],
    evidenceNote: 'One ladder is what makes the rule checkable. A rule per level is a rule per level to test.',
    stack: ['NestJS', 'MySQL', 'Sequelize', 'TypeScript', 'Next.js', 'SAP integration'],
    diagram: 'tax-ladder',
  },
  {
    slug: 'release-gate-from-zero',
    title: '"All tests green" meant nothing, so I froze the debt by name',
    context: 'Release engineering · authorization across the product',
    period: '2025–2026',
    summary:
      'Inherited authorization gaps meant a passing suite proved nothing. Fixing them first would have blocked every release for months, so they were frozen by name — old debt cannot pass, new regressions show the day they land.',
    reported: 'All tests are green — we should be fine to release.',
    actually: [
      'The suite was green because it was not looking. There was no deterministic gate, and authorization carried a large set of gaps that predated me.',
      'Both obvious options were wrong. Fixing every inherited gap first would have stopped delivery for months. Releasing while they counted as passes would hide a genuinely new regression inside the noise of old debt.',
      'What needed building was not more tests, but a gate that could tell inherited debt from a new regression and say so on every run.',
    ],
    shipped: [
      `A permission matrix: ${figures.guardedRoutes} guarded routes evaluated against ${figures.permissionProfiles} reviewed permission profiles, producing ${figures.permissionChecks} exact pre-handler authorization decisions per run. The inherited gaps are quarantined individually, by name — so old debt cannot be reported as green, and a new regression shows up the day it lands.`,
      `The wider gate around it: ${figures.releaseCases} repeatable Playwright cases across ${figures.releaseSpecs} specs, covering the API, the web app, mobile web, cross-surface propagation and visual regression.`,
      'Disposable schemas with synthetic fixtures, per-case snapshot restore and credential masking, so a release is certified without touching customer data.',
      'Earlier, the breaking change that introduced permission handling across every feature, and the supervisor role that scopes record visibility by department.',
    ],
    evidence: [
      { value: figures.releaseCases, label: 'repeatable release cases' },
      { value: figures.permissionChecks, label: 'authorization decisions per run' },
      { value: figures.reviewsGiven, label: 'code reviews on pull requests' },
    ],
    evidenceNote:
      'No production data is required to certify a release — the property the gate was built for, and the one that makes it usable by anyone.',
    stack: ['Playwright', 'MySQL', 'TypeScript', 'NestJS', 'Next.js', 'CI'],
  },
  {
    slug: 'configurable-approval-engine',
    title: 'One hard-coded approver did not survive the second customer',
    context: 'Approvals · specification through rollout',
    period: '2025–2026',
    summary:
      'The obvious fix was a branch per customer, which compounds forever. Instead the business configures its own ladders, spending authority and price guards, and a new customer costs no code at all.',
    reported: 'Approvals are wrong for this customer.',
    actually: [
      'The first customer had one approver, hard-coded. The second had a hierarchy, and the request arrived as a bug about their approvals being wrong.',
      'Branching per customer works today and compounds forever: every fleet adds a branch, none can safely be removed, and nobody can answer "what are this customer\'s rules" without reading code.',
      "The rule underneath was not about approvals at all. A customer's hierarchy, spending authority and chart of accounts are their operating procedure — they change without asking us, so they belong in configuration, not in a release.",
      'Getting that right meant sitting with operations, purchasing and finance staff to find the real rule before specifying anything.',
    ],
    shipped: [
      "An approval engine the business configures itself: sequential and parallel ladders, per-approver spending authority, mandatory price checks, guards above a budget owner's limit, and super-approver override.",
      'Bypass states rendered honestly. When a ladder is short-circuited the screen says so, because a trail that hides its own exceptions is worse than no trail.',
      'Specification and decision records first, then implementation across shared contracts, the API, the dashboard and the app — one change landing coherently across four surfaces instead of four drifting.',
    ],
    evidence: [
      { value: figures.customerOrgs, label: 'customer organisations on their own hierarchies' },
      { value: figures.designQuestionsResolved, label: 'open design questions resolved' },
      { value: figures.approvalRebuildWeeks, label: 'to rebuild it' },
      { value: figures.escalations, label: 'escalations handled directly' },
    ],
    evidenceNote:
      'Named decision owner on the decision records. Every customer since has configured their own hierarchy without a code change.',
    stack: ['NestJS', 'Next.js', 'React Native', 'MySQL', 'TypeScript', 'shared contracts'],
  },
  {
    slug: 'procure-to-pay-migration',
    title: 'Moving a module off the offline app, with no specification to work from',
    context: 'Procurement · offline app to back-office web',
    period: '2026',
    summary:
      'No specification existed, only flows shaped by an offline device. Porting them faithfully would have carried offline assumptions into a place where they are wrong, so the workflows were re-decided at the pace of a migration.',
    reported: 'Procurement should live in the web app, not on the vessel.',
    actually: [
      'Nothing was written down. The specification was the existing flows, and those had been shaped by an offline device — draft-first, one user at a time, sync-aware.',
      'Office staff online do not have those constraints, and they do have ones the mobile flows never handled: several people in one document, and real concurrency. A faithful port would have carried offline assumptions somewhere they are wrong and reproduced the collisions instead of removing them.',
      'So it was not a migration in the mechanical sense. It was re-deciding what the flows should be, at the pace of one.',
    ],
    shipped: [
      `${figures.migrationFiles} files across the web app and the API, in ${figures.migrationWeeks}, as an explicitly AI-assisted workstream — then hardened by an audit-and-refactor pass across both surfaces.`,
      'Workflows redesigned for online multi-user use rather than ported, with every deliberate divergence recorded in a decision record so a later reader can tell a decision from an accident.',
      'Cutover data operations run as executable runbooks: dry-run defaulting to true, numbered stop conditions, idempotent upserts, one-way markers, and a written result per run — so a migration against a live customer database is reviewable and repeatable rather than a one-off session.',
    ],
    evidence: [
      { value: figures.migrationFiles, label: 'files across web and API' },
      { value: figures.migrationWeeks, label: 'elapsed' },
    ],
    evidenceNote:
      'The release gate, the permission matrix and the documentation contract all existed before any agent ran through them. It was fast because the acceptance criteria were written first.',
    stack: ['Next.js', 'NestJS', 'TypeScript', 'Playwright', 'agent runbooks'],
  },
  {
    slug: 'native-to-react-native',
    title: 'Two platforms, two bug lists, one missing shared layer',
    context: 'Clinical mobile · Kotlin and Swift to React Native',
    period: '2021–2023',
    summary:
      'The defect list looked like two sets of platform bugs. It was one product implemented twice and drifting, so closing defects could never catch up — the platforms were unified onto one codebase instead.',
    reported: 'Android and iOS each have their own list of bugs.',
    actually: [
      'Read as two platform problems it is two backlogs and two engineers. Read as one product implemented twice it is drift — and drift keeps producing defects no matter how many you close.',
      'The same clinical feature existed in Kotlin and in Swift, maintained separately and diverging quietly. A fix on one side was half a fix, and nothing in the process noticed.',
      'This was 2021, with no coding assistant: the cross-platform architecture, the migration plan and the encryption library were designed and written by hand.',
    ],
    shipped: [
      `The Personal Health Manager app migrated onto one React Native codebase, resolving ${figures.nativeDefectsResolved} native defects and unifying both platforms.`,
      'The mobile UI architecture and API integration for the core clinical features — DNA reports and the survey instruments — plus web-to-mobile account linking, multi-account support, infinite scroll over large datasets, and charting.',
      'The client-side encryption library protecting patient data at rest, written after a vulnerability assessment and penetration test.',
      'A design-revamp refactor that cut code complexity roughly in half and improved responsiveness by about a third.',
    ],
    evidence: [
      { value: figures.nativeDefectsResolved, label: 'native defects resolved' },
      { value: figures.pentestFindingsClosed, label: 'of penetration-test findings closed' },
      { value: figures.bugReportReduction, label: 'fewer post-launch bug reports' },
      { value: figures.bothAppsReleasedWithin, label: 'to release both patient and physician apps' },
    ],
    evidenceNote:
      'Delivered remotely from Indonesia to a Singapore team, coordinating an outsourced group and running the knowledge transfer.',
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
