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
      }),
    ).toBeNull();
  });

  it("dispatches the work completion on the first unhandled expiry", () => {
    expect(
      resolveCompletionDispatch({
        completionTick: 1,
        lastHandledTick: 0,
        view: "ACTIVE",
      }),
    ).toBe("ACTIVE");
  });

  it("dispatches the break completion on the first unhandled expiry", () => {
    expect(
      resolveCompletionDispatch({
        completionTick: 1,
        lastHandledTick: 0,
        view: "BREAK",
      }),
    ).toBe("BREAK");
  });

  it("never dispatches the same expiry twice", () => {
    expect(
      resolveCompletionDispatch({
        completionTick: 1,
        lastHandledTick: 1,
        view: "ACTIVE",
      }),
    ).toBeNull();
  });

  it("dispatches again once a new expiry is signalled", () => {
    expect(
      resolveCompletionDispatch({
        completionTick: 2,
        lastHandledTick: 1,
        view: "BREAK",
      }),
    ).toBe("BREAK");
  });

  it("ignores expiries raised outside a running phase view", () => {
    for (const view of ["CONFIG", "READY", "PAUSED", "RESULTS"] as const) {
      expect(
        resolveCompletionDispatch({
          completionTick: 1,
          lastHandledTick: 0,
          view,
        }),
      ).toBeNull();
    }
  });
});
