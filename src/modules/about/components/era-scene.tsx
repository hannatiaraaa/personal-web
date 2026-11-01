import type { JSX } from 'react';
import type { EraScene } from '@/content/arc';
import { SceneApprovalLadder } from './scene-approval-ladder';
import { SceneComplexNetwork } from './scene-complex-network';
import { SceneEncryptedAtRest } from './scene-encrypted-at-rest';
import { SceneFirstCodebases } from './scene-first-codebases';
import { SceneOneCodebase } from './scene-one-codebase';
import { SceneOutOfSignal } from './scene-out-of-signal';
import { SceneReleaseGate } from './scene-release-gate';
import { SceneReviewRecord } from './scene-review-record';
import { SceneSuiteMigration } from './scene-suite-migration';
import { SceneTaxOrder } from './scene-tax-order';

/** The scene an era names. Every name in the union has a case, so an era
 *  pointing at a scene nobody has drawn does not compile — the declared return
 *  type has no `undefined` for a missing case to fall through to. */
export function ArcScene({ scene }: { scene: EraScene }): JSX.Element | null {
  switch (scene) {
    case 'complex-network':
      return <SceneComplexNetwork />;
    case 'one-codebase':
      return <SceneOneCodebase />;
    case 'encrypted-at-rest':
      return <SceneEncryptedAtRest />;
    case 'first-codebases':
      return <SceneFirstCodebases />;
    case 'out-of-signal':
      return <SceneOutOfSignal />;
    case 'approval-ladder':
      return <SceneApprovalLadder />;
    case 'tax-order':
      return <SceneTaxOrder />;
    case 'suite-migration':
      return <SceneSuiteMigration />;
    case 'release-gate':
      return <SceneReleaseGate />;
    case 'review-record':
      return <SceneReviewRecord />;
  }
}
