/**
 * A published figure split around its one integer: `~1,100` is `~` + 1100 + ``.
 * `isGrouped` records whether the original wrote a thousands separator, so the
 * figure can be written back exactly as published.
 */
export type FigureParts = {
  readonly prefix: string;
  readonly integer: number;
  readonly suffix: string;
  readonly isGrouped: boolean;
};

const THOUSANDS_SEPARATOR = ',';

/** An integer, either plain or grouped in threes by commas. */
const INTEGER = /\d{1,3}(?:,\d{3})+(?!\d)|\d+/g;
/** A digit either side of a decimal point. */
const DECIMAL = /\d\.\d|\.\d/;

/**
 * Splits a figure into prefix, integer and suffix, or returns null when it does
 * not have exactly one integer — a word, a range, a decimal. Null means "render
 * as written": a counter that lands on the wrong number is worse than none.
 */
export function parseFigure(value: string): FigureParts | null {
  if (DECIMAL.test(value)) return null;

  const matches = [...value.matchAll(INTEGER)];
  const [match] = matches;
  if (matches.length !== 1 || match === undefined) return null;

  const digits = match[0];
  const start = match.index;
  return {
    prefix: value.slice(0, start),
    integer: Number(digits.replaceAll(THOUSANDS_SEPARATOR, '')),
    suffix: value.slice(start + digits.length),
    isGrouped: digits.includes(THOUSANDS_SEPARATOR),
  };
}

/**
 * Counting stops below the first thousands separator. A CSS counter prints
 * digits without grouping, so `1,000+` would land as `1000+` — not the published
 * figure. Those render as written instead.
 */
const COUNTABLE_BELOW = 1000;

/**
 * A single digit has nothing to count through but wrong figures: `2 weeks`
 * passes through `1 weeks`, and a reader who stops scrolling there reads it.
 */
const COUNTABLE_FROM = 10;

/** Whether a figure can count up and land exactly on its published form. */
export function isCountable(parts: FigureParts): boolean {
  return !parts.isGrouped && parts.integer >= COUNTABLE_FROM && parts.integer < COUNTABLE_BELOW;
}
