import { describe, expect, it } from 'vitest';

import { getPackageNameFromPath } from '../utils';

describe('getPackageNameFromPath', () => {
  it('returns null for non-package paths', () => {
    expect(getPackageNameFromPath('/')).toBeNull();
    expect(getPackageNameFromPath('/about')).toBeNull();
    expect(getPackageNameFromPath('/user')).toBeNull();
  });

  it('returns null for /package without a name', () => {
    expect(getPackageNameFromPath('/package')).toBeNull();
    expect(getPackageNameFromPath('/package/')).toBeNull();
  });

  it('extracts unscoped package name and lowercases it', () => {
    expect(getPackageNameFromPath('/package/react')).toBe('react');
    expect(getPackageNameFromPath('/package/React')).toBe('react');
    expect(getPackageNameFromPath('/package/Lodash')).toBe('lodash');
  });

  it('extracts scoped package name and lowercases it', () => {
    expect(getPackageNameFromPath('/package/@babel/core')).toBe('@babel/core');
    expect(getPackageNameFromPath('/package/@types/node')).toBe('@types/node');
    expect(getPackageNameFromPath('/package/@Angular/CLI')).toBe('@angular/cli');
  });

  it('ignores trailing path segments', () => {
    expect(getPackageNameFromPath('/package/react/v/1.2.3')).toBe('react');
    expect(getPackageNameFromPath('/package/@babel/core/v/2.0.0')).toBe('@babel/core');
  });
});
