import React, { useEffect } from "react";
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
} from "motion/react";
import { useTranslation } from "react-i18next";
import { CalendarClock, Check, Flame } from "lucide-react";
import { EASE_OUT_EXPO } from "../../motion/presets";

/**
 * The three visuals of the "how it works" stage. Each plays its short story
 * once when mounted, so swapping the active step replays the next one.
 * Under reduced motion they render their finished state.
 */

const TOPIC_SWATCHES = [
  "bg-emerald-400",
  "bg-indigo-500",
  "bg-pink-500",
  "bg-amber-400",
];

/** Text that types itself in, character by character. */
const TypedText: React.FC<{ text: string; delay?: number; duration?: number }> = ({
  text,
  delay = 0,
  duration = 1.2,
}) => {
  const reducedMotion = useReducedMotion() ?? false;
  const count = useMotionValue(reducedMotion ? text.length : 0);
  const shown = useTransform(count, (c) => text.slice(0, Math.round(c)));

  useEffect(() => {
    if (reducedMotion) {
      count.set(text.length);
      return;
    }
    const controls = animate(count, text.length, {
      duration,
      delay,
      ease: "linear",
    });
    return () => controls.stop();
  }, [count, delay, duration, reducedMotion, text]);

  return (
    <span className="relative">
      {/* Reserve the final size so typing never shifts layout. */}
      <span className="invisible">{text}</span>
      <motion.span className="absolute inset-0">{shown}</motion.span>
    </span>
  );
};

const fade = (delay: number) => ({
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, delay, ease: EASE_OUT_EXPO },
});

export const CreateCardVisual: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="w-full max-w-sm space-y-4">
      <motion.div {...fade(0)} className="rounded-2xl bg-white p-5 shadow-xl border border-gray-100">
        <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
          {t("landing.howItWorks.visuals.question")}
        </p>
        <p className="mb-4 text-base font-semibold text-gray-900">
          <TypedText text={t("landing.mockUI.question")} delay={0.3} />
        </p>
        <p className="mb-1 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
          {t("landing.howItWorks.visuals.answer")}
        </p>
        <p className="mb-4 text-base text-gray-700">
          <TypedText text={t("landing.mockUI.answer")} delay={1.6} duration={0.4} />
        </p>
        <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-gray-400">
          {t("landing.howItWorks.visuals.topic")}
        </p>
        <div className="flex gap-2">
          {TOPIC_SWATCHES.map((swatch, i) => (
            <motion.span
              key={swatch}
              className={`h-7 w-7 rounded-full ${swatch}`}
              initial={{ scale: 0.6, opacity: 0 }}
              animate={{
                scale: 1,
                opacity: 1,
                boxShadow:
                  i === 1
                    ? "0 0 0 3px #ffffff, 0 0 0 5px #6366f1"
                    : "0 0 0 0px rgba(0,0,0,0)",
              }}
              transition={{ delay: 2.1 + i * 0.08, duration: 0.4, ease: EASE_OUT_EXPO }}
            />
          ))}
        </div>
      </motion.div>
      <motion.div
        {...fade(2.6)}
        className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 py-3 text-sm font-semibold text-white shadow-lg"
      >
        <Check size={16} />
        {t("landing.howItWorks.visuals.saved")}
      </motion.div>
    </div>
  );
};

const RATING_STYLES = [
  { key: "easy", tone: "border-emerald-300 text-emerald-700" },
  { key: "medium", tone: "border-amber-300 text-amber-700" },
  { key: "hard", tone: "border-rose-300 text-rose-700" },
] as const;

export const StudySessionVisual: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="w-full max-w-sm">
      <motion.div {...fade(0)} className="mb-3 flex items-center justify-between text-xs text-gray-500">
        <span className="font-semibold text-gray-900">{t("landing.mockUI.studySession")}</span>
        <span>3 / 10</span>
      </motion.div>
      <div className="mb-4 h-1.5 overflow-hidden rounded-full bg-indigo-100">
        <motion.div
          className="h-full origin-left rounded-full bg-gradient-to-r from-indigo-500 to-purple-600"
          initial={{ scaleX: 0.2 }}
          animate={{ scaleX: 0.3 }}
          transition={{ duration: 0.8, delay: 2.2, ease: EASE_OUT_EXPO }}
        />
      </div>
      <motion.div {...fade(0.15)} className="relative mb-4">
        <div className="absolute inset-x-3 -bottom-2 h-full rounded-2xl bg-white/70 border border-gray-100" />
        <div className="relative rounded-2xl bg-white p-5 shadow-xl border border-gray-100">
          <p className="mb-3 text-base font-semibold text-gray-900">{t("landing.mockUI.question")}</p>
          <motion.div
            className="rounded-xl bg-indigo-50 px-3 py-2 text-center text-lg font-bold text-indigo-700"
            initial={{ opacity: 0, rotateX: -90 }}
            animate={{ opacity: 1, rotateX: 0 }}
            transition={{ delay: 0.8, duration: 0.6, ease: EASE_OUT_EXPO }}
          >
            {t("landing.mockUI.answer")}
          </motion.div>
        </div>
      </motion.div>
      <div className="mb-4 grid grid-cols-3 gap-2">
        {RATING_STYLES.map((rating, i) => (
          <motion.span
            key={rating.key}
            className={`rounded-lg border-2 bg-white py-2 text-center text-sm font-semibold ${rating.tone}`}
            initial={{ opacity: 0, y: 8 }}
            animate={
              rating.key === "medium"
                ? { opacity: 1, y: 0, scale: [1, 0.92, 1.04, 1] }
                : { opacity: 1, y: 0 }
            }
            transition={{
              delay: 1.2 + i * 0.08,
              duration: rating.key === "medium" ? 0.9 : 0.4,
              ease: EASE_OUT_EXPO,
            }}
          >
            {t(`landing.mockUI.${rating.key}`)}
          </motion.span>
        ))}
      </div>
      <motion.div
        {...fade(2.2)}
        className="mx-auto flex w-fit items-center gap-2 rounded-full bg-gray-900 px-4 py-2 text-sm text-white"
      >
        <CalendarClock size={14} />
        {t("landing.showcase.selfAssessment.nextReview", { count: 3 })}
      </motion.div>
    </div>
  );
};

/** Sample weekly activity for the chart; bar heights only, no real data. */
const WEEK_BARS = [0.35, 0.5, 0.42, 0.62, 0.7, 0.66, 0.9];

export const ProgressVisual: React.FC = () => {
  const { t } = useTranslation();
  return (
    <div className="w-full max-w-sm">
      <motion.div {...fade(0)} className="rounded-2xl bg-white p-5 shadow-xl border border-gray-100">
        <div className="mb-4 flex items-center justify-between">
          <span className="text-sm font-semibold text-gray-900">
            {t("landing.howItWorks.visuals.chartTitle")}
          </span>
          <motion.span
            className="inline-flex items-center gap-1 rounded-full bg-orange-50 px-2.5 py-1 text-xs font-semibold text-orange-600"
            initial={{ opacity: 0, scale: 0.6 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.3, type: "spring", stiffness: 400, damping: 16 }}
          >
            <Flame size={12} />
            {t("landing.howItWorks.visuals.streak", { count: 7 })}
          </motion.span>
        </div>
        <div className="flex h-36 items-end gap-2">
          {WEEK_BARS.map((height, i) => (
            <div key={i} className="flex h-full flex-1 items-end rounded-md bg-indigo-50">
              <motion.div
                className="w-full origin-bottom rounded-md bg-gradient-to-t from-indigo-500 to-pink-400"
                style={{ height: `${height * 100}%` }}
                initial={{ scaleY: 0 }}
                animate={{ scaleY: 1 }}
                transition={{ delay: 0.2 + i * 0.09, duration: 0.7, ease: EASE_OUT_EXPO }}
              />
            </div>
          ))}
        </div>
      </motion.div>
      <motion.p {...fade(1.2)} className="mt-3 text-center text-xs text-gray-400">
        {t("landing.showcase.sampleNote")}
      </motion.p>
    </div>
  );
};

export const STEP_VISUALS = [CreateCardVisual, StudySessionVisual, ProgressVisual];
