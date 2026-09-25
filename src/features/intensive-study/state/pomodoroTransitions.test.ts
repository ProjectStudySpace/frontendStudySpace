/**
 * Atomic phase transitions of the Pomodoro timer.
 *
 * A transition must never depend on state that has not flushed yet: starting
 * the next phase reads its duration from the transition itself, so a timer that
 * just reached zero can still start the following phase.
 */
import React, { act } from "react";
import { createRoot, type Root } from "react-dom/client";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { usePomodoroTimer } from "../../../../hooks/usePomodoroTimer";

type TimerState = ReturnType<typeof usePomodoroTimer>;

let latest: TimerState | null = null;
let root: Root | null = null;

function Probe() {
  latest = usePomodoroTimer();
  return null;
}

function timer(): TimerState {
  if (!latest) {
    throw new Error("Timer probe not rendered");
  }
  return latest;
}

async function renderTimerProbe() {
  const container = document.createElement("div");
  document.body.appendChild(container);
  root = createRoot(container);
  await act(async () => {
    root?.render(React.createElement(Probe));
  });
}

/** Advance the fake clock one second at a time, flushing React in between. */
async function advanceSeconds(seconds: number) {
  for (let i = 0; i < seconds; i += 1) {
    await act(async () => {
      vi.advanceTimersByTime(1000);
    });
  }
}

describe("usePomodoroTimer atomic transitions", () => {
  beforeEach(async () => {
    (
      globalThis as { IS_REACT_ACT_ENVIRONMENT?: boolean }
    ).IS_REACT_ACT_ENVIRONMENT = true;
    vi.useFakeTimers();
    latest = null;
    document.body.innerHTML = "";
    await renderTimerProbe();
  });

  afterEach(async () => {
    if (root) {
      await act(async () => root?.unmount());
      root = null;
    }
    vi.useRealTimers();
    document.body.innerHTML = "";
  });

  it("signals a natural expiry exactly once when the work phase reaches zero", async () => {
    await act(async () => {
      timer().transitionTo({ phase: "WORK", durationSeconds: 2 });
    });
    expect(timer().isRunning).toBe(true);

    await advanceSeconds(2);

    expect(timer().timeRemaining).toBe(0);
    expect(timer().isRunning).toBe(false);
    expect(timer().completionTick).toBe(1);

    // No stale callback keeps running after the expiry.
    await advanceSeconds(5);
    expect(timer().completionTick).toBe(1);
    expect(timer().timeRemaining).toBe(0);
  });

  it("starts the break phase from a zeroed work timer (work -> break)", async () => {
    await act(async () => {
      timer().transitionTo({ phase: "WORK", durationSeconds: 2 });
    });
    await advanceSeconds(2);
    expect(timer().completionTick).toBe(1);

    // The stale zero of the expired work phase must not block the break start.
    await act(async () => {
      timer().transitionTo({ phase: "SHORT_BREAK", durationSeconds: 3 });
    });

    expect(timer().phase).toBe("SHORT_BREAK");
    expect(timer().timeRemaining).toBe(3);
    expect(timer().isRunning).toBe(true);

    await advanceSeconds(3);

    expect(timer().timeRemaining).toBe(0);
    expect(timer().completionTick).toBe(2);
  });

  it("starts the next work phase from a zeroed break timer (break -> work)", async () => {
    await act(async () => {
      timer().transitionTo({ phase: "LONG_BREAK", durationSeconds: 2 });
    });
    await advanceSeconds(2);
    expect(timer().completionTick).toBe(1);

    await act(async () => {
      timer().transitionTo({ phase: "WORK", durationSeconds: 2 });
    });

    expect(timer().phase).toBe("WORK");
    expect(timer().isRunning).toBe(true);

    await advanceSeconds(2);

    expect(timer().timeRemaining).toBe(0);
    expect(timer().completionTick).toBe(2);
    expect(timer().isRunning).toBe(false);
  });

  it("never runs a duplicate interval after a transition", async () => {
    await act(async () => {
      timer().transitionTo({ phase: "WORK", durationSeconds: 10 });
    });
    await advanceSeconds(2);
    expect(timer().timeRemaining).toBe(8);

    // A manual transition (skip break / end break) mid-run replaces the timer.
    await act(async () => {
      timer().transitionTo({ phase: "SHORT_BREAK", durationSeconds: 10 });
    });
    await advanceSeconds(3);

    // Exactly one tick per second: a leaked interval would double the drain.
    expect(timer().timeRemaining).toBe(7);
    expect(timer().completionTick).toBe(0);
  });

  it("keeps counting after re-applying an identical transition while running", async () => {
    await act(async () => {
      timer().transitionTo({ phase: "WORK", durationSeconds: 10 });
    });
    // A same-second re-sync of the live block yields identical state.
    await act(async () => {
      timer().transitionTo({ phase: "WORK", durationSeconds: 10 });
    });
    expect(timer().isRunning).toBe(true);

    await advanceSeconds(3);

    expect(timer().timeRemaining).toBe(7);
  });

  it("keeps counting when pause and start land in the same batch", async () => {
    await act(async () => {
      timer().transitionTo({ phase: "WORK", durationSeconds: 10 });
    });
    await act(async () => {
      timer().pause();
      timer().start();
    });
    expect(timer().isRunning).toBe(true);

    await advanceSeconds(3);

    expect(timer().timeRemaining).toBe(7);
  });

  it("never drives the remaining time below zero", async () => {
    await act(async () => {
      timer().transitionTo({ phase: "WORK", durationSeconds: 1 });
    });
    await advanceSeconds(10);

    expect(timer().timeRemaining).toBe(0);
    expect(timer().timeRemaining).toBeGreaterThanOrEqual(0);
  });

  it("does not auto-start nor signal an expiry for an already expired backend block", async () => {
    const startedAt = new Date(Date.now() - 60_000).toISOString();

    let remaining = -1;
    await act(async () => {
      remaining = timer().transitionTo({
        phase: "WORK",
        durationSeconds: 30,
        startedAt,
      });
    });

    expect(remaining).toBe(0);
    expect(timer().timeRemaining).toBe(0);
    expect(timer().isRunning).toBe(false);
    expect(timer().completionTick).toBe(0);

    // Hydration must stay inert: no expiry is fabricated later either.
    await advanceSeconds(5);
    expect(timer().completionTick).toBe(0);
  });

  it("resumes a live backend block on its remaining time", async () => {
    const startedAt = new Date(Date.now() - 10_000).toISOString();

    let remaining = -1;
    await act(async () => {
      remaining = timer().transitionTo({
        phase: "WORK",
        durationSeconds: 30,
        startedAt,
      });
    });

    expect(remaining).toBe(20);
    expect(timer().timeRemaining).toBe(20);
    expect(timer().totalTime).toBe(30);
    expect(timer().isRunning).toBe(true);
  });

  it("honours an explicit paused transition", async () => {
    await act(async () => {
      timer().transitionTo({
        phase: "SHORT_BREAK",
        durationSeconds: 5,
        autoStart: false,
      });
    });

    expect(timer().timeRemaining).toBe(5);
    expect(timer().isRunning).toBe(false);

    await advanceSeconds(3);
    expect(timer().timeRemaining).toBe(5);
    expect(timer().completionTick).toBe(0);
  });

  it("falls back to the configured duration of the phase", async () => {
    await act(async () => {
      timer().transitionTo({ phase: "SHORT_BREAK" });
    });

    expect(timer().timeRemaining).toBe(timer().SHORT_BREAK_DURATION);
    expect(timer().totalTime).toBe(timer().SHORT_BREAK_DURATION);
  });
});
