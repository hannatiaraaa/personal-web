import { describe, expect, test } from 'bun:test';
import { splitForReveal } from './reveal-text';

describe('splitForReveal', () => {
  test('splits a sentence into its words, in order', () => {
    const { words } = splitForReveal('Records keep reverting.');

    expect(words.map((word) => word.text)).toEqual(['Records', 'keep', 'reverting.']);
  });

  test('numbers characters across the whole sentence, so typing runs on from word to word', () => {
    const { words } = splitForReveal('ab cd');

    expect(words.flatMap((word) => word.chars.map((char) => char.index))).toEqual([0, 1, 2, 3]);
  });

  test('counts characters without the spaces, which are never typed', () => {
    const result = splitForReveal('Records keep reverting.');

    expect(result.charCount).toBe(21);
    expect(result.wordCount).toBe(3);
  });

  test('treats a run of whitespace as one gap and ignores leading and trailing space', () => {
    const { words } = splitForReveal('  one \n  two  ');

    expect(words.map((word) => word.text)).toEqual(['one', 'two']);
    expect(words.map((word) => word.index)).toEqual([0, 1]);
  });

  test('keeps a character outside the basic plane whole, rather than splitting it into halves', () => {
    const { words, charCount } = splitForReveal('a𝑥');

    expect(words[0]?.chars.map((char) => char.char)).toEqual(['a', '𝑥']);
    expect(charCount).toBe(2);
  });

  test('an empty sentence has no words and nothing to type', () => {
    expect(splitForReveal('   ')).toEqual({ words: [], charCount: 0, wordCount: 0 });
  });
});
