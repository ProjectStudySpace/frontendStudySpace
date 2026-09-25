import React, { useRef } from "react";
import { motion, useInView, useReducedMotion } from "motion/react";
import { useTranslation } from "react-i18next";
import { ArrowRight } from "lucide-react";
import { Reveal, RevealItem } from "./Reveal";
import { hoverLift, nudgeX } from "../motion/presets";

interface CtaSectionProps {
  onGetStarted: () => void;
}

/**
 * Closing call to action on the brand gradient, with a slow light sheen that
 * sweeps across while the section is on screen.
 */
export const CtaSection: React.FC<CtaSectionProps> = ({ onGetStarted }) => {
  const { t } = useTranslation();
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { amount: 0.2 });
  const reducedMotion = useReducedMotion() ?? false;
  const sweeping = inView && !reducedMotion;

  return (
    <section
      ref={ref}
      className="relative isolate overflow-hidden py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-600"
    >
      {!reducedMotion && (
        <motion.div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 -left-1/2 -z-10 w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/15 to-transparent"
          initial={{ x: "0%" }}
          animate={sweeping ? { x: ["0%", "400%"] } : { x: "0%" }}
          transition={
            sweeping
              ? {
                  duration: 7,
                  ease: "easeInOut",
                  repeat: Infinity,
                  repeatDelay: 4,
                }
              : { duration: 0 }
          }
        />
      )}

      <Reveal stagger={0.1} className="max-w-4xl mx-auto text-center">
        <RevealItem
          as="h2"
          className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4 sm:mb-6 px-4"
        >
          {t("landing.cta.title")}
        </RevealItem>
        <RevealItem
          as="p"
          className="text-base sm:text-lg md:text-xl text-indigo-100 mb-6 sm:mb-8 px-4"
        >
          {t("landing.cta.subtitle")}
        </RevealItem>
        <RevealItem>
          <motion.button
            onClick={onGetStarted}
            variants={hoverLift(2, reducedMotion)}
            initial="rest"
            animate="rest"
            whileHover="hover"
            whileTap="tap"
            className="bg-white text-indigo-600 px-6 sm:px-8 py-3 sm:py-4 rounded-lg font-semibold text-base sm:text-lg hover:bg-indigo-50 transition-[background-color,box-shadow] shadow-lg hover:shadow-xl inline-flex items-center gap-2"
          >
            {t("landing.cta.button")}
            <motion.span variants={nudgeX(4, reducedMotion)} className="inline-flex">
              <ArrowRight size={18} className="sm:w-5 sm:h-5" />
            </motion.span>
          </motion.button>
        </RevealItem>
      </Reveal>
    </section>
  );
};
