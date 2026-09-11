# AGENTS.md

Personal site and portfolio for Hanna Tiara Andarlia. Next.js 15 App Router, React 19, Tailwind v4, TypeScript strict, Bun.

**Read [`docs/guidelines.md`](docs/guidelines.md) before writing code here.** It is short and it is binding.

The three rules that catch most mistakes:

1. **Three layers, never mixed.** `lib/` is pure logic (no React, no DOM). `hooks/` is React state (no JSX). `views/` and `components/` are markup (no maths, no rules). Dependencies point view → hook → lib.
2. **`app/**/page.tsx` composes, it does not render.** Metadata and a list of section views. The markup lives in `src/modules/<area>/views/`.
3. **Server by default.** `'use client'` needs a stated reason in a comment, and the boundary is pushed as far down as it goes.

Content and every published figure come from `src/content/`. Nothing else states a number — see `.claude/skills/portfolio-voice`.

Budget: shared First Load JS ≤ 110 kB. Anything heavy is `next/dynamic`, viewport-gated, with a static placeholder.

```bash
bun run dev    # http://localhost:3000
bun run gate   # format:check → lint → typecheck → build → test:unit → test:e2e
```

Never push, never merge to `main`, never deploy.
