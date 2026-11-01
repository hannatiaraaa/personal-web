import { describeCaseStudyPart } from '@/modules/work/lib/case-study-parts';

/**
 * A drawing of the mechanism for a case study that has no interactive. A study
 * with an interactive is drawn from the frame its piece ends on instead.
 */
export type StillKind = 'approval-ladder';

/** The fields the home story reads off a case study. */
type StoryStudy<Interactive extends string> = {
  readonly slug: string;
  readonly interactive?: Interactive;
  readonly still?: StillKind;
};

/** Where a story step sends the reader, and whether it is to run something or to read. */
export type StoryAction<Interactive extends string> =
  | { readonly kind: 'try'; readonly interactive: Interactive; readonly href: string }
  | { readonly kind: 'read'; readonly href: string };

/** Interactives are drawn in this part, so a "try it" opens the study there. */
const INTERACTIVE_PART_ID = describeCaseStudyPart('actually').id;

/**
 * The studies the home story tells: each one with a mechanism that can be shown
 * in one frame — an interactive's last frame or a still — in content order. A
 * step is a picture, so a study with nothing to draw is left to the index.
 */
export function pickStoryStudies<Interactive extends string, Study extends StoryStudy<Interactive>>(
  studies: readonly Study[],
): readonly Study[] {
  return studies.filter((study) => study.interactive !== undefined || study.still !== undefined);
}

/** The one link a story step carries. */
export function storyAction<Interactive extends string>(study: StoryStudy<Interactive>): StoryAction<Interactive> {
  if (study.interactive !== undefined) {
    return { kind: 'try', interactive: study.interactive, href: `/work/${study.slug}#${INTERACTIVE_PART_ID}` };
  }
  return { kind: 'read', href: `/work/${study.slug}` };
}
