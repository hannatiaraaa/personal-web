import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { PIN_MIN_WIDTH_REM, PIN_QUERY, fitsPin } from './media-queries';

const REM_PX = 16;

describe('PIN_QUERY', () => {
  test('is the `pin` variant in globals.css, word for word', () => {
    const css = readFileSync(join(import.meta.dir, '../../styles/globals.css'), 'utf8');
    const variant = /@custom-variant pin \{\s*@media ([^{]+)\{/.exec(css)?.[1]?.trim();
    expect(variant).toBe(PIN_QUERY);
  });

  test('asks for the width the fit rule names, and nothing about height', () => {
    expect(PIN_QUERY).toBe(`(min-width: ${PIN_MIN_WIDTH_REM}rem)`);
  });
});

describe('fitsPin', () => {
  test('pins every laptop and desktop width, a landscape tablet included', () => {
    expect(fitsPin(1024)).toBe(true);
    expect(fitsPin(1280)).toBe(true);
    expect(fitsPin(1440)).toBe(true);
    expect(fitsPin(2000)).toBe(true);
  });

  test('does not pin a landscape phone, a portrait tablet or a phone', () => {
    expect(fitsPin(844)).toBe(false);
    expect(fitsPin(768)).toBe(false);
    expect(fitsPin(390)).toBe(false);
  });

  test('agrees with the query at its edge', () => {
    const width = PIN_MIN_WIDTH_REM * REM_PX;
    expect(fitsPin(width)).toBe(true);
    expect(fitsPin(width - 1)).toBe(false);
  });
});
