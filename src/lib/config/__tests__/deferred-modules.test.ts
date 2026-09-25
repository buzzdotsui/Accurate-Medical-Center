import { describe, it, expect, afterEach } from 'vitest';
import { isDeferredModuleEnabled } from '../deferred-modules';

/**
 * Phase 1 product-surface guard (invoice TTI/2026/HMS-P1-002).
 * Future modules (radiology, psych, advanced analytics, specialty
 * surfaces) must stay deactivated in the delivered product unless the
 * operator explicitly opts in — the default has to be OFF.
 */
const KEY = 'PHASE1_ENABLE_DEFERRED_MODULES';
const original = process.env[KEY];

afterEach(() => {
  if (original === undefined) {
    delete process.env[KEY];
  } else {
    process.env[KEY] = original;
  }
});

describe('isDeferredModuleEnabled', () => {
  it('is disabled when the environment variable is unset', () => {
    delete process.env[KEY];
    expect(isDeferredModuleEnabled()).toBe(false);
  });

  it('is disabled for every non-"true" value', () => {
    for (const value of ['', 'false', '0', 'TRUE', 'yes']) {
      process.env[KEY] = value;
      expect(isDeferredModuleEnabled()).toBe(false);
    }
  });

  it('is enabled only when explicitly "true"', () => {
    process.env[KEY] = 'true';
    expect(isDeferredModuleEnabled()).toBe(true);
  });
});
