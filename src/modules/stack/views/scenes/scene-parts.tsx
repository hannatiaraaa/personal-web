import type { CSSProperties, ReactNode } from 'react';
import { arrowHead, boxAround, labelAbove, type ScenePoint } from '../../lib';

/** The width every scene is drawn to; its height is its own. */
const SCENE_WIDTH = 320;
const ARROW_HEAD = 6;
/** How far a label sits above the arrow it names. */
const ARROW_LABEL_RISE = 6;

type OrderStyle = CSSProperties & Record<'--k', number>;

/** A piece's place in its scene's draw-in, which staggers it (stack-story.css). */
function order(k: number): OrderStyle {
  return { '--k': k };
}

type FrameProps = {
  /** What the scene shows, in one sentence: the mechanism, not the shapes. */
  description: string;
  height: number;
  children: ReactNode;
};

/**
 * One explainer scene: an image to assistive tech, named by its description.
 * The markup is the finished drawing; the draw-in is CSS on the pinned panel.
 */
export function SceneFrame({ description, height, children }: FrameProps) {
  return (
    <svg
      viewBox={`0 0 ${SCENE_WIDTH} ${height}`}
      role='img'
      aria-label={description}
      className='stack-scene'
      fill='none'
    >
      {children}
    </svg>
  );
}

type TextProps = {
  at: ScenePoint;
  children: string;
  /** A minor label, dropped where the scene is drawn small rather than shrunk. */
  minor?: boolean;
  anchor?: 'start' | 'middle' | 'end';
};

export function SceneText({ at, children, minor = false, anchor = 'middle' }: TextProps) {
  return (
    <text
      x={at.x}
      y={at.y}
      textAnchor={anchor}
      className={minor ? 'stack-scene-minor' : 'stack-scene-label'}
    >
      {children}
    </text>
  );
}

type NodeProps = {
  centre: ScenePoint;
  width: number;
  height: number;
  /** The draw-in order. */
  k: number;
  /** The node the scene is about wears the signal colour. */
  accent?: boolean;
  /** A tool mark and a label, or anything else drawn inside. */
  children?: ReactNode;
};

/** A box in a flow or sequence, drawn in as one piece. */
export function SceneNode({ centre, width, height, k, accent = false, children }: NodeProps) {
  const box = boxAround(centre, width, height);
  return (
    <g
      className='stack-scene-in'
      style={order(k)}
    >
      <rect
        {...box}
        rx='6'
        className={accent ? 'stack-scene-box stack-scene-box-accent' : 'stack-scene-box'}
      />
      {children}
    </g>
  );
}

type ArrowProps = {
  from: ScenePoint;
  to: ScenePoint;
  k: number;
  /** A return, an optional path or a later step: dashed. */
  dashed?: boolean;
  label?: string;
  /** Where the label sits, when not centred above the arrow. */
  labelAt?: ScenePoint;
};

/** A directed link with an open head, and an optional label above its middle. */
export function SceneArrow({ from, to, k, dashed = false, label, labelAt }: ArrowProps) {
  const middle = labelAt ?? labelAbove(from, to, ARROW_LABEL_RISE);
  return (
    <g
      className='stack-scene-in'
      style={order(k)}
    >
      <path
        d={`M${from.x} ${from.y}L${to.x} ${to.y}`}
        className={dashed ? 'stack-scene-link stack-scene-link-dashed' : 'stack-scene-link'}
      />
      <path
        d={arrowHead(from, to, ARROW_HEAD)}
        className='stack-scene-link'
      />
      {label ? <SceneText at={middle}>{label}</SceneText> : null}
    </g>
  );
}

type PieceProps = {
  k: number;
  children: ReactNode;
};

/** Anything else drawn in as one piece: a mark, a header, a rule. */
export function ScenePiece({ k, children }: PieceProps) {
  return (
    <g
      className='stack-scene-in'
      style={order(k)}
    >
      {children}
    </g>
  );
}
