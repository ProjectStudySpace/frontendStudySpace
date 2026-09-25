/**
 * Dispatch rules for a natural Pomodoro timer expiry.
 *
 * The page must only fabricate a backend transition when the timer really
 * counted down to zero, and exactly once per expiry.
 */
import { describe, expect, it } from "vitest";
import { resolveCompletionDispatch } from "./timerCompletion";

describe("resolveCompletionDispatch", () => {
  it("does not dispatch while no natural expiry has happened", () => {
    expect(
      resolveCompletionDispatch({
        completionTick: 0,
        lastHandledTick: 0,
        view: "ACTIVE",
      }).dispatch,
    ).toBeNull();
  });

  it("dispatches the work completion on the first unhandled expiry", () => {
    const result = resolveCompletionDispatch({
      completionTick: 1,
      lastHandledTick: 0,
      view: "ACTIVE",
    });
    expect(result.dispatch).toBe("ACTIVE");
    expect(result.nextHandledTick).toBe(1);
  });

  it("dispatches the break completion on the first unhandled expiry", () => {
    const result = resolveCompletionDispatch({
      completionTick: 1,
      lastHandledTick: 0,
      view: "BREAK",
    });
    expect(result.dispatch).toBe("BREAK");
    expect(result.nextHandledTick).toBe(1);
  });

  it("never dispatches the same expiry twice", () => {
    expect(
      resolveCompletionDispatch({
        completionTick: 1,
        lastHandledTick: 1,
        view: "ACTIVE",
      }).dispatch,
    ).toBeNull();
  });

  it("dispatches again once a new expiry is signalled", () => {
    const result = resolveCompletionDispatch({
      completionTick: 2,
      lastHandledTick: 1,
      view: "BREAK",
    });
    expect(result.dispatch).toBe("BREAK");
    expect(result.nextHandledTick).toBe(2);
  });

  it("ignores expiries raised outside a running phase view", () => {
    for (const view of ["CONFIG", "READY", "PAUSED", "RESULTS"] as const) {
      expect(
        resolveCompletionDispatch({
          completionTick: 1,
          lastHandledTick: 0,
          view,
        }).dispatch,
      ).toBeNull();
    }
  });

  // REL-201 regression coverage: a tick raised while the view is not live
  // (e.g. after an abandon that leaves the timer running) must be consumed
  // immediately so it cannot latch and fire on a later, unrelated session.
  it("consumes a tick raised outside a live view so it cannot latch", () => {
    const result = resolveCompletionDispatch({
      completionTick: 1,
      lastHandledTick: 0,
      view: "RESULTS",
    });
    expect(result.dispatch).toBeNull();
    expect(result.nextHandledTick).toBe(1);
  });

  it("a consumed stale tick never dispatches when the view later becomes live", () => {
    const result = resolveCompletionDispatch({
      completionTick: 1,
      lastHandledTick: 1,
      view: "ACTIVE",
    });
    expect(result.dispatch).toBeNull();
  });

  it("a fresh expiry after a consumed stale tick still dispatches exactly once", () => {
    const active = resolveCompletionDispatch({
      completionTick: 2,
      lastHandledTick: 1,
      view: "ACTIVE",
    });
    expect(active.dispatch).toBe("ACTIVE");
    expect(active.nextHandledTick).toBe(2);

    const brk = resolveCompletionDispatch({
      completionTick: 2,
      lastHandledTick: 1,
      view: "BREAK",
    });
    expect(brk.dispatch).toBe("BREAK");
    expect(brk.nextHandledTick).toBe(2);
  });

  it("the handled tick never regresses", () => {
    const result = resolveCompletionDispatch({
      completionTick: 0,
      lastHandledTick: 2,
      view: "ACTIVE",
    });
    expect(result.dispatch).toBeNull();
    expect(result.nextHandledTick).toBe(2);
  });
});
