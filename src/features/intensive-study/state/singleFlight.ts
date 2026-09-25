/**
 * Single-flight wrapper for an async task.
 *
 * A second call arriving while a previous one is still in flight is
 * suppressed (resolves false) instead of running concurrently. The
 * in-flight flag is set synchronously before the task starts and is
 * always released in `finally`, whether the task resolves or rejects,
 * so the lock can never latch. Rejections propagate to the caller
 * unchanged.
 *
 * The instance is the lock: callers that need suppression across calls
 * must hold ONE stable instance (in React, via `useRef(...).current`).
 */
export type SingleFlight = (task: () => Promise<void>) => Promise<boolean>;

export function createSingleFlight(): SingleFlight {
  let inFlight = false;

  return async (task) => {
    if (inFlight) return false;
    inFlight = true;
    try {
      await task();
      return true;
    } finally {
      inFlight = false;
    }
  };
}
