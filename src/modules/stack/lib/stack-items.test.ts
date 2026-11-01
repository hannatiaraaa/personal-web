import { describe, expect, test } from 'bun:test';
import type { StackGroup } from '@/content/stack';
import { stackGroups } from '@/content/stack';
import { listStackItems } from './stack-items';

describe('listStackItems', () => {
  test('returns a flat group items unchanged', () => {
    const group: StackGroup = { id: 'daily', title: 'T', note: 'N', items: ['a', 'b'] };

    expect(listStackItems(group)).toEqual(['a', 'b']);
  });

  test('returns a subgrouped group items in subgroup order', () => {
    const group: StackGroup = {
      id: 'domain',
      title: 'T',
      note: 'N',
      subgroups: [
        { title: 'one', items: ['a', 'b'] },
        { title: 'two', items: ['c'] },
      ],
    };

    expect(listStackItems(group)).toEqual(['a', 'b', 'c']);
  });

  test('states every item in the library exactly once', () => {
    const items = stackGroups.flatMap(listStackItems);

    expect(new Set(items).size).toBe(items.length);
  });
});
