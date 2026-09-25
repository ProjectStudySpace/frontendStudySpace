import React, { useRef } from "react";
import {
  AnimatePresence,
  motion,
  useInView,
  useReducedMotion,
  type Variants,
} from "motion/react";
import { useTranslation } from "react-i18next";
import { Bell, Flame, RefreshCw } from "lucide-react";
import { EASE_OUT_EXPO } from "../../motion/presets";
import { REVIEW_INTERVALS, reviewDays } from "../../motion/showcase";
import { useLoopActive, useTicker } from "./useSceneLoop";

const DAYS_IN_MONTH = 30;
/** Blank cells before day 1 so the sample month starts on a Wednesday. */
const LEADING_BLANKS = 2;
const WEEKDAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "sunday",
] as const;

// Two sample cards started on different days, each following the intervals.
const SESSION_DAYS = new Set([
  ...reviewDays(3, REVIEW_INTERVALS, DAYS_IN_MONTH),
  ...reviewDays(9, REVIEW_INTERVALS, DAYS_IN_MONTH),
]);
const SESSION_ORDER = [...SESSION_DAYS].sort((a, b) => a - b);

const NOTIFICATIONS = [
  { key: "review", icon: Bell, tone: "bg-indigo-500" },
  { key: "streak", icon: Flame, tone: "bg-orange-500" },
] as const;

/**
 * Calendar & reminders: study sessions pop onto their scheduled days, a sync
 * badge confirms Google Calendar, and push-style reminders slide in on a loop.
 */
export const CalendarReminders: React.FC = () => {
  const { t } = useTranslation();
  const reducedMotion = useReducedMotion() ?? false;
  const ref = useRef<HTMLDivElement>(null);
  const seen = useInView(ref, { once: true, amount: 0.35 });
  const active = useLoopActive(ref);
  const tick = useTicker(active, 3200);
  const showSessions = seen || reducedMotion;
  const notification = NOTIFICATIONS[tick % NOTIFICATIONS.length];

  const sessionVariants: Variants = {
    hidden: { scale: 0, opacity: 0 },
    visible: (order: number) => ({
      scale: 1,
      opacity: 1,
      transition: reducedMotion
        ? { duration: 0 }
        : { type: "spring", stiffness: 420, damping: 18, delay: 0.3 + order * 0.14 },
    }),
  };

  const cells = [
    ...Array.from({ length: LEADING_BLANKS }, () => null),
    ...Array.from({ length: DAYS_IN_MONTH }, (_, i) => i + 1),
  ];

  return (
    <div ref={ref} aria-hidden="true" className="relative pb-14">
      <div className="relative rounded-3xl border border-sky-100 bg-white p-4 sm:p-6 shadow-[0_30px_80px_-40px_rgba(14,165,233,0.5)]">
        <div className="mb-4 flex items-center justify-between gap-2">
          <span className="text-sm font-semibold text-gray-900">
            {t("landing.showcase.calendarIntegration.monthLabel")}
          </span>
          <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-2.5 py-1 text-[11px] sm:text-xs font-medium text-sky-700">
            <motion.span
              className="inline-flex"
              animate={active ? { rotate: 360 } : { rotate: 0 }}
              transition={
                active
                  ? { duration: 1.2, ease: "easeInOut", repeat: Infinity, repeatDelay: 2 }
                  : { duration: 0 }
              }
            >
              <RefreshCw size={12} />
            </motion.span>
            {t("landing.showcase.calendarIntegration.synced")}
          </span>
        </div>

        <div className="grid grid-cols-7 gap-1 sm:gap-1.5 text-center">
          {WEEKDAYS.map((day) => (
            <span key={day} className="pb-1 text-[10px] sm:text-xs font-medium text-gray-400">
              {t(`calendarWidget.days.${day}`)}
            </span>
          ))}
          {cells.map((day, i) => {
            const order = day ? SESSION_ORDER.indexOf(day) : -1;
            return (
              <div
                key={i}
                className="relative flex aspect-square items-center justify-center rounded-lg text-[11px] sm:text-sm text-gray-500"
              >
                {day && order >= 0 && (
                  <motion.span
                    className="absolute inset-0.5 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600"
                    variants={sessionVariants}
                    custom={order}
                    initial="hidden"
                    animate={showSessions ? "visible" : "hidden"}
                  />
                )}
                {day && (
                  <span className={`relative ${order >= 0 && showSessions ? "font-semibold text-white" : ""}`}>
                    {day}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        <div className="mt-4 flex items-center gap-2 text-[11px] sm:text-xs text-gray-500">
          <span className="h-2.5 w-2.5 rounded bg-gradient-to-br from-indigo-500 to-purple-600" />
          {t("landing.showcase.calendarIntegration.legend")}
        </div>
      </div>

      <div className="absolute bottom-0 right-0 left-6 sm:left-auto sm:w-72">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={reducedMotion ? "static" : `${notification.key}-${tick}`}
            initial={{ opacity: 0, y: 16, x: 16 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: 10 }}
            transition={{ duration: 0.5, ease: EASE_OUT_EXPO }}
            className="flex items-start gap-3 rounded-2xl border border-gray-100 bg-white/95 p-3 shadow-xl"
          >
            <span className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-xl text-white ${notification.tone}`}>
              <notification.icon size={16} />
            </span>
            <span className="min-w-0">
              <span className="block text-xs font-semibold text-gray-900">
                {t(`landing.showcase.calendarIntegration.notifications.${notification.key}.title`)}
              </span>
              <span className="block text-[11px] leading-snug text-gray-500">
                {t(`landing.showcase.calendarIntegration.notifications.${notification.key}.body`)}
              </span>
            </span>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
};
