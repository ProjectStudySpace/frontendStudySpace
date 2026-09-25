import React, { useEffect, useMemo, useRef } from "react";
import {
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useSpring,
  useTransform,
} from "motion/react";
import { driftLoop, forgettingCurve, parallaxOffset } from "../motion/background";
import { EASE_OUT_EXPO } from "../motion/presets";

const VIEW_WIDTH = 1440;
const VIEW_HEIGHT = 800;
const PARALLAX_STRENGTH = 18;

/**
 * Curves live in horizontal bands of the canvas. Each one is a forgetting
 * curve: memory decays, a review restores it, and it fades more slowly after.
 */
const CURVES = [
  { offsetY: 40, height: 360, reviews: 3, opacity: 0.5, drift: 22 },
  { offsetY: 250, height: 320, reviews: 4, opacity: 0.35, drift: 28 },
  { offsetY: 440, height: 300, reviews: 2, opacity: 0.25, drift: 19 },
] as const;

/** Large soft brand-color blobs, drifting on long mirrored loops. */
const BLOBS: Array<{
  className: string;
  path: { x: number[]; y: number[] };
  duration: number;
}> = [
  {
    className: "-top-32 -left-24 w-[28rem] h-[28rem] bg-indigo-300/40",
    path: { x: [0, 60, -20], y: [0, 40, 80] },
    duration: 26,
  },
  {
    className: "top-1/4 -right-32 w-[32rem] h-[32rem] bg-purple-300/35",
    path: { x: [0, -70, -30], y: [0, 50, -30] },
    duration: 30,
  },
  {
    className: "-bottom-40 left-1/3 w-[26rem] h-[26rem] bg-pink-200/40",
    path: { x: [0, 40, 90], y: [0, -50, -20] },
    duration: 22,
  },
];

const DRAW_DURATION = 2.4;

/**
 * Decorative, full-bleed animated backdrop for the hero ("memory network").
 * Sits behind content, never receives pointer events, pauses its loops when
 * off-screen and renders statically under reduced motion.
 */
export const HeroBackground: React.FC = () => {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { amount: 0.1 });
  const reducedMotion = useReducedMotion() ?? false;
  const animated = inView && !reducedMotion;

  const pointerX = useMotionValue(0);
  const pointerY = useMotionValue(0);
  const springX = useSpring(pointerX, { stiffness: 40, damping: 20 });
  const springY = useSpring(pointerY, { stiffness: 40, damping: 20 });
  // Curves sit "closer" to the viewer than the blobs, so they move less.
  const curvesX = useTransform(springX, (v) => v * -0.5);
  const curvesY = useTransform(springY, (v) => v * -0.5);

  const curves = useMemo(
    () =>
      CURVES.map((curve) => ({
        ...curve,
        ...forgettingCurve({
          width: VIEW_WIDTH,
          height: curve.height,
          reviews: curve.reviews,
        }),
      })),
    [],
  );

  useEffect(() => {
    const finePointer = window.matchMedia?.("(pointer: fine)").matches ?? false;
    if (!animated || !finePointer) {
      pointerX.set(0);
      pointerY.set(0);
      return;
    }
    const handleMove = (event: PointerEvent) => {
      const offset = parallaxOffset(
        { x: event.clientX, y: event.clientY },
        { width: window.innerWidth, height: window.innerHeight },
        PARALLAX_STRENGTH,
      );
      pointerX.set(offset.x);
      pointerY.set(offset.y);
    };
    window.addEventListener("pointermove", handleMove, { passive: true });
    return () => window.removeEventListener("pointermove", handleMove);
  }, [animated, pointerX, pointerY]);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
    >
      <motion.div className="absolute inset-0" style={{ x: springX, y: springY }}>
        {BLOBS.map((blob, i) => (
          <motion.div
            key={i}
            className={`absolute rounded-full blur-3xl ${blob.className}`}
            animate={animated ? blob.path : { x: 0, y: 0 }}
            transition={animated ? driftLoop(blob.duration) : { duration: 1.2 }}
          />
        ))}
      </motion.div>

      <motion.svg
        className="absolute inset-0 h-full w-full"
        viewBox={`0 0 ${VIEW_WIDTH} ${VIEW_HEIGHT}`}
        preserveAspectRatio="xMidYMid slice"
        style={{ x: curvesX, y: curvesY }}
      >
        <defs>
          <linearGradient id="hero-curve-stroke" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#6366f1" stopOpacity="0" />
            <stop offset="20%" stopColor="#6366f1" />
            <stop offset="60%" stopColor="#9333ea" />
            <stop offset="100%" stopColor="#db2777" stopOpacity="0.2" />
          </linearGradient>
        </defs>

        {curves.map((curve, i) => (
          <g
            key={i}
            opacity={curve.opacity}
            transform={`translate(0 ${curve.offsetY})`}
          >
            <motion.g
              animate={animated ? { y: [0, -14, 6] } : { y: 0 }}
              transition={
                animated ? driftLoop(curve.drift, DRAW_DURATION) : { duration: 1.2 }
              }
            >
              <motion.path
                d={curve.d}
                fill="none"
                stroke="url(#hero-curve-stroke)"
                strokeWidth={1.5}
                strokeLinecap="round"
                initial={{ pathLength: reducedMotion ? 1 : 0 }}
                animate={{ pathLength: 1 }}
                transition={{
                  duration: reducedMotion ? 0 : DRAW_DURATION,
                  delay: reducedMotion ? 0 : 0.3 + i * 0.25,
                  ease: EASE_OUT_EXPO,
                }}
              />
              {curve.nodes.map((node, j) => (
                <motion.circle
                  key={j}
                  cx={node.x}
                  cy={node.y}
                  r={4}
                  fill="#8b5cf6"
                  style={{ transformBox: "fill-box", transformOrigin: "center" }}
                  initial={{ opacity: reducedMotion ? 0.8 : 0, scale: 1 }}
                  animate={
                    animated
                      ? { opacity: [0.35, 0.9], scale: [0.8, 1.35] }
                      : { opacity: 0.8, scale: 1 }
                  }
                  transition={
                    animated
                      ? driftLoop(2.8, DRAW_DURATION * 0.6 + j * 0.45 + i * 0.3)
                      : { duration: 0.6 }
                  }
                />
              ))}
            </motion.g>
          </g>
        ))}
      </motion.svg>

      {/* Fade into the page so the next section starts clean. */}
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-white" />
    </div>
  );
};
