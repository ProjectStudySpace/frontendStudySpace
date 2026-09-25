import { describe, expect, it } from "vitest";
import {
  REVIEW_INTERVALS,
  formatClock,
  progressFrame,
  retentionChart,
  reviewDays,
  ringOffset,
  seededShuffle,
} from "./showcase";

describe("retentionChart", () => {
  const box = { width: 600, height: 300, intervals: [...REVIEW_INTERVALS] };

  it("draws a single polyline that starts at the left edge", () => {
    const { d } = retentionChart(box);
    expect(d.startsWith("M 0 ")).toBe(true);
    expect(d.match(/M/g)).toHaveLength(1);
    expect(d).not.toMatch(/[CQAZ]/);
  });

  it("places one review marker per interval, in order along the path", () => {
    const { markers } = retentionChart(box);
    expect(markers.map((m) => m.days)).toEqual([1, 3, 7, 21]);
    markers.forEach((marker, i) => {
      expect(marker.at).toBeGreaterThan(0);
      expect(marker.at).toBeLessThan(1);
      expect(marker.x).toBeLessThan(box.width);
      if (i > 0) {
        expect(marker.at).toBeGreaterThan(markers[i - 1].at);
        expect(marker.x).toBeGreaterThan(markers[i - 1].x);
      }
    });
  });

  it("restores recall to the top at every review", () => {
    const { markers, top } = retentionChart(box);
    markers.forEach((marker) => expect(marker.y).toBe(top));
  });

  it("forgets less after every review", () => {
    const { floors } = retentionChart(box);
    expect(floors).toHaveLength(box.intervals.length + 1);
    for (let i = 1; i < floors.length; i++) {
      expect(floors[i]).toBeGreaterThan(floors[i - 1]);
    }
    floors.forEach((floor) => {
      expect(floor).toBeGreaterThan(0);
      expect(floor).toBeLessThan(1);
    });
  });

  it("stays inside the box", () => {
    const { d } = retentionChart(box);
    const numbers = (d.match(/-?\d+(\.\d+)?/g) ?? []).map(Number);
    for (let i = 0; i < numbers.length; i += 2) {
      expect(numbers[i]).toBeGreaterThanOrEqual(0);
      expect(numbers[i]).toBeLessThanOrEqual(box.width);
      expect(numbers[i + 1]).toBeGreaterThanOrEqual(0);
      expect(numbers[i + 1]).toBeLessThanOrEqual(box.height);
    }
  });

  it("handles no reviews as a single decay", () => {
    const { markers, floors } = retentionChart({ ...box, intervals: [] });
    expect(markers).toEqual([]);
    expect(floors).toHaveLength(1);
  });
});

describe("reviewDays", () => {
  it("accumulates intervals from the first study day", () => {
    expect(reviewDays(3, [1, 3, 7, 21], 31)).toEqual([3, 4, 7, 14]);
  });

  it("drops days beyond the end of the month", () => {
    expect(reviewDays(20, [1, 3, 7], 30)).toEqual([20, 21, 24]);
  });

  it("returns nothing for a start outside the month", () => {
    expect(reviewDays(0, [1], 30)).toEqual([]);
    expect(reviewDays(31, [1], 30)).toEqual([]);
  });
});

describe("seededShuffle", () => {
  const items = ["a", "b", "c", "d", "e", "f", "g"];

  it("is deterministic for a seed", () => {
    expect(seededShuffle(items, 7)).toEqual(seededShuffle(items, 7));
  });

  it("returns a permutation without mutating the input", () => {
    const copy = [...items];
    const shuffled = seededShuffle(items, 3);
    expect(items).toEqual(copy);
    expect([...shuffled].sort()).toEqual([...items].sort());
  });

  it("produces different orders for different seeds", () => {
    const orders = new Set(
      [1, 2, 3, 4, 5].map((seed) => seededShuffle(items, seed).join("")),
    );
    expect(orders.size).toBeGreaterThan(1);
  });
});

describe("formatClock", () => {
  it("formats minutes and seconds with padding", () => {
    expect(formatClock(1500)).toBe("25:00");
    expect(formatClock(247)).toBe("04:07");
  });

  it("clamps negatives and rounds fractions down", () => {
    expect(formatClock(-3)).toBe("00:00");
    expect(formatClock(59.9)).toBe("00:59");
  });
});

describe("ringOffset", () => {
  it("is zero when full and the circumference when empty", () => {
    expect(ringOffset(100, 100, 200)).toBe(0);
    expect(ringOffset(0, 100, 200)).toBe(200);
    expect(ringOffset(25, 100, 200)).toBe(150);
  });

  it("clamps out-of-range values and a zero total", () => {
    expect(ringOffset(150, 100, 200)).toBe(0);
    expect(ringOffset(-5, 100, 200)).toBe(200);
    expect(ringOffset(5, 0, 200)).toBe(200);
  });
});

describe("progressFrame", () => {
  it("starts empty", () => {
    expect(progressFrame(0)).toEqual({
      streakDays: 0,
      completedToday: 0,
      xpPercent: 0,
      badgeUnlocked: false,
    });
  });

  it("grows monotonically and caps at a week", () => {
    let previous = progressFrame(0);
    for (let tick = 1; tick <= 20; tick++) {
      const frame = progressFrame(tick);
      expect(frame.streakDays).toBeGreaterThanOrEqual(previous.streakDays);
      expect(frame.xpPercent).toBeGreaterThanOrEqual(previous.xpPercent);
      expect(frame.streakDays).toBeLessThanOrEqual(7);
      expect(frame.xpPercent).toBeLessThanOrEqual(100);
      previous = frame;
    }
  });

  it("unlocks the week badge exactly when the streak reaches seven", () => {
    expect(progressFrame(6).badgeUnlocked).toBe(false);
    expect(progressFrame(7)).toMatchObject({ streakDays: 7, badgeUnlocked: true });
  });

  it("treats negative ticks as the start", () => {
    expect(progressFrame(-4)).toEqual(progressFrame(0));
  });
});
