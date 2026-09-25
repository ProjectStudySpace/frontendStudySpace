import React, { useId, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { useTranslation } from "react-i18next";
import { BookOpen, ImageIcon, RotateCw } from "lucide-react";
import { EASE_OUT_EXPO } from "../../motion/presets";
import {
  AFIB_BEATS,
  RICH_CONTENT_LOOP,
  ecgStripPath,
  richContentFrame,
} from "../../motion/richContent";
import { useLoopActive, useTicker } from "./useSceneLoop";

const ECG_WIDTH = 300;
const ECG_HEIGHT = 60;
const ECG_PATH = ecgStripPath({
  width: ECG_WIDTH,
  height: ECG_HEIGHT,
  beats: AFIB_BEATS,
});

/** Ventricular action potential, phases 0-4 (sample drawing, not to scale). */
const ACTION_POTENTIAL_PATH =
  "M 6 88 H 34 L 38 12 L 46 28 Q 50 24 56 26 C 84 28 104 31 116 37 C 130 47 140 84 154 88 H 194";

const PHASE_LABELS: Array<{ phase: number; x: number; y: number }> = [
  { phase: 0, x: 28, y: 48 },
  { phase: 1, x: 50, y: 16 },
  { phase: 2, x: 86, y: 20 },
  { phase: 3, x: 146, y: 60 },
  { phase: 4, x: 18, y: 80 },
];

const PHASES = ["p0", "p1", "p2", "p3", "p4"] as const;

const K = "landing.showcase.richContent";

/**
 * Rich content: a flashcard whose question is an ECG image flips to its
 * answer, and a two-page study note opens like a book while its diagram
 * draws itself. Loops in view; under reduced motion both rest open.
 */
export const RichContentDemo: React.FC = () => {
  const { t } = useTranslation();
  const reducedMotion = useReducedMotion() ?? false;
  const ref = useRef<HTMLDivElement>(null);
  const gridId = useId().replace(/:/g, "");
  const [manualFlip, setManualFlip] = useState<boolean | null>(null);
  const active = useLoopActive(ref);
  const tick = useTicker(active, 1500);

  const frame = reducedMotion
    ? { bookOpen: true, diagramDrawn: true, cardFlipped: false }
    : richContentFrame(tick);
  const loop = Math.floor(tick / RICH_CONTENT_LOOP);
  const flipped = manualFlip ?? frame.cardFlipped;
  const turn = reducedMotion
    ? { duration: 0 }
    : { duration: 1.1, ease: EASE_OUT_EXPO };

  return (
    <div
      ref={ref}
      className="relative mx-auto max-w-lg space-y-5 rounded-3xl border border-sky-100 bg-gradient-to-br from-sky-50 via-white to-rose-50 p-4 sm:p-6"
    >
      {/* Flashcard with an image on its question side */}
      <div style={{ perspective: 1200 }}>
        <motion.button
          type="button"
          onClick={() => setManualFlip(!flipped)}
          aria-pressed={flipped}
          aria-label={t(`${K}.flipLabel`)}
          className="relative block h-52 w-full rounded-2xl text-left focus:outline-none focus-visible:ring-4 focus-visible:ring-sky-300 sm:h-56"
          style={{ transformStyle: "preserve-3d" }}
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: reducedMotion ? 0 : 0.8, ease: EASE_OUT_EXPO }}
        >
          <span
            className="absolute inset-0 flex flex-col gap-2.5 rounded-2xl border border-gray-100 bg-white p-4 shadow-xl sm:p-5"
            style={{ backfaceVisibility: "hidden" }}
          >
            <span className="flex items-center justify-between gap-2">
              <span className="inline-flex min-w-0 items-center gap-1.5 rounded-full bg-rose-50 px-2.5 py-1 text-xs font-medium text-rose-700">
                <span className="h-2 w-2 flex-shrink-0 rounded-full bg-rose-500" />
                <span className="truncate">{t(`${K}.cardTopic`)}</span>
              </span>
              <span className="inline-flex flex-shrink-0 items-center gap-1 text-[11px] font-medium text-gray-400">
                <ImageIcon size={12} aria-hidden="true" />
                {t(`${K}.cardKind`)}
              </span>
            </span>
            <span className="text-base font-semibold text-gray-900 sm:text-lg">
              {t(`${K}.cardQuestion`)}
            </span>
            <svg
              viewBox={`0 0 ${ECG_WIDTH} ${ECG_HEIGHT}`}
              role="img"
              aria-label={t(`${K}.ecgLabel`)}
              className="w-full flex-1 min-h-0 rounded-lg border border-rose-100"
              preserveAspectRatio="none"
            >
              <defs>
                <pattern id={gridId} width="10" height="10" patternUnits="userSpaceOnUse">
                  <path d="M 10 0 H 0 V 10" fill="none" stroke="#fecdd3" strokeWidth="0.6" />
                </pattern>
              </defs>
              <rect width={ECG_WIDTH} height={ECG_HEIGHT} fill="#fff1f2" />
              <rect width={ECG_WIDTH} height={ECG_HEIGHT} fill={`url(#${gridId})`} />
              <motion.path
                key={reducedMotion ? "static" : loop}
                d={ECG_PATH}
                fill="none"
                stroke="#be123c"
                strokeWidth="1.4"
                strokeLinejoin="round"
                vectorEffect="non-scaling-stroke"
                initial={reducedMotion ? false : { pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ duration: 1.6, ease: "linear" }}
              />
            </svg>
            <span className="inline-flex items-center gap-1.5 text-xs text-gray-400">
              <RotateCw size={12} aria-hidden="true" />
              {t("landing.showcase.selfAssessment.tapToFlip")}
            </span>
          </span>
          <span
            className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-rose-500 to-indigo-600 p-5 text-center text-white shadow-xl sm:p-6"
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          >
            <span className="text-xs uppercase tracking-[0.2em] text-rose-100">
              {t("landing.showcase.selfAssessment.answerLabel")}
            </span>
            <span className="text-lg font-bold sm:text-xl">{t(`${K}.answerTitle`)}</span>
            <span className="text-sm leading-snug text-rose-50 sm:text-base">
              {t(`${K}.answerBody`)}
            </span>
          </span>
        </motion.button>
      </div>

      {/* Two-page study note that opens like a book */}
      <div style={{ perspective: 1600 }}>
        <motion.div
          className="relative grid h-[19rem] grid-cols-2 sm:h-80"
          initial={false}
          animate={{ x: frame.bookOpen ? "0%" : "-25%" }}
          transition={turn}
        >
          {/* Spine shadow, only meaningful while open */}
          <motion.span
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-2 left-1/2 z-20 w-3 -translate-x-1/2 bg-gradient-to-r from-transparent via-gray-300/60 to-transparent"
            initial={false}
            animate={{ opacity: frame.bookOpen ? 1 : 0 }}
            transition={turn}
          />

          <div aria-hidden="true" />

          {/* Right page: figure and a longer paragraph */}
          <div className="flex min-w-0 flex-col gap-2 overflow-hidden rounded-r-xl border border-l-0 border-amber-100 bg-[#fffdf7] p-2.5 shadow-lg sm:p-4">
            <svg
              viewBox="0 0 200 100"
              role="img"
              aria-label={t(`${K}.figureLabel`)}
              className="w-full rounded-md border border-amber-100 bg-white"
            >
              <line x1="4" y1="88" x2="196" y2="88" stroke="#e5e7eb" strokeDasharray="3 3" />
              <motion.path
                d={ACTION_POTENTIAL_PATH}
                fill="none"
                stroke="#4f46e5"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={false}
                animate={{ pathLength: frame.diagramDrawn ? 1 : 0 }}
                transition={{ duration: reducedMotion ? 0 : 1.3, ease: "easeInOut" }}
              />
              {PHASE_LABELS.map(({ phase, x, y }, i) => (
                <motion.text
                  key={phase}
                  x={x}
                  y={y}
                  fontSize="10"
                  fontWeight="700"
                  fill="#db2777"
                  textAnchor="middle"
                  initial={false}
                  animate={{ opacity: frame.diagramDrawn ? 1 : 0 }}
                  transition={{
                    duration: reducedMotion ? 0 : 0.3,
                    delay: reducedMotion || !frame.diagramDrawn ? 0 : 0.3 + i * 0.2,
                  }}
                >
                  {phase}
                </motion.text>
              ))}
              <text x="194" y="84" fontSize="8" fill="#9ca3af" textAnchor="end">
                −90 mV
              </text>
            </svg>
            <p className="text-[10px] font-semibold text-gray-500 sm:text-xs">
              {t(`${K}.figureCaption`)}
            </p>
            <p className="text-[10px] leading-snug text-gray-700 sm:text-xs">
              {t(`${K}.noteClinical`)}
            </p>
          </div>

          {/* The leaf: cover on the front, left page on the back */}
          <motion.div
            className="absolute inset-y-0 left-1/2 right-0 z-10 origin-left"
            style={{ transformStyle: "preserve-3d" }}
            initial={false}
            animate={{ rotateY: frame.bookOpen ? -180 : 0 }}
            transition={turn}
          >
            <div
              aria-hidden="true"
              className="absolute inset-0 flex flex-col justify-between rounded-r-xl bg-gradient-to-br from-indigo-600 to-sky-500 p-3 text-white shadow-xl sm:p-5"
              style={{ backfaceVisibility: "hidden" }}
            >
              <BookOpen size={20} />
              <div>
                <p className="text-sm font-bold leading-tight sm:text-base">
                  {t(`${K}.noteTitle`)}
                </p>
                <p className="mt-1 text-[11px] text-indigo-100 sm:text-xs">
                  {t(`${K}.noteKind`)}
                </p>
              </div>
            </div>
            <div
              className="absolute inset-0 overflow-hidden rounded-l-xl border border-r-0 border-amber-100 bg-[#fffdf7] p-2.5 shadow-lg sm:p-4"
              style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
            >
              <p className="text-[11px] font-bold leading-tight text-gray-900 sm:text-sm">
                {t(`${K}.noteTitle`)}
              </p>
              <p className="mb-1.5 text-[10px] text-gray-500 sm:mb-2 sm:text-xs">
                {t(`${K}.noteSubtitle`)}
              </p>
              <div aria-hidden="true" className="mb-1.5 h-px bg-gray-200 sm:mb-2" />
              <ul className="space-y-1 sm:space-y-1.5">
                {PHASES.map((phase, i) => (
                  <li
                    key={phase}
                    className="flex gap-1.5 text-[10px] leading-snug text-gray-700 sm:text-xs"
                  >
                    <span
                      aria-hidden="true"
                      className="mt-px flex h-3.5 w-3.5 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 text-[9px] font-bold text-indigo-700"
                    >
                      {i}
                    </span>
                    <span>
                      <span className="sr-only">{t(`${K}.phaseLabel`, { phase: i })} </span>
                      {t(`${K}.phases.${phase}`)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </motion.div>
      </div>

      <p className="text-center text-xs text-gray-400">
        {t("landing.showcase.sampleNote")}
      </p>
    </div>
  );
};
