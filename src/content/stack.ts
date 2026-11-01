/**
 * Grouped by how current it is, not by category — a recruiter reading a flat
 * alphabetical list cannot tell what she would reach for on Monday from what
 * she touched at university.
 *
 * Deliberately absent: Microsoft 365, AntDesign, OneSignal, Android SDK. All
 * true, all on the CV, and all listed in Brand_and_Headlines.md §5 as terms that
 * pull the wrong recruiters. The same note named MATLAB, Maple and Wolfram
 * Mathematica; she chose to show them, as the tools of her mathematics.
 */

/**
 * A stable name for a group, which the page draws its explainer scene from. A
 * union rather than a string, so a group without a scene does not compile.
 */
export type StackGroupId = 'daily' | 'offline' | 'architecture' | 'domain' | 'ai-delivery' | 'archive';

/** A labelled part of a group, for a group that spans more than one kind of work. */
export type StackSubgroup = {
  readonly title: string;
  readonly items: readonly string[];
};

type StackGroupHeading = {
  readonly id: StackGroupId;
  readonly title: string;
  readonly note: string;
};

/**
 * A group lists its items flat or in labelled subgroups, never both, so no
 * item can be stated twice.
 */
export type StackGroup = StackGroupHeading &
  (
    | { readonly items: readonly string[]; readonly subgroups?: never }
    | { readonly subgroups: readonly StackSubgroup[]; readonly items?: never }
  );

export const stackGroups: readonly StackGroup[] = [
  {
    id: 'daily',
    title: 'Reach for daily',
    note: 'What I am writing this week, across multiple repositories.',
    items: [
      'TypeScript',
      'React Native',
      'Expo',
      'React 19',
      'Next.js 15 (App Router, RSC, Server Actions)',
      'NestJS (Fastify)',
      'Node 22',
      'Bun',
      'MySQL',
      'Sequelize',
      'shadcn/ui',
      'Tailwind v4',
      'TanStack Query',
      'Playwright',
    ],
  },
  {
    id: 'offline',
    title: 'Offline-first and on-device',
    note: 'The part that is scarce. Built for crews working where there is no network at all, not where it is slow.',
    items: [
      'WatermelonDB',
      'SQLite',
      'Versioned local schemas and migrations',
      'Sync ownership and conflict resolution',
      'Draft persistence and resume',
      'Offline batch-write performance',
      'EAS build and OTA',
    ],
  },
  {
    id: 'architecture',
    title: 'Architecture and release quality',
    note: 'Designed so the next change is configuration rather than code, and so a release can be certified without production data.',
    items: [
      'Clean architecture (domain / data / presentation)',
      'Dependency injection (Awilix)',
      'Monorepos (Lerna, Bun workspaces)',
      'Shared contract packages',
      'Versioned REST APIs and DTO validation',
      'RBAC and permission guards',
      'Deterministic fixtures and disposable schemas',
      'Permission and authority matrices',
      'Visual regression',
      'Sentry',
    ],
  },
  {
    id: 'domain',
    title: 'Domain',
    note: 'The part that takes longest to learn and is hardest to hire for.',
    // The same three kinds of work as the Domain scene's lanes.
    subgroups: [
      {
        title: 'B2B operations',
        items: [
          'Work order management (CMMS, planned maintenance, scheduling and recurrence)',
          'Asset and component hierarchies',
          'Inspections and defect reporting',
          'Procure-to-pay (requisitions, purchase orders, vendors, cost codes)',
          'Multi-tier approvals and spending authority',
          'Multi-tenant B2B SaaS',
          'Inventory',
          'Audit trails',
          'ERP / SAP integration',
        ],
      },
      {
        title: 'B2C health',
        items: ['Health management apps (patient and physician)', 'Client-side encryption of genetic data at rest'],
      },
      {
        title: 'Applied mathematics',
        items: [
          'Agent-based modelling',
          'Support vector machine (SVM) classification',
          'Deterministic and stochastic modelling',
          'Optimal control',
        ],
      },
    ],
  },
  {
    id: 'ai-delivery',
    title: 'AI-assisted delivery',
    note: 'Inside gates written first. The release gate, the permission matrix and the documentation contract all predate the agent work that runs through them.',
    items: [
      'Claude Code, ChatGPT, GitHub Copilot and Antigravity, with agent orchestration',
      'Executable operational runbooks (dry-run defaults, numbered stop conditions, idempotent writes)',
      'Prompt-as-spec',
      'Agent context engineering (CLAUDE.md / AGENTS.md)',
      'Custom skills authoring',
    ],
  },
  {
    id: 'archive',
    title: 'Also used, less recently',
    note: 'Shipped with, would pick up again without ceremony.',
    items: [
      'Python',
      'R',
      'MATLAB',
      'Maple',
      'Wolfram Mathematica',
      'Redux Toolkit',
      'Redux Saga',
      'Drizzle',
      'next-intl',
      'MDX',
      'three.js',
      'GSAP',
      'Firebase',
      'Figma',
    ],
  },
] as const;

export const process = [
  {
    title: 'Written before built',
    detail:
      'Specifications, architecture decision records and acceptance criteria come first, and the decision record outlives the ticket. Named decision owner on the approval ADRs.',
  },
  {
    title: 'Documentation ships with the change',
    detail:
      'Every user-facing change carries its workflow, screen and permission documentation in the same commit. This is a contract now enforced across the repositories, not a habit.',
  },
  {
    title: 'Customer-facing',
    detail:
      'Operating procedures turn into configuration by sitting with the people who run them — operations, purchasing and finance. Most of my product decisions came from those conversations, not from a backlog.',
  },
  {
    title: 'Written-first and remote',
    detail:
      'Four years of distributed delivery across Indonesia and Singapore. Specifications, decision records, runbooks and release notes are how the work is handed over.',
  },
] as const;
