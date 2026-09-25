import React, { useRef } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { useTranslation } from "react-i18next";
import { ArrowRight, Check, Lock } from "lucide-react";
import { Reveal, RevealItem } from "../Reveal";
import { EASE_OUT_EXPO, hoverLift, nudgeX } from "../../motion/presets";

const FREE_FEATURES = [
  "spacedRepetition",
  "selfAssessment",
  "topics",
  "calendar",
  "progress",
  "intensive",
] as const;

const PRO_FEATURES = ["advancedSpaced", "advancedStats", "prioritySupport"] as const;

interface FreePlanCardProps {
  onGetStarted: () => void;
}

/** The current plan: fully unlocked, with every feature checked in turn. */
export const FreePlanCard: React.FC<FreePlanCardProps> = ({ onGetStarted }) => {
  const { t } = useTranslation();
  const reducedMotion = useReducedMotion() ?? false;

  return (
    <div className="relative isolate h-full">
      <div
        aria-hidden="true"
        className="absolute -inset-px -z-10 rounded-3xl bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400 opacity-70 blur-xl"
      />
      <div className="flex h-full flex-col rounded-3xl bg-white p-6 sm:p-8 text-gray-900">
        <div className="mb-6 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-2xl font-bold">{t("landing.pricing.free.name")}</h3>
            <p className="mt-1 text-sm text-gray-600">{t("landing.pricing.free.description")}</p>
          </div>
          <span className="flex-shrink-0 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
            {t("landing.pricing.free.badge")}
          </span>
        </div>
        <div className="mb-6 flex items-baseline gap-1">
          <span className="text-5xl font-bold tracking-tight">{t("landing.pricing.free.price")}</span>
          <span className="text-gray-500">{t("landing.pricing.free.perMonth")}</span>
        </div>
        <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-gray-400">
          {t("landing.pricing.free.included")}
        </p>
        <Reveal as="ul" stagger={0.09} delayChildren={0.2} amount={0.3} className="mb-8 space-y-3">
          {FREE_FEATURES.map((feature) => (
            <RevealItem as="li" key={feature} distance={8} className="flex items-start gap-3 text-sm sm:text-base">
              <motion.span
                aria-hidden="true"
                className="mt-0.5 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500 text-white"
                variants={{
                  hidden: { scale: reducedMotion ? 1 : 0 },
                  visible: {
                    scale: 1,
                    transition: { type: "spring", stiffness: 500, damping: 18 },
                  },
                }}
              >
                <Check size={12} strokeWidth={3} />
              </motion.span>
              <span className="text-gray-700">{t(`landing.pricing.free.features.${feature}`)}</span>
            </RevealItem>
          ))}
        </Reveal>
        <motion.button
          type="button"
          onClick={onGetStarted}
          variants={hoverLift(2, reducedMotion)}
          initial="rest"
          animate="rest"
          whileHover="hover"
          whileTap="tap"
          className="mt-auto inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 py-3 font-semibold text-white shadow-lg transition-colors hover:from-indigo-600 hover:to-purple-700"
        >
          {t("landing.pricing.free.cta")}
          <motion.span variants={nudgeX(4, reducedMotion)} className="inline-flex">
            <ArrowRight size={18} />
          </motion.span>
        </motion.button>
      </div>
    </div>
  );
};

/** Blueprint grid drawn with CSS gradients, used behind the coming-soon plan. */
const BLUEPRINT_STYLE: React.CSSProperties = {
  backgroundImage:
    "linear-gradient(rgba(148,163,184,0.12) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.12) 1px, transparent 1px)",
  backgroundSize: "22px 22px",
};

/** The future plan as a blueprint: dimmed, locked, stamped "coming soon". */
export const ProPlanCard: React.FC = () => {
  const { t } = useTranslation();
  const reducedMotion = useReducedMotion() ?? false;
  const ref = useRef<HTMLDivElement>(null);
  const seen = useInView(ref, { once: true, amount: 0.4 });
  const onScreen = useInView(ref, { amount: 0.1 });
  const looping = onScreen && !reducedMotion;
  const stamped = seen || reducedMotion;

  return (
    <div
      ref={ref}
      className="relative flex h-full flex-col overflow-hidden rounded-3xl border-2 border-dashed border-slate-600 bg-slate-900/60 p-6 sm:p-8 text-slate-300"
      style={BLUEPRINT_STYLE}
    >
      <motion.span
        className="absolute right-4 top-6 sm:right-6 rounded-lg border-2 border-amber-300/80 px-3 py-1 text-xs sm:text-sm font-bold uppercase tracking-[0.2em] text-amber-300"
        initial={{ opacity: 0, scale: 1.8, rotate: -14 }}
        animate={stamped ? { opacity: 1, scale: 1, rotate: -8 } : { opacity: 0, scale: 1.8, rotate: -14 }}
        transition={{ delay: reducedMotion ? 0 : 0.5, duration: 0.45, ease: EASE_OUT_EXPO }}
      >
        {t("landing.pricing.pro.stamp")}
      </motion.span>

      <div className="mb-6 flex items-center gap-3 pr-28">
        <motion.span
          className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl border border-slate-600 bg-slate-800 text-slate-300"
          animate={looping ? { rotate: [0, -10, 8, -4, 0] } : { rotate: 0 }}
          transition={
            looping
              ? { duration: 1.1, repeat: Infinity, repeatDelay: 2.4, ease: "easeInOut" }
              : { duration: 0 }
          }
        >
          <Lock size={20} />
        </motion.span>
        <h3 className="text-2xl font-bold text-white">{t("landing.pricing.pro.name")}</h3>
      </div>

      <p className="mb-6 text-sm text-slate-400">{t("landing.pricing.pro.description")}</p>
      <p className="mb-6 text-lg font-semibold text-slate-200">{t("landing.pricing.pro.price")}</p>

      <p className="mb-3 text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
        {t("landing.pricing.pro.planned")}
      </p>
      <ul className="mb-8 space-y-3">
        {PRO_FEATURES.map((feature) => (
          <li key={feature} className="flex items-start gap-3 text-sm sm:text-base text-slate-400">
            <span
              aria-hidden="true"
              className="mt-0.5 h-5 w-5 flex-shrink-0 rounded-full border border-dashed border-slate-500"
            />
            {t(`landing.pricing.pro.features.${feature}`)}
          </li>
        ))}
      </ul>

      <button
        type="button"
        disabled
        className="mt-auto w-full cursor-not-allowed rounded-xl border border-slate-600 py-3 font-semibold text-slate-400"
      >
        {t("landing.pricing.pro.cta")}
      </button>
    </div>
  );
};
