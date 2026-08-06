/**
 * Dispatch rules for a natural Pomodoro timer expiry.
 *
 * The timer hook raises a monotonic `completionTick` only when a running phase
 * really counted down to zero. Hydrating an already expired backend block never
 * raises one, so resuming a stale session cannot fabricate a server-side
 * transition. This resolver keeps the dispatch single-shot per expiry.
 */

/** Views that own a live phase and can therefore complete it. */
export type TimerCompletionSource = "ACTIVE" | "BREAK";

export interface CompletionDispatchInput {
  /** Monotonic counter raised once per natural expiry. */
  completionTick: number;
  /** Last expiry already dispatched by the page. */
  lastHandledTick: number;
  /** Current page view. */
  view: string;
}

export interface CompletionDispatchResolution {
  /** Non-null only when the current view owns a live phase to complete. */
  dispatch: TimerCompletionSource | null;
  /**
   * Tick value the page must record as handled — advances on every new
   * tick, dispatched or suppressed, and never decreases. Consuming a tick
   * even when it cannot be dispatched prevents it from latching and firing
   * on a later, unrelated session (REL-201).
   */
  nextHandledTick: number;
}

export function resolveCompletionDispatch({
  completionTick,
  lastHandledTick,
  view,
}: CompletionDispatchInput): CompletionDispatchResolution {
  if (completionTick <= 0 || completionTick === lastHandledTick) {
    return { dispatch: null, nextHandledTick: lastHandledTick };
  }

  const nextHandledTick = Math.max(completionTick, lastHandledTick);

  if (view === "ACTIVE" || view === "BREAK") {
    return { dispatch: view, nextHandledTick };
  }

  return { dispatch: null, nextHandledTick };
}
