/**
 * Single source of truth for every claim this site publishes.
 *
 * Authority chain, highest first:
 *   1. cv_hanna/2026/Cover_Letter_Master.md  — states it carries the current
 *      numbers and wins any conflict.
 *   2. cv_hanna/2026/LinkedIn_Profile_Pack.md — current public phrasings.
 *   3. cv_hanna/2026/CV_Hanna_2026_Master.md  — the older exact figures. Loses.
 *
 * The current set is the rounded one. The exact set (539 PRs, 1,144 cases,
 * 2,760 decisions, 395 reviews, "three fleets") is not wrong, it is older —
 * which is exactly the kind of thing that gets pasted back in from an old
 * draft, so e2e/content.spec.ts asserts it never reaches the built output.
 *
 * Nothing outside this file states a figure. If a number needs changing it
 * changes here once, and every page that quotes it follows.
 */

export const identity = {
  name: 'Hanna Tiara Andarlia',
  /**
   * Brand line, not role. Brand_and_Headlines.md r14 (9 Sep 2026): the public
   * surface never self-applies "Senior" — a self-awarded adjective is
   * discounted on sight. Seniority is carried by the evidence below instead.
   */
  brandLine: 'Full-Stack Engineer',
  stackLine: 'TypeScript · React Native/Expo · Next.js · NestJS',
  /** Role. Belongs in experience context, never in the headline slot. */
  role: 'Founding Engineer',
  employer: 'Altonaut (PT Alto Nautika Teknologi)',
  employerParent: 'a venture of Wintermar Offshore Marine Group Tbk',
  location: 'Indonesia',
  timezone: 'GMT+7',
  remoteSince: 2021,
  email: 'hannatiara@gmail.com',
  site: 'https://hannatiaraaa.vercel.app',
  github: 'https://github.com/hannatiaraaa',
  linkedin: 'https://www.linkedin.com/in/hanna-tiara-andarlia/',
} as const;

/** The differentiator sentence. Fixed wording — Brand_and_Headlines.md r11. */
export const brandSentence =
  'I started in frontend and learned my way to the end of the pipeline — idea, API, mobile, web, release — by watching how people actually use what I ship.';

export const positioning = {
  /**
   * The market noun, for keyword match — used once per page at most.
   * `surfaces` carries the breadth, because the product is planned maintenance,
   * inventory, certificates and procurement, not one of those.
   */
  domain: 'end-to-end software',
  surfaces: [
    'work orders and planned maintenance',
    'assets and component hierarchies',
    'inspections, defects and certificates',
    'inventory and procure-to-pay',
    'multi-tier approvals and fleet analytics',
  ],
  /** One sentence naming the whole product. Used where the role is introduced. */
  product: 'planned maintenance, inventory and procurement for offshore fleets',
  /** The three surfaces it ships as. */
  productSurfaces: 'an offline tablet app for crews, a back-office web app for shore staff, and a vendor portal',
  proof: 'offshore marine fleets',
  availability: 'Open to full-remote engineering roles',
  overlap: 'comfortable with AU, SG and EU overlap',
} as const;

type Figure = {
  /** The number as it should be rendered. Rounded, with its qualifier. */
  readonly value: string;
  /** What it counts. Sentence case, no trailing period. */
  readonly label: string;
};

/** The four that go above the fold. Ordered by how quickly they land. */
export const headlineFigures: readonly Figure[] = [
  { value: '100+', label: 'vessels running the platform' },
  { value: '1,000+', label: 'merged pull requests' },
  { value: '1,000+', label: 'real users' },
  { value: '6 yrs', label: 'in production software, 5 remote' },
] as const;

export const figures = {
  vessels: '100+',
  customerOrgs: '3',
  mergedPullRequests: '1,000+',
  realUsers: '1,000+',
  reviewsGiven: '500+',
  releaseCases: '1,000+',
  releaseSpecs: '150+',
  permissionChecks: '2,000+',
  guardedRoutes: '130+',
  permissionProfiles: '20+',
  migrationFiles: '~1,100',
  migrationWeeks: '< 4 weeks',
  approvalRebuildWeeks: '< 3 weeks',
  escalations: '100+',
  pentestFindingsClosed: '60%',
  yearsInProduction: '6',
  yearsRemote: '5',
  nativeDefectsResolved: '20+',
  bugReportReduction: '~30%',
  bothAppsReleasedWithin: '6 months',
  designQuestionsResolved: '50+',
  workstreamsOwned: '5+',
  sapDeliveryWeeks: '2 weeks',
  repositories: 'multiple',
  publications: 'two',
} as const;

export const education = {
  degree: 'BSc Mathematics',
  institution: 'Universitas Indonesia',
  years: '2015–2019',
  note: 'applied mathematics',
} as const;

export const publications = [
  {
    title:
      'Classification of the likelihood of Indonesian Facebook users in spreading hoaxes using Support Vector Machine (SVM)',
    venue: 'Journal of Physics: Conference Series',
    year: 2021,
  },
  {
    title: 'An Agent-Based Model of Contagion Effects in Affected Depression and Its Recovery Process',
    venue: 'Journal of Physics: Conference Series',
    year: 2021,
  },
] as const;

/**
 * Figures that were correct in an earlier revision and are now superseded.
 * Exported so the e2e suite can assert none of them reach the built output.
 */
export const supersededFigures: readonly string[] = [
  // Only literals from the previous generation of figures belong here. An entry
  // that is not an old figure catches nothing and costs an assertion; an entry
  // that matches a *current* figure fails the build on a true statement — which
  // is what '130+ guarded' did, because 130+ is the live route count and 138 was
  // the old one.
  '539',
  '1,144',
  '1144',
  '191 specs',
  '2,760',
  '2760',
  '138 guarded',
  '395',
  '899',
  '32 open design questions',
  '19 tickets',
  'three fleets',
  'three customer fleets',
] as const;
