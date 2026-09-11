import { GeistMono } from 'geist/font/mono';
import { GeistSans } from 'geist/font/sans';

/**
 * Geist, self-hosted from the package rather than fetched from Google. The font
 * files ship with the build, so there is no third-party connection on first
 * paint and no layout shift waiting on one.
 *
 * Chosen over Instrument Sans for the same reason Apple's own interface type
 * works: it is neutral enough to disappear at body size and precise enough to
 * hold a 4.5rem display line without looking soft. The mono carries every
 * figure and legend.
 */
export const sans = GeistSans;
export const mono = GeistMono;
