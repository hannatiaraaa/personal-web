import { FlatCompat } from '@eslint/eslintrc';

const compat = new FlatCompat({ baseDirectory: import.meta.dirname });

const config = [
  ...compat.extends('next/core-web-vitals', 'next/typescript'),
  {
    // .claude/ holds agent worktrees: whole checkouts with their own .next builds.
    ignores: ['.next/**', 'node_modules/**', 'playwright-report/**', 'test-results/**', 'next-env.d.ts', '.claude/**'],
  },
];

export default config;
