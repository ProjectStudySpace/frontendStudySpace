import React, { useRef } from "react";
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import { useTranslation } from "react-i18next";
import { BookOpen, Calendar, ChevronRight, TrendingUp } from "lucide-react";
import { Reveal, RevealItem } from "./Reveal";
import { SectionHeading } from "./SectionHeading";

const STEPS = [
  { step: "1", key: "step1", icon: BookOpen },
  { step: "2", key: "step2", icon: Calendar },
  { step: "3", key: "step3", icon: TrendingUp },
] as const;

/**
 * Three steps revealed in sequence, joined on wide screens by a progress rail
 * that fills as the section scrolls through the viewport.
 */
export const HowItWorksSection: React.FC = () => {
  const { t } = useTranslation();
  const reducedMotion = useReducedMotion() ?? false;
  const stepsRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: stepsRef,
    offset: ["start 0.85", "center 0.45"],
  });
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 120,
    damping: 30,
    restDelta: 0.001,
  });
  const railScale = useTransform(smoothProgress, (v) => (reducedMotion ? 1 : v));

  return (
    <section
      id="how-it-works"
      className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-white"
    >
      <div className="max-w-7xl mx-auto">
        <SectionHeading
          title={t("landing.howItWorks.title")}
          subtitle={t("landing.howItWorks.subtitle")}
        />

        <div ref={stepsRef}>
          {/* Progress rail, aligned with the centers of the three columns. */}
          <div
            aria-hidden="true"
            className="hidden md:block relative h-0.5 mb-10 mx-[16.667%] rounded-full bg-indigo-100"
          >
            <motion.div
              className="absolute inset-0 origin-left rounded-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"
              style={{ scaleX: railScale }}
            />
            {STEPS.map((item, index) => (
              <span
                key={item.key}
                className="absolute top-1/2 w-2.5 h-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white border-2 border-indigo-400"
                style={{ left: `${index * 50}%` }}
              />
            ))}
          </div>

          <Reveal
            stagger={0.15}
            amount={0.25}
            className="grid sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8"
          >
            {STEPS.map((item, index) => (
              <RevealItem key={item.key} distance={24} className="relative">
                <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-xl sm:rounded-2xl p-6 sm:p-8 text-center h-full">
                  <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white text-xl sm:text-2xl font-bold mx-auto mb-3 sm:mb-4">
                    {item.step}
                  </div>
                  <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg sm:rounded-xl bg-white shadow-md flex items-center justify-center mx-auto mb-3 sm:mb-4">
                    <item.icon size={24} className="text-indigo-600 sm:w-7 sm:h-7" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-semibold text-gray-900 mb-2 sm:mb-3 px-2">
                    {t(`landing.howItWorks.${item.key}.title`)}
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 leading-relaxed px-2">
                    {t(`landing.howItWorks.${item.key}.description`)}
                  </p>
                </div>
                {index < STEPS.length - 1 && (
                  <div
                    aria-hidden="true"
                    className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2 z-10"
                  >
                    <ChevronRight size={32} className="text-indigo-300" />
                  </div>
                )}
              </RevealItem>
            ))}
          </Reveal>
        </div>
      </div>
    </section>
  );
};
