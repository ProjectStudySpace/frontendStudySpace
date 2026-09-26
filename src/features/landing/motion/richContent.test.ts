import { describe, expect, it } from "vitest";
import {
  AFIB_BEATS,
  IMAGE_CARD_LOOP,
  ecgStripPath,
  imageCardFrame,
  rrIntervals,
  studyNoteFrame,
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

describe("imageCardFrame", () => {
  it("starts on the question side of the card, in the first loop", () => {
    expect(imageCardFrame(0)).toEqual({ flipped: false, loop: 0 });
  });

  it("shows the question first, then flips to the answer", () => {
    expect(imageCardFrame(1).flipped).toBe(false);
    expect(imageCardFrame(2).flipped).toBe(true);
    expect(imageCardFrame(IMAGE_CARD_LOOP - 1).flipped).toBe(true);
  });

  it("repeats every loop, counting loops, and treats negative ticks as the first frame", () => {
    for (let t = 0; t < IMAGE_CARD_LOOP; t++) {
      expect(imageCardFrame(t + IMAGE_CARD_LOOP)).toEqual({
        flipped: imageCardFrame(t).flipped,
        loop: 1,
      });
    }
    expect(imageCardFrame(-3)).toEqual(imageCardFrame(0));
  });
});

describe("studyNoteFrame", () => {
  it("starts closed with nothing drawn", () => {
    expect(studyNoteFrame(0)).toEqual({
      open: false,
      anatomyShown: false,
      potentialDrawn: false,
    });
  });

  it("opens, then labels the anatomy, then draws the action potential", () => {
    expect(studyNoteFrame(1)).toEqual({
      open: true,
      anatomyShown: false,
      potentialDrawn: false,
    });
    expect(studyNoteFrame(2).anatomyShown).toBe(true);
    expect(studyNoteFrame(2).potentialDrawn).toBe(false);
    expect(studyNoteFrame(3).potentialDrawn).toBe(true);
  });

  it("opens once and stays open: every later tick rests fully open", () => {
    const rest = { open: true, anatomyShown: true, potentialDrawn: true };
    [3, 4, 10, 99].forEach((tick) => expect(studyNoteFrame(tick)).toEqual(rest));
  });

  it("treats negative ticks as the closed first frame", () => {
    expect(studyNoteFrame(-2)).toEqual(studyNoteFrame(0));
  });
});
