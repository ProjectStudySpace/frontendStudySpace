/**
 * Scroll storytelling math: maps a 0..1 scroll progress over a pinned stage
 * to the active step and how far into that step the reader is.
 */

const clamp01 = (value: number): number =>
  Number.isNaN(value) ? 0 : Math.min(1, Math.max(0, value));

/** Index of the active step; each step owns an equal slice of progress. */
export function stepForProgress(progress: number, count: number): number {
  if (count <= 0) return 0;
  return Math.min(count - 1, Math.floor(clamp01(progress) * count));
}

/** Progress (0..1) within the active step's slice. */
export function stepLocalProgress(progress: number, count: number): number {
  if (count <= 0) return 0;
  const p = clamp01(progress);
  return clamp01(p * count - stepForProgress(p, count));
}
