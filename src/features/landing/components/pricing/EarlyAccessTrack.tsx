import React, { useRef } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { useTranslation } from "react-i18next";
import { Sparkles } from "lucide-react";
import { EASE_OUT_EXPO } from "../../motion/presets";

/**
 * Pricing timeline: a glowing, fully drawn "now" segment with a pulsing
 * "you are here" marker, followed by a dashed, not-yet-reached segment that
 * ends at the upcoming experiences.
 */
export const EarlyAccessTrack: React.FC = () => {
  const { t } = useTranslation();
  const reducedMotion = useReducedMotion() ?? false;
  const ref = useRef<HTMLDivElement>(null);
  const seen = useInView(ref, { once: true, amount: 0.5 });
  const onScreen = useInView(ref, { amount: 0.1 });
  const looping = onScreen && !reducedMotion;
  const drawn = seen || reducedMotion;

  return (
    <div
      ref={ref}
      role="img"
      aria-label={`${t("landing.pricing.track.nowTitle")}: ${t("landing.pricing.track.nowBody")}. ${t("landing.pricing.track.soonTitle")}: ${t("landing.pricing.track.soonBody")}.`}
      className="mx-auto max-w-4xl"
    >
      <div aria-hidden="true" className="relative flex items-center pt-12">
        {/* Now: early access, filled and glowing. */}
        <div className="relative h-2 flex-[3] rounded-full bg-white/10">
          <motion.div
            className="absolute inset-0 origin-left rounded-full bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 shadow-[0_0_24px_rgba(192,132,252,0.7)]"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: drawn ? 1 : 0 }}
            transition={{ duration: reducedMotion ? 0 : 1.4, ease: EASE_OUT_EXPO }}
          />
          <div className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2">
            <motion.div
              className="relative"
              initial={{ opacity: 0, scale: 0.4 }}
              animate={{ opacity: drawn ? 1 : 0, scale: drawn ? 1 : 0.4 }}
              transition={{ delay: reducedMotion ? 0 : 1.2, duration: 0.5, ease: EASE_OUT_EXPO }}
            >
              <span className="relative flex h-5 w-5 items-center justify-center">
                {looping && (
                  <motion.span
                    className="absolute inset-0 rounded-full bg-pink-400"
                    animate={{ scale: [1, 2.6], opacity: [0.6, 0] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
                  />
                )}
                <span className="relative h-5 w-5 rounded-full border-4 border-slate-950 bg-pink-400" />
              </span>
              <span className="absolute bottom-full left-1/2 mb-3 -translate-x-1/2 whitespace-nowrap rounded-full bg-white px-3 py-1 text-xs font-semibold text-slate-900 shadow-lg">
                {t("landing.pricing.track.youAreHere")}
                <span className="absolute left-1/2 top-full h-2 w-2 -translate-x-1/2 -translate-y-1 rotate-45 bg-white" />
              </span>
            </motion.div>
          </div>
        </div>

        {/* Coming soon: dashed and not reached yet. */}
        <svg className="h-2 flex-[2] overflow-visible" preserveAspectRatio="none" viewBox="0 0 100 8">
          <motion.line
            x1={4}
            x2={96}
            y1={4}
            y2={4}
            stroke="rgba(255,255,255,0.35)"
            strokeWidth={2}
            strokeDasharray="4 5"
            vectorEffect="non-scaling-stroke"
            animate={looping ? { strokeDashoffset: [0, -18] } : { strokeDashoffset: 0 }}
            transition={looping ? { duration: 1.6, repeat: Infinity, ease: "linear" } : { duration: 0 }}
          />
        </svg>
        <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full border border-dashed border-white/30 text-slate-400">
          <Sparkles size={14} />
        </span>
      </div>

      <div aria-hidden="true" className="mt-5 flex gap-4 text-left">
        <div className="flex-[3]">
          <p className="text-xs sm:text-sm font-semibold text-white">
            {t("landing.pricing.track.nowTitle")}
          </p>
          <p className="text-xs sm:text-sm text-indigo-200">
            {t("landing.pricing.track.nowBody")}
          </p>
        </div>
        <div className="flex-[2] text-right">
          <p className="text-xs sm:text-sm font-semibold text-slate-300">
            {t("landing.pricing.track.soonTitle")}
          </p>
          <p className="text-xs sm:text-sm text-slate-500">
            {t("landing.pricing.track.soonBody")}
          </p>
        </div>
      </div>
    </div>
  );
};
