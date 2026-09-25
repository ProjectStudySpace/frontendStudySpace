import React from "react";
import { motion, useReducedMotion, type Variants } from "motion/react";
import { useTranslation } from "react-i18next";
import { Check } from "lucide-react";
import { Reveal } from "./Reveal";
import { SectionHeading } from "./SectionHeading";
import { EASE_OUT_EXPO, getRevealVariants, scaleIn } from "../motion/presets";

interface PricingSectionProps {
  onGetStarted: () => void;
}

interface Plan {
  key: "free" | "pro" | "team";
  features: string[];
  highlighted: boolean;
}

const PLANS: Plan[] = [
  {
    key: "free",
    features: ["cards", "topics", "basicSpaced", "mobileAccess", "basicStats"],
    highlighted: false,
  },
  {
    key: "pro",
    features: [
      "unlimitedCards",
      "unlimitedTopics",
      "advancedSpaced",
      "calendarIntegration",
      "advancedStats",
      "prioritySupport",
      "noAds",
    ],
    highlighted: true,
  },
  {
    key: "team",
    features: [
      "allPro",
      "members",
      "sharedCards",
      "collaborativeBoards",
      "teamManagement",
      "groupAnalytics",
    ],
    highlighted: false,
  },
];

const HOVER_TRANSITION = { duration: 0.3, ease: EASE_OUT_EXPO };

export const PricingSection: React.FC<PricingSectionProps> = ({
  onGetStarted,
}) => {
  const { t } = useTranslation();
  const reducedMotion = useReducedMotion() ?? false;
  const hover = reducedMotion ? {} : { y: -4, transition: HOVER_TRANSITION };

  // The highlighted plan arrives last and settles from a slightly smaller
  // scale, so it reads as the focal point without extra decoration.
  const planVariants = (highlighted: boolean): Variants => ({
    ...(highlighted && !reducedMotion
      ? scaleIn({ from: 0.94, duration: 0.8, delay: 0.15 })
      : getRevealVariants(reducedMotion, { distance: 24 })),
    hover,
  });

  const glowVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 0.45,
      transition: { duration: 1.2, delay: 0.6, ease: EASE_OUT_EXPO },
    },
  };

  return (
    <section
      id="pricing"
      className="py-12 sm:py-16 md:py-20 px-4 sm:px-6 lg:px-8 bg-gray-50"
    >
      <div className="max-w-7xl mx-auto">
        <SectionHeading
          title={t("landing.pricing.title")}
          subtitle={t("landing.pricing.subtitle")}
        />

        <Reveal
          stagger={0.1}
          amount={0.15}
          className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6 md:gap-8 max-w-5xl mx-auto"
        >
          {PLANS.map((plan, index) => (
            <motion.div
              key={plan.key}
              variants={planVariants(plan.highlighted)}
              whileHover="hover"
              className={`relative isolate ${
                index === 1 ? "sm:col-span-2 md:col-span-1" : ""
              }`}
            >
              {plan.highlighted && (
                <motion.div
                  aria-hidden="true"
                  variants={glowVariants}
                  className="absolute -inset-2 sm:-inset-3 -z-10 rounded-3xl bg-gradient-to-br from-indigo-400 via-purple-400 to-pink-400 blur-2xl"
                />
              )}
              <div
                className={`h-full rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-8 ${
                  plan.highlighted
                    ? "bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-2xl sm:scale-105"
                    : "bg-white border-2 border-gray-200 hover:border-indigo-200 transition-colors duration-300"
                }`}
              >
                <div className="text-center mb-4 sm:mb-6">
                  <h3
                    className={`text-xl sm:text-2xl font-bold mb-2 ${
                      plan.highlighted ? "text-white" : "text-gray-900"
                    }`}
                  >
                    {t(`landing.pricing.${plan.key}.name`)}
                  </h3>
                  <p
                    className={`text-xs sm:text-sm mb-3 sm:mb-4 ${
                      plan.highlighted ? "text-indigo-100" : "text-gray-600"
                    }`}
                  >
                    {t(`landing.pricing.${plan.key}.description`)}
                  </p>
                  <div className="flex items-baseline justify-center gap-1">
                    <span
                      className={`text-3xl sm:text-4xl md:text-5xl font-bold ${
                        plan.highlighted ? "text-white" : "text-gray-900"
                      }`}
                    >
                      {t(`landing.pricing.${plan.key}.price`)}
                    </span>
                    <span
                      className={`text-sm sm:text-base ${
                        plan.highlighted ? "text-indigo-100" : "text-gray-600"
                      }`}
                    >
                      {t("landing.pricing.free.perMonth")}
                    </span>
                  </div>
                </div>

                <ul className="space-y-2 sm:space-y-3 mb-6 sm:mb-8">
                  {plan.features.map((feature) => (
                    <li key={feature} className="flex items-start gap-2 sm:gap-3">
                      <div
                        className={`w-4 h-4 sm:w-5 sm:h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          plan.highlighted ? "bg-white/20" : "bg-green-100"
                        }`}
                      >
                        <Check
                          size={12}
                          className={`sm:w-3.5 sm:h-3.5 ${
                            plan.highlighted ? "text-white" : "text-green-600"
                          }`}
                        />
                      </div>
                      <span
                        className={`text-xs sm:text-sm md:text-base ${
                          plan.highlighted ? "text-indigo-50" : "text-gray-700"
                        }`}
                      >
                        {t(`landing.pricing.${plan.key}.features.${feature}`)}
                      </span>
                    </li>
                  ))}
                </ul>

                <motion.button
                  onClick={onGetStarted}
                  whileTap={reducedMotion ? undefined : { scale: 0.97 }}
                  className={`w-full py-2.5 sm:py-3 rounded-lg text-sm sm:text-base font-semibold transition-colors ${
                    plan.highlighted
                      ? "bg-white text-indigo-600 hover:bg-indigo-50"
                      : "bg-gradient-to-r from-indigo-500 to-purple-600 text-white hover:from-indigo-600 hover:to-purple-700"
                  }`}
                >
                  {t(`landing.pricing.${plan.key}.cta`)}
                </motion.button>
              </div>
            </motion.div>
          ))}
        </Reveal>
      </div>
    </section>
  );
};
