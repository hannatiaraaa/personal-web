/**
 * A case-study part's heading. An `h2`, so a screen-reader user can reach every
 * part by heading; it takes focus when the part indicator jumps to it
 * (`tabIndex={-1}`, never in the tab order), which is what moves the indicator.
 */
export function PartHeading({ id, legend }: { id: string; legend: string }) {
  return (
    <h2
      id={id}
      tabIndex={-1}
      className='legend case-study-part-heading'
    >
      {legend}
    </h2>
  );
}
