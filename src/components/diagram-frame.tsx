/**
 * Shared frame for mechanism diagrams. Product screenshots cannot be published;
 * the mechanism can be drawn from scratch, and the mechanism is the part worth
 * showing anyway.
 *
 * Colours come from theme tokens so both themes stay legible. The SVG is
 * role="img" with a text description, so a screen reader gets the finding
 * rather than a list of shapes — and the scroll container is focusable, because
 * on a narrow screen the right-hand half is otherwise unreachable by keyboard.
 */

export const diagramLabel = 'font-mono text-[11px]';

type Props = {
  title: string;
  description: string;
  viewBox: string;
  children: React.ReactNode;
};

export function DiagramFrame({ title, description, viewBox, children }: Props) {
  return (
    <figure
      tabIndex={0}
      role="group"
      aria-label={`Diagram: ${title}`}
      className="my-8 overflow-x-auto rounded-lg border border-line bg-surface p-4 sm:p-6"
    >
      <svg viewBox={viewBox} role="img" aria-label={description} className="h-auto w-full min-w-[38rem]" fill="none">
        {children}
      </svg>
      <figcaption className="mt-4 text-meta text-ink-muted">{title}</figcaption>
    </figure>
  );
}
