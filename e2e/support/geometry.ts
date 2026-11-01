import type { Page } from '@playwright/test';

/**
 * Layout faults a reader sees but a scroll-width check can miss: `overflow-x:
 * clip` on an ancestor hides real overflow from `scrollWidth`, so every box is
 * measured against the viewport and against each ancestor that clips it.
 *
 * Returns one line per fault, empty when the page is sound. Runs in the page.
 */
export async function findLayoutFaults(page: Page): Promise<string[]> {
  return page.evaluate(() => {
    /** Sub-pixel rounding differs by engine; a fault is a whole pixel or more. */
    const TOLERANCE = 1;
    /** A glyph's side bearing can sit a pixel past its box in Firefox without any ink being cut. */
    const CLIP_TOLERANCE = 2;
    /** Overlap smaller than this is line boxes kissing, not one box on another. */
    const MIN_OVERLAP = 8;
    /** Cards closer than this read as one block. */
    const MIN_CARD_GAP = 8;

    const faults: string[] = [];
    const viewport = document.documentElement.clientWidth;

    const describe = (element: Element): string => {
      const id = element.id ? `#${element.id}` : '';
      const classes = [...element.classList].slice(0, 3).join('.');
      const text = (element.textContent ?? '').trim().replace(/\s+/g, ' ').slice(0, 40);
      return `${element.tagName.toLowerCase()}${id}${classes ? `.${classes}` : ''} "${text}"`;
    };

    const isRendered = (element: Element): boolean => {
      const rect = element.getBoundingClientRect();
      if (rect.width <= TOLERANCE || rect.height <= TOLERANCE) return false;
      return element.checkVisibility({ visibilityProperty: true, opacityProperty: false });
    };

    /** Carries text of its own, as opposed to a wrapper around text-bearing children. */
    const hasOwnText = (element: Element): boolean =>
      [...element.childNodes].some((node) => node.nodeType === Node.TEXT_NODE && node.textContent?.trim());

    const clipsX = (style: CSSStyleDeclaration): boolean => style.overflowX === 'hidden' || style.overflowX === 'clip';
    const scrollsX = (style: CSSStyleDeclaration): boolean =>
      style.overflowX === 'auto' || style.overflowX === 'scroll';

    if (document.documentElement.scrollWidth > window.innerWidth) {
      faults.push(`page scrolls sideways: ${document.documentElement.scrollWidth} > ${window.innerWidth}`);
    }

    for (const element of document.body.querySelectorAll('*')) {
      if (!hasOwnText(element) || !isRendered(element)) continue;
      const rect = element.getBoundingClientRect();
      const style = getComputedStyle(element);

      // Text inside a scroll container is reachable by scrolling it.
      let inScroller = false;
      for (let parent = element.parentElement; parent && parent !== document.body; parent = parent.parentElement) {
        const parentStyle = getComputedStyle(parent);
        if (scrollsX(parentStyle)) {
          inScroller = true;
          break;
        }
        if (clipsX(parentStyle)) {
          const box = parent.getBoundingClientRect();
          // Wholly outside is a mask holding text back until it reveals; cut is straddling the edge.
          const isStraddling = rect.right > box.left && rect.left < box.right;
          const isCut = rect.right > box.right + CLIP_TOLERANCE || rect.left < box.left - CLIP_TOLERANCE;
          if (isStraddling && isCut) faults.push(`clipped by ${describe(parent)}: ${describe(element)}`);
        }
      }
      if (inScroller) continue;

      if (rect.right > viewport + TOLERANCE || rect.left < -TOLERANCE) {
        faults.push(
          `outside the viewport (${Math.round(rect.left)}–${Math.round(rect.right)} of ${viewport}): ${describe(element)}`,
        );
      }

      if (clipsX(style) && style.textOverflow !== 'ellipsis' && element.scrollWidth > element.clientWidth + TOLERANCE) {
        faults.push(`text cut off: ${describe(element)}`);
      }
    }

    // Siblings in flow must not sit on top of each other. Laid over on purpose
    // (absolutely placed, stacked in one grid cell, or moved by a transform
    // mid-story) is not in flow; SVG scenes place their own text.
    const moved = new Map<Element, boolean>();
    /** Mid-choreography: it or an ancestor is transformed, so its box is not where it rests. */
    const isMoved = (element: Element | null): boolean => {
      if (!element || element === document.body) return false;
      const known = moved.get(element);
      if (known !== undefined) return known;
      const style = getComputedStyle(element);
      const isTransformed = [style.transform, style.translate, style.rotate, style.scale].some(
        (value) => value !== 'none',
      );
      const result = isTransformed || isMoved(element.parentElement);
      moved.set(element, result);
      return result;
    };
    const isInFlow = (element: Element): boolean => {
      if (!(element instanceof HTMLElement)) return false;
      if (!element.checkVisibility({ opacityProperty: true, visibilityProperty: true })) return false;
      const style = getComputedStyle(element);
      const isStacked = style.gridRowStart !== 'auto' || style.gridColumnStart !== 'auto';
      const isPlaced = style.position === 'absolute' || style.position === 'fixed';
      return !isPlaced && !isStacked && !isMoved(element) && isRendered(element);
    };
    for (const parent of document.body.querySelectorAll('*')) {
      const children = [...parent.children].filter(isInFlow);
      const fragments = children.map((child) => [...child.getClientRects()]);
      for (const [index, a] of children.entries()) {
        for (const [offset, b] of children.slice(index + 1).entries()) {
          const overlaps = fragments[index]!.some((ra) =>
            fragments[index + 1 + offset]!.some((rb) => {
              const width = Math.min(ra.right, rb.right) - Math.max(ra.left, rb.left);
              const height = Math.min(ra.bottom, rb.bottom) - Math.max(ra.top, rb.top);
              return width > MIN_OVERLAP && height > MIN_OVERLAP;
            }),
          );
          if (overlaps) faults.push(`siblings overlap: ${describe(a)} / ${describe(b)}`);
        }
      }
    }

    // Two cards side by side or stacked must not touch or overlap.
    const cards = [...document.querySelectorAll('.card')].filter(isRendered);
    for (const [index, a] of cards.entries()) {
      for (const b of cards.slice(index + 1)) {
        if (a.contains(b) || b.contains(a)) continue;
        const ra = a.getBoundingClientRect();
        const rb = b.getBoundingClientRect();
        const overlapX = Math.min(ra.right, rb.right) - Math.max(ra.left, rb.left);
        const overlapY = Math.min(ra.bottom, rb.bottom) - Math.max(ra.top, rb.top);
        if (overlapX > 0 && overlapY > -MIN_CARD_GAP) {
          faults.push(`cards ${Math.round(-overlapY)}px apart: ${describe(a)} / ${describe(b)}`);
        } else if (overlapY > 0 && overlapX > -MIN_CARD_GAP) {
          faults.push(`cards ${Math.round(-overlapX)}px apart: ${describe(a)} / ${describe(b)}`);
        }
      }
    }

    // One h1, and no level skipped on the way down.
    const headings = [...document.querySelectorAll('h1, h2, h3, h4, h5, h6')].filter((heading) =>
      heading.checkVisibility(),
    );
    const levels = headings.map((heading) => Number(heading.tagName.slice(1)));
    if (levels.filter((level) => level === 1).length !== 1) faults.push(`expected one h1, found ${levels.join(',')}`);
    for (const [index, level] of levels.entries()) {
      const previous = levels[index - 1] ?? 0;
      if (level > previous + 1) faults.push(`heading skips h${previous} to h${level}: ${describe(headings[index]!)}`);
    }

    return faults;
  });
}

/** The smallest a control may be where the pointer is a finger (WCAG 2.5.5). */
const MIN_TAP_TARGET = 44;

/**
 * Controls a finger reaches for that are smaller than 44px. Links inside
 * running text are exempt (WCAG 2.5.8), so only standalone controls count. A
 * control's target is its box grown by an absolutely placed `::before` or
 * `::after` (the hit-area pattern), and an input's is its label's.
 */
export async function findSmallTapTargets(page: Page, scope = 'body'): Promise<string[]> {
  return page.evaluate(
    ({ min, scope }) => {
      const TOLERANCE = 1;
      const CONTROL = ':is(button, a, summary, [role="button"], input, select)';
      const controls = document.querySelectorAll(`:is(${scope})${CONTROL}, :is(${scope}) ${CONTROL}`);

      const px = (value: string): number => (value.endsWith('px') ? Number.parseFloat(value) : 0);
      const targetOf = (control: Element) => {
        const owner = control instanceof HTMLInputElement ? (control.closest('label') ?? control) : control;
        const rect = owner.getBoundingClientRect();
        let { width, height } = rect;
        for (const pseudo of ['::before', '::after']) {
          const style = getComputedStyle(owner, pseudo);
          if (style.content === 'none' || style.position !== 'absolute') continue;
          width = Math.max(width, rect.width - px(style.left) - px(style.right));
          height = Math.max(height, rect.height - px(style.top) - px(style.bottom));
        }
        return { width, height };
      };

      const small: string[] = [];
      for (const control of controls) {
        if (!control.checkVisibility({ visibilityProperty: true })) continue;
        if (control.closest('p, .prose-page, dd, td, blockquote')) continue;
        const rect = control.getBoundingClientRect();
        if (rect.width <= TOLERANCE || rect.height <= TOLERANCE) continue;
        const target = targetOf(control);
        if (target.width < min - TOLERANCE || target.height < min - TOLERANCE) {
          const name = control.getAttribute('aria-label') ?? control.textContent?.trim().slice(0, 30);
          small.push(
            `${control.tagName.toLowerCase()} "${name}" ${Math.round(target.width)}×${Math.round(target.height)}`,
          );
        }
      }
      return small;
    },
    { min: MIN_TAP_TARGET, scope },
  );
}

/**
 * The first `stops` keyboard stops that show no focus indicator: no outline
 * and no ring drawn as a box shadow, on the element or its `:focus-visible`
 * pseudo-state as the engine computes it.
 */
export async function findFocusWithoutIndicator(page: Page, key: string, stops: number): Promise<string[]> {
  const missing: string[] = [];
  for (let stop = 0; stop < stops; stop += 1) {
    await page.keyboard.press(key);
    const fault = await page.evaluate(() => {
      const active = document.activeElement;
      // The dev server's overlay takes a stop of its own; it never ships.
      if (!active || active === document.body || active.tagName === 'NEXTJS-PORTAL') return null;
      const style = getComputedStyle(active);
      const hasOutline = style.outlineStyle !== 'none' && Number.parseFloat(style.outlineWidth) > 0;
      const hasRing = style.boxShadow !== 'none';
      if (hasOutline || hasRing) return null;
      const name = active.getAttribute('aria-label') ?? active.textContent?.trim().slice(0, 30);
      return `${active.tagName.toLowerCase()} "${name}"`;
    });
    if (fault) missing.push(fault);
  }
  return missing;
}

/** The visuals a scroll story holds still; each is sticky only where its story pins. */
export const SCENE_VISUALS = [
  '.hero-intro-stage',
  '.scrolly-visual',
  '.draft-sync-frame',
  '.gate-run-frame',
  '.tax-ladder-sticky',
  '.stack-story-visual',
].join(', ');

export type SceneFit = {
  /** Visuals that are `position: sticky` on this screen. */
  readonly sticky: string[];
  /** One line per visual held still but cut by the screen, or hidden under a sticky bar. */
  readonly faults: string[];
};

/**
 * Where the page is scrolled now: which scene visuals are sticky, and whether
 * any that is held still is cut by the bottom of the screen or sits under the
 * header or the case-study part bar. Runs in the page.
 */
export async function measureSceneFit(page: Page): Promise<SceneFit> {
  return page.evaluate((selector) => {
    const TOLERANCE = 1;
    const describe = (element: Element): string =>
      `${element.tagName.toLowerCase()}.${[...element.classList].join('.')}`;

    // Everything sticky above the content: the header, and the part bar where it spans the column.
    let offset = 0;
    const header = document.querySelector('body > header, header');
    if (header) offset = header.getBoundingClientRect().bottom;
    const bar = document.querySelector('.part-nav');
    if (bar && getComputedStyle(bar).position === 'sticky') {
      const rect = bar.getBoundingClientRect();
      const isBar = rect.width > window.innerWidth / 2;
      const isStuck = Math.abs(rect.top - offset) <= TOLERANCE;
      if (isBar && isStuck) offset = rect.bottom;
    }

    const sticky: string[] = [];
    const faults: string[] = [];
    for (const element of document.querySelectorAll(selector)) {
      const style = getComputedStyle(element);
      if (style.position !== 'sticky' || !element.checkVisibility()) continue;
      sticky.push(describe(element));
      const rect = element.getBoundingClientRect();
      // Held still is resting at its sticky top; before and after that it scrolls like anything else.
      const isHeld = Math.abs(rect.top - Number.parseFloat(style.top)) <= TOLERANCE;
      if (!isHeld) continue;
      // The hero's stage starts under the translucent header by design; its content is padded clear of it.
      const content = element.matches('.hero-intro-stage') ? element.querySelector('.hero-intro-content') : element;
      const target = content ?? element;
      const box = target.getBoundingClientRect();
      // Content spilling out of a box that does not scroll is cut just the same.
      const spills = getComputedStyle(target).overflowY === 'visible';
      const bottom = spills ? box.top + Math.max(box.height, target.scrollHeight) : box.bottom;
      if (box.top < offset - TOLERANCE) {
        faults.push(`${describe(element)} under the sticky bars: top ${Math.round(box.top)} < ${Math.round(offset)}`);
      }
      if (bottom > window.innerHeight + TOLERANCE) {
        faults.push(`${describe(element)} cut by the screen: bottom ${Math.round(bottom)} > ${window.innerHeight}`);
      }
    }
    return { sticky, faults };
  }, SCENE_VISUALS);
}

export type VisualFit = {
  /** Whether the scene's visual is `position: sticky`. */
  readonly isSticky: boolean;
  /** Whether it rests at its sticky top: held still while the scene scrolls. */
  readonly isHeld: boolean;
  /** The scene's scroll state: its beat, its active step and its progress. */
  readonly signal: string;
  /** One line per part of the visual cut by the screen, hidden under a sticky bar, or cropped by its frame. */
  readonly faults: string[];
};

/**
 * One scene's held visual, where the page is scrolled now: whether it pins,
 * and whether all of it, down to its drawing, its log and its controls, sits
 * below the sticky bars and above the bottom of the screen. A part that scrolls
 * inside its own column counts as that column. Runs in the page.
 */
export async function measureVisualFit(page: Page, scene: string, visual: string): Promise<VisualFit> {
  return page.evaluate(
    ({ scene, visual }) => {
      const TOLERANCE = 1;
      const PARTS = 'svg, canvas, button, h2, h3, h4, p, li, figcaption, table, [role="group"], [role="img"]';
      const describe = (element: Element): string =>
        `${element.tagName.toLowerCase()}.${[...element.classList].slice(0, 2).join('.')}`;

      const sceneElement = document.querySelector(scene);
      if (!(sceneElement instanceof HTMLElement)) return { isSticky: false, isHeld: false, signal: '', faults: [] };
      const signal = [
        sceneElement.dataset.beat ?? '',
        sceneElement.dataset.activeStep ?? '',
        sceneElement.style.getPropertyValue('--progress'),
      ].join('|');

      const element = sceneElement.querySelector(visual) ?? (sceneElement.matches(visual) ? sceneElement : null);
      if (!element) return { isSticky: false, isHeld: false, signal, faults: [`no ${visual} in ${scene}`] };
      const style = getComputedStyle(element);
      const isSticky = style.position === 'sticky';
      const rect = element.getBoundingClientRect();
      const isHeld = isSticky && Math.abs(rect.top - Number.parseFloat(style.top)) <= TOLERANCE;

      // Everything sticky above the content: the header, and the part bar where it spans the column.
      let offset = document.querySelector('header')?.getBoundingClientRect().bottom ?? 0;
      const bar = document.querySelector('.part-nav');
      if (bar && getComputedStyle(bar).position === 'sticky') {
        const box = bar.getBoundingClientRect();
        if (box.width > window.innerWidth / 2 && Math.abs(box.top - offset) <= TOLERANCE) offset = box.bottom;
      }

      // The hero's stage starts under the translucent header by design; its content is padded clear of it.
      const root = element.matches('.hero-intro-stage')
        ? (element.querySelector('.hero-intro-content') ?? element)
        : element;
      const rootBox = root.getBoundingClientRect();
      const top = offset;
      const bottom = window.innerHeight;

      const faults: string[] = [];
      const check = (part: Element, box: DOMRect) => {
        if (box.top < top - TOLERANCE)
          faults.push(`${describe(part)} cut at the top: ${Math.round(box.top)} < ${Math.round(top)}`);
        if (box.bottom > bottom + TOLERANCE)
          faults.push(`${describe(part)} cut at the bottom: ${Math.round(box.bottom)} > ${Math.round(bottom)}`);
      };
      check(root, rootBox);

      const scrollsY = (node: Element) => ['auto', 'scroll'].includes(getComputedStyle(node).overflowY);
      const clipsY = (node: Element) => getComputedStyle(node).overflowY !== 'visible';
      for (const part of root.querySelectorAll(PARTS)) {
        if (!part.checkVisibility({ opacityProperty: true, visibilityProperty: true })) continue;
        const box = part.getBoundingClientRect();
        if (box.width <= TOLERANCE || box.height <= TOLERANCE) continue;
        let isReachable = true;
        let isShown = true;
        for (let node = part.parentElement; node && node !== root.parentElement; node = node.parentElement) {
          if (!clipsY(node)) continue;
          const clip = node.getBoundingClientRect();
          // Wholly outside a clipping box inside the visual is held back on purpose: a slide not yet in,
          // or scrolled away. The visual's own box clipping it is the frame cropping its content.
          if ((node !== root && box.bottom <= clip.top + TOLERANCE) || box.top >= clip.bottom - TOLERANCE) {
            isShown = false;
            break;
          }
          // Inside a column that scrolls it is reached by scrolling; the column itself must fit.
          if (scrollsY(node)) {
            isReachable = false;
            break;
          }
          if (box.top < clip.top - TOLERANCE || box.bottom > clip.bottom + TOLERANCE)
            faults.push(`${describe(part)} cropped by ${describe(node)}`);
        }
        if (!isShown || !isReachable) continue;
        check(part, box);
      }
      for (const scroller of [...root.querySelectorAll('*')].filter(scrollsY)) {
        check(scroller, scroller.getBoundingClientRect());
      }
      return { isSticky, isHeld, signal, faults: [...new Set(faults)] };
    },
    { scene, visual },
  );
}

/**
 * Collisions inside drawn scenes: in every SVG matching `selector`, a label
 * that overlaps another label, or a label that overlaps a box without sitting
 * wholly inside it (a node's own label is inside its box). Measured with
 * `getBBox` and the `transform` attributes, in the drawing's own units, so it
 * holds at every rendered size and ignores a piece caught mid draw-in. A label not rendered at this size is skipped.
 */
export async function findSceneLabelOverlaps(page: Page, selector: string): Promise<string[]> {
  return page.evaluate((selector) => {
    /** Glyph boxes include side bearings; less than this is not ink on ink. */
    const MIN_OVERLAP = 1;

    type Box = { x: number; y: number; width: number; height: number };
    /** The element's box in the drawing's units: its `transform` attributes up to the svg, no CSS motion. */
    const boxOf = (element: SVGGraphicsElement, svg: SVGSVGElement): Box | null => {
      let local: DOMRect;
      try {
        local = element.getBBox();
      } catch {
        return null;
      }
      if (local.width <= 0 || local.height <= 0) return null;
      let matrix = new DOMMatrix();
      for (let node: Element | null = element; node && node !== svg; node = node.parentElement) {
        const own = (node as SVGGraphicsElement).transform?.baseVal.consolidate()?.matrix;
        if (own) matrix = DOMMatrix.fromMatrix(own).multiply(matrix);
      }
      const corners = [
        new DOMPoint(local.x, local.y),
        new DOMPoint(local.x + local.width, local.y),
        new DOMPoint(local.x, local.y + local.height),
        new DOMPoint(local.x + local.width, local.y + local.height),
      ].map((point) => point.matrixTransform(matrix));
      const xs = corners.map((point) => point.x);
      const ys = corners.map((point) => point.y);
      const x = Math.min(...xs);
      const y = Math.min(...ys);
      return { x, y, width: Math.max(...xs) - x, height: Math.max(...ys) - y };
    };
    const overlap = (a: Box, b: Box): boolean =>
      Math.min(a.x + a.width, b.x + b.width) - Math.max(a.x, b.x) > MIN_OVERLAP &&
      Math.min(a.y + a.height, b.y + b.height) - Math.max(a.y, b.y) > MIN_OVERLAP;
    const inside = (inner: Box, outer: Box): boolean =>
      inner.x >= outer.x &&
      inner.y >= outer.y &&
      inner.x + inner.width <= outer.x + outer.width &&
      inner.y + inner.height <= outer.y + outer.height;
    const name = (element: Element): string =>
      element.tagName === 'text' ? `"${(element.textContent ?? '').trim()}"` : 'a box';

    const faults: string[] = [];
    document.querySelectorAll<SVGSVGElement>(selector).forEach((svg, index) => {
      const labels = [...svg.querySelectorAll<SVGTextElement>('text')]
        .filter((text) => getComputedStyle(text).display !== 'none')
        .flatMap((text) => {
          const box = boxOf(text, svg);
          return box ? [{ element: text, box }] : [];
        });
      const boxes = [...svg.querySelectorAll<SVGRectElement>('rect')].flatMap((rect) => {
        const box = boxOf(rect, svg);
        return box ? [{ element: rect, box }] : [];
      });
      labels.forEach((label, at) => {
        for (const other of labels.slice(at + 1)) {
          if (overlap(label.box, other.box)) {
            faults.push(`scene ${index}: ${name(label.element)} overlaps ${name(other.element)}`);
          }
        }
        for (const box of boxes) {
          if (overlap(label.box, box.box) && !inside(label.box, box.box)) {
            faults.push(`scene ${index}: ${name(label.element)} runs into ${name(box.element)}`);
          }
        }
      });
    });
    return faults;
  }, selector);
}
