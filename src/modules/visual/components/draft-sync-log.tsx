import type { DraftSyncStep } from '@/modules/visual/lib/draft-sync';
import { stepState } from '@/modules/visual/lib/step-state';

/**
 * The run as text: every step, in order, with the one on screen marked. This
 * is the accessible version of the drawing — everything it shows is said here.
 */
export function DraftSyncLog({ steps, beat }: { steps: readonly DraftSyncStep[]; beat: number }) {
  return (
    // Focusable because when pinned it scrolls inside itself, and a keyboard
    // reader must be able to reach its foot.
    <div
      role='group'
      aria-labelledby='draft-sync-log-title'
      tabIndex={0}
      className='draft-sync-log'
    >
      <p
        id='draft-sync-log-title'
        className='legend'
      >
        Event log
      </p>
      <ol className='draft-sync-log-list'>
        {steps.map((step, index) => (
          <li
            key={step.kind}
            aria-current={index === beat ? 'step' : undefined}
            data-state={stepState(index, beat)}
            data-outcome={step.outcome}
            className='draft-sync-log-item'
          >
            <span
              aria-hidden='true'
              className='draft-sync-log-index tnum font-mono'
            >
              {index + 1}
            </span>
            <span>{step.label}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
