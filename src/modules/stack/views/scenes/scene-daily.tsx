import { chainLinks } from '../../lib';
import { SceneArrow, SceneFrame, SceneNode, ScenePiece, SceneText } from './scene-parts';
import { ToolMark } from './tool-marks';

const NODE = { width: 62, height: 68 } as const;
const STEPS = [
  { at: { x: 40, y: 76 }, mark: 'react', label: 'React' },
  { at: { x: 120, y: 76 }, mark: 'next', label: 'Next.js' },
  { at: { x: 200, y: 76 }, mark: 'nest', label: 'NestJS' },
  { at: { x: 280, y: 76 }, mark: 'database', label: 'MySQL' },
] as const;
const LINKS = chainLinks(
  STEPS.map((step) => step.at),
  { halfWidth: NODE.width / 2, halfHeight: NODE.height / 2, margin: 2 },
);

/**
 * A request through the daily stack: browser, server and database as tiers
 * over a component, a server render, an API and its store, with TypeScript as
 * the band every layer stands on.
 */
export function SceneDaily() {
  return (
    <SceneFrame
      height={180}
      description='A request through the daily stack: a React component in the browser, rendered on the server by Next.js, answered by a NestJS API from MySQL, with TypeScript running through every layer.'
    >
      <ScenePiece k={0}>
        <SceneText at={{ x: 40, y: 16 }}>browser</SceneText>
        <SceneText at={{ x: 160, y: 16 }}>server</SceneText>
        <SceneText at={{ x: 280, y: 16 }}>database</SceneText>
        <path
          className='stack-scene-tier'
          d='M9 32V26H71V32M89 32V26H231V32M249 32V26H311V32'
        />
      </ScenePiece>

      {STEPS.map((step, index) => (
        <SceneNode
          key={step.label}
          centre={step.at}
          width={NODE.width}
          height={NODE.height}
          k={1 + index * 2}
        >
          <ToolMark
            name={step.mark}
            at={{ x: step.at.x, y: 64 }}
            scale={1.1}
          />
          <SceneText at={{ x: step.at.x, y: 100 }}>{step.label}</SceneText>
        </SceneNode>
      ))}
      {LINKS.map((link, index) => (
        <SceneArrow
          key={link.from.x}
          {...link}
          k={2 + index * 2}
        />
      ))}

      <ScenePiece k={8}>
        <path
          className='stack-scene-link stack-scene-link-dashed'
          d='M40 110V140M120 110V140M200 110V140M280 110V140'
        />
        <rect
          x='9'
          y='140'
          width='302'
          height='32'
          rx='8'
          className='stack-scene-box stack-scene-box-accent'
        />
        <ToolMark
          name='typescript'
          at={{ x: 30, y: 156 }}
          scale={0.8}
          accent
        />
        <SceneText at={{ x: 160, y: 161 }}>TypeScript</SceneText>
        <SceneText
          minor
          anchor='end'
          at={{ x: 300, y: 160 }}
        >
          every layer
        </SceneText>
      </ScenePiece>
    </SceneFrame>
  );
}
