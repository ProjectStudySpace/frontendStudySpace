import { useEffect, useState, type RefObject } from "react";
import { useInView, useReducedMotion } from "motion/react";

/**
 * True while an autoplaying illustration should run: its element is on screen
 * and the user has not asked for reduced motion. Loops pause off-screen.
 */
export function useLoopActive(
  ref: RefObject<Element | null>,
  amount = 0.35,
): boolean {
  const inView = useInView(ref, { amount });
  const reducedMotion = useReducedMotion() ?? false;
  return inView && !reducedMotion;
}

/** Counter that advances every `intervalMs` while `active`, then holds. */
export function useTicker(active: boolean, intervalMs: number): number {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!active) return;
    const id = window.setInterval(() => setTick((t) => t + 1), intervalMs);
    return () => window.clearInterval(id);
  }, [active, intervalMs]);

  return tick;
}
