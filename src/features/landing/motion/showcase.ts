/**
 * Pure geometry and timelines behind the feature showcase illustrations.
 * Everything here is deterministic sample data for the landing page; nothing
 * mirrors a real user's account.
 */

/** Sample spacing between reviews, in days, used across the illustrations. */
export const REVIEW_INTERVALS = [1, 3, 7, 21] as const;

export interface RetentionChartOptions {
  width: number;
  height: number;
  /** Days between consecutive reviews. */
  intervals: readonly number[];
  /** Points sampled per decay segment. */
  samples?: number;
  /** How much wider every later segment is than the previous one. */
  growth?: number;
}

export interface RetentionMarker {
  x: number;
  y: number;
  /** Interval that led to this review, in days. */
  days: number;
  /** Fraction (0..1) of the total path length at which the review happens. */
  at: number;
}

export interface RetentionChart {
  /** SVG path data made only of M/L commands. */
  d: string;
  markers: RetentionMarker[];
  /** Retention (0..1) reached at the end of each decay segment. */
  floors: number[];
  /** y coordinate of full recall. */
  top: number;
  /** y coordinate of zero recall. */
  bottom: number;
}

const round = (value: number): number => Number(value.toFixed(2));
const clamp = (value: number, min: number, max: number): number =>
  Math.min(max, Math.max(min, value));

/** Decay rate for the i-th segment; each review makes forgetting slower. */
const decayRate = (index: number): number => 2.2 / 1.8 ** index;
/** Share of a segment spent on the "review" jump back to full recall. */
const JUMP_RATIO = 0.04;

/**
 * A spaced-repetition retention chart: recall decays exponentially, every
 * review restores it to the top, and every later decay is shallower.
 */
export function retentionChart({
  width,
  height,
  intervals,
  samples = 24,
  growth = 1.35,
}: RetentionChartOptions): RetentionChart {
  const top = round(height * 0.12);
  const bottom = round(height * 0.88);
  const segments = intervals.length + 1;
  const weights = Array.from({ length: segments }, (_, i) => growth ** i);
  const totalWeight = weights.reduce((sum, w) => sum + w, 0);
  const steps = Math.max(2, Math.floor(samples));

  const points: Array<[number, number]> = [];
  const jumpIndices: number[] = [];
  const floors: number[] = [];
  let start = 0;

  weights.forEach((weight, i) => {
    const isLast = i === segments - 1;
    const span = (width * weight) / totalWeight;
    const end = isLast ? width : start + span;
    const decayEnd = isLast ? end : end - span * JUMP_RATIO;
    const rate = decayRate(i);

    for (let j = i === 0 ? 0 : 1; j <= steps; j++) {
      const s = j / steps;
      const retention = Math.exp(-rate * s);
      const x = start + (decayEnd - start) * s;
      points.push([round(x), round(top + (1 - retention) * (bottom - top))]);
    }
    floors.push(round(Math.exp(-rate)));

    if (!isLast) {
      points.push([round(end), top]);
      jumpIndices.push(points.length - 1);
    }
    start = end;
  });

  const cumulative: number[] = [0];
  for (let i = 1; i < points.length; i++) {
    const [x0, y0] = points[i - 1];
    const [x1, y1] = points[i];
    cumulative.push(cumulative[i - 1] + Math.hypot(x1 - x0, y1 - y0));
  }
  const total = cumulative[cumulative.length - 1] || 1;

  const markers = jumpIndices.map((pointIndex, i) => ({
    x: points[pointIndex][0],
    y: top,
    days: intervals[i],
    at: round(cumulative[pointIndex] / total),
  }));

  const d = points
    .map(([x, y], i) => `${i === 0 ? "M" : "L"} ${x} ${y}`)
    .join(" ");

  return { d, markers, floors, top, bottom };
}

/**
 * Days of the month on which a card is studied, starting on `start` and then
 * after every interval, dropping anything past the end of the month.
 */
export function reviewDays(
  start: number,
  intervals: readonly number[],
  daysInMonth: number,
): number[] {
  if (start < 1 || start > daysInMonth) return [];
  const days = [start];
  let current = start;
  for (const interval of intervals) {
    current += interval;
    if (current > daysInMonth) break;
    days.push(current);
  }
  return days;
}

/** Small deterministic PRNG (mulberry32) returning values in [0, 1). */
function mulberry32(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Fisher-Yates shuffle with a seed, so looping animations are reproducible. */
export function seededShuffle<T>(items: readonly T[], seed: number): T[] {
  const random = mulberry32(seed);
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/** "mm:ss" for a countdown, never negative. */
export function formatClock(seconds: number): string {
  const whole = Math.max(0, Math.floor(seconds));
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${pad(Math.floor(whole / 60))}:${pad(whole % 60)}`;
}

/** stroke-dashoffset for a ring that empties as `remaining` runs out. */
export function ringOffset(
  remaining: number,
  total: number,
  circumference: number,
): number {
  if (total <= 0) return circumference;
  return circumference * (1 - clamp(remaining / total, 0, 1));
}

export interface ProgressFrame {
  streakDays: number;
  completedToday: number;
  xpPercent: number;
  badgeUnlocked: boolean;
}

/** Days needed for the sample "Week Streak" badge. */
export const WEEK_STREAK = 7;

/** One frame of the looping progress illustration; one tick is one day. */
export function progressFrame(tick: number): ProgressFrame {
  const t = Math.max(0, Math.floor(tick));
  const streakDays = Math.min(WEEK_STREAK, t);
  return {
    streakDays,
    completedToday: Math.min(24, t * 3),
    xpPercent: Math.min(100, Math.round((t / 9) * 100)),
    badgeUnlocked: streakDays >= WEEK_STREAK,
  };
}
