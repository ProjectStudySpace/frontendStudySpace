import { describe, expect, it } from "vitest";
import { driftLoop, forgettingCurve, parallaxOffset } from "./background";

const commands = (d: string) => d.match(/[MC]/g) ?? [];

// Every numeric coordinate in the path, paired as [x, y].
const coordinates = (d: string): Array<[number, number]> => {
  const numbers = (d.match(/-?\d+(\.\d+)?/g) ?? []).map(Number);
  const pairs: Array<[number, number]> = [];
  for (let i = 0; i < numbers.length; i += 2) {
    pairs.push([numbers[i], numbers[i + 1]]);
  }
  return pairs;
};

describe("forgettingCurve", () => {
  const base = { width: 1200, height: 400, reviews: 3 };

  it("starts with a move command and uses one decay plus one recall per review", () => {
    const { d } = forgettingCurve(base);
    expect(d.startsWith("M")).toBe(true);
    const cs = commands(d);
    expect(cs.filter((c) => c === "M")).toHaveLength(1);
    expect(cs.filter((c) => c === "C")).toHaveLength(base.reviews * 2 + 1);
  });

  it("spans the full width and stays inside the box", () => {
    const { d } = forgettingCurve(base);
    const points = coordinates(d);
    expect(points[0][0]).toBe(0);
    expect(points[points.length - 1][0]).toBe(base.width);
    for (const [x, y] of points) {
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThanOrEqual(base.width);
      expect(y).toBeGreaterThanOrEqual(0);
      expect(y).toBeLessThanOrEqual(base.height);
    }
  });

  it("returns one node per review, placed where recall peaks", () => {
    const { nodes } = forgettingCurve(base);
    expect(nodes).toHaveLength(base.reviews);
    const xs = nodes.map((n) => n.x);
    expect([...xs].sort((a, b) => a - b)).toEqual(xs);
    for (const node of nodes) {
      expect(node.x).toBeGreaterThan(0);
      expect(node.x).toBeLessThan(base.width);
    }
  });

  it("forgets less after each review (troughs get shallower)", () => {
    const { troughs } = forgettingCurve(base);
    expect(troughs).toHaveLength(base.reviews + 1);
    for (let i = 1; i < troughs.length; i++) {
      // Smaller y is higher on screen, i.e. more retained.
      expect(troughs[i]).toBeLessThan(troughs[i - 1]);
    }
  });

  it("widens the interval between reviews (spaced repetition)", () => {
    const { nodes } = forgettingCurve({ ...base, reviews: 4 });
    const gaps = nodes.slice(1).map((n, i) => n.x - nodes[i].x);
    for (let i = 1; i < gaps.length; i++) {
      expect(gaps[i]).toBeGreaterThan(gaps[i - 1]);
    }
  });

  it("degrades to a single decay when there are no reviews", () => {
    const { d, nodes } = forgettingCurve({ ...base, reviews: -2 });
    expect(nodes).toEqual([]);
    expect(commands(d).filter((c) => c === "C")).toHaveLength(1);
  });
});

describe("driftLoop", () => {
  it("builds a seamless infinite mirrored loop", () => {
    expect(driftLoop(24)).toEqual({
      duration: 24,
      delay: 0,
      repeat: Infinity,
      repeatType: "mirror",
      ease: "easeInOut",
    });
  });

  it("accepts a delay and clamps negative values", () => {
    expect(driftLoop(-5, -1)).toMatchObject({ duration: 0, delay: 0 });
    expect(driftLoop(18, 2)).toMatchObject({ duration: 18, delay: 2 });
  });
});

describe("parallaxOffset", () => {
  const viewport = { width: 1000, height: 800 };

  it("is zero at the viewport center", () => {
    expect(parallaxOffset({ x: 500, y: 400 }, viewport, 20)).toEqual({
      x: 0,
      y: 0,
    });
  });

  it("maps edges to plus/minus strength", () => {
    expect(parallaxOffset({ x: 0, y: 0 }, viewport, 20)).toEqual({
      x: -20,
      y: -20,
    });
    expect(parallaxOffset({ x: 1000, y: 800 }, viewport, 20)).toEqual({
      x: 20,
      y: 20,
    });
  });

  it("clamps pointers outside the viewport", () => {
    expect(parallaxOffset({ x: 5000, y: -300 }, viewport, 10)).toEqual({
      x: 10,
      y: -10,
    });
  });

  it("returns zero for an empty viewport", () => {
    expect(
      parallaxOffset({ x: 10, y: 10 }, { width: 0, height: 0 }, 10),
    ).toEqual({ x: 0, y: 0 });
  });
});
