import { SceneArrow, SceneFrame, SceneNode, ScenePiece, SceneText } from './scene-parts';
import { ToolMark } from './tool-marks';

const LANES = [
  { x: 40, mark: 'tablet', label: 'tablet' },
  { x: 120, mark: 'watermelon', label: 'outbox' },
  { x: 200, mark: 'owner', label: 'owner check' },
  { x: 280, mark: 'server', label: 'server' },
] as const;

/**
 * Offline sync as a sequence diagram: a lane each for the tablet, its local
 * outbox, the ownership check and the server, read top to bottom.
 */
export function SceneOffline() {
  return (
    <SceneFrame
      height={244}
      description='Offline sync as a sequence: a tablet with no signal saves to its WatermelonDB outbox, the draft is queued with its owner, and when signal returns it syncs through an ownership check that the server accepts or rejects as stale; app updates arrive over the air.'
    >
      <ScenePiece k={0}>
        {LANES.map((lane) => (
          <g key={lane.label}>
            <ToolMark
              name={lane.mark}
              at={{ x: lane.x, y: 16 }}
              scale={0.9}
              accent={lane.mark === 'watermelon'}
            />
            <SceneText at={{ x: lane.x, y: 46 }}>{lane.label}</SceneText>
          </g>
        ))}
        {/* No signal over the tablet. */}
        <path
          className='stack-scene-link'
          d='M54 20V16M58 20V12M62 20V8M51 6 65 22'
        />
        <path
          className='stack-scene-lifeline'
          d='M40 54V216M120 54V216M200 54V216M280 54V216'
        />
      </ScenePiece>

      <SceneArrow
        from={{ x: 40, y: 76 }}
        to={{ x: 116, y: 76 }}
        k={1}
        label='save'
      />
      <SceneNode
        centre={{ x: 120, y: 98 }}
        width={108}
        height={22}
        k={2}
        accent
      >
        <SceneText at={{ x: 120, y: 102.5 }}>draft + owner</SceneText>
      </SceneNode>

      <ScenePiece k={3}>
        <path
          className='stack-scene-rule'
          d='M4 126H316'
        />
        <rect
          x='98'
          y='115'
          width='124'
          height='22'
          rx='11'
          className='stack-scene-pill'
        />
        <SceneText at={{ x: 160, y: 130.5 }}>signal returns</SceneText>
      </ScenePiece>

      <SceneArrow
        from={{ x: 120, y: 156 }}
        to={{ x: 196, y: 156 }}
        k={4}
        label='sync'
      />
      <SceneArrow
        from={{ x: 200, y: 182 }}
        to={{ x: 276, y: 182 }}
        k={5}
        label='accept'
      />
      <SceneArrow
        from={{ x: 200, y: 208 }}
        to={{ x: 124, y: 208 }}
        k={6}
        dashed
        label='reject stale'
      />

      <ScenePiece k={7}>
        <ToolMark
          name='ota'
          at={{ x: 300, y: 232 }}
          scale={0.7}
          accent
        />
        <SceneText
          anchor='end'
          at={{ x: 284, y: 237 }}
        >
          OTA update
        </SceneText>
      </ScenePiece>
    </SceneFrame>
  );
}
