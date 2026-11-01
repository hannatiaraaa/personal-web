import type { JSX } from 'react';
import type { StackGroupId } from '@/content/stack';
import { SceneAiDelivery } from './scene-ai-delivery';
import { SceneArchitecture } from './scene-architecture';
import { SceneArchive } from './scene-archive';
import { SceneDaily } from './scene-daily';
import { SceneDomain } from './scene-domain';
import { SceneOffline } from './scene-offline';

/**
 * Each group's explainer: what the skills in it are and how they work, drawn
 * as the tools' marks on a small system diagram. Keyed by every group id, so a
 * group added to the content without a scene is a compile error.
 */
const SCENES: Record<StackGroupId, () => JSX.Element> = {
  daily: SceneDaily,
  offline: SceneOffline,
  architecture: SceneArchitecture,
  domain: SceneDomain,
  'ai-delivery': SceneAiDelivery,
  archive: SceneArchive,
};

export function StackScene({ id }: { id: StackGroupId }) {
  const Scene = SCENES[id];
  return <Scene />;
}
