import { IBM_Plex_Mono, Instrument_Sans } from 'next/font/google';

/**
 * Instrument Sans for text, IBM Plex Mono for figures and legends.
 * Inter was the previous choice and is the most defaulted typeface on the web;
 * Plex Mono carries an engineering provenance that suits a page about
 * operations software better than a code font people recognise from an editor.
 */
export const sans = Instrument_Sans({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-instrument-sans',
});

export const mono = IBM_Plex_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  display: 'swap',
  variable: '--font-plex-mono',
});
