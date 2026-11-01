'use client';

// Client: a hook — React state and effects, used only by client components.

import { useEffect, useRef, type RefObject } from 'react';

/**
 * Calls `onChange` with the closest `selector` ancestor, and again whenever one
 * of its `attributes` changes. A `MutationObserver`, so a scene keeps one scroll
 * listener however many pieces follow its state.
 *
 * `onChange` may change without re-subscribing. Nothing runs while `isEnabled`
 * is false; while `isObserving` is false the scene is read once, not watched.
 */
export function useSceneAttribute(
  elementRef: RefObject<Element | null>,
  selector: string,
  attributes: readonly string[],
  onChange: (scene: Element) => void,
  { isEnabled = true, isObserving = true }: { isEnabled?: boolean; isObserving?: boolean } = {},
): void {
  const callback = useRef(onChange);
  useEffect(() => {
    callback.current = onChange;
  });

  const attributeKey = attributes.join(' ');

  useEffect(() => {
    const scene = elementRef.current?.closest(selector);
    if (!scene || !isEnabled) return;

    const read = () => callback.current(scene);
    read();
    if (!isObserving) return;
    const observer = new MutationObserver(read);
    observer.observe(scene, { attributes: true, attributeFilter: attributeKey.split(' ') });
    return () => observer.disconnect();
  }, [elementRef, selector, attributeKey, isEnabled, isObserving]);
}
