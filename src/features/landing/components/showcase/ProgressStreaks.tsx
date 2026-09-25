import React, { useRef } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useTranslation } from "react-i18next";
import { Award, Flame } from "lucide-react";
import { EASE_OUT_EXPO } from "../../motion/presets";
import { WEEK_STREAK, progressFrame } from "../../motion/showcase";
import { useLoopActive, useTicker } from "./useSceneLoop";

const WEEKDAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

/** Ticks per loop: a week of study, a short hold on the finished state. */
const LOOP_TICKS = 12;
const FINAL_TICK = 9;

/** Number that rolls vertically whenever it changes. */
const RollingNumber: React.FC<{ value: number; className?: string }> = ({
  value,
  className,
}) => (
  <span className={`relative inline-flex overflow-hidden tabular-nums ${className ?? ""}`}>
    <AnimatePresence mode="popLayout" initial={false}>
      <motion.span
        key={value}
        initial={{ y: "100%", opacity: 0 }}
        animate={{ y: "0%", opacity: 1 }}
        exit={{ y: "-100%", opacity: 0 }}
        transition={{ duration: 0.45, ease: EASE_OUT_EXPO }}
      >
        {value}
      </motion.span>
    </AnimatePresence>
  </span>
);

/**
 * Progress, streaks and XP on a dark stage: a week of study plays out day by
 * day, the flame counter ticks up, XP fills, completed cards count up and the
 * "Week Streak" badge unlocks on day seven. Loops while in view.
 */
export const ProgressStreaks: React.FC = () => {
  const { t } = useTranslation();
  const reducedMotion = useReducedMotion() ?? false;
  const ref = useRef<HTMLDivElement>(null);
  const active = useLoopActive(ref);
  const tick = useTicker(active, 850);
  const frame = progressFrame(reducedMotion ? FINAL_TICK : tick % LOOP_TICKS);

  return (
    <div
      ref={ref}
      aria-hidden="true"
      className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 p-5 sm:p-7 text-white"
    >
      <div
        className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-orange-500/20 blur-3xl"
      />

      <div className="relative flex items-center gap-4 mb-6">
        <motion.div
          className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-400 to-rose-500"
          animate={
            active
              ? { scale: [1, 1.08, 1], rotate: [0, -4, 0] }
              : { scale: 1, rotate: 0 }
          }
          transition={{ duration: 0.85, repeat: active ? Infinity : 0 }}
        >
          <Flame size={32} />
        </motion.div>
        <div>
          <div className="flex items-baseline gap-2 text-4xl font-bold">
            <RollingNumber value={frame.streakDays} />
            <span className="text-base font-medium text-slate-300">
              {t("landing.showcase.progressTracking.streakUnit")}
            </span>
          </div>
          <p className="text-sm text-slate-400">
            {t("landing.mockUI.currentStreak")}
          </p>
        </div>
      </div>

      <div className="relative mb-6 grid grid-cols-7 gap-1.5 sm:gap-2">
        {WEEKDAYS.map((day, i) => {
          const done = i < frame.streakDays;
          return (
            <div key={day} className="flex flex-col items-center gap-1.5">
              <div className="relative h-8 w-full rounded-lg bg-white/5">
                <motion.div
                  className="absolute inset-0 rounded-lg bg-gradient-to-br from-orange-400 to-rose-500"
                  initial={false}
                  animate={{ opacity: done ? 1 : 0, scale: done ? 1 : 0.6 }}
                  transition={{ duration: 0.4, ease: EASE_OUT_EXPO }}
                />
              </div>
              <span className="text-[10px] text-slate-500">
                {t(`calendarWidget.days.${day}`)}
              </span>
            </div>
          );
        })}
      </div>

      <div className="relative mb-6">
        <p className="mb-2 text-xs text-slate-400">
          {t("landing.showcase.progressTracking.xpLabel")}
        </p>
        <div className="h-3 overflow-hidden rounded-full bg-white/10">
          <motion.div
            className="h-full origin-left rounded-full bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400"
            initial={false}
            animate={{ scaleX: frame.xpPercent / 100 }}
            transition={{ duration: 0.6, ease: EASE_OUT_EXPO }}
          />
        </div>
      </div>

      <div className="relative grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-white/5 p-3 sm:p-4">
          <RollingNumber value={frame.completedToday} className="text-2xl font-bold" />
          <p className="text-xs text-slate-400">
            {t("landing.showcase.progressTracking.completed")}
          </p>
        </div>
        <div className="relative flex items-center gap-3 rounded-2xl bg-white/5 p-3 sm:p-4">
          <motion.span
            className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full"
            initial={false}
            animate={{
              backgroundColor: frame.badgeUnlocked ? "#f59e0b" : "rgba(255,255,255,0.08)",
              scale: frame.badgeUnlocked && !reducedMotion ? [1, 1.25, 1] : 1,
            }}
            transition={{ duration: 0.6, ease: EASE_OUT_EXPO }}
          >
            <Award size={20} className={frame.badgeUnlocked ? "text-white" : "text-slate-500"} />
          </motion.span>
          <span className="min-w-0">
            <span className="block truncate text-sm font-semibold">
              {t("gamification.badges.streakWeek.name")}
            </span>
            <span className="block text-xs text-slate-400">
              {frame.badgeUnlocked
                ? t("gamification.badges.earned")
                : `${frame.streakDays}/${WEEK_STREAK}`}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
};
