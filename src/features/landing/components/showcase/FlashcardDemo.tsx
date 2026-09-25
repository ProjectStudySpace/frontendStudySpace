import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useTranslation } from "react-i18next";
import { CalendarClock, RotateCw } from "lucide-react";
import { EASE_OUT_EXPO } from "../../motion/presets";
import { useLoopActive, useTicker } from "./useSceneLoop";

type Rating = "easy" | "medium" | "hard";

/** Sample spacing per rating for the demo only; the app computes the real one. */
const SAMPLE_NEXT_REVIEW: Record<Rating, number> = { hard: 1, medium: 3, easy: 7 };

const RATINGS: Array<{ key: Rating; idle: string; active: string }> = [
  {
    key: "easy",
    idle: "border-emerald-200 text-emerald-700 hover:bg-emerald-50",
    active: "border-emerald-500 bg-emerald-500 text-white",
  },
  {
    key: "medium",
    idle: "border-amber-200 text-amber-700 hover:bg-amber-50",
    active: "border-amber-500 bg-amber-500 text-white",
  },
  {
    key: "hard",
    idle: "border-rose-200 text-rose-700 hover:bg-rose-50",
    active: "border-rose-500 bg-rose-500 text-white",
  },
];

/** Autoplay order of ratings, one per loop. */
const AUTOPLAY_RATINGS: Rating[] = ["medium", "easy", "hard"];
/** Ticks per autoplay loop: question, answer, rated, hold. */
const LOOP_TICKS = 4;

/**
 * Self-assessment demo: the card flips to reveal its answer, a difficulty is
 * picked and the "next review" chip updates. Autoplays in view; clicking the
 * card or a rating hands control to the visitor.
 */
export const FlashcardDemo: React.FC = () => {
  const { t } = useTranslation();
  const reducedMotion = useReducedMotion() ?? false;
  const ref = useRef<HTMLDivElement>(null);
  const [manual, setManual] = useState(false);
  const [flipped, setFlipped] = useState(reducedMotion);
  const [rating, setRating] = useState<Rating | null>(
    reducedMotion ? "medium" : null,
  );
  const active = useLoopActive(ref) && !manual;
  const tick = useTicker(active, 1500);

  useEffect(() => {
    if (!active) return;
    const phase = tick % LOOP_TICKS;
    const loop = Math.floor(tick / LOOP_TICKS);
    setFlipped(phase >= 1);
    setRating(
      phase >= 2 ? AUTOPLAY_RATINGS[loop % AUTOPLAY_RATINGS.length] : null,
    );
  }, [active, tick]);

  const flip = () => {
    setManual(true);
    setFlipped((value) => !value);
  };

  const rate = (value: Rating) => {
    setManual(true);
    setFlipped(true);
    setRating(value);
  };

  const days = rating ? SAMPLE_NEXT_REVIEW[rating] : null;

  return (
    <div
      ref={ref}
      className="relative mx-auto max-w-md rounded-3xl bg-gradient-to-br from-amber-50 via-white to-indigo-50 p-5 sm:p-8 border border-amber-100"
    >
      <div style={{ perspective: 1200 }} className="mb-6">
        <motion.button
          type="button"
          onClick={flip}
          aria-pressed={flipped}
          aria-label={t("landing.showcase.selfAssessment.flipLabel")}
          className="relative block w-full h-48 sm:h-56 rounded-2xl text-left focus:outline-none focus-visible:ring-4 focus-visible:ring-indigo-300"
          style={{ transformStyle: "preserve-3d" }}
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{ duration: 0.8, ease: EASE_OUT_EXPO }}
        >
          <span
            className="absolute inset-0 flex flex-col justify-between rounded-2xl bg-white p-5 sm:p-6 shadow-xl border border-gray-100"
            style={{ backfaceVisibility: "hidden" }}
          >
            <span className="inline-flex w-fit items-center gap-1.5 rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-medium text-indigo-700">
              <span className="h-2 w-2 rounded-full bg-indigo-500" />
              {t("landing.showcase.selfAssessment.sampleTopic")}
            </span>
            <span className="text-lg sm:text-xl font-semibold text-gray-900">
              {t("landing.mockUI.question")}
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs text-gray-400">
              <RotateCw size={12} aria-hidden="true" />
              {t("landing.showcase.selfAssessment.tapToFlip")}
            </span>
          </span>
          <span
            className="absolute inset-0 flex flex-col items-center justify-center gap-2 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 p-6 text-white shadow-xl"
            style={{ backfaceVisibility: "hidden", transform: "rotateY(180deg)" }}
          >
            <span className="text-xs uppercase tracking-[0.2em] text-indigo-100">
              {t("landing.showcase.selfAssessment.answerLabel")}
            </span>
            <span className="text-3xl sm:text-4xl font-bold">
              {t("landing.mockUI.answer")}
            </span>
          </span>
        </motion.button>
      </div>

      <p className="mb-3 text-center text-sm font-medium text-gray-700">
        {t("landing.showcase.selfAssessment.prompt")}
      </p>
      <div className="grid grid-cols-3 gap-2 sm:gap-3 mb-5">
        {RATINGS.map((option) => {
          const selected = rating === option.key;
          return (
            <motion.button
              key={option.key}
              type="button"
              onClick={() => rate(option.key)}
              aria-pressed={selected}
              whileTap={reducedMotion ? undefined : { scale: 0.95 }}
              animate={selected && !reducedMotion ? { y: [0, -4, 0] } : { y: 0 }}
              transition={{ duration: 0.4, ease: EASE_OUT_EXPO }}
              className={`rounded-xl border-2 py-2.5 text-sm font-semibold transition-colors ${
                selected ? option.active : `bg-white ${option.idle}`
              }`}
            >
              {t(`landing.mockUI.${option.key}`)}
            </motion.button>
          );
        })}
      </div>

      <div className="flex h-10 items-center justify-center" aria-live="polite">
        <AnimatePresence mode="wait" initial={false}>
          {days !== null ? (
            <motion.span
              key={days}
              initial={{ opacity: 0, y: 12, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -12, scale: 0.9 }}
              transition={{ duration: 0.45, ease: EASE_OUT_EXPO }}
              className="inline-flex items-center gap-2 rounded-full bg-gray-900 px-4 py-2 text-sm font-medium text-white"
            >
              <CalendarClock size={16} aria-hidden="true" />
              {t("landing.showcase.selfAssessment.nextReview", { count: days })}
            </motion.span>
          ) : (
            <motion.span
              key="waiting"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-sm text-gray-400"
            >
              {t("landing.showcase.selfAssessment.waiting")}
            </motion.span>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};
