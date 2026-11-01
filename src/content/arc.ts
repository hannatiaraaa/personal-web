import { education, figures } from './facts';

/**
 * The scene drawn beside an era on /about. A union rather than a string, so an
 * era naming a scene nobody has drawn is a compile error in the scene switch.
 */
export type EraScene =
  | 'complex-network'
  | 'one-codebase'
  | 'encrypted-at-rest'
  | 'first-codebases'
  | 'out-of-signal'
  | 'approval-ladder'
  | 'tax-order'
  | 'suite-migration'
  | 'release-gate'
  | 'review-record';

/** A layer of the product she owns. The arc is the order she came to own them in. */
export type Layer = 'modelling' | 'frontend-mobile' | 'offline' | 'api' | 'integration' | 'release' | 'practice';

/** Every layer, in the order the indicator fills. Labels are short: they sit in a chip. */
export const layers: readonly { readonly id: Layer; readonly label: string }[] = [
  { id: 'modelling', label: 'Maths & modelling' },
  { id: 'frontend-mobile', label: 'Frontend & mobile' },
  { id: 'offline', label: 'Offline data' },
  { id: 'api', label: 'API & rules' },
  { id: 'integration', label: 'ERP integration' },
  { id: 'release', label: 'Release gate' },
  { id: 'practice', label: 'Review & practice' },
] as const;

/** One era of the arc: where the work went next, and why. */
export type Era = {
  /** Stable key: two eras can share a period. */
  readonly id: string;
  readonly period: string;
  /** Where the era happened. */
  readonly place: string;
  readonly title: string;
  readonly body: string;
  readonly scene: EraScene;
  /** Layers this era is where she first owned. An era that goes deeper rather than wider adds none. */
  readonly adds: readonly Layer[];
};

const NALAGENETICS = 'Nalagenetics · Singapore, remote';
const ALTONAUT = 'Altonaut · Jakarta, hybrid';

/**
 * 2015 to now, from the CV files only (Cover_Letter_Master.md >
 * CV_Hanna_Master_ATS.md > LinkedIn_Profile_Pack.md > CV_Hanna_2026_Master.md).
 * Altonaut's eras carry no year of their own: the CV dates the role, not the
 * steps inside it, so they are ordered as the CV tells them and not dated.
 */
export const arc: readonly Era[] = [
  {
    id: 'mathematics',
    period: '2015 – 2019',
    place: education.institution,
    title: 'Mathematics, research, and a classroom',
    body: `A ${education.degree} at ${education.institution}. From 2017 to 2018 I was a research assistant on ${figures.researchPapers} papers — complex networks, deterministic and stochastic modelling, optimal control — and a lecturer assistant teaching Ordinary Differential Equations. I presented at ICMAMU 2018 in Bangkok, and placed in national essay and paper contests and the faculty's Most Outstanding Student award. By 2021, when ${figures.publications} of the papers were published, I had added applied data science at WorldQuant University and ${figures.awsCertifications} AWS certifications. The contagion model from one of them runs further down this page.`,
    scene: 'complex-network',
    adds: ['modelling'],
  },
  {
    id: 'nalagenetics-migration',
    period: '2021 – 2023',
    place: NALAGENETICS,
    title: 'One patient app instead of two',
    body: `Personalised DNA testing for Southeast Asian populations; the app is where patients read their own genetic results. I worked remote to Singapore hours, and every line was hand-written — there were no coding assistants. The app existed twice, in Kotlin and in Swift, and patients on Android and iOS saw different behaviour from the same result. With no specification, only the live app to work from, I migrated it to React Native and cleared ${figures.nativeDefectsResolved} native defects. Then the clinical screens — the RxReady, NutriReady and MammoReady DNA reports and the FACT-ES and COVID-19 Likelihood Meter surveys — with post-launch bug reports down ${figures.bugReportReduction}.`,
    scene: 'one-codebase',
    adds: ['frontend-mobile'],
  },
  {
    id: 'nalagenetics-ownership',
    period: '2021 – 2023',
    place: NALAGENETICS,
    title: 'A whole app, and the data inside it',
    body: `A complete user app single-handed inside a ${figures.singleHandedAppScope} scope, with no design support, planned and tracked myself. A third-party penetration test came back; I closed ${figures.pentestFindingsClosed} of its findings and wrote the client-side encryption library that keeps patients' genetic data unreadable at rest. When the design was revamped I rebuilt the app for ${figures.revampComplexity} the code complexity, and shipped the patient and physician apps within ${figures.bothAppsReleasedWithin} while coordinating an outsourced engineering team.`,
    scene: 'encrypted-at-rest',
    adds: [],
  },
  {
    id: 'altonaut-joined',
    period: '2024',
    place: ALTONAUT,
    title: 'Joined a product in its first months',
    body: 'My employment of record is Software Engineer at Wintermar. I joined Altonaut in the product’s first months as a frontend engineer, and initialised the first codebases.',
    scene: 'first-codebases',
    adds: [],
  },
  {
    id: 'altonaut-offline',
    period: '2024 – now',
    place: ALTONAUT,
    title: 'Offline, because the crews are at sea',
    body: 'The tablet app goes to crews where there is no network to fall back on. Completed work kept going missing, and I traced it to how crews work — finish a job, switch tablet, lose signal — rather than to how often the app synced. I redesigned draft sync, local persistence and recovery: late-sync guards, soft deletion, a database migration, resume-on-open. Then I recovered and backfilled the affected records, and the crashes and endless loading stopped.',
    scene: 'out-of-signal',
    adds: ['offline'],
  },
  {
    id: 'altonaut-approvals',
    period: '2024 – now',
    place: ALTONAUT,
    title: 'Picked up the API to own the approval rules',
    body: `Customers ran materially different order processes, and their approval rules could not be owned from the client. So I learned NestJS and MySQL and built a configurable procurement engine — sequential and parallel chains, spending limits, budget guards, price checks, super-approver overrides — that customers set themselves instead of waiting for a release. I was decision owner on the self-service configuration, from requirements and prototype to PRDs and architecture decisions, settling ${figures.designQuestionsResolved} design questions from real usage. The first version took ${figures.approvalFirstBuildWeeks}; the generalised rebuild, ${figures.approvalRebuildWeeks}.`,
    scene: 'approval-ladder',
    adds: ['api'],
  },
  {
    id: 'altonaut-procurement',
    period: '2024 – now',
    place: ALTONAUT,
    title: 'Procurement, through to SAP',
    body: `Main contributor to the procurement revamp: SAP integration, cost-code mapping, component-first requisitions, multi-vendor sourcing and service scopes. I put the requisition arithmetic into one calculation order, so tax can never be charged on tax — ending a class of double-taxation and rounding errors in purchases a finance team signs off. A major SAP requisition integration took ${figures.sapDeliveryWeeks} of development, with SAP staying the customer's system of record.`,
    scene: 'tax-order',
    adds: ['integration'],
  },
  {
    id: 'altonaut-migration',
    period: '2024 – now',
    place: ALTONAUT,
    title: 'Out of React Native Web, into the back office',
    body: `The procurement suite lived in the React Native Web app; shore staff needed it in the back-office web app, with several people working the same records at once. I moved ${figures.migrationFiles} files across web and API in ${figures.migrationWeeks} with AI-assisted development, redesigned the concurrency-sensitive workflows with no written specification, and recorded every intentional difference in a decision record.`,
    scene: 'suite-migration',
    adds: [],
  },
  {
    id: 'altonaut-release-gate',
    period: '2024 – now',
    place: ALTONAUT,
    title: 'Taught myself Playwright and built the gate',
    body: `Procurement runs end to end across every surface, and nothing certified a release. I built the safety net from nothing: ${figures.releaseCases} repeatable cases across ${figures.releaseSpecs} specs — API, web, mobile web, cross-app propagation, visual regression — on throwaway databases with synthetic data. Beside them, ${figures.guardedRoutes} protected routes are checked against ${figures.permissionProfiles} reviewed profiles, ${figures.permissionChecks} access decisions per run, with inherited gaps documented so they cannot pass as green.`,
    scene: 'release-gate',
    adds: ['release'],
  },
  {
    id: 'altonaut-review',
    period: '2024 – now',
    place: ALTONAUT,
    title: 'Reviewer of record, and the practice around it',
    body: `${figures.reviewsGiven} pull requests reviewed across every product repository, from internal and partner teams and increasingly from agents, as reviewer of record for the modules and the shared contracts. Documentation and decision records ship with the code, and production data migrations run from dry-run runbooks with recorded results. Most of the product decisions came from ${figures.escalations} escalations handled directly with customers' operations, purchasing and finance staff.`,
    scene: 'review-record',
    adds: ['practice'],
  },
] as const;
