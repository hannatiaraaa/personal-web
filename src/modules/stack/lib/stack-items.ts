import type { StackGroup } from '@/content/stack';

/** Every item a group lists, in content order, whether it is flat or in subgroups. */
export function listStackItems(group: StackGroup): readonly string[] {
  return group.items ?? group.subgroups.flatMap((subgroup) => subgroup.items);
}
