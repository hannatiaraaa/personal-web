import { describe, expect, test } from 'bun:test';
import { getPageHeader, pageHeaders } from './page-headers';

describe('getPageHeader', () => {
  test('gives each documented route its header', () => {
    for (const path of Object.keys(pageHeaders)) {
      expect(getPageHeader(path)).not.toBeNull();
    }
  });

  test('gives no header to the routes that supply their own', () => {
    // Home opens with the pool; a case study has its own context header.
    expect(getPageHeader('/')).toBeNull();
    expect(getPageHeader('/work/offline-draft-ownership')).toBeNull();
  });

  test('gives no header to an unknown route', () => {
    expect(getPageHeader('/nope')).toBeNull();
  });

  test('ignores a trailing slash and casing, so a link cannot lose the header', () => {
    expect(getPageHeader('/work/')).toEqual(getPageHeader('/work'));
    expect(getPageHeader('/About')).toEqual(getPageHeader('/about'));
  });

  test('leaves the root path alone rather than stripping it to empty', () => {
    expect(getPageHeader('/')).toBeNull();
  });

  test('every header carries a legend and a title', () => {
    for (const [path, header] of Object.entries(pageHeaders)) {
      expect(header.legend.length, `${path} needs a legend`).toBeGreaterThan(0);
      expect(header.title.length, `${path} needs a title`).toBeGreaterThan(0);
    }
  });
});
