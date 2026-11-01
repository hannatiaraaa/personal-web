'use client';

// Client: a hook — React state and document listeners, used only by client components.

import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * A button that shows and hides a panel. Escape closes it and puts focus back
 * on the button; a press outside both closes it; and so does `resetKey`
 * changing — the pathname, so a menu does not stay open over the next page.
 */
export function useDisclosure<Trigger extends HTMLElement, Panel extends HTMLElement>(resetKey: string) {
  const [isOpen, setIsOpen] = useState(false);
  const [openedAt, setOpenedAt] = useState(resetKey);
  const triggerRef = useRef<Trigger>(null);
  const panelRef = useRef<Panel>(null);

  // Adjusted during render rather than in an effect, so the next page never paints with it open.
  if (openedAt !== resetKey) {
    setOpenedAt(resetKey);
    setIsOpen(false);
  }

  useEffect(() => {
    if (!isOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      setIsOpen(false);
      triggerRef.current?.focus();
    };
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (panelRef.current?.contains(target) || triggerRef.current?.contains(target)) return;
      setIsOpen(false);
    };

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('pointerdown', onPointerDown);
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('pointerdown', onPointerDown);
    };
  }, [isOpen]);

  const toggle = useCallback(() => setIsOpen((open) => !open), []);

  return { isOpen, toggle, triggerRef, panelRef };
}
