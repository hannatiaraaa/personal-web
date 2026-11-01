/**
 * Shared frame for mechanism diagrams: product screenshots cannot be published,
 * and the mechanism is the part worth showing.
 *
 * The SVG is `role="img"` with a text description, so a screen reader gets the
 * finding, not shapes; the scroll container is focusable so a narrow screen's
 * hidden half is reachable by keyboard. Groups marked `data-diagram-stage` (1–4)
 * build in on a view timeline set on the scroll container (`scrolly-work.css`),
 * whose subject is only the drawing. Without view timelines, or under reduced
 * motion, the diagram is whole.
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
    <figure className='border-line bg-surface my-8 rounded-lg border p-4 sm:p-6'>
      <div
        tabIndex={0}
        role='group'
        aria-label={`Diagram: ${title}`}
        className='diagram-scroll overflow-x-auto'
      >
        <svg
          viewBox={viewBox}
          role='img'
          aria-label={description}
          className='h-auto w-full min-w-[38rem]'
          fill='none'
        >
          {children}
        </svg>
      </div>
      <figcaption className='text-meta text-ink-muted mt-4'>{title}</figcaption>
    </figure>
  );
}
