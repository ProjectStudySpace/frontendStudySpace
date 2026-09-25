import type { Variants } from "motion/react";

/**
 * Shared motion vocabulary for the landing page. Every factory is pure and
 * returns plain Motion variants, so choreography stays consistent and testable.
 * Only opacity and transforms are animated to stay on the compositor.
 */

/** Calm, decelerating entrance curve used by every reveal. */
export const EASE_OUT_EXPO: [number, number, number, number] = [
  0.22, 1, 0.36, 1,
];

export interface RevealOptions {
  /** Vertical travel in px before settling. */
  distance?: number;
  /** Seconds. */
  duration?: number;
  /** Seconds. */
  delay?: number;
}

export interface ScaleInOptions {
  /** Starting scale, settles at 1. */
  from?: number;
  duration?: number;
  delay?: number;
}

const nonNegative = (value: number): number => Math.max(0, value);

export function fadeUp({
  distance = 20,
  duration = 0.6,
  delay = 0,
}: RevealOptions = {}): Variants {
  return {
    hidden: { opacity: 0, y: distance },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: nonNegative(duration),
        delay: nonNegative(delay),
        ease: EASE_OUT_EXPO,
      },
    },
  };
}

export function scaleIn({
  from = 0.96,
  duration = 0.7,
  delay = 0,
}: ScaleInOptions = {}): Variants {
  return {
    hidden: { opacity: 0, scale: from },
    visible: {
      opacity: 1,
      scale: 1,
      transition: {
        duration: nonNegative(duration),
        delay: nonNegative(delay),
        ease: EASE_OUT_EXPO,
      },
    },
  };
}

/** Parent variants that cascade `hidden`/`visible` to children in sequence. */
export function staggerContainer(stagger = 0.08, delayChildren = 0): Variants {
  return {
    hidden: {},
    visible: {
      transition: {
        staggerChildren: nonNegative(stagger),
        delayChildren: nonNegative(delayChildren),
      },
    },
  };
}

/**
 * Reveal variants that respect the user's motion preference: under reduced
 * motion the element only fades in, without any positional travel.
 */
export function getRevealVariants(
  reducedMotion: boolean,
  options: RevealOptions = {},
): Variants {
  if (!reducedMotion) return fadeUp(options);
  return {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.3,
        delay: nonNegative(options.delay ?? 0),
        ease: "linear",
      },
    },
  };
}
