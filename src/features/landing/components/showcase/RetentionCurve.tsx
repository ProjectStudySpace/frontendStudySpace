import React, { useEffect, useMemo, useRef } from "react";
import {
  animate,
  motion,
  useInView,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type MotionValue,
} from "motion/react";
import { useTranslation } from "react-i18next";
import { REVIEW_INTERVALS, retentionChart } from "../../motion/showcase";

const WIDTH = 600;
const HEIGHT = 320;
/** Seconds the curve takes to draw from the first to the last review. */
const DRAW_DURATION = 3.2;

interface MarkerProps {
  x: number;
  y: number;
  at: number;
  label: string;
  progress: MotionValue<number>;
}

/** A review dot that pops in when the drawn curve reaches it. */
const ReviewMarker: React.FC<MarkerProps> = ({ x, y, at, label, progress }) => {
  const range = [Math.max(0, at - 0.015), Math.min(1, at + 0.025)];
  const scale = useTransform(progress, range, [0, 1]);
  const opacity = useTransform(progress, range, [0, 1]);
  const labelY = useTransform(progress, range, [8, 0]);

  return (
    <g>
      <motion.line
        x1={x}
        x2={x}
        y1={y}
        y2={HEIGHT * 0.88}
        stroke="#a5b4fc"
        strokeDasharray="3 5"
        style={{ opacity }}
      />
      <motion.circle
        cx={x}
        cy={y}
        r={9}
        fill="white"
        stroke="#7c3aed"
        strokeWidth={3}
        style={{ scale, opacity, transformOrigin: `${x}px ${y}px` }}
      />
      <motion.g style={{ opacity, y: labelY }}>
        <rect
          x={x - 26}
          y={y - 40}
          width={52}
          height={22}
          rx={11}
          fill="#312e81"
        />
        <text
          x={x}
          y={y - 25}
          textAnchor="middle"
          fontSize={12}
          fontWeight={600}
          fill="white"
        >
          {label}
        </text>
      </motion.g>
    </g>
  );
};

/**
 * Forgetting curve that plays once when the scene comes into view: the
 * retention line draws itself, every review marker pops in with the interval
 * that preceded it, and the chart then stays complete. Static and complete
 * under reduced motion.
 */
export const RetentionCurve: React.FC = () => {
  const { t } = useTranslation();
  const reducedMotion = useReducedMotion() ?? false;
  const ref = useRef<HTMLDivElement>(null);
  const chart = useMemo(
    () =>
      retentionChart({
        width: WIDTH,
        height: HEIGHT,
        intervals: REVIEW_INTERVALS,
      }),
    [],
  );
  const noReview = useMemo(
    () => retentionChart({ width: WIDTH, height: HEIGHT, intervals: [] }),
    [],
  );

  const inView = useInView(ref, { once: true, amount: 0.5 });
  const progress = useMotionValue(0);

  useEffect(() => {
    if (reducedMotion) {
      progress.set(1);
      return;
    }
    if (!inView) return;
    const controls = animate(progress, 1, {
      duration: DRAW_DURATION,
      ease: "easeInOut",
    });
    return () => controls.stop();
  }, [inView, reducedMotion, progress]);

  return (
    <div
      ref={ref}
      className="relative rounded-3xl border border-indigo-100 bg-white p-4 sm:p-6 shadow-[0_30px_80px_-40px_rgba(79,70,229,0.45)]"
    >
      <div className="flex flex-wrap items-center justify-between gap-2 mb-3 text-xs sm:text-sm">
        <span className="font-semibold text-gray-900">
          {t("landing.showcase.spacedRepetition.chartTitle")}
        </span>
        <span className="flex items-center gap-4 text-gray-500">
          <span className="flex items-center gap-1.5">
            <span className="h-0.5 w-5 rounded bg-gray-300" />
            {t("landing.showcase.spacedRepetition.legendWithout")}
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-1 w-5 rounded bg-gradient-to-r from-indigo-500 to-pink-500" />
            {t("landing.showcase.spacedRepetition.legendWith")}
          </span>
        </span>
      </div>

      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="w-full h-auto overflow-visible"
        role="img"
        aria-label={t("landing.showcase.spacedRepetition.chartLabel")}
      >
        <defs>
          <linearGradient id="retention-stroke" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#6366f1" />
            <stop offset="55%" stopColor="#a855f7" />
            <stop offset="100%" stopColor="#ec4899" />
          </linearGradient>
        </defs>

        {[0.25, 0.5, 0.75].map((ratio) => {
          const y = chart.top + (chart.bottom - chart.top) * ratio;
          return (
            <line
              key={ratio}
              x1={0}
              x2={WIDTH}
              y1={y}
              y2={y}
              stroke="#eef2ff"
              strokeWidth={1}
            />
          );
        })}
        <line
          x1={0}
          x2={WIDTH}
          y1={chart.bottom}
          y2={chart.bottom}
          stroke="#c7d2fe"
        />
        <text x={4} y={chart.top - 8} fontSize={11} fill="#6b7280">
          {t("landing.showcase.spacedRepetition.axisRecall")}
        </text>
        <text
          x={WIDTH - 4}
          y={HEIGHT - 6}
          fontSize={11}
          fill="#6b7280"
          textAnchor="end"
        >
          {t("landing.showcase.spacedRepetition.axisTime")}
        </text>

        <path
          d={noReview.d}
          fill="none"
          stroke="#d1d5db"
          strokeWidth={2}
          strokeDasharray="6 6"
        />
        <motion.path
          d={chart.d}
          fill="none"
          stroke="url(#retention-stroke)"
          strokeWidth={4}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={{ pathLength: progress }}
        />

        {chart.markers.map((marker) => (
          <ReviewMarker
            key={marker.days}
            {...marker}
            progress={progress}
            label={t("landing.showcase.spacedRepetition.interval", {
              days: marker.days,
            })}
          />
        ))}
      </svg>
      <p className="mt-2 text-[11px] sm:text-xs text-gray-400">
        {t("landing.showcase.sampleNote")}
      </p>
    </div>
  );
};
