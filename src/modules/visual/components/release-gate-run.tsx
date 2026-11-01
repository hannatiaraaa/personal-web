import type { CSSProperties } from 'react';
import { figures } from '@/content/facts';
import { releaseGateRunCopy } from '@/content/interactives';
import { ScrollScene } from '@/common/components/scroll-scene';
import { formatPosition } from '@/common/lib/format-position';
import { PIN_QUERY } from '@/common/lib/media-queries';
import { buildGateSuite, buildPermissionMatrix, GATE_DEBT_NAMES } from '@/modules/visual/lib/gate-run';
import { formatGateCounter, GATE_RUN_BEATS, gateRunStateAt } from '@/modules/visual/lib/gate-run-timeline';
import { GateRunMount } from './gate-run-mount';
import { GateRunStill } from './gate-run-still';

const DESCRIPTION = releaseGateRunCopy.describe(GATE_DEBT_NAMES.length);

/** Staggers the debt chips in CSS. */
type DebtChipStyle = CSSProperties & Record<'--gate-debt-i', number>;

function debtChipStyle(index: number): DebtChipStyle {
  return { '--gate-debt-i': index };
}

const SUITE = buildGateSuite();
const MATRIX = buildPermissionMatrix();

/**
 * The release gate, run as the reader scrolls: report, suite, debt, matrix,
 * certified. Pinned at the `pin` size; below it, and under reduced motion, it
 * rests finished and plays on request. The picture is illustrative; the stamp's
 * figures are the published ones.
 */
export function ReleaseGateRun() {
  const finalCounter = formatGateCounter(gateRunStateAt(SUITE, MATRIX, 1), SUITE);

  const stamp = (
    <div className='gate-run-stamp'>
      <p className='gate-run-stamp-title'>Release certified</p>
      <p className='gate-run-stamp-figures tnum'>
        <span>
          {figures.releaseCases} repeatable cases across {figures.releaseSpecs} specs
        </span>
        <span>{figures.permissionChecks} permission checks per run</span>
      </p>
    </div>
  );

  return (
    <ScrollScene
      as='figure'
      mode='pinned'
      beats={GATE_RUN_BEATS}
      liveQuery={PIN_QUERY}
      label={releaseGateRunCopy.label}
      className='gate-run'
    >
      <div className='gate-run-frame'>
        <div
          className='gate-run-captions'
          aria-hidden='true'
        >
          {releaseGateRunCopy.captions.map((caption, index) => (
            <div
              key={caption.kicker}
              className='gate-run-caption'
              data-caption={index}
            >
              <p className='gate-run-kicker'>
                <span className='tnum'>{formatPosition(index)}</span> · {caption.kicker}
              </p>
              <p className='gate-run-headline'>{caption.headline}</p>
              <p className='gate-run-line'>{caption.line}</p>
            </div>
          ))}
        </div>

        <GateRunMount
          still={
            <GateRunStill
              suite={SUITE}
              matrix={MATRIX}
              description={DESCRIPTION}
            />
          }
          stamp={stamp}
          finalCounter={finalCounter}
          description={DESCRIPTION}
        />

        <ol
          className='gate-run-debt'
          aria-label={releaseGateRunCopy.debtListLabel}
        >
          {GATE_DEBT_NAMES.map((name, index) => (
            <li
              key={name}
              style={debtChipStyle(index)}
            >
              <span
                aria-hidden='true'
                className='gate-run-debt-tag tnum'
              >
                {index + 1}
              </span>
              <span className='gate-run-debt-name'>{name}</span>
            </li>
          ))}
        </ol>
      </div>
    </ScrollScene>
  );
}
