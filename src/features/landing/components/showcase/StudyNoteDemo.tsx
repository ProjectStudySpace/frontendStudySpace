import React, { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { useTranslation } from "react-i18next";
import { BookOpen } from "lucide-react";
import { studyNoteFrame } from "../../motion/richContent";
import { HEART_LEGEND, HeartAnatomy } from "./HeartAnatomy";
import { useLoopActive, useTicker } from "./useSceneLoop";

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

const LEGEND_DOT = {
  right: "bg-blue-400 ring-blue-700",
  left: "bg-red-400 ring-red-800",
  node: "bg-amber-400 ring-amber-700",
} as const;

const REST = { open: true, anatomyShown: true, potentialDrawn: true };

const K = "landing.showcase.studyNotes";

/** Two facing pages sit side by side only from the `sm` breakpoint up. */
const SIDE_BY_SIDE = "(min-width: 640px)";

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(
    () =>
      typeof window !== "undefined" &&
      typeof window.matchMedia === "function" &&
      window.matchMedia(query).matches,
  );

  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;
    const mql = window.matchMedia(query);
    const update = () => setMatches(mql.matches);
    update();
    mql.addEventListener("change", update);
    return () => mql.removeEventListener("change", update);
  }, [query]);

  return matches;
}

/**
 * A two-page study note, like the app's notes with a left and a right image.
 * When it first comes into view the cover swings open around the spine once
 * and is then removed, so the resting state is always the open note with both
 * pages fully readable. The heart is labeled and the action potential draws
 * itself, once. Below `sm` the pages stack and there is no cover; under
 * reduced motion the note renders open and fully drawn.
 */
export const StudyNoteDemo: React.FC = () => {
  const { t } = useTranslation();
  const reducedMotion = useReducedMotion() ?? false;
  const ref = useRef<HTMLDivElement>(null);
  const sideBySide = useMediaQuery(SIDE_BY_SIDE);
  const inView = useLoopActive(ref);
  const [settled, setSettled] = useState(false);
  const [coverGone, setCoverGone] = useState(false);
  const tick = useTicker(inView && !settled, 1200);

  const frame = reducedMotion ? REST : studyNoteFrame(tick);
  useEffect(() => {
    if (frame.potentialDrawn) setSettled(true);
  }, [frame.potentialDrawn]);

  const animated = sideBySide && !reducedMotion;
  const showCover = animated && !coverGone;
  const leftVisible = !animated || frame.open;
  const turn = reducedMotion
    ? { duration: 0 }
    : { duration: 1.2, ease: [0.65, 0, 0.35, 1] as const };

  return (
    <div
      ref={ref}
      className="relative mx-auto w-full max-w-3xl rounded-3xl border border-amber-100 bg-gradient-to-br from-amber-50 via-white to-sky-50 p-3 sm:p-6"
    >
      {/*
        The perspective lives on the direct parent of the cover, and the cover
        is a single face that hinges on the spine (its left edge). It never
        rests on top of the pages: it is unmounted once it has opened.
      */}
      <motion.div
        className="relative grid grid-cols-1 sm:grid-cols-2"
        style={{ perspective: 2000 }}
        initial={false}
        animate={{ x: animated && !frame.open ? "-25%" : "0%" }}
        transition={turn}
      >
        {/* Left page: title, anatomy figure and its legend */}
        <motion.section
          className="min-w-0 rounded-t-xl border border-amber-200/70 bg-[#fffdf7] p-4 shadow-md sm:rounded-l-xl sm:rounded-tr-none sm:border-r-0 sm:p-5"
          initial={false}
          animate={{ opacity: leftVisible ? 1 : 0 }}
          transition={{
            duration: reducedMotion ? 0 : 0.4,
            delay: reducedMotion || !frame.open ? 0 : 0.45,
          }}
        >
          <p className="text-base font-bold leading-tight text-gray-900">
            {t(`${K}.noteTitle`)}
          </p>
          <p className="mb-3 text-xs text-gray-500">{t(`${K}.noteKind`)}</p>
          <p className="mb-2 text-sm font-semibold text-indigo-700">
            {t(`${K}.leftHeading`)}
          </p>
          <div className="rounded-lg border border-amber-100 bg-white p-1.5">
            <HeartAnatomy labeled={frame.anatomyShown} reducedMotion={reducedMotion} />
          </div>
          <p className="mt-1.5 text-xs font-semibold text-gray-500">
            {t(`${K}.heartCaption`)}
          </p>
          <ul className="mt-2.5 grid grid-cols-1 gap-x-3 gap-y-1 min-[420px]:grid-cols-2">
            {HEART_LEGEND.map(({ key, side }) => (
              <li key={key} className="flex items-baseline gap-1.5 text-xs text-gray-700">
                <span
                  aria-hidden="true"
                  className={`h-2 w-2 flex-shrink-0 translate-y-px rounded-full ring-1 ${LEGEND_DOT[side]}`}
                />
                <span className="font-bold">{t(`${K}.heart.${key}.abbr`)}</span>
                <span className="min-w-0">{t(`${K}.heart.${key}.name`)}</span>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-gray-600">{t(`${K}.valves`)}</p>
          <p className="mt-2.5 text-[13px] leading-relaxed text-gray-700">
            {t(`${K}.leftText`)}
          </p>
        </motion.section>

        {/* Right page: action potential figure, phases and a clinical note */}
        <section className="min-w-0 rounded-b-xl border border-t-0 border-amber-200/70 bg-[#fffdf7] p-4 shadow-md sm:rounded-r-xl sm:rounded-bl-none sm:border-l sm:border-t sm:border-l-amber-200/40 sm:p-5">
          <p className="mb-2 text-sm font-semibold text-indigo-700">
            {t(`${K}.rightHeading`)}
          </p>
          <svg
            viewBox="0 0 200 100"
            role="img"
            aria-label={t(`${K}.figureLabel`)}
            className="w-full rounded-lg border border-amber-100 bg-white"
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
              animate={{ pathLength: frame.potentialDrawn ? 1 : 0 }}
              transition={{ duration: reducedMotion ? 0 : 1.4, ease: "easeInOut" }}
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
                animate={{ opacity: frame.potentialDrawn ? 1 : 0 }}
                transition={{
                  duration: reducedMotion ? 0 : 0.3,
                  delay: reducedMotion || !frame.potentialDrawn ? 0 : 0.4 + i * 0.2,
                }}
              >
                {phase}
              </motion.text>
            ))}
            <text x="194" y="84" fontSize="8" fill="#9ca3af" textAnchor="end">
              −90 mV
            </text>
          </svg>
          <p className="mt-1.5 text-xs font-semibold text-gray-500">
            {t(`${K}.figureCaption`)}
          </p>
          <ul className="mt-3 space-y-2">
            {PHASES.map((phase, i) => (
              <li key={phase} className="flex gap-2 text-[13px] leading-snug text-gray-700">
                <span
                  aria-hidden="true"
                  className="mt-px flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-indigo-100 text-[11px] font-bold text-indigo-700"
                >
                  {i}
                </span>
                <span className="min-w-0">
                  <span className="sr-only">{t(`${K}.phaseLabel`, { phase: i })} </span>
                  {t(`${K}.phases.${phase}`)}
                </span>
              </li>
            ))}
          </ul>
          <p className="mt-3 rounded-lg bg-rose-50 px-3 py-2 text-[13px] leading-relaxed text-rose-900">
            {t(`${K}.noteClinical`)}
          </p>
        </section>

        {/* Spine shadow between the facing pages */}
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-1 left-1/2 hidden w-4 -translate-x-1/2 bg-gradient-to-r from-transparent via-amber-900/10 to-transparent sm:block"
        />

        {/* Cover: hinges open on the spine once, then is removed */}
        {showCover && (
          <motion.div
            aria-hidden="true"
            className="absolute inset-y-0 left-1/2 right-0 z-10 flex flex-col justify-between rounded-r-xl bg-gradient-to-br from-indigo-600 to-sky-500 p-6 text-white shadow-xl"
            style={{
              transformOrigin: "left center",
              backfaceVisibility: "hidden",
              WebkitBackfaceVisibility: "hidden",
            }}
            initial={false}
            animate={{ rotateY: frame.open ? -180 : 0, opacity: frame.open ? 0 : 1 }}
            transition={{ ...turn, opacity: { duration: 0.25, delay: frame.open ? 0.9 : 0 } }}
            onAnimationComplete={() => {
              if (frame.open) setCoverGone(true);
            }}
          >
            <BookOpen size={28} />
            <div>
              <p className="text-2xl font-bold leading-tight">{t(`${K}.noteTitle`)}</p>
              <p className="mt-1 text-sm text-indigo-100">{t(`${K}.noteKind`)}</p>
            </div>
          </motion.div>
        )}
      </motion.div>

      <p className="mt-4 text-center text-xs text-gray-400">
        {t("landing.showcase.sampleNote")}
      </p>
    </div>
  );
};
