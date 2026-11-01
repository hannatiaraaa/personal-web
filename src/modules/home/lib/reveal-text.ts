export type RevealChar = { readonly char: string; readonly index: number };

export type RevealWord = {
  readonly text: string;
  /** Position among the words, for a word-by-word reveal. */
  readonly index: number;
  readonly chars: readonly RevealChar[];
};

export type RevealText = {
  readonly words: readonly RevealWord[];
  /** Characters to type; spaces are not typed, they sit between words. */
  readonly charCount: number;
  readonly wordCount: number;
};

/**
 * A sentence cut into words and characters for a typed or word-by-word reveal.
 *
 * Characters are numbered across the whole sentence, so a reveal driven by one
 * number runs on from word to word. Words stay whole units so a line only
 * breaks between them. Split by code point, so a character outside the basic
 * plane is never cut in half.
 */
export function splitForReveal(text: string): RevealText {
  let charIndex = 0;
  const words = text
    .split(/\s+/)
    .filter((word) => word.length > 0)
    .map((word, index) => ({
      text: word,
      index,
      chars: Array.from(word, (char) => ({ char, index: charIndex++ })),
    }));

  return { words, charCount: charIndex, wordCount: words.length };
}
