/**
 * Media queries a script needs to agree with the stylesheet on.
 *
 * `PIN_QUERY` is the `pin` variant in globals.css (media-queries.test.ts holds
 * the two together). A pinned scene holds its visual beside its steps, so it
 * needs a wide screen. Width alone decides: phones and tablets come in standard
 * widths, while a desktop window's height moves with its toolbars and a docked
 * DevTools, so every pinned frame is sized from the height it has and scales
 * its drawing to fit there instead.
 */
export const PIN_MIN_WIDTH_REM = 64;
export const PIN_QUERY = `(min-width: ${PIN_MIN_WIDTH_REM}rem)`;
export const REDUCED_MOTION_QUERY = '(prefers-reduced-motion: reduce)';
export const DARK_SCHEME_QUERY = '(prefers-color-scheme: dark)';

const REM_PX = 16;

/** `PIN_QUERY` for a viewport width in CSS pixels, for a script or a test that has the size rather than a `matchMedia`. */
export function fitsPin(width: number): boolean {
  return width >= PIN_MIN_WIDTH_REM * REM_PX;
}
