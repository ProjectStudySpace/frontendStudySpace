import type { Transition } from "motion/react";

/**
 * Pure geometry and timing for the hero background. Kept free of React so the
 * shapes and loops can be reasoned about (and tested) in isolation.
 */

export interface Point {
  x: number;
  y: number;
}

export interface ForgettingCurveOptions {
  width: number;
  height: number;
  /** Number of review moments along the curve. */
  reviews: number;
  /** How much each interval grows relative to the previous one. */
  growth?: number;
}

export interface ForgettingCurve {
  /** SVG path data. */
  d: string;
  /** Review points, where recall is restored to the top. */
  nodes: Point[];
  /** Lowest y reached by each decay segment, in order. */
  troughs: number[];
}

const TOP_RATIO = 0.15;
const BOTTOM_RATIO = 0.9;
/** Portion of each interval spent climbing back after a review. */
const RECALL_RATIO = 0.18;

const round = (value: number): number => Number(value.toFixed(2));
const pair = (x: number, y: number): string => `${round(x)} ${round(y)}`;

/**
 * A smooth spaced-repetition "forgetting curve": retention decays, a review
 * restores it, and every later decay is shallower and the interval longer.
 */
export function forgettingCurve({
  width,
  height,
  reviews,
  growth = 1.35,
}: ForgettingCurveOptions): ForgettingCurve {
  const reviewCount = Math.max(0, Math.floor(reviews));
  const segments = reviewCount + 1;
  const top = height * TOP_RATIO;
  const bottom = height * BOTTOM_RATIO;

  const weights = Array.from({ length: segments }, (_, i) => growth ** i);
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);

  const parts: string[] = [`M ${pair(0, top)}`];
  const nodes: Point[] = [];
  const troughs: number[] = [];
  let start = 0;

  weights.forEach((weight, i) => {
    const isLast = i === segments - 1;
    const span = (width * weight) / totalWeight;
    const end = isLast ? width : start + span;
    const trough = top + (bottom - top) * (0.85 / (1 + 0.7 * i));
    const decayEnd = isLast ? end : end - span * RECALL_RATIO;
    troughs.push(round(trough));

    parts.push(
      `C ${pair(start + span * 0.12, top + (trough - top) * 0.75)}, ` +
        `${pair(start + span * 0.35, trough)}, ${pair(decayEnd, trough)}`,
    );

    if (!isLast) {
      const mid = decayEnd + (end - decayEnd) / 2;
      parts.push(
        `C ${pair(mid, trough)}, ${pair(mid, top)}, ${pair(end, top)}`,
      );
      nodes.push({ x: round(end), y: round(top) });
    }
    start = end;
  });

  return { d: parts.join(" "), nodes, troughs };
}

/** An endless, seamless back-and-forth loop for ambient drift. */
export function driftLoop(duration: number, delay = 0): Transition {
  return {
    duration: Math.max(0, duration),
    delay: Math.max(0, delay),
    repeat: Infinity,
    repeatType: "mirror",
    ease: "easeInOut",
  };
}

/**
 * Maps a pointer position to an offset in [-strength, strength] on each axis,
 * zero at the viewport center.
 */
export function parallaxOffset(
  pointer: Point,
  viewport: { width: number; height: number },
  strength: number,
): Point {
  const axis = (value: number, size: number): number => {
    if (size <= 0) return 0;
    const normalized = Math.min(1, Math.max(0, value / size)) * 2 - 1;
    return round(normalized * strength) || 0;
  };
  return {
    x: axis(pointer.x, viewport.width),
    y: axis(pointer.y, viewport.height),
  };
}
