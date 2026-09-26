import { describe, expect, it } from "vitest";
import { stepForProgress, stepLocalProgress } from "./story";

describe("stepForProgress", () => {
  it("splits progress into equal slices per step", () => {
    expect(stepForProgress(0, 3)).toBe(0);
    expect(stepForProgress(0.32, 3)).toBe(0);
    expect(stepForProgress(0.34, 3)).toBe(1);
    expect(stepForProgress(0.67, 3)).toBe(2);
  });

  it("keeps the last step active at the very end", () => {
    expect(stepForProgress(1, 3)).toBe(2);
  });

  it("clamps out-of-range and invalid input", () => {
    expect(stepForProgress(-0.5, 3)).toBe(0);
    expect(stepForProgress(4, 3)).toBe(2);
    expect(stepForProgress(Number.NaN, 3)).toBe(0);
    expect(stepForProgress(0.5, 0)).toBe(0);
  });
});

describe("stepLocalProgress", () => {
  it("reports how far into the active step the scroll is", () => {
    expect(stepLocalProgress(0, 4)).toBe(0);
    expect(stepLocalProgress(0.125, 4)).toBeCloseTo(0.5);
    expect(stepLocalProgress(0.375, 4)).toBeCloseTo(0.5);
  });

  it("completes the last step at the end", () => {
    expect(stepLocalProgress(1, 3)).toBe(1);
  });

  it("clamps out-of-range and invalid input", () => {
    expect(stepLocalProgress(-1, 3)).toBe(0);
    expect(stepLocalProgress(2, 3)).toBe(1);
    expect(stepLocalProgress(Number.NaN, 3)).toBe(0);
    expect(stepLocalProgress(0.5, 0)).toBe(0);
  });
});
