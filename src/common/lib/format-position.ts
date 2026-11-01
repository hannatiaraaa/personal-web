const POSITION_DIGITS = 2;

/** A zero-based index as the reader counts it: from one, in two digits ("01"). */
export function formatPosition(index: number): string {
  return String(index + 1).padStart(POSITION_DIGITS, '0');
}
