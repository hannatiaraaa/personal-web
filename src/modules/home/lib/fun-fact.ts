/** The fact after `current`, coming back round to the first after the last. */
export function nextFactIndex(current: number, count: number): number {
  if (count <= 0) return 0;
  return (current + 1) % count;
}
