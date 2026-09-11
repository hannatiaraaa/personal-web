import { figures } from './facts';

/**
 * Built from cv_hanna/2026/CV_Hanna_Master_ATS.md, which is the newest master
 * and the file Cover_Letter_Master.md was derived from. Where it disagrees with
 * CV_Hanna_2026_Master.md, this content follows the ATS master.
 *
 * Rendered as HTML so the CV is indexable, rather than living only inside a PDF
 * behind a Google Drive item id.
 */

export const summary: readonly string[] = [
  `Six years building and owning production software across mobile, web, backend and delivery infrastructure, remote and hybrid across Indonesia and Singapore. TypeScript, React Native/Expo, Next.js and NestJS, with particular depth in offline-first applications, permission-heavy workflows, and systems where correctness affects operations and money.`,
  `Took a fleet maintenance and procurement platform from its early stage to ${figures.vessels} vessels and ${figures.realUsers} users across ${figures.customerOrgs} large customer organisations, growing from frontend and mobile work into end-to-end ownership: requirements, architecture and data models, APIs and applications, and the automated checks and release standards for the domain.`,
  `${figures.mergedPullRequests} merged pull requests and ${figures.reviewsGiven} code reviews, across monorepos and multi-repo systems, conventionally and AI-assisted. The work is making complex software predictable: decisions documented, changes tested, permissions verified, releases held to a written standard. Milestone-sized features that took one to three months and a small team now ship in weeks.`,
];

export const highlights: readonly string[] = [
  `Founding engineer on a field-operations platform, from its first months to ${figures.vessels} vessels and ${figures.customerOrgs} large corporate clients, with ${figures.workstreamsOwned} workstreams owned end to end.`,
  `Ended the approvals bottleneck. Replaced a single hard-coded approver with an engine each customer configures itself, so a customer changes its own approval chain, spending limits and price guards in an afternoon instead of waiting for a release.`,
  `Stopped crews losing completed work at sea. Traced repeated data loss to how people actually work offline — finish a job, switch tablet, lose signal — and rebuilt draft handling so a half-finished job survives whatever the network does.`,
  `Built the release safety net from nothing: ${figures.releaseCases} repeatable tests across ${figures.releaseSpecs} specs and ${figures.permissionChecks} permission checks per run, certifying a release without ever touching customer data.`,
  `Made every decision traceable: specifications, architecture decision records, release notes and user guides ship with the change across all product repositories, so no part of the system depends on one person's memory.`,
];

export type Role = {
  readonly title: string;
  readonly organisation: string;
  readonly organisationNote?: string;
  readonly period: string;
  readonly location: string;
  readonly context?: string;
  readonly bullets: readonly string[];
};

export const roles: readonly Role[] = [
  {
    title: 'Founding Engineer',
    organisation: 'Altonaut (PT Alto Nautika Teknologi)',
    organisationNote:
      'a venture of Wintermar Offshore Marine Group Tbk · employment of record: Software Engineer, Wintermar Offshore Marine Group Tbk',
    period: 'Jan 2024 – Present',
    location: 'Jakarta, Indonesia',
    context: `Planned maintenance, inventory and procurement for offshore fleets — work orders, assets and components, inspections, defects, certificates, stock, purchase approvals and fleet analytics. Runs on ${figures.vessels} vessels for ${figures.realUsers} users across ${figures.customerOrgs} large customer organisations, as an offline tablet app for crews at sea, a back-office web app for shore staff, and a vendor portal. I joined in the product's first months, initialised the first codebases as a frontend engineer, and grew into the full path: requirements, data model and architecture through API, apps, release engineering and production support.`,
    bullets: [
      'Designed and delivered a configurable procurement engine and analytics dashboard after identifying that customer fleets followed materially different end-to-end order processes. Replaced a hard-coded approver with sequential and parallel approval chains, spending limits, budget guards, price checks and super-approver overrides, so customers manage their own approval rules without a product release.',
      `Improved delivery throughput on comparable work, moving milestone-sized features from month-scale towards weeks. The self-service approval configuration went from a six-week first implementation to ${figures.approvalRebuildWeeks} when rebuilding the generalised version; a major SAP requisition integration was delivered in ${figures.sapDeliveryWeeks}.`,
      `Owned the end-to-end design and delivery of self-service multi-approval configuration as decision owner across requirements, prototype, UI/UX, PRDs and architecture decisions. Settled ${figures.designQuestionsResolved} design questions from real customer usage and implemented the resulting data model, API contracts, NestJS services, validation and dashboard.`,
      "Main contributor to the procurement revamp with ERP workflows: SAP integration, cost-code mapping normalisation, component-first requisitions, multi-vendor sourcing, service scopes and deterministic tax calculation. Eliminated a class of double-taxation and rounding errors while coordinating with the third-party system that remains the customer's system of record.",
      'Rebuilt the offline job workflow after tracing recurring data loss to real crew behaviour rather than sync frequency. Redesigned draft synchronisation, local persistence and recovery — late-sync guards, soft deletion, database migration, resume-on-open — recovering and backfilling affected records and eliminating the crashes and endless loading that had undermined crew confidence in the app.',
      'Owned the planned-maintenance, work-order and due-deviation processes: recurring maintenance by running hours and by calendar, threshold configurations driving job status and punctuality compliance, postponement and reopened-history rules, completion workflows triggering defect reports, and combining standard with vessel-specific job structures. Led the underlying job rules and the analytics reporting standard behind the dashboards department heads and directors use.',
      `Built the product's release safety net from nothing, especially for the end-to-end procurement process: ${figures.releaseCases} repeatable Playwright cases across ${figures.releaseSpecs} specs covering API, web, mobile web, cross-app propagation and visual regression, on throwaway databases with synthetic data.`,
      `Established automated permission verification across the product: ${figures.guardedRoutes} protected routes against ${figures.permissionProfiles} reviewed profiles, producing ${figures.permissionChecks} access decisions per run. Documented inherited gaps explicitly so existing permission issues could not silently become false release passes.`,
      `Migrated the procurement suite from React Native Web to the back-office web application — ${figures.migrationFiles} files across web and API in ${figures.migrationWeeks} with AI-assisted development, then hardened through subsequent production work. Redesigned concurrency-sensitive workflows for multi-user office operation with no written specification to work from, recording every intentional architectural difference in a decision record.`,
      'Established engineering practice for documentation, migrations and review: workflow, screen and permission documentation and architecture decision records ship with code, and production data migrations run from dry-run runbooks with recorded results. Any behaviour in the system traces back to a decision, a date and a reason.',
      `Reviewed over ${figures.reviewsGiven} pull requests across all product repositories, from internal and external partner teams and increasingly of agent-generated code, as reviewer of record for the modules and the shared contracts.`,
      `Handled ${figures.escalations} customer-raised requests and escalations for ${figures.customerOrgs} production customers, working directly with implementers and the clients' operations, purchasing and finance staff. Those conversations, not a backlog, drove most product decisions in the domain.`,
    ],
  },
  {
    title: 'Software Engineer',
    organisation: 'Nalagenetics',
    period: 'Apr 2021 – Aug 2023',
    location: 'Singapore (remote)',
    context:
      'Personalised DNA testing for Southeast Asian populations, sold direct and through partner clinics and laboratories. The patient app is where people read their own genetic results and act on them, so clarity and privacy are the product. Hand-written from scratch, before coding assistants existed.',
    bullets: [
      `Migrated the Personal Health Manager app from native Kotlin and Swift to React Native, clearing ${figures.nativeDefectsResolved} native defects and ending a split where patients on Android and iOS saw different behaviour from the same test result. No specification, only the live production app to work from.`,
      `Mobile UI architecture and API integration for the core clinical features — the DNA report products and the survey instruments — cutting post-launch bug reports by ${figures.bugReportReduction}.`,
      'Delivered a complete user application single-handed inside a three-month scope with no design support, planning and tracking the work personally.',
      `Closed ${figures.pentestFindingsClosed} of the findings from a third-party vulnerability assessment and penetration test, and wrote the client-side encryption library that keeps patients' genetic data unreadable at rest.`,
      `Rebuilt the application through a design revamp for roughly half the code complexity and a third better responsiveness, shipping both the patient and physician apps within ${figures.bothAppsReleasedWithin} while coordinating an outsourced engineering team.`,
    ],
  },
  {
    title: 'Research Assistant and Lecturer Assistant',
    organisation: 'Universitas Indonesia',
    period: 'Aug 2017 – Dec 2018',
    location: 'Depok, Indonesia',
    bullets: [
      'Contributed to three research papers on complex networks, deterministic and stochastic modelling, and optimal control.',
      'Taught the Ordinary Differential Equations class.',
    ],
  },
];

export const certifications = [
  'Amazon Web Services, 2021 — Machine Learning (Technical), Data Analytics (Technical), Cloud Practitioner Essentials',
  'WorldQuant University, 2020 — Applied Data Science I and II',
] as const;

export const awards = [
  '3rd place, Most Outstanding Student, Faculty of Mathematics and Natural Sciences, Universitas Indonesia (2018)',
  '1st place, National Essay Competition, Statistika Ria IPB (2017)',
  '2nd place, National Essay Contest, Mathematics Festival, Universitas Sriwijaya (2017)',
  '3rd place, National Paper Contest, Universitas Padjadjaran (2017)',
] as const;

export const languages = 'Indonesian (native) · English (professional working proficiency)';

export const resumePdf = '/hanna-tiara-andarlia-resume.pdf';
