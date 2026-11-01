/**
 * Fails the gate when the JavaScript a visitor downloads outgrows the budget in
 * docs/guidelines.md: shared First Load JS ≤ 110 kB, and no route more than
 * 15 kB over shared.
 *
 * Measured the way `next build`'s size table is, so the two agree to the kB:
 *   - `.next/app-build-manifest.json` lists the chunks each app entry loads.
 *   - Shared = the chunks every entry loads. A route = its own entry's chunks;
 *     the root layout's entry is not added on top (Next's table leaves it out).
 *   - Each chunk is gzipped at level 9, and kB is 1000 bytes.
 *
 * Reading the manifest rather than build stdout survives table format changes.
 * Run after `next build`: `bun run check:budget`.
 */

import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';

const SHARED_BUDGET_KB = 110;
const ROUTE_HEADROOM_KB = 15;
const GZIP_LEVEL = 9;
const BYTES_PER_KB = 1000;

const DIST = join(import.meta.dir, '..', '.next');
const LAYOUT_ENTRY = '/layout';

type AppBuildManifest = { pages: Record<string, string[]> };

function isAppBuildManifest(value: unknown): value is AppBuildManifest {
  if (typeof value !== 'object' || value === null || !('pages' in value)) return false;
  const { pages } = value;
  return (
    typeof pages === 'object' &&
    pages !== null &&
    Object.values(pages).every((files) => Array.isArray(files) && files.every((file) => typeof file === 'string'))
  );
}

function readManifest(): AppBuildManifest {
  const path = join(DIST, 'app-build-manifest.json');
  let parsed: unknown;
  try {
    parsed = JSON.parse(readFileSync(path, 'utf8'));
  } catch {
    throw new Error(`Could not read ${path}. Run \`bun run build\` first.`);
  }
  if (!isAppBuildManifest(parsed)) throw new Error(`${path} is not the shape this script expects.`);
  return parsed;
}

const gzipCache = new Map<string, number>();

function gzippedBytes(file: string): number {
  const cached = gzipCache.get(file);
  if (cached !== undefined) return cached;
  const bytes = gzipSync(readFileSync(join(DIST, file)), { level: GZIP_LEVEL }).byteLength;
  gzipCache.set(file, bytes);
  return bytes;
}

function totalKb(files: Iterable<string>): number {
  let bytes = 0;
  for (const file of files) bytes += gzippedBytes(file);
  return bytes / BYTES_PER_KB;
}

function jsOnly(files: readonly string[]): string[] {
  return files.filter((file) => file.endsWith('.js'));
}

/** `/work/[slug]/page` → `/work/[slug]`, the way the build table names routes. */
function routeName(entry: string): string {
  const trimmed = entry.replace(/\/(page|route)$/, '');
  return trimmed === '' ? '/' : trimmed;
}

function main(): void {
  const { pages } = readManifest();
  const entries = Object.entries(pages).filter(([entry]) => entry !== LAYOUT_ENTRY);

  const entryFiles = entries.map(([, files]) => new Set(jsOnly(files)));
  const shared = [...(entryFiles[0] ?? [])].filter((file) => entryFiles.every((files) => files.has(file)));
  const sharedKb = totalKb(shared);
  const routeLimitKb = sharedKb + ROUTE_HEADROOM_KB;

  const failures: string[] = [];
  if (sharedKb > SHARED_BUDGET_KB) {
    failures.push(`shared First Load JS ${sharedKb.toFixed(1)} kB > ${SHARED_BUDGET_KB} kB`);
  }

  const rows = entries
    .map(([entry, files]) => ({
      route: routeName(entry),
      kb: totalKb(new Set(jsOnly(files))),
    }))
    .sort((a, b) => a.route.localeCompare(b.route));

  for (const row of rows) {
    if (row.kb > routeLimitKb) {
      failures.push(
        `${row.route} ${row.kb.toFixed(1)} kB > ${routeLimitKb.toFixed(1)} kB (shared + ${ROUTE_HEADROOM_KB})`,
      );
    }
  }

  const width = Math.max(...rows.map((row) => row.route.length));
  console.log(
    `First Load JS (gzip) — budget: shared ≤ ${SHARED_BUDGET_KB} kB, route ≤ shared + ${ROUTE_HEADROOM_KB} kB`,
  );
  for (const row of rows) console.log(`  ${row.route.padEnd(width)}  ${row.kb.toFixed(1).padStart(6)} kB`);
  console.log(`  ${'shared by all'.padEnd(width)}  ${sharedKb.toFixed(1).padStart(6)} kB`);

  if (failures.length > 0) {
    console.error('\nBudget exceeded:');
    for (const failure of failures) console.error(`  ${failure}`);
    process.exit(1);
  }
  console.log('\nWithin budget.');
}

main();
