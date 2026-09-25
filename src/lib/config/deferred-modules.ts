/**
 * Deferred-module guard for Phase 1 delivery (invoice TTI/2026/HMS-P1-002).
 *
 * Specialty surfaces (psych, ambulance, theatre, maternal) and unfinished
 * APIs are NOT part of the paid Phase 1 scope. Source code is preserved for
 * a future phase; active exposure is disabled unless explicitly re-enabled
 * for development with PHASE1_ENABLE_DEFERRED_MODULES=true.
 *
 * Returns true when the caller may proceed (module enabled).
 * Returns false when the module is deactivated for the delivered product.
 */
export function isDeferredModuleEnabled(): boolean {
  return process.env.PHASE1_ENABLE_DEFERRED_MODULES === 'true';
}
