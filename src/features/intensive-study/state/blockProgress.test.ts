/**
 * "Block N of M" reads the total from the session status GET, which counts
 * every Pomodoro block the session has, including extra blocks added later.
 */
import { describe, expect, it } from "vitest";
import { resolveTotalBlocks } from "./blockProgress";

const blocks = (count: number) => Array.from({ length: count }, () => ({}));

describe("resolveTotalBlocks", () => {
  it("uses the totalBlocks reported by the session status", () => {
    expect(
      resolveTotalBlocks({
        statusTotalBlocks: 6,
        session: { pomodoroBlocks: blocks(6) },
        blockNumber: 2,
      }),
    ).toBe(6);
  });

  it("falls back to the session's Pomodoro blocks when no status total is known", () => {
    expect(
      resolveTotalBlocks({
        statusTotalBlocks: null,
        session: { pomodoroBlocks: blocks(3) },
        blockNumber: 1,
      }),
    ).toBe(3);
  });

  it("follows extra blocks the session gained after the status was read", () => {
    expect(
      resolveTotalBlocks({
        statusTotalBlocks: 4,
        session: { pomodoroBlocks: blocks(5) },
        blockNumber: 5,
      }),
    ).toBe(5);
  });

  it("never reports fewer blocks than the one currently shown", () => {
    expect(
      resolveTotalBlocks({
        statusTotalBlocks: null,
        session: { pomodoroBlocks: [] },
        blockNumber: 2,
      }),
    ).toBe(2);
    expect(
      resolveTotalBlocks({ statusTotalBlocks: null, session: null, blockNumber: 1 }),
    ).toBe(1);
  });

  it("ignores a malformed status total", () => {
    expect(
      resolveTotalBlocks({
        statusTotalBlocks: Number.NaN,
        session: { pomodoroBlocks: blocks(2) },
        blockNumber: 1,
      }),
    ).toBe(2);
  });
});
