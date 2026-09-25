/**
 * Pure geometry and timeline behind the "flashcards and study notes, with
 * images" illustration. Deterministic sample data for the landing page only.
 */

/**
 * R-wave positions (x, in a 300-wide strip) of the sample atrial fibrillation
 * ECG. Every R-R interval differs: the rhythm is irregularly irregular.
 */
export const AFIB_BEATS: readonly number[] = [24, 66, 88, 142, 176, 244];

export interface EcgStripOptions {
  width: number;
  height: number;
  /** x positions of each QRS complex, in strip coordinates. */
  beats: readonly number[];
  /** Horizontal spacing of the fibrillatory baseline samples. */
  step?: number;
}

const round = (value: number): number => Number(value.toFixed(2));

/** Relative amplitude of successive fibrillatory baseline samples. */
const FIBRILLATION = [1, -0.6, 0.8, -1, 0.5, -0.8, 0.3, -0.5];
/** Horizontal extent of a complex around its R wave: QRS then T wave. */
const COMPLEX_BEFORE = 3;
const COMPLEX_AFTER = 17;

/**
 * An ECG rhythm strip as a single M/L polyline: a low-amplitude fibrillating
 * baseline with no P waves, and one narrow QRS complex plus T wave per beat.
 */
export function ecgStripPath({
  width,
  height,
  beats,
  step = 4,
}: EcgStripOptions): string {
  const baseline = height * 0.6;
  const amplitude = height * 0.03;
  const points: Array<[number, number]> = [];
  let sample = 0;
  let x = 0;

  const wiggleUntil = (limit: number) => {
    while (x < limit) {
      const wave = FIBRILLATION[sample % FIBRILLATION.length];
      points.push([x, baseline + amplitude * wave]);
      sample += 1;
      x += step;
    }
  };

  [...beats]
    .sort((a, b) => a - b)
    .forEach((beat) => {
      wiggleUntil(beat - COMPLEX_BEFORE);
      points.push(
        [beat - COMPLEX_BEFORE, baseline],
        [beat - 1.5, baseline + height * 0.08],
        [beat, height * 0.1],
        [beat + 1.5, baseline + height * 0.25],
        [beat + COMPLEX_BEFORE, baseline],
        [beat + 10, baseline - height * 0.12],
        [beat + COMPLEX_AFTER, baseline],
      );
      x = beat + COMPLEX_AFTER + step;
    });

  wiggleUntil(width);
  points.push([width, baseline]);

  return points
    .map(([px, py], i) => `${i === 0 ? "M" : "L"} ${round(px)} ${round(py)}`)
    .join(" ");
}

/** Spacing between consecutive beats (the R-R intervals). */
export function rrIntervals(beats: readonly number[]): number[] {
  return beats.slice(1).map((beat, i) => beat - beats[i]);
}

export interface RichContentFrame {
  bookOpen: boolean;
  diagramDrawn: boolean;
  cardFlipped: boolean;
}

/** Ticks in one loop of the illustration. */
export const RICH_CONTENT_LOOP = 6;

/**
 * One frame of the looping illustration: the note opens and draws its
 * diagram, the image flashcard flips to its answer, then both reset.
 */
export function richContentFrame(tick: number): RichContentFrame {
  const phase = Math.max(0, Math.floor(tick)) % RICH_CONTENT_LOOP;
  return {
    bookOpen: phase >= 1 && phase <= 4,
    diagramDrawn: phase >= 2 && phase <= 4,
    cardFlipped: phase >= 3 && phase <= 4,
  };
}
