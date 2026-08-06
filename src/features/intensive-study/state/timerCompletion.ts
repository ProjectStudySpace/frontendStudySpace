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

export function resolveCompletionDispatch({
  completionTick,
  lastHandledTick,
  view,
}: CompletionDispatchInput): TimerCompletionSource | null {
  if (completionTick <= 0 || completionTick === lastHandledTick) {
    return null;
  }

  if (view === "ACTIVE" || view === "BREAK") {
    return view;
  }

  return null;
}
