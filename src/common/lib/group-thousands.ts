const THOUSANDS_SEPARATOR = ',';
const DIGITS_PER_GROUP = 3;

/** An integer with comma-grouped thousands, the way the site prints figures: `1,040`. */
export function groupThousands(integer: number): string {
  const digits = String(Math.abs(integer));
  const groups: string[] = [];
  for (let end = digits.length; end > 0; end -= DIGITS_PER_GROUP) {
    groups.unshift(digits.slice(Math.max(0, end - DIGITS_PER_GROUP), end));
  }
  return `${integer < 0 ? '-' : ''}${groups.join(THOUSANDS_SEPARATOR)}`;
}
