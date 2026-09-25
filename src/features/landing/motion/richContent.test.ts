import { describe, expect, it } from "vitest";
import {
  AFIB_BEATS,
  RICH_CONTENT_LOOP,
  ecgStripPath,
  richContentFrame,
  rrIntervals,
} from "./richContent";

const box = { width: 300, height: 60 };

const points = (d: string): Array<[number, number]> =>
  d
    .replace(/[ML]/g, " ")
    .trim()
    .split(/\s+/)
    .reduce<Array<[number, number]>>((acc, value, i, all) => {
      if (i % 2 === 0) acc.push([Number(value), Number(all[i + 1])]);
      return acc;
    }, []);

describe("ecgStripPath", () => {
  it("draws a single M/L polyline from the left edge to the right edge", () => {
    const d = ecgStripPath({ ...box, beats: AFIB_BEATS });
    expect(d.startsWith("M 0 ")).toBe(true);
    expect(d.match(/M/g)).toHaveLength(1);
    expect(d).not.toMatch(/[CQAZ]/);
    const pts = points(d);
    expect(pts[pts.length - 1][0]).toBe(box.width);
  });

  it("never moves backwards in time and stays inside the box", () => {
    const pts = points(ecgStripPath({ ...box, beats: AFIB_BEATS }));
    pts.forEach(([x, y], i) => {
      expect(y).toBeGreaterThanOrEqual(0);
      expect(y).toBeLessThanOrEqual(box.height);
      if (i > 0) expect(x).toBeGreaterThanOrEqual(pts[i - 1][0]);
    });
  });

  it("draws exactly one tall R spike per beat", () => {
    const pts = points(ecgStripPath({ ...box, beats: AFIB_BEATS }));
    const spikes = pts.filter(([, y]) => y < box.height * 0.3);
    expect(spikes).toHaveLength(AFIB_BEATS.length);
  });

  it("keeps the baseline between beats low-amplitude (no P waves)", () => {
    const pts = points(ecgStripPath({ ...box, beats: [150] }));
    const baseline = box.height * 0.6;
    const farFromBeat = pts.filter(([x]) => x < 120 || x > 190);
    expect(farFromBeat.length).toBeGreaterThan(5);
    farFromBeat.forEach(([, y]) => {
      expect(Math.abs(y - baseline)).toBeLessThanOrEqual(box.height * 0.06);
    });
  });
});

describe("rrIntervals", () => {
  it("returns the spacing between consecutive beats", () => {
    expect(rrIntervals([10, 40, 55])).toEqual([30, 15]);
    expect(rrIntervals([10])).toEqual([]);
  });

  it("makes the sample atrial fibrillation strip irregularly irregular", () => {
    const rr = rrIntervals(AFIB_BEATS);
    expect(rr.length).toBeGreaterThanOrEqual(4);
    expect(new Set(rr).size).toBe(rr.length);
  });
});

describe("richContentFrame", () => {
  it("starts with a closed note and the question side of the card", () => {
    expect(richContentFrame(0)).toEqual({
      bookOpen: false,
      diagramDrawn: false,
      cardFlipped: false,
    });
  });

  it("opens the note, draws its diagram, then flips the card", () => {
    expect(richContentFrame(1).bookOpen).toBe(true);
    expect(richContentFrame(1).cardFlipped).toBe(false);
    expect(richContentFrame(2).diagramDrawn).toBe(true);
    expect(richContentFrame(3).cardFlipped).toBe(true);
  });

  it("repeats every loop and treats negative ticks as the first frame", () => {
    for (let t = 0; t < RICH_CONTENT_LOOP; t++) {
      expect(richContentFrame(t + RICH_CONTENT_LOOP)).toEqual(richContentFrame(t));
    }
    expect(richContentFrame(-4)).toEqual(richContentFrame(0));
  });

  it("closes everything again before the loop restarts", () => {
    const last = richContentFrame(RICH_CONTENT_LOOP - 1);
    expect(last.bookOpen).toBe(false);
    expect(last.cardFlipped).toBe(false);
  });
});
