import React, { useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useTranslation } from "react-i18next";
import { Check, Clock3 } from "lucide-react";
import { EASE_OUT_EXPO } from "../../motion/presets";
import { formatClock, ringOffset } from "../../motion/showcase";
import { useLoopActive, useTicker } from "./useSceneLoop";

type Intensity = "relaxed" | "normal" | "intensive";

/** Mirrors the app's intensity presets (max Pomodoros per session). */
const INTENSITIES: Array<{ key: Intensity; blocks: number }> = [
  { key: "relaxed", blocks: 2 },
  { key: "normal", blocks: 4 },
  { key: "intensive", blocks: 8 },
];

const POMODORO_SECONDS = 25 * 60;
/** Demo fast-forward: seconds of the Pomodoro shown per tick. */
const SECONDS_PER_TICK = 75;
const TICKS_PER_BLOCK = POMODORO_SECONDS / SECONDS_PER_TICK;
/** A card from the queue is answered every few ticks. */
const TICKS_PER_CARD = 4;
const QUEUE_SIZE = 3;
const SAMPLE_CARDS = 5;

const RADIUS = 52;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

/**
 * Intensive study: a fast-forwarded Pomodoro ring counts down while cards
 * flow through the session queue. The intensity buttons are real controls
 * that switch between the app's three presets.
 */
export const FocusSession: React.FC = () => {
  const { t } = useTranslation();
  const reducedMotion = useReducedMotion() ?? false;
  const ref = useRef<HTMLDivElement>(null);
  const [intensity, setIntensity] = useState<Intensity>("normal");
  const active = useLoopActive(ref);
  const tick = useTicker(active, 500);

  const preset = INTENSITIES.find((item) => item.key === intensity) ?? INTENSITIES[1];
  const elapsedInBlock = reducedMotion ? 0 : tick % TICKS_PER_BLOCK;
  const block = reducedMotion ? 0 : Math.floor(tick / TICKS_PER_BLOCK) % preset.blocks;
  const remaining = POMODORO_SECONDS - elapsedInBlock * SECONDS_PER_TICK;
  const answered = reducedMotion ? 0 : Math.floor(tick / TICKS_PER_CARD);
  const queue = Array.from({ length: QUEUE_SIZE }, (_, i) => answered + i);

  return (
    <div
      ref={ref}
      className="rounded-3xl border border-rose-100 bg-gradient-to-br from-rose-50 via-white to-orange-50 p-4 sm:p-6"
    >
      <div
        role="group"
        aria-label={t("intensiveStudy.intensity.title")}
        className="mb-6 grid grid-cols-3 gap-1 rounded-2xl bg-white p-1 shadow-sm border border-gray-100"
      >
        {INTENSITIES.map((item) => {
          const selected = item.key === intensity;
          return (
            <button
              key={item.key}
              type="button"
              aria-pressed={selected}
              onClick={() => setIntensity(item.key)}
              className={`relative rounded-xl px-2 py-2 text-xs sm:text-sm font-semibold transition-colors ${
                selected ? "text-white" : "text-gray-600 hover:text-gray-900"
              }`}
            >
              {selected && (
                <motion.span
                  layoutId="focus-intensity"
                  className="absolute inset-0 rounded-xl bg-gradient-to-r from-rose-500 to-orange-500"
                  transition={{ type: "spring", stiffness: 380, damping: 32 }}
                />
              )}
              <span className="relative">
                {t(`intensiveStudy.intensity.${item.key}.name`)}
              </span>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-[auto,1fr] items-center gap-4 sm:gap-6" aria-hidden="true">
        <div className="relative h-32 w-32 sm:h-36 sm:w-36">
          <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
            <circle cx={60} cy={60} r={RADIUS} fill="none" stroke="#ffe4e6" strokeWidth={10} />
            <motion.circle
              cx={60}
              cy={60}
              r={RADIUS}
              fill="none"
              stroke="url(#focus-ring)"
              strokeWidth={10}
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              initial={false}
              animate={{
                strokeDashoffset: ringOffset(remaining, POMODORO_SECONDS, CIRCUMFERENCE),
              }}
              transition={{ duration: 0.5, ease: "linear" }}
            />
            <defs>
              <linearGradient id="focus-ring" x1="0" x2="1" y1="0" y2="1">
                <stop offset="0%" stopColor="#f43f5e" />
                <stop offset="100%" stopColor="#f97316" />
              </linearGradient>
            </defs>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-2xl sm:text-3xl font-bold tabular-nums text-gray-900">
              {formatClock(remaining)}
            </span>
            <span className="text-[11px] font-medium uppercase tracking-wider text-rose-600">
              {t("intensiveStudy.pomodoro.work")}
            </span>
          </div>
        </div>

        <div className="min-w-0">
          <div className="mb-3 flex flex-wrap gap-1.5">
            {Array.from({ length: preset.blocks }, (_, i) => (
              <motion.span
                key={`${intensity}-${i}`}
                initial={{ scale: 0, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: i * 0.05, duration: 0.3, ease: EASE_OUT_EXPO }}
                className={`h-2.5 w-5 rounded-full ${
                  i < block ? "bg-rose-500" : i === block ? "bg-orange-400" : "bg-rose-100"
                }`}
              />
            ))}
          </div>
          <p className="text-xs sm:text-sm font-medium text-gray-900">
            {t(`intensiveStudy.intensity.${intensity}.pomodoros`)}
          </p>
          <p className="flex items-center gap-1.5 text-xs text-gray-500">
            <Clock3 size={12} className="flex-shrink-0" />
            {t(`intensiveStudy.intensity.${intensity}.reviews`)}
          </p>
        </div>
      </div>

      <div className="mt-6 space-y-2" aria-hidden="true">
        <AnimatePresence initial={false} mode="popLayout">
          {queue.map((n, i) => (
            <motion.div
              key={n}
              layout
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: i === 0 ? 1 : 0.7 - i * 0.15, y: 0 }}
              exit={{ opacity: 0, x: 60 }}
              transition={{ duration: 0.5, ease: EASE_OUT_EXPO }}
              className={`flex items-center justify-between gap-3 rounded-xl border bg-white px-3 py-2.5 ${
                i === 0 ? "border-rose-200 shadow-md" : "border-gray-100"
              }`}
            >
              <span className="line-clamp-2 text-xs sm:text-sm leading-snug text-gray-800">
                {t(`landing.showcase.intensiveStudy.cards.card${(n % SAMPLE_CARDS) + 1}`)}
              </span>
              {i === 0 && (
                <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-600">
                  <Check size={12} />
                </span>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};
